(function(){
  'use strict';

  var period='month';

  function el(id){return document.getElementById(id)}
  function localDate(d){
    d=d||new Date();
    var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function parseDate(s){return new Date(String(s||'')+'T12:00:00')}
  function addDays(s,n){var d=parseDate(s);d.setDate(d.getDate()+n);return localDate(d)}
  function firstMonth(s){return String(s||'').slice(0,7)+'-01'}
  function fmtDate(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'')}
  function stageName(s){return {order:'Pedido',separation:'Em separação',invoiced:'Faturado',completed:'Concluído'}[s||'order']||'Pedido'}
  function stageClass(s){return {order:'pb-order',separation:'pb-separation',invoiced:'pb-invoiced',completed:'pb-completed'}[s||'order']||'pb-order'}
  function customerName(o){var c=typeof customer==='function'?customer(o.party):null;return c&&c.name?c.name:'Cliente não informado'}
  function serviceName(o){
    if(typeof window.serviceLabel==='function')return window.serviceLabel(o,'order');
    var n=Number(o&&o.serviceNo)||0;
    return 'Pedido #'+String(n||1).padStart(2,'0');
  }
  function sum(list){return (list||[]).reduce(function(total,o){return total+orderTotal(o)},0)}
  function orderLabel(n){return n+' '+(n===1?'pedido':'pedidos')}

  function bounds(){
    var today=localDate();
    if(period==='today')return [today,today,'Hoje'];
    if(period==='7d')return [addDays(today,-6),today,'Últimos 7 dias'];
    if(period==='30d')return [addDays(today,-29),today,'Últimos 30 dias'];
    return [firstMonth(today),today,'Este mês'];
  }

  function removeOldStyles(){
    ['primeDashboardStyle','primeSimpleDashboardStyle','primeBalancedDashboardStyle'].forEach(function(id){var n=el(id);if(n)n.remove()});
  }

  function injectStyle(){
    removeOldStyles();
    var style=document.createElement('style');
    style.id='primeBalancedDashboardStyle';
    style.textContent='\
      #home .pb-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:14px}\
      #home .pb-kicker{color:var(--green);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}\
      #home .pb-head h2{margin:5px 0 3px;font-size:29px;letter-spacing:-.03em}\
      #home .pb-head p{margin:0;color:var(--muted);font-size:12px}\
      #home .pb-actions{display:flex;gap:8px;flex:none}\
      #home .pb-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0c1813;border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:11px}\
      #home .pb-toolbar-copy strong{display:block;font-size:12px}#home .pb-toolbar-copy span{display:block;color:var(--muted);font-size:10px;margin-top:2px}\
      #home .pb-period{width:auto;min-width:150px;margin:0;padding:9px 11px;font-size:11px}\
      #home .pb-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:11px}\
      #home .pb-kpi,#home .pb-panel{background:linear-gradient(145deg,#0e1b16,#0a1511);border:1px solid var(--line);box-shadow:0 14px 34px #0002}\
      #home .pb-kpi{border-radius:16px;padding:15px;position:relative;overflow:hidden}\
      #home .pb-kpi:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,var(--green),#70bfff);opacity:.6}\
      #home .pb-kpi span{display:block;color:var(--muted);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}\
      #home .pb-kpi strong{display:block;font-size:21px;margin-top:9px;letter-spacing:-.025em}\
      #home .pb-kpi small{display:block;color:var(--muted);font-size:9px;margin-top:4px}\
      #home .pb-grid{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(245px,.75fr);gap:11px;align-items:start}\
      #home .pb-side{display:grid;gap:11px}\
      #home .pb-panel{border-radius:16px;padding:15px;min-width:0}\
      #home .pb-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}\
      #home .pb-panel-head h3{margin:0;font-size:14px}\
      #home .pb-panel-head small{color:var(--muted);font-size:9px}\
      #home .pb-order{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:13px;align-items:center;padding:11px 1px;border-bottom:1px solid #1b3027}\
      #home .pb-order:last-child{border-bottom:0}\
      #home .pb-order-title{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}\
      #home .pb-order-title strong{color:var(--green);font-size:11px}\
      #home .pb-order-title b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:390px}\
      #home .pb-order-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;color:var(--muted);font-size:9px;margin-top:5px}\
      #home .pb-owner{color:var(--green);font-weight:850}\
      #home .pb-order-side{text-align:right;white-space:nowrap}\
      #home .pb-order-side>strong{display:block;font-size:12px}\
      #home .pb-stage{display:inline-block;border:1px solid #2a4538;border-radius:999px;padding:4px 7px;font-size:8px;color:var(--muted);margin-top:5px}\
      #home .pb-stage.pb-separation{color:#ffd274;border-color:#6d592a}.pb-stage.pb-invoiced{color:#80c9ff;border-color:#275a78}.pb-stage.pb-completed{color:#71e5ad;border-color:#266849}\
      #home .pb-stages{display:grid;gap:7px}\
      #home .pb-stage-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:#09140f;border:1px solid #1d3229;border-radius:11px;padding:10px 11px}\
      #home .pb-stage-row span{font-size:10px;color:#cad7d1}#home .pb-stage-row strong{font-size:14px}\
      #home .pb-products{display:grid;gap:2px}\
      #home .pb-product{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #1b3027}\
      #home .pb-product:last-child{border-bottom:0}\
      #home .pb-rank{width:23px;height:23px;display:grid;place-items:center;border-radius:7px;background:#10241a;color:var(--green);font-size:9px;font-weight:900}\
      #home .pb-product b{display:block;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#home .pb-product small{display:block;color:var(--muted);font-size:8px;margin-top:2px}\
      #home .pb-product>strong{font-size:10px;white-space:nowrap}\
      #home .pb-empty{padding:24px 10px;text-align:center;color:var(--muted);font-size:10px;border:1px dashed var(--line);border-radius:12px;margin-top:8px}\
      @media(max-width:950px){#home .pb-kpis{grid-template-columns:1fr 1fr}#home .pb-grid{grid-template-columns:1fr}#home .pb-side{grid-template-columns:1fr 1fr}}\
      @media(max-width:650px){#home .pb-head{align-items:flex-start;flex-direction:column}#home .pb-actions{width:100%}#home .pb-actions button{flex:1}#home .pb-toolbar{align-items:flex-start;flex-direction:column}#home .pb-period{width:100%}#home .pb-side{grid-template-columns:1fr}}\
      @media(max-width:450px){#home .pb-head h2{font-size:25px}#home .pb-kpis{grid-template-columns:1fr 1fr}#home .pb-kpi strong{font-size:18px}#home .pb-order{grid-template-columns:1fr}#home .pb-order-side{text-align:left;display:flex;gap:8px;align-items:center}#home .pb-stage{margin-top:0}}\
    ';
    document.head.appendChild(style);
  }

  function buildDashboard(){
    var home=el('home');if(!home)return;
    injectStyle();
    home.dataset.primeDashboard='balanced';
    home.innerHTML='\
      <div class="pb-head">\
        <div><div class="pb-kicker">PRIME · GESTÃO</div><h2>Painel</h2><p>Uma visão clara do movimento do seu negócio.</p></div>\
        <div class="pb-actions"><button class="secondary" onclick="openQuote()">＋ Orçamento</button><button class="primary" onclick="openOrder()">＋ Pedido</button></div>\
      </div>\
      <div class="pb-toolbar">\
        <div class="pb-toolbar-copy"><strong>Resumo de vendas</strong><span id="pbPeriodText">Este mês</span></div>\
        <select id="pbPeriod" class="pb-period"><option value="today">Hoje</option><option value="7d">Últimos 7 dias</option><option value="month" selected>Este mês</option><option value="30d">Últimos 30 dias</option></select>\
      </div>\
      <div class="pb-kpis">\
        <article class="pb-kpi"><span>Vendido hoje</span><strong id="pbToday">R$ 0,00</strong><small id="pbTodayCount">0 pedidos</small></article>\
        <article class="pb-kpi"><span>Vendido no período</span><strong id="pbPeriodValue">R$ 0,00</strong><small id="pbPeriodCount">0 pedidos</small></article>\
        <article class="pb-kpi"><span>Ticket médio</span><strong id="pbTicket">R$ 0,00</strong><small>Média por pedido</small></article>\
        <article class="pb-kpi"><span>Orçamentos abertos</span><strong id="pbQuotes">0</strong><small id="pbQuotesValue">R$ 0,00 em negociação</small></article>\
      </div>\
      <div class="pb-grid">\
        <section class="pb-panel">\
          <div class="pb-panel-head"><h3>Últimos pedidos</h3><button class="linkbtn" onclick="go(\'orders\')">Ver todos</button></div>\
          <div id="pbOrders"></div>\
        </section>\
        <div class="pb-side">\
          <section class="pb-panel"><div class="pb-panel-head"><h3>Pedidos por etapa</h3><small>No período</small></div><div id="pbStages" class="pb-stages"></div></section>\
          <section class="pb-panel"><div class="pb-panel-head"><h3>Mais vendidos</h3><small>Top 3</small></div><div id="pbProducts" class="pb-products"></div></section>\
        </div>\
      </div>';

    el('pbPeriod').value=period;
    el('pbPeriod').onchange=function(){period=this.value;renderDashboard()};
  }

  function renderStages(orders){
    var keys=['order','separation','invoiced','completed'],counts={order:0,separation:0,invoiced:0,completed:0};
    orders.forEach(function(o){var k=o.orderStage||'order';counts[k]=(counts[k]||0)+1});
    el('pbStages').innerHTML=keys.map(function(k){return '<div class="pb-stage-row"><span>'+stageName(k)+'</span><strong>'+counts[k]+'</strong></div>'}).join('');
  }

  function renderProducts(orders){
    var map={};
    orders.forEach(function(o){(o.items||[]).forEach(function(i){
      var id=i.productId||'?';
      var p=typeof product==='function'?product(id):null;
      var row=map[id]||(map[id]={name:p&&p.name?p.name:'Produto',qty:0,value:0});
      row.qty+=Number(i.qty||0);row.value+=Number(i.qty||0)*Number(i.price||0);
    })});
    var a=Object.keys(map).map(function(k){return map[k]}).sort(function(a,b){return b.qty-a.qty||b.value-a.value}).slice(0,3);
    el('pbProducts').innerHTML=a.length?a.map(function(p,i){return '<div class="pb-product"><span class="pb-rank">'+(i+1)+'</span><div><b>'+esc(p.name)+'</b><small>'+p.qty.toLocaleString('pt-BR')+' un.</small></div><strong>'+money(p.value)+'</strong></div>'}).join(''):'<div class="pb-empty">Sem vendas de produtos neste período.</div>';
  }

  function renderOrders(orders){
    var a=orders.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||Number(b.serviceNo||0)-Number(a.serviceNo||0)}).slice(0,7);
    var box=el('pbOrders');
    if(!a.length){box.innerHTML='<div class="pb-empty">Nenhum pedido neste período.</div>';return}
    box.innerHTML=a.map(function(o){
      var owner='';
      try{if(typeof isAdmin==='function'&&isAdmin()&&o.createdBy)owner='<span class="pb-owner">'+esc(o.createdBy)+'</span>'}catch(e){}
      return '<div class="pb-order"><div><div class="pb-order-title"><strong>'+esc(serviceName(o))+'</strong><b>'+esc(customerName(o))+'</b></div><div class="pb-order-meta"><span>'+esc(fmtDate(o.date))+'</span>'+owner+'</div></div><div class="pb-order-side"><strong>'+money(orderTotal(o))+'</strong><span class="pb-stage '+stageClass(o.orderStage)+'">'+esc(stageName(o.orderStage))+'</span></div></div>';
    }).join('');
  }

  function renderDashboard(){
    if(!el('pbToday'))buildDashboard();
    if(!el('pbToday'))return;

    var sales=db&&db.sales?db.sales:[],quotes=db&&db.quotes?db.quotes:[],today=localDate(),b=bounds();
    var todayOrders=sales.filter(function(o){return String(o.date||'')===today});
    var selected=sales.filter(function(o){var d=String(o.date||'');return d>=b[0]&&d<=b[1]});
    var selectedTotal=sum(selected),quoteTotal=sum(quotes);

    el('pbPeriod').value=period;
    el('pbPeriodText').textContent=b[2]+' · '+fmtDate(b[0])+(b[0]!==b[1]?' a '+fmtDate(b[1]):'');
    el('pbToday').textContent=money(sum(todayOrders));el('pbTodayCount').textContent=orderLabel(todayOrders.length);
    el('pbPeriodValue').textContent=money(selectedTotal);el('pbPeriodCount').textContent=orderLabel(selected.length);
    el('pbTicket').textContent=money(selected.length?selectedTotal/selected.length:0);
    el('pbQuotes').textContent=String(quotes.length);el('pbQuotesValue').textContent=money(quoteTotal)+' em negociação';

    renderOrders(selected);renderStages(selected);renderProducts(selected);
  }

  function updateNav(){
    var b=document.querySelector('.nav button[data-page="home"]');
    if(b)b.innerHTML='<span>▦</span>Painel';
    if(el('pageTitle')&&document.querySelector('#home.page.on'))el('pageTitle').textContent='Painel';
  }

  buildDashboard();
  updateNav();

  var previousGo=window.go;
  if(typeof previousGo==='function'){
    window.go=function(page){
      var result=previousGo.apply(this,arguments);
      if(page==='home'){
        buildDashboard();renderDashboard();updateNav();
        if(el('pageTitle'))el('pageTitle').textContent='Painel';
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
      buildDashboard();renderDashboard();updateNav();
      return result;
    };
  }

  try{if(session)renderDashboard()}catch(e){}
})();
