(function(){
  'use strict';

  function el(id){return document.getElementById(id)}
  function localDate(d){
    d=d||new Date();
    var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function firstMonth(s){return String(s||'').slice(0,7)+'-01'}
  function fmtDate(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'')}
  function stageName(s){return {order:'Pedido',separation:'Em separação',invoiced:'Faturado',completed:'Concluído'}[s||'order']||'Pedido'}
  function stageClass(s){return {order:'ps-order',separation:'ps-separation',invoiced:'ps-invoiced',completed:'ps-completed'}[s||'order']||'ps-order'}
  function serviceName(o){
    if(typeof window.serviceLabel==='function')return window.serviceLabel(o,'order');
    var n=Number(o&&o.serviceNo)||0;
    return 'Pedido #'+String(n||1).padStart(2,'0');
  }
  function customerName(o){var c=typeof customer==='function'?customer(o.party):null;return c&&c.name?c.name:'Cliente não informado'}
  function total(list){return (list||[]).reduce(function(sum,o){return sum+orderTotal(o)},0)}
  function orderLabel(n){return n+' '+(n===1?'pedido':'pedidos')}

  function tidyProcurement(){
    var supplierExtra=document.querySelector('#suppliersModal .proc-toolbar .primary');
    if(supplierExtra)supplierExtra.remove();
    var purchaseExtra=document.querySelector('#purchasesModal .proc-toolbar .primary');
    if(purchaseExtra)purchaseExtra.remove();

    var supplierTop=document.querySelector('#suppliersModal .proc-top-actions .primary');
    if(supplierTop)supplierTop.textContent='＋ Novo Fornecedor';
    var purchaseTop=document.querySelector('#purchasesModal .proc-top-actions .primary');
    if(purchaseTop)purchaseTop.textContent='＋ Nova Compra';

    if(!el('primeProcurementSingleButtonStyle')){
      var style=document.createElement('style');
      style.id='primeProcurementSingleButtonStyle';
      style.textContent='\n@media(max-width:700px){.proc-top{align-items:center!important;gap:10px!important}.proc-top>div:first-child{min-width:0}.proc-top-actions{display:flex!important;align-items:center!important;gap:6px!important}.proc-top-actions .primary{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:9px 10px!important;font-size:10px!important;white-space:nowrap}.proc-top-actions .close{flex:none}.proc-toolbar{display:block!important}}\n';
      document.head.appendChild(style);
    }
  }

  function injectDashboardStyle(){
    var old=el('primeDashboardStyle');if(old)old.remove();
    if(el('primeSimpleDashboardStyle'))return;
    var style=document.createElement('style');
    style.id='primeSimpleDashboardStyle';
    style.textContent='\
      #home .ps-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:18px}\
      #home .ps-kicker{font-size:10px;font-weight:900;letter-spacing:.14em;color:var(--green);text-transform:uppercase}\
      #home .ps-head h2{margin:5px 0 3px;font-size:28px;letter-spacing:-.03em}\
      #home .ps-head p{margin:0;color:var(--muted);font-size:12px}\
      #home .ps-actions{display:flex;gap:8px;flex:none}\
      #home .ps-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-bottom:13px}\
      #home .ps-kpi,#home .ps-panel{background:linear-gradient(145deg,#0e1b16,#0a1511);border:1px solid var(--line);box-shadow:0 14px 34px #0002}\
      #home .ps-kpi{border-radius:17px;padding:17px;position:relative;overflow:hidden}\
      #home .ps-kpi:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,var(--green),#65bfff);opacity:.65}\
      #home .ps-kpi span{display:block;color:var(--muted);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}\
      #home .ps-kpi strong{display:block;font-size:23px;margin-top:9px;letter-spacing:-.03em}\
      #home .ps-kpi small{display:block;color:var(--muted);font-size:10px;margin-top:5px}\
      #home .ps-panel{border-radius:17px;padding:16px}\
      #home .ps-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}\
      #home .ps-panel-head h3{margin:0;font-size:15px}\
      #home .ps-list{display:grid}\
      #home .ps-order-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px 2px;border-bottom:1px solid #1b3027}\
      #home .ps-order-row:last-child{border-bottom:0}\
      #home .ps-order-main{min-width:0}\
      #home .ps-order-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\
      #home .ps-order-title strong{font-size:12px;color:var(--green)}\
      #home .ps-order-title b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px}\
      #home .ps-order-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;color:var(--muted);font-size:10px;margin-top:5px}\
      #home .ps-owner{color:var(--green);font-weight:800}\
      #home .ps-order-side{text-align:right;white-space:nowrap}\
      #home .ps-order-side strong{display:block;font-size:13px}\
      #home .ps-stage{display:inline-block;margin-top:5px;border:1px solid #2b4439;border-radius:999px;padding:4px 7px;font-size:9px;color:var(--muted)}\
      #home .ps-stage.ps-separation{color:#ffd274;border-color:#6d592a}.ps-stage.ps-invoiced{color:#80c9ff;border-color:#275a78}.ps-stage.ps-completed{color:#71e5ad;border-color:#266849}\
      #home .ps-empty{padding:26px 12px;text-align:center;color:var(--muted);font-size:11px;border:1px dashed var(--line);border-radius:13px;margin-top:8px}\
      @media(max-width:720px){#home .ps-head{align-items:flex-start;flex-direction:column}#home .ps-actions{width:100%}#home .ps-actions button{flex:1}#home .ps-kpis{grid-template-columns:1fr 1fr}#home .ps-kpis .ps-kpi:last-child{grid-column:1/-1}}\
      @media(max-width:460px){#home .ps-head h2{font-size:25px}#home .ps-kpis{grid-template-columns:1fr}#home .ps-kpis .ps-kpi:last-child{grid-column:auto}#home .ps-order-row{grid-template-columns:1fr}#home .ps-order-side{text-align:left;display:flex;align-items:center;gap:8px}#home .ps-stage{margin-top:0}}\
    ';
    document.head.appendChild(style);
  }

  function buildDashboard(){
    var home=el('home');if(!home)return;
    injectDashboardStyle();
    home.dataset.primeDashboard='simple';
    home.innerHTML='\
      <div class="ps-head">\
        <div><div class="ps-kicker">PRIME</div><h2>Visão geral</h2><p>Um resumo simples do que importa no dia a dia.</p></div>\
        <div class="ps-actions"><button class="secondary" onclick="openQuote()">＋ Orçamento</button><button class="primary" onclick="openOrder()">＋ Pedido</button></div>\
      </div>\
      <div class="ps-kpis">\
        <article class="ps-kpi"><span>Vendido hoje</span><strong id="psTodayValue">R$ 0,00</strong><small id="psTodayCount">0 pedidos</small></article>\
        <article class="ps-kpi"><span>Vendido no mês</span><strong id="psMonthValue">R$ 0,00</strong><small id="psMonthCount">0 pedidos</small></article>\
        <article class="ps-kpi"><span>Orçamentos abertos</span><strong id="psQuotesCount">0</strong><small id="psQuotesValue">R$ 0,00 em negociação</small></article>\
      </div>\
      <section class="ps-panel">\
        <div class="ps-panel-head"><h3>Últimos pedidos</h3><button class="linkbtn" onclick="go(\'orders\')">Ver todos</button></div>\
        <div id="psOrders" class="ps-list"></div>\
      </section>';
  }

  function renderDashboard(){
    var home=el('home');if(!home)return;
    if(!el('psTodayValue'))buildDashboard();
    if(!el('psTodayValue'))return;

    var sales=db&&db.sales?db.sales:[],quotes=db&&db.quotes?db.quotes:[];
    var today=localDate(),monthStart=firstMonth(today),monthPrefix=today.slice(0,7);
    var todayOrders=sales.filter(function(o){return String(o.date||'')===today});
    var monthOrders=sales.filter(function(o){return String(o.date||'').slice(0,7)===monthPrefix&&String(o.date||'')>=monthStart});

    el('psTodayValue').textContent=money(total(todayOrders));
    el('psTodayCount').textContent=orderLabel(todayOrders.length);
    el('psMonthValue').textContent=money(total(monthOrders));
    el('psMonthCount').textContent=orderLabel(monthOrders.length);
    el('psQuotesCount').textContent=String(quotes.length);
    el('psQuotesValue').textContent=money(total(quotes))+' em negociação';

    var recent=sales.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||Number(b.serviceNo||0)-Number(a.serviceNo||0)}).slice(0,6);
    var box=el('psOrders');
    if(!recent.length){box.innerHTML='<div class="ps-empty">Nenhum pedido registrado ainda.</div>';return}
    box.innerHTML=recent.map(function(o){
      var owner='';
      try{if(typeof isAdmin==='function'&&isAdmin()&&o.createdBy)owner='<span class="ps-owner">'+esc(o.createdBy)+'</span>'}catch(e){}
      return '<div class="ps-order-row"><div class="ps-order-main"><div class="ps-order-title"><strong>'+esc(serviceName(o))+'</strong><b>'+esc(customerName(o))+'</b></div><div class="ps-order-meta"><span>'+esc(fmtDate(o.date))+'</span>'+owner+'</div></div><div class="ps-order-side"><strong>'+money(orderTotal(o))+'</strong><span class="ps-stage '+stageClass(o.orderStage)+'">'+esc(stageName(o.orderStage))+'</span></div></div>';
    }).join('');
  }

  function updateNav(){
    var b=document.querySelector('.nav button[data-page="home"]');
    if(b)b.innerHTML='<span>⌂</span>Início';
    if(el('pageTitle')&&document.querySelector('#home.page.on'))el('pageTitle').textContent='Início';
  }

  tidyProcurement();
  buildDashboard();
  updateNav();

  var previousGo=window.go;
  if(typeof previousGo==='function'){
    window.go=function(page){
      var result=previousGo.apply(this,arguments);
      if(page==='home'){
        if(el('pageTitle'))el('pageTitle').textContent='Início';
        renderDashboard();
      }
      return result;
    };
  }

  window.renderHome=renderDashboard;
  window.renderDashboard=renderDashboard;

  var previousAfterLogin=window.afterLogin;
  if(typeof previousAfterLogin==='function'){
    window.afterLogin=async function(){
      var result=await previousAfterLogin.apply(this,arguments);
      tidyProcurement();
      buildDashboard();
      renderDashboard();
      updateNav();
      return result;
    };
  }

  setTimeout(tidyProcurement,100);
  setTimeout(tidyProcurement,700);
  try{if(session)renderDashboard()}catch(e){}
})();
