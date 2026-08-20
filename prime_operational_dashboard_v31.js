(function(){
  'use strict';

  var period='month',customFrom='',customTo='';

  function el(id){return document.getElementById(id)}
  function localDate(d){d=d||new Date();var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day}
  function firstMonth(s){return String(s||'').slice(0,7)+'-01'}
  function fmtDate(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'')}
  function stageName(s){return {order:'Pedido',separation:'Em separação',invoiced:'Faturado',completed:'Concluído'}[s||'order']||'Pedido'}
  function stageClass(s){return {order:'po-order',separation:'po-separation',invoiced:'po-invoiced',completed:'po-completed'}[s||'order']||'po-order'}
  function customerName(o){var c=typeof customer==='function'?customer(o.party):null;return c&&c.name?c.name:'Cliente não informado'}
  function serviceName(o){if(typeof window.serviceLabel==='function')return window.serviceLabel(o,'order');var n=Number(o&&o.serviceNo)||0;return 'Pedido #'+String(n||1).padStart(2,'0')}
  function sum(list){return (list||[]).reduce(function(total,o){return total+orderTotal(o)},0)}
  function orderLabel(n){return n+' '+(n===1?'pedido':'pedidos')}
  function can(key){return typeof window.canPermission==='function'?window.canPermission(key):(typeof isAdmin==='function'&&isAdmin())}

  function selectedBounds(){
    var t=localDate();
    if(period==='today')return [t,t,'Hoje'];
    if(period==='custom')return [customFrom||firstMonth(t),customTo||t,'Período personalizado'];
    return [firstMonth(t),t,'Este mês'];
  }

  function removeOldStyles(){['primeDashboardStyle','primeSimpleDashboardStyle','primeBalancedDashboardStyle','primeOperationalDashboardStyle'].forEach(function(id){var n=el(id);if(n)n.remove()})}

  function injectStyle(){
    removeOldStyles();
    var style=document.createElement('style');style.id='primeOperationalDashboardStyle';style.textContent='\
      #home .po-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:15px}\
      #home .po-kicker{color:var(--green);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}\
      #home .po-head h2{margin:5px 0 3px;font-size:29px;letter-spacing:-.03em}\
      #home .po-head p{margin:0;color:var(--muted);font-size:12px}\
      #home .po-actions{display:flex;gap:8px;flex:none}\
      #home .po-filter{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;background:linear-gradient(145deg,#0e1b16,#0a1511);border:1px solid var(--line);border-radius:15px;padding:12px 13px;margin-bottom:11px}\
      #home .po-filter-copy strong{display:block;font-size:12px}#home .po-filter-copy span{display:block;color:var(--muted);font-size:10px;margin-top:3px}\
      #home .po-filter-controls{display:flex;align-items:flex-end;gap:7px;flex-wrap:wrap;justify-content:flex-end}\
      #home .po-filter-controls label{font-size:9px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.05em}\
      #home .po-filter-controls select,#home .po-filter-controls input{width:auto;min-width:135px;margin-top:4px;padding:9px 10px;font-size:11px}\
      #home .po-custom{display:none;gap:7px;align-items:flex-end}\
      #home .po-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:11px}\
      #home .po-kpi,#home .po-panel{background:linear-gradient(145deg,#0e1b16,#0a1511);border:1px solid var(--line);box-shadow:0 14px 34px #0002}\
      #home .po-kpi{border-radius:16px;padding:15px;position:relative;overflow:hidden}\
      #home .po-kpi:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,var(--green),#65bfff);opacity:.62}\
      #home .po-kpi-top{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}\
      #home .po-icon{width:25px;height:25px;display:grid;place-items:center;border-radius:8px;background:#10281d;color:var(--green);font-size:11px;font-weight:900}\
      #home .po-kpi strong{display:block;font-size:21px;margin-top:10px;letter-spacing:-.025em}\
      #home .po-kpi small{display:block;color:var(--muted);font-size:9px;margin-top:4px}\
      #home .po-grid{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(250px,.7fr);gap:11px;align-items:start}\
      #home .po-panel{border-radius:16px;padding:15px;min-width:0}\
      #home .po-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}\
      #home .po-panel-head h3{margin:0;font-size:14px}#home .po-panel-head small{color:var(--muted);font-size:9px}\
      #home .po-orders{display:grid}\
      #home .po-order{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:13px;align-items:center;padding:12px 2px;border-bottom:1px solid #1b3027}\
      #home .po-order:last-child{border-bottom:0}\
      #home .po-order-title{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}\
      #home .po-order-title strong{color:var(--green);font-size:11px}\
      #home .po-order-title b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:410px}\
      #home .po-order-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;color:var(--muted);font-size:9px;margin-top:5px}\
      #home .po-owner{color:var(--green);font-weight:850}\
      #home .po-order-side{text-align:right;white-space:nowrap}#home .po-order-side>strong{display:block;font-size:12px}\
      #home .po-stage{display:inline-block;border:1px solid #2a4538;border-radius:999px;padding:4px 7px;font-size:8px;color:var(--muted);margin-top:5px}\
      #home .po-stage.po-separation{color:#ffd274;border-color:#6d592a}.po-stage.po-invoiced{color:#80c9ff;border-color:#275a78}.po-stage.po-completed{color:#71e5ad;border-color:#266849}\
      #home .po-stages{display:grid;gap:10px;padding-top:2px}\
      #home .po-stage-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}\
      #home .po-stage-info{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px}\
      #home .po-stage-info span{font-size:10px;color:#cad7d1}#home .po-stage-info strong{font-size:11px}\
      #home .po-track{height:7px;background:#07110d;border:1px solid #20362c;border-radius:99px;overflow:hidden}\
      #home .po-fill{height:100%;background:linear-gradient(90deg,var(--green),#69baff);border-radius:99px}\
      #home .po-stage-row-inner{min-width:0}\
      #home .po-period-summary{margin-top:13px;border-top:1px solid #1b3027;padding-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}\
      #home .po-period-summary div{background:#09140f;border:1px solid #1d3229;border-radius:10px;padding:10px}\
      #home .po-period-summary span{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.05em}\
      #home .po-period-summary strong{display:block;font-size:13px;margin-top:5px}\
      #home .po-empty{padding:26px 10px;text-align:center;color:var(--muted);font-size:10px;border:1px dashed var(--line);border-radius:12px;margin-top:8px}\
      @media(max-width:950px){#home .po-kpis{grid-template-columns:1fr 1fr}#home .po-grid{grid-template-columns:1fr}}\
      @media(max-width:680px){#home .po-head{align-items:flex-start;flex-direction:column}#home .po-actions{width:100%}#home .po-actions button{flex:1}#home .po-filter{align-items:flex-start;flex-direction:column}#home .po-filter-controls{width:100%;justify-content:flex-start}#home .po-filter-controls>label{width:100%}#home .po-filter-controls select{width:100%}#home .po-custom{width:100%}#home .po-custom label{flex:1}#home .po-custom input{width:100%;min-width:0}}\
      @media(max-width:460px){#home .po-head h2{font-size:25px}#home .po-kpis{grid-template-columns:1fr 1fr}#home .po-kpi strong{font-size:18px}#home .po-order{grid-template-columns:1fr}#home .po-order-side{text-align:left;display:flex;gap:8px;align-items:center}#home .po-stage{margin-top:0}#home .po-period-summary{grid-template-columns:1fr}}\
    ';document.head.appendChild(style);
  }

  function buildDashboard(){
    var home=el('home');if(!home)return;injectStyle();home.dataset.primeDashboard='operational';
    var t=localDate();if(!customFrom)customFrom=firstMonth(t);if(!customTo)customTo=t;
    home.innerHTML='\
      <div class="po-head">\
        <div><div class="po-kicker">PRIME · GESTÃO</div><h2>Painel</h2><p>Vendas e pedidos que precisam da sua atenção.</p></div>\
        <div class="po-actions"><button id="poNewQuote" class="secondary" onclick="openQuote()">＋ Orçamento</button><button id="poNewOrder" class="primary" onclick="openOrder()">＋ Pedido</button></div>\
      </div>\
      <div class="po-filter">\
        <div class="po-filter-copy"><strong>Movimento dos pedidos</strong><span id="poPeriodText">Este mês</span></div>\
        <div class="po-filter-controls">\
          <label>Período<select id="poPeriod"><option value="today">Hoje</option><option value="month" selected>Este mês</option><option value="custom">Outro período</option></select></label>\
          <div id="poCustom" class="po-custom"><label>De<input id="poFrom" type="date"></label><label>Até<input id="poTo" type="date"></label></div>\
        </div>\
      </div>\
      <div class="po-kpis">\
        <article class="po-kpi"><div class="po-kpi-top"><span class="po-icon">↗</span><span>Vendido hoje</span></div><strong id="poToday">R$ 0,00</strong><small id="poTodayCount">0 pedidos</small></article>\
        <article class="po-kpi"><div class="po-kpi-top"><span class="po-icon">▦</span><span>Vendido no mês</span></div><strong id="poMonth">R$ 0,00</strong><small id="poMonthCount">0 pedidos</small></article>\
        <article class="po-kpi"><div class="po-kpi-top"><span class="po-icon">◇</span><span>Orçamentos abertos</span></div><strong id="poQuotes">0</strong><small id="poQuotesValue">R$ 0,00 em negociação</small></article>\
        <article class="po-kpi"><div class="po-kpi-top"><span class="po-icon">●</span><span>Pedidos em andamento</span></div><strong id="poOpen">0</strong><small>Ainda não concluídos</small></article>\
      </div>\
      <div class="po-grid">\
        <section class="po-panel"><div class="po-panel-head"><h3>Últimos pedidos</h3><button class="linkbtn" onclick="go(\'orders\')">Ver todos</button></div><div id="poOrders" class="po-orders"></div></section>\
        <section class="po-panel"><div class="po-panel-head"><h3>Pedidos por etapa</h3><small id="poStagePeriod">Este mês</small></div><div id="poStages" class="po-stages"></div><div class="po-period-summary"><div><span>Pedidos no período</span><strong id="poPeriodCount">0</strong></div><div><span>Vendas no período</span><strong id="poPeriodValue">R$ 0,00</strong></div></div></section>\
      </div>';

    el('poPeriod').value=period;el('poFrom').value=customFrom;el('poTo').value=customTo;
    el('poPeriod').onchange=function(){period=this.value;toggleCustom();renderDashboard()};
    el('poFrom').onchange=function(){customFrom=this.value;renderDashboard()};el('poTo').onchange=function(){customTo=this.value;renderDashboard()};
    toggleCustom();applyButtonPermissions();
  }

  function toggleCustom(){var n=el('poCustom');if(n)n.style.display=period==='custom'?'flex':'none'}
  function applyButtonPermissions(){var q=el('poNewQuote'),o=el('poNewOrder');if(q)q.style.display=can('create_quotes')?'':'none';if(o)o.style.display=can('create_orders')?'':'none'}

  function renderStages(orders,label){
    var keys=['order','separation','invoiced','completed'],counts={order:0,separation:0,invoiced:0,completed:0};orders.forEach(function(o){var k=o.orderStage||'order';counts[k]=(counts[k]||0)+1});var max=Math.max.apply(null,keys.map(function(k){return counts[k]}).concat([1]));
    el('poStages').innerHTML=keys.map(function(k){var pct=Math.round((counts[k]/max)*100);return '<div class="po-stage-row"><div class="po-stage-row-inner"><div class="po-stage-info"><span>'+stageName(k)+'</span><strong>'+counts[k]+'</strong></div><div class="po-track"><div class="po-fill" style="width:'+pct+'%"></div></div></div></div>'}).join('');el('poStagePeriod').textContent=label;
  }

  function renderOrders(orders){
    var a=orders.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||Number(b.serviceNo||0)-Number(a.serviceNo||0)}).slice(0,8),box=el('poOrders');
    if(!a.length){box.innerHTML='<div class="po-empty">Nenhum pedido neste período.</div>';return}
    box.innerHTML=a.map(function(o){var owner='';try{if(((typeof isAdmin==='function'&&isAdmin())||can('view_all_sales'))&&o.createdBy)owner='<span class="po-owner">'+esc(o.createdBy)+'</span>'}catch(e){}return '<div class="po-order"><div><div class="po-order-title"><strong>'+esc(serviceName(o))+'</strong><b>'+esc(customerName(o))+'</b></div><div class="po-order-meta"><span>'+esc(fmtDate(o.date))+'</span>'+owner+'</div></div><div class="po-order-side"><strong>'+money(orderTotal(o))+'</strong><span class="po-stage '+stageClass(o.orderStage)+'">'+esc(stageName(o.orderStage))+'</span></div></div>'}).join('');
  }

  function renderDashboard(){
    if(!el('poToday'))buildDashboard();if(!el('poToday'))return;
    var sales=db&&db.sales?db.sales:[],quotes=db&&db.quotes?db.quotes:[],t=localDate(),monthStart=firstMonth(t),b=selectedBounds();
    var todayOrders=sales.filter(function(o){return String(o.date||'')===t});
    var monthOrders=sales.filter(function(o){var d=String(o.date||'');return d>=monthStart&&d<=t});
    var selected=sales.filter(function(o){var d=String(o.date||'');return d>=b[0]&&d<=b[1]});
    var open=sales.filter(function(o){return String(o.orderStage||'order')!=='completed'});
    el('poToday').textContent=money(sum(todayOrders));el('poTodayCount').textContent=orderLabel(todayOrders.length);
    el('poMonth').textContent=money(sum(monthOrders));el('poMonthCount').textContent=orderLabel(monthOrders.length);
    el('poQuotes').textContent=String(quotes.length);el('poQuotesValue').textContent=money(sum(quotes))+' em negociação';el('poOpen').textContent=String(open.length);
    el('poPeriod').value=period;el('poPeriodText').textContent=b[2];el('poFrom').value=customFrom;el('poTo').value=customTo;toggleCustom();
    el('poPeriodCount').textContent=String(selected.length);el('poPeriodValue').textContent=money(sum(selected));
    renderOrders(selected);renderStages(selected,b[2]);applyButtonPermissions();
  }

  function updateNav(){var b=document.querySelector('.nav button[data-page="home"]');if(b)b.innerHTML='<span>▦</span>Painel';if(el('pageTitle')&&document.querySelector('#home.page.on'))el('pageTitle').textContent='Painel'}

  buildDashboard();updateNav();
  var previousGo=window.go;if(typeof previousGo==='function')window.go=function(page){var r=previousGo.apply(this,arguments);if(page==='home'){if(el('pageTitle'))el('pageTitle').textContent='Painel';renderDashboard()}return r};
  window.renderHome=renderDashboard;window.renderDashboard=renderDashboard;
  var previousAfterLogin=window.afterLogin;if(typeof previousAfterLogin==='function')window.afterLogin=async function(){var r=await previousAfterLogin.apply(this,arguments);buildDashboard();renderDashboard();updateNav();return r};
  try{if(session)renderDashboard()}catch(e){}
})();