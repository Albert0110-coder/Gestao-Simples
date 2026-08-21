(function(){
  'use strict';

  var commissionUsers=[];

  function el(id){return document.getElementById(id)}
  function isCommissionAdmin(){return typeof isAdmin==='function'&&isAdmin()}

  function ensureUI(){
    if(!el('commissionModal')){
      var modal=document.createElement('div');
      modal.id='commissionModal';
      modal.className='modal';
      modal.innerHTML=''
        +'<div class="sheet">'
        +  '<div class="sheethead"><h2>Comissão de vendedores</h2><button class="close" type="button" id="commissionClose">×</button></div>'
        +  '<div class="filters">'
        +    '<div class="grid2">'
        +      '<label class="field">Vendedor<select id="commissionSeller"></select></label>'
        +      '<label class="field">Comissão (%)<input id="commissionRate" type="number" min="0" max="100" step="0.01" inputmode="decimal" value="5"></label>'
        +      '<label class="field">Período<select id="commissionPeriod"><option value="day">Dia</option><option value="month" selected>Mês</option><option value="year">Ano</option></select></label>'
        +      '<label class="field" id="commissionPeriodLabel">Mês<input id="commissionPeriodValue" type="month"></label>'
        +      '<label class="field" style="grid-column:1/-1">Considerar<select id="commissionStage"><option value="all">Todos os pedidos</option><option value="invoiced_plus">Faturados e concluídos</option><option value="completed">Somente concluídos</option></select></label>'
        +    '</div>'
        +    '<button class="primary" type="button" id="commissionCalculate" style="width:100%;margin-top:11px">Calcular comissão</button>'
        +  '</div>'
        +  '<div class="cards" style="margin-top:0">'
        +    '<div class="card"><small>Total vendido</small><strong id="commissionSalesTotal">R$ 0,00</strong></div>'
        +    '<div class="card"><small>Comissão</small><strong id="commissionTotal">R$ 0,00</strong></div>'
        +    '<div class="card"><small>Pedidos</small><strong id="commissionCount">0</strong></div>'
        +    '<div class="card"><small>Percentual</small><strong id="commissionRateSummary">0%</strong></div>'
        +  '</div>'
        +  '<div class="sectionhead"><h3>Detalhamento das vendas</h3></div>'
        +  '<div id="commissionList" class="list"><div class="empty">Escolha os dados e calcule a comissão.</div></div>'
        +'</div>';
      document.body.appendChild(modal);

      el('commissionClose').addEventListener('click',function(){closeModal('commissionModal')});
      el('commissionCalculate').addEventListener('click',calculateCommission);
      el('commissionRate').addEventListener('input',calculateCommission);
      el('commissionSeller').addEventListener('change',calculateCommission);
      el('commissionStage').addEventListener('change',calculateCommission);
      el('commissionPeriod').addEventListener('change',function(){setCommissionPeriodInput(true);calculateCommission()});
      el('commissionPeriodValue').addEventListener('change',calculateCommission);
    }

    var menu=el('adminMenu');
    if(menu&&!el('primeCommissionBtn')){
      var btn=document.createElement('button');
      btn.id='primeCommissionBtn';
      btn.type='button';
      btn.innerHTML='Comissões <small>Calcular comissão por vendedor e período</small>';
      btn.addEventListener('click',openCommission);
      menu.appendChild(btn);
    }
    updateCommissionAccess();
  }

  function updateCommissionAccess(){
    var btn=el('primeCommissionBtn');
    if(btn)btn.style.display=isCommissionAdmin()?'':'none';
  }

  function setCommissionPeriodInput(reset){
    var mode=el('commissionPeriod')?el('commissionPeriod').value:'month';
    var input=el('commissionPeriodValue');
    var label=el('commissionPeriodLabel');
    if(!input||!label)return;
    if(mode==='day'){
      input.type='date';
      if(reset||!input.value)input.value=today();
      label.firstChild.nodeValue='Dia';
    }else if(mode==='year'){
      input.type='number';
      input.min='2000';input.max='2100';input.step='1';
      if(reset||!input.value)input.value=String(new Date().getFullYear());
      label.firstChild.nodeValue='Ano';
    }else{
      input.type='month';
      input.removeAttribute('min');input.removeAttribute('max');input.removeAttribute('step');
      if(reset||!/^\d{4}-\d{2}$/.test(input.value||''))input.value=today().slice(0,7);
      label.firstChild.nodeValue='Mês';
    }
  }

  function optionName(){
    var select=el('commissionSeller');
    if(!select||select.selectedIndex<0)return '';
    var option=select.options[select.selectedIndex];
    return option&&option.getAttribute('data-name')||'';
  }

  async function loadCommissionUsers(){
    var select=el('commissionSeller');
    if(!select)return;
    select.innerHTML='<option value="">Carregando vendedores...</option>';
    select.disabled=true;
    try{
      var j=await api('list_users');
      commissionUsers=(j.users||[]).filter(function(u){return u&&u.enabled!==false}).sort(function(a,b){
        if(a.role!==b.role)return a.role==='user'?-1:1;
        return String(a.username||'').localeCompare(String(b.username||''));
      });
      if(!commissionUsers.length)throw new Error('Nenhum vendedor ativo encontrado.');
      select.innerHTML=commissionUsers.map(function(u){
        return '<option value="'+esc(u.id)+'" data-name="'+esc(u.username||'')+'">'+esc(u.username||'Usuário')+(u.role==='admin'?' · Administrador':'')+'</option>';
      }).join('');
      var firstSeller=commissionUsers.find(function(u){return u.role==='user'})||commissionUsers[0];
      if(firstSeller)select.value=firstSeller.id;
    }catch(e){
      commissionUsers=[];
      select.innerHTML='<option value="">Não foi possível carregar</option>';
      var list=el('commissionList');
      if(list)list.innerHTML='<div class="empty">'+esc(e.message||'Não foi possível carregar os vendedores.')+'</div>';
    }finally{
      select.disabled=false;
    }
  }

  function saleMatchesSeller(s,sellerId,sellerName){
    if(!sellerId)return false;
    var ownerId=String(s.createdByUserId||s.assignedUserId||s.ownerUserId||'');
    if(ownerId&&ownerId===String(sellerId))return true;
    var ownerName=String(s.createdBy||s.owner||'').trim().toLowerCase();
    return !!(sellerName&&ownerName===String(sellerName).trim().toLowerCase());
  }

  function saleMatchesPeriod(s){
    var mode=el('commissionPeriod').value;
    var value=String(el('commissionPeriodValue').value||'');
    var date=String(s.date||'');
    if(mode==='day')return date===value;
    if(mode==='year')return !!value&&date.indexOf(value+'-')===0;
    return !!value&&date.indexOf(value)===0;
  }

  function saleMatchesStage(s){
    var filter=el('commissionStage').value;
    var stage=String(s.orderStage||'order');
    if(filter==='completed')return stage==='completed';
    if(filter==='invoiced_plus')return stage==='invoiced'||stage==='completed';
    return true;
  }

  function percentText(n){
    return Number(n||0).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
  }

  function calculateCommission(){
    if(!el('commissionModal'))return;
    var sellerId=el('commissionSeller').value;
    var sellerName=optionName();
    var rate=Math.max(0,Math.min(100,Number(el('commissionRate').value)||0));
    var sales=(db.sales||[]).filter(function(s){
      return saleMatchesSeller(s,sellerId,sellerName)&&saleMatchesPeriod(s)&&saleMatchesStage(s);
    }).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});

    var total=sales.reduce(function(sum,s){return sum+orderTotal(s)},0);
    var commission=total*(rate/100);
    el('commissionSalesTotal').textContent=money(total);
    el('commissionTotal').textContent=money(commission);
    el('commissionCount').textContent=String(sales.length);
    el('commissionRateSummary').textContent=percentText(rate);

    var list=el('commissionList');
    if(!sales.length){
      list.innerHTML='<div class="empty">Nenhuma venda encontrada para esse vendedor e período.</div>';
      return;
    }
    list.innerHTML=sales.map(function(s){
      var c=typeof customer==='function'?customer(s.party):null;
      var value=orderTotal(s);
      var valueCommission=value*(rate/100);
      var stage=typeof stageLabel==='function'?stageLabel(s.orderStage):String(s.orderStage||'Pedido');
      return '<div class="row"><div class="rowtop"><div><h4>'+esc(c&&c.name?c.name:'Cliente não informado')+'</h4><div class="meta">'+esc(s.date||'')+' · '+esc(stage)+'</div></div><div style="text-align:right"><div class="value">'+money(value)+'</div><div class="meta">Comissão: <strong style="color:var(--green)">'+money(valueCommission)+'</strong></div></div></div></div>';
    }).join('');
  }

  async function openCommission(){
    if(!isCommissionAdmin()){
      alert('A área de comissões está disponível para administradores.');
      return;
    }
    ensureUI();
    setCommissionPeriodInput(false);
    el('commissionModal').classList.add('on');
    await loadCommissionUsers();
    calculateCommission();
  }

  window.openCommission=openCommission;
  window.calculateCommission=calculateCommission;

  ensureUI();
  setCommissionPeriodInput(false);

  var originalRenderAll=window.renderAll;
  if(typeof originalRenderAll==='function'){
    window.renderAll=function(){
      var r=originalRenderAll.apply(this,arguments);
      ensureUI();
      updateCommissionAccess();
      return r;
    };
  }

  var originalAfterLogin=window.afterLogin;
  if(typeof originalAfterLogin==='function'){
    window.afterLogin=async function(){
      var r=await originalAfterLogin.apply(this,arguments);
      ensureUI();
      updateCommissionAccess();
      return r;
    };
  }
})();
