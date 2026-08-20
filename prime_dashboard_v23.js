(function(){
  'use strict';

  var dashState={period:'month',from:'',to:'',seller:'all',stage:'all',pay:'all',fulfill:'all',search:''};

  function localDate(d){
    d=d||new Date();
    var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function parseDate(s){return new Date(String(s||'')+'T12:00:00')}
  function addDays(s,n){var d=parseDate(s);d.setDate(d.getDate()+n);return localDate(d)}
  function firstMonth(s){var d=parseDate(s);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01'}
  function lastMonth(s){var d=parseDate(s);return localDate(new Date(d.getFullYear(),d.getMonth()+1,0,12))}
  function firstYear(s){return String(parseDate(s).getFullYear())+'-01-01'}
  function lastYear(s){return String(parseDate(s).getFullYear())+'-12-31'}
  function stageName(s){return {order:'Pedido',separation:'Em separação',invoiced:'Faturado',completed:'Concluído'}[s||'order']||'Pedido'}
  function stageClass(s){return {order:'is-order',separation:'is-separation',invoiced:'is-invoiced',completed:'is-completed'}[s||'order']||'is-order'}
  function serviceName(o){
    if(typeof window.serviceLabel==='function')return window.serviceLabel(o,'order');
    var n=Number(o&&o.serviceNo)||0;
    return 'Pedido #'+String(n||1).padStart(2,'0');
  }
  function customerName(o){var c=typeof customer==='function'?customer(o.party):null;return c&&c.name?c.name:'Cliente não informado'}
  function fmtShort(s){
    var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]:String(s||'');
  }
  function fmtFull(s){
    var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'');
  }
  function escAttr(s){return esc(s).replace(/`/g,'&#96;')}

  function periodBounds(mode){
    var t=localDate();
    if(mode==='today')return [t,t];
    if(mode==='yesterday'){var y=addDays(t,-1);return [y,y]}
    if(mode==='7d')return [addDays(t,-6),t];
    if(mode==='30d')return [addDays(t,-29),t];
    if(mode==='month')return [firstMonth(t),lastMonth(t)];
    if(mode==='prevmonth'){
      var d=parseDate(firstMonth(t));d.setMonth(d.getMonth()-1);var p=localDate(d);return [firstMonth(p),lastMonth(p)];
    }
    if(mode==='year')return [firstYear(t),lastYear(t)];
    if(mode==='all'){
      var dates=(db.sales||[]).map(function(o){return String(o.date||'')}).filter(Boolean).sort();
      return dates.length?[dates[0],dates[dates.length-1]]:[firstYear(t),t];
    }
    return [dashState.from||firstMonth(t),dashState.to||t];
  }

  function setPeriod(mode,keepCustom){
    dashState.period=mode||'month';
    if(dashState.period!=='custom'||!keepCustom){
      var b=periodBounds(dashState.period);dashState.from=b[0];dashState.to=b[1];
    }
  }

  function buildDashboard(){
    var home=$('home');if(!home)return;
    home.dataset.primeDashboard='1';
    home.innerHTML='\
      <div class="pd-head">\
        <div><div class="pd-kicker">PRIME · GESTÃO COMERCIAL</div><h2>Painel de vendas</h2><p>Acompanhe faturamento, pedidos, evolução e desempenho em um só lugar.</p></div>\
        <div class="pd-head-actions"><button class="secondary" onclick="openQuote()">＋ Orçamento</button><button class="primary" onclick="openOrder()">＋ Pedido</button></div>\
      </div>\
      <section class="pd-filter-card">\
        <div class="pd-filter-title"><div><strong>Filtros do painel</strong><span>Combine os filtros para analisar exatamente o que precisa.</span></div><button id="pdClear" class="pd-clear" type="button">Limpar filtros</button></div>\
        <div class="pd-filters">\
          <label>Período<select id="pdPeriod"><option value="today">Hoje</option><option value="yesterday">Ontem</option><option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option><option value="month">Este mês</option><option value="prevmonth">Mês anterior</option><option value="year">Este ano</option><option value="all">Todo o histórico</option><option value="custom">Personalizado</option></select></label>\
          <label>De<input id="pdFrom" type="date"></label>\
          <label>Até<input id="pdTo" type="date"></label>\
          <label id="pdSellerWrap">Responsável<select id="pdSeller"><option value="all">Todos</option></select></label>\
          <label>Etapa<select id="pdStage"><option value="all">Todas</option><option value="order">Pedido</option><option value="separation">Em separação</option><option value="invoiced">Faturado</option><option value="completed">Concluído</option></select></label>\
          <label>Pagamento<select id="pdPay"><option value="all">Todos</option></select></label>\
          <label>Entrega<select id="pdFulfill"><option value="all">Todas</option><option value="pickup">Retirada</option><option value="delivery">Entrega</option></select></label>\
          <label class="pd-search-label">Cliente<input id="pdSearch" type="search" placeholder="Buscar cliente..."></label>\
        </div>\
      </section>\
      <div class="pd-kpis">\
        <article class="pd-kpi"><div class="pd-kpi-top"><span class="pd-icon">↗</span><span>Vendido hoje</span></div><strong id="pdTodayValue">R$ 0,00</strong><small id="pdTodayCount">0 pedidos</small></article>\
        <article class="pd-kpi"><div class="pd-kpi-top"><span class="pd-icon">▦</span><span>Vendido no mês</span></div><strong id="pdMonthValue">R$ 0,00</strong><small id="pdMonthCount">0 pedidos</small></article>\
        <article class="pd-kpi"><div class="pd-kpi-top"><span class="pd-icon">◆</span><span>Vendido no ano</span></div><strong id="pdYearValue">R$ 0,00</strong><small id="pdYearCount">0 pedidos</small></article>\
        <article class="pd-kpi pd-kpi-accent"><div class="pd-kpi-top"><span class="pd-icon">#</span><span>Pedidos no período</span></div><strong id="pdPeriodCount">0</strong><small id="pdPeriodValue">R$ 0,00 em vendas</small></article>\
      </div>\
      <div class="pd-main-grid">\
        <section class="pd-panel pd-chart-panel">\
          <div class="pd-panel-head"><div><span class="pd-label">EVOLUÇÃO DE VENDAS</span><h3 id="pdChartTitle">Vendas no período</h3></div><div class="pd-chart-total"><span>Total filtrado</span><strong id="pdFilteredTotal">R$ 0,00</strong></div></div>\
          <div id="pdChart" class="pd-chart"></div>\
        </section>\
        <section class="pd-panel">\
          <div class="pd-panel-head"><div><span class="pd-label">RESUMO</span><h3>Indicadores do período</h3></div></div>\
          <div class="pd-summary">\
            <div><span>Ticket médio</span><strong id="pdTicket">R$ 0,00</strong></div>\
            <div><span>Itens vendidos</span><strong id="pdItems">0</strong></div>\
            <div><span>Clientes atendidos</span><strong id="pdClients">0</strong></div>\
            <div><span>Orçamentos abertos</span><strong id="pdQuotes">0</strong></div>\
          </div>\
        </section>\
      </div>\
      <div class="pd-bottom-grid">\
        <section class="pd-panel">\
          <div class="pd-panel-head"><div><span class="pd-label">FLUXO</span><h3>Pedidos por etapa</h3></div></div>\
          <div id="pdStages" class="pd-stages"></div>\
        </section>\
        <section class="pd-panel">\
          <div class="pd-panel-head"><div><span class="pd-label">DESTAQUES</span><h3>Produtos mais vendidos</h3></div></div>\
          <div id="pdProducts" class="pd-products"></div>\
        </section>\
      </div>\
      <section class="pd-panel pd-orders-panel">\
        <div class="pd-panel-head"><div><span class="pd-label">PEDIDOS</span><h3>Últimos pedidos do período</h3></div><button class="linkbtn" onclick="go(\'orders\')">Ver todos</button></div>\
        <div id="pdOrders" class="pd-orders"></div>\
      </section>';

    var style=document.createElement('style');style.id='primeDashboardStyle';style.textContent='\
      #home{--pd-blue:#31c5ff;--pd-purple:#986cff;--pd-pink:#e34dff}\
      #home .pd-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:16px}#home .pd-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;color:#5acfff}#home .pd-head h2{margin:5px 0 3px;font-size:29px;letter-spacing:-.03em}#home .pd-head p{margin:0;color:var(--muted);font-size:12px}#home .pd-head-actions{display:flex;gap:8px;flex:none}\
      #home .pd-filter-card,#home .pd-panel,#home .pd-kpi{background:linear-gradient(145deg,#0e1a17,#0b1512);border:1px solid var(--line);box-shadow:0 16px 40px #0002}#home .pd-filter-card{border-radius:17px;padding:14px;margin-bottom:12px}#home .pd-filter-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:11px}#home .pd-filter-title strong{display:block;font-size:13px}#home .pd-filter-title span{display:block;color:var(--muted);font-size:10px;margin-top:3px}#home .pd-clear{border:0;background:transparent;color:#65d5ff;font-size:11px;font-weight:800;padding:4px 0}\
      #home .pd-filters{display:grid;grid-template-columns:1.25fr repeat(2,1fr) 1.25fr 1.15fr 1.05fr 1fr 1.5fr;gap:8px}#home .pd-filters label{color:var(--muted);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}#home .pd-filters input,#home .pd-filters select{margin-top:5px;padding:9px 10px;border-radius:9px;font-size:11px;background:#08130f}\
      #home .pd-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}#home .pd-kpi{border-radius:16px;padding:15px;position:relative;overflow:hidden}#home .pd-kpi:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,#24cfff,#6b72ff,#db32fa);opacity:.6}#home .pd-kpi-accent{background:linear-gradient(145deg,#172344,#17152c);border-color:#394475}#home .pd-kpi-top{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}#home .pd-icon{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#16362f;color:#69e9bf;font-size:12px}#home .pd-kpi strong{display:block;font-size:22px;margin-top:11px;letter-spacing:-.03em}#home .pd-kpi small{display:block;color:var(--muted);font-size:10px;margin-top:4px}\
      #home .pd-main-grid{display:grid;grid-template-columns:minmax(0,2.15fr) minmax(230px,.85fr);gap:10px;margin-top:10px}#home .pd-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}#home .pd-panel{border-radius:17px;padding:16px;min-width:0}#home .pd-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}#home .pd-label{color:#62cfff;font-size:9px;font-weight:900;letter-spacing:.13em}#home .pd-panel h3{font-size:14px;margin:4px 0 0}#home .pd-chart-total{text-align:right}#home .pd-chart-total span{display:block;color:var(--muted);font-size:9px}#home .pd-chart-total strong{display:block;margin-top:3px;font-size:17px}\
      #home .pd-chart{height:270px;width:100%;position:relative}#home .pd-chart svg{width:100%;height:100%;display:block}#home .pd-chart-empty{height:100%;display:grid;place-items:center;color:var(--muted);font-size:11px;border:1px dashed var(--line);border-radius:12px}#home .pd-gridline{stroke:#234035;stroke-width:1;opacity:.55}#home .pd-axis-label{fill:#779087;font-size:9px}#home .pd-line{fill:none;stroke:url(#pdLineGrad);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}#home .pd-area{fill:url(#pdAreaGrad)}#home .pd-dot{fill:#71e6ff;stroke:#0d1714;stroke-width:2}\
      #home .pd-summary{display:grid;grid-template-columns:1fr 1fr;gap:9px}#home .pd-summary>div{background:#09140f;border:1px solid #1d3229;border-radius:12px;padding:12px}#home .pd-summary span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.05em}#home .pd-summary strong{display:block;margin-top:7px;font-size:16px}\
      #home .pd-stages{display:grid;gap:11px}#home .pd-stage-row{display:grid;grid-template-columns:92px 1fr 34px;align-items:center;gap:8px;font-size:10px}#home .pd-stage-row>span:first-child{color:#c7d4cf}.pd-stage-track{height:8px;background:#07110d;border:1px solid #1c3128;border-radius:99px;overflow:hidden}.pd-stage-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#32c8ff,#776dff)}#home .pd-stage-row strong{text-align:right;font-size:11px}\
      #home .pd-products{display:grid;gap:7px}#home .pd-product-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:9px;align-items:center;padding:8px 0;border-bottom:1px solid #192c24}#home .pd-product-row:last-child{border-bottom:0}#home .pd-rank{width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:#10221b;color:#68d7ff;font-size:10px;font-weight:900}#home .pd-product-row b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#home .pd-product-row small{display:block;color:var(--muted);font-size:9px;margin-top:2px}#home .pd-product-value{text-align:right}#home .pd-product-value strong{font-size:11px}#home .pd-product-value small{font-size:9px}\
      #home .pd-orders-panel{margin-top:10px;margin-bottom:8px}#home .pd-orders{overflow:auto}#home .pd-orders-table{width:100%;border-collapse:collapse;min-width:690px}#home .pd-orders-table th{font-size:9px;color:var(--muted);text-align:left;text-transform:uppercase;letter-spacing:.06em;padding:8px 7px;border-bottom:1px solid #263b32}#home .pd-orders-table td{font-size:10px;padding:10px 7px;border-bottom:1px solid #172b22;color:#d9e2de}#home .pd-orders-table tr:last-child td{border-bottom:0}#home .pd-orders-table td:last-child,#home .pd-orders-table th:last-child{text-align:right}.pd-stage-pill{display:inline-block;border:1px solid #2a4639;border-radius:99px;padding:4px 7px;font-size:9px}.pd-stage-pill.is-separation{color:#ffd274;border-color:#6d592a}.pd-stage-pill.is-invoiced{color:#80c9ff;border-color:#275a78}.pd-stage-pill.is-completed{color:#71e5ad;border-color:#266849}.pd-stage-pill.is-order{color:#c9d3cf}\
      #home .pd-empty{padding:20px;text-align:center;color:var(--muted);font-size:10px;border:1px dashed #24382f;border-radius:11px}\
      @media(max-width:1050px){#home .pd-filters{grid-template-columns:repeat(4,1fr)}#home .pd-main-grid{grid-template-columns:1fr}#home .pd-chart{height:250px}}\
      @media(max-width:720px){#home .pd-head{align-items:flex-start;flex-direction:column}#home .pd-head-actions{width:100%}#home .pd-head-actions button{flex:1}#home .pd-filters{grid-template-columns:1fr 1fr}#home .pd-kpis{grid-template-columns:1fr 1fr}#home .pd-bottom-grid{grid-template-columns:1fr}#home .pd-chart{height:230px}#home .pd-filter-title{align-items:center}}\
      @media(max-width:430px){#home .pd-kpis{grid-template-columns:1fr}#home .pd-kpi strong{font-size:20px}#home .pd-summary{grid-template-columns:1fr 1fr}#home .pd-filters{grid-template-columns:1fr 1fr}#home .pd-search-label{grid-column:1/-1}}';
    if(!document.getElementById('primeDashboardStyle'))document.head.appendChild(style);

    wireEvents();
  }

  function wireEvents(){
    $('pdPeriod').onchange=function(){setPeriod(this.value);syncControls();renderDashboard()};
    $('pdFrom').onchange=function(){dashState.from=this.value;dashState.period='custom';$('pdPeriod').value='custom';renderDashboard()};
    $('pdTo').onchange=function(){dashState.to=this.value;dashState.period='custom';$('pdPeriod').value='custom';renderDashboard()};
    $('pdSeller').onchange=function(){dashState.seller=this.value;renderDashboard()};
    $('pdStage').onchange=function(){dashState.stage=this.value;renderDashboard()};
    $('pdPay').onchange=function(){dashState.pay=this.value;renderDashboard()};
    $('pdFulfill').onchange=function(){dashState.fulfill=this.value;renderDashboard()};
    $('pdSearch').oninput=function(){dashState.search=this.value;renderDashboard()};
    $('pdClear').onclick=function(){dashState={period:'month',from:'',to:'',seller:'all',stage:'all',pay:'all',fulfill:'all',search:''};setPeriod('month');syncControls();renderDashboard()};
  }

  function syncControls(){
    if(!$('pdPeriod'))return;
    $('pdPeriod').value=dashState.period;$('pdFrom').value=dashState.from;$('pdTo').value=dashState.to;
    $('pdSeller').value=dashState.seller;$('pdStage').value=dashState.stage;$('pdPay').value=dashState.pay;$('pdFulfill').value=dashState.fulfill;$('pdSearch').value=dashState.search;
  }

  function refreshDynamicOptions(){
    var seller=$('pdSeller'),pay=$('pdPay');if(!seller||!pay)return;
    var currentSeller=dashState.seller,currentPay=dashState.pay;
    var sellers={};(db.sales||[]).forEach(function(o){if(o.createdBy)sellers[o.createdBy]=true});
    seller.innerHTML='<option value="all">Todos</option>'+Object.keys(sellers).sort(function(a,b){return a.localeCompare(b)}).map(function(n){return '<option value="'+escAttr(n)+'">'+esc(n)+'</option>'}).join('');
    if(currentSeller!=='all'&&sellers[currentSeller])seller.value=currentSeller;else{dashState.seller='all';seller.value='all'}
    var pays={};(db.sales||[]).forEach(function(o){if(o.pay)pays[o.pay]=true});
    pay.innerHTML='<option value="all">Todos</option>'+Object.keys(pays).sort(function(a,b){return a.localeCompare(b)}).map(function(n){return '<option value="'+escAttr(n)+'">'+esc(n)+'</option>'}).join('');
    if(currentPay!=='all'&&pays[currentPay])pay.value=currentPay;else{dashState.pay='all';pay.value='all'}
    $('pdSellerWrap').style.display=isAdmin()?'block':'none';
  }

  function matchesNonDate(o){
    if(dashState.seller!=='all'&&String(o.createdBy||'')!==dashState.seller)return false;
    if(dashState.stage!=='all'&&String(o.orderStage||'order')!==dashState.stage)return false;
    if(dashState.pay!=='all'&&String(o.pay||'')!==dashState.pay)return false;
    if(dashState.fulfill!=='all'&&String(o.fulfill||'pickup')!==dashState.fulfill)return false;
    if(dashState.search){var q=dashState.search.trim().toLowerCase(),name=customerName(o).toLowerCase();if(name.indexOf(q)<0)return false}
    return true;
  }
  function inRange(o,from,to){var d=String(o.date||'');return (!from||d>=from)&&(!to||d<=to)}
  function sum(list){return list.reduce(function(s,o){return s+orderTotal(o)},0)}
  function orderCountLabel(n){return n+' '+(n===1?'pedido':'pedidos')}

  function renderDashboard(){
    if(!$('pdPeriod'))return;
    refreshDynamicOptions();syncControls();
    var all=(db.sales||[]).filter(matchesNonDate),t=localDate(),monthStart=firstMonth(t),monthEnd=lastMonth(t),yearStart=firstYear(t),yearEnd=lastYear(t);
    var todayOrders=all.filter(function(o){return inRange(o,t,t)}),monthOrders=all.filter(function(o){return inRange(o,monthStart,monthEnd)}),yearOrders=all.filter(function(o){return inRange(o,yearStart,yearEnd)});
    var periodOrders=all.filter(function(o){return inRange(o,dashState.from,dashState.to)});

    $('pdTodayValue').textContent=money(sum(todayOrders));$('pdTodayCount').textContent=orderCountLabel(todayOrders.length);
    $('pdMonthValue').textContent=money(sum(monthOrders));$('pdMonthCount').textContent=orderCountLabel(monthOrders.length);
    $('pdYearValue').textContent=money(sum(yearOrders));$('pdYearCount').textContent=orderCountLabel(yearOrders.length);
    $('pdPeriodCount').textContent=String(periodOrders.length);$('pdPeriodValue').textContent=money(sum(periodOrders))+' em vendas';
    $('pdFilteredTotal').textContent=money(sum(periodOrders));
    $('pdChartTitle').textContent=(dashState.from&&dashState.to)?fmtFull(dashState.from)+' — '+fmtFull(dashState.to):'Vendas no período';

    var total=sum(periodOrders),items=periodOrders.reduce(function(a,o){return a+(o.items||[]).reduce(function(s,i){return s+Number(i.qty||0)},0)},0);
    var clients={};periodOrders.forEach(function(o){if(o.party)clients[o.party]=true});
    var quotes=(db.quotes||[]).filter(function(q){
      if(dashState.seller!=='all'&&String(q.createdBy||'')!==dashState.seller)return false;
      if(dashState.search){var c=customer(q.party),n=String(c&&c.name||'').toLowerCase();if(n.indexOf(dashState.search.trim().toLowerCase())<0)return false}
      return true;
    });
    $('pdTicket').textContent=money(periodOrders.length?total/periodOrders.length:0);$('pdItems').textContent=String(items);$('pdClients').textContent=String(Object.keys(clients).length);$('pdQuotes').textContent=String(quotes.length);

    renderChart(periodOrders);renderStages(periodOrders);renderProducts(periodOrders);renderOrdersTable(periodOrders);
  }

  function seriesFor(orders){
    var from=dashState.from,to=dashState.to;if(!from||!to)return [];
    var days=Math.max(1,Math.round((parseDate(to)-parseDate(from))/86400000)+1),monthly=days>62,map={},keys=[];
    orders.forEach(function(o){var d=String(o.date||'');var k=monthly?d.slice(0,7):d;map[k]=(map[k]||0)+orderTotal(o)});
    if(monthly){
      var cur=parseDate(from);cur.setDate(1);var end=parseDate(to);end.setDate(1);var guard=0;
      while(cur<=end&&guard++<180){var k=cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0');keys.push(k);cur.setMonth(cur.getMonth()+1)}
    }else{
      var k=from,guard2=0;while(k<=to&&guard2++<400){keys.push(k);k=addDays(k,1)}
    }
    return keys.map(function(k){return {key:k,label:monthly?k.slice(5)+'/'+k.slice(0,4):fmtShort(k),value:map[k]||0}});
  }

  function renderChart(orders){
    var box=$('pdChart'),data=seriesFor(orders);if(!data.length){box.innerHTML='<div class="pd-chart-empty">Sem dados para o período selecionado.</div>';return}
    var W=760,H=260,L=54,R=12,T=14,B=33,plotW=W-L-R,plotH=H-T-B,max=Math.max.apply(null,data.map(function(x){return x.value}).concat([1]));
    var points=data.map(function(d,i){var x=L+(data.length===1?plotW/2:(i/(data.length-1))*plotW),y=T+plotH-(d.value/max)*plotH;return {x:x,y:y,d:d}});
    var line=points.map(function(p,i){return (i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join(' '),area=line+' L '+points[points.length-1].x.toFixed(1)+' '+(T+plotH)+' L '+points[0].x.toFixed(1)+' '+(T+plotH)+' Z';
    var grid='',labels='';for(var g=0;g<=4;g++){var gy=T+(plotH/4)*g,val=max*(1-g/4);grid+='<line class="pd-gridline" x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'"/><text class="pd-axis-label" x="2" y="'+(gy+3)+'">'+compactMoney(val)+'</text>'}
    var step=Math.max(1,Math.ceil(data.length/6));points.forEach(function(p,i){if(i%step===0||i===points.length-1)labels+='<text class="pd-axis-label" text-anchor="middle" x="'+p.x+'" y="'+(H-8)+'">'+esc(p.d.label)+'</text>'});
    var dots=points.map(function(p){return '<circle class="pd-dot" cx="'+p.x+'" cy="'+p.y+'" r="3.5"><title>'+esc(p.d.label)+' · '+esc(money(p.d.value))+'</title></circle>'}).join('');
    box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-label="Gráfico de evolução das vendas"><defs><linearGradient id="pdLineGrad" x1="0" x2="1"><stop offset="0" stop-color="#2ed5ff"/><stop offset=".55" stop-color="#6975ff"/><stop offset="1" stop-color="#d94aff"/></linearGradient><linearGradient id="pdAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d8fff" stop-opacity=".28"/><stop offset="1" stop-color="#4d8fff" stop-opacity="0"/></linearGradient></defs>'+grid+'<path class="pd-area" d="'+area+'"/><path class="pd-line" d="'+line+'"/>'+dots+labels+'</svg>';
  }
  function compactMoney(v){v=Number(v||0);if(v>=1000000)return 'R$ '+(v/1000000).toFixed(1).replace('.',',')+' mi';if(v>=1000)return 'R$ '+(v/1000).toFixed(v>=10000?0:1).replace('.',',')+' mil';return 'R$ '+Math.round(v)}

  function renderStages(orders){
    var stages=['order','separation','invoiced','completed'],counts={};stages.forEach(function(s){counts[s]=0});orders.forEach(function(o){var s=o.orderStage||'order';counts[s]=(counts[s]||0)+1});var max=Math.max.apply(null,stages.map(function(s){return counts[s]}).concat([1]));
    $('pdStages').innerHTML=stages.map(function(s){return '<div class="pd-stage-row"><span>'+stageName(s)+'</span><div class="pd-stage-track"><div class="pd-stage-fill" style="width:'+((counts[s]/max)*100).toFixed(1)+'%"></div></div><strong>'+counts[s]+'</strong></div>'}).join('');
  }

  function renderProducts(orders){
    var map={};orders.forEach(function(o){(o.items||[]).forEach(function(i){var id=i.productId||'?',p=product(id),r=map[id]||(map[id]={name:p&&p.name?p.name:'Produto',code:p&&p.code?p.code:'',qty:0,value:0});r.qty+=Number(i.qty||0);r.value+=Number(i.qty||0)*Number(i.price||0)})});
    var a=Object.keys(map).map(function(k){return map[k]}).sort(function(a,b){return b.qty-a.qty||b.value-a.value}).slice(0,5);
    $('pdProducts').innerHTML=a.length?a.map(function(p,i){return '<div class="pd-product-row"><span class="pd-rank">'+(i+1)+'</span><div><b>'+esc(p.name)+'</b><small>'+(p.code?'Código '+esc(p.code)+' · ':'')+p.qty.toLocaleString('pt-BR')+' un.</small></div><div class="pd-product-value"><strong>'+money(p.value)+'</strong><small>em vendas</small></div></div>'}).join(''):'<div class="pd-empty">Sem produtos vendidos neste período.</div>';
  }

  function renderOrdersTable(orders){
    var a=orders.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||Number(b.serviceNo||0)-Number(a.serviceNo||0)}).slice(0,8);
    if(!a.length){$('pdOrders').innerHTML='<div class="pd-empty">Nenhum pedido encontrado com estes filtros.</div>';return}
    $('pdOrders').innerHTML='<table class="pd-orders-table"><thead><tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Responsável</th><th>Situação</th><th>Valor</th></tr></thead><tbody>'+a.map(function(o){return '<tr><td><strong>'+esc(serviceName(o))+'</strong></td><td>'+esc(fmtFull(o.date))+'</td><td>'+esc(customerName(o))+'</td><td>'+esc(o.createdBy||'—')+'</td><td><span class="pd-stage-pill '+stageClass(o.orderStage)+'">'+esc(stageName(o.orderStage))+'</span></td><td><strong>'+money(orderTotal(o))+'</strong></td></tr>'}).join('')+'</tbody></table>';
  }

  function updateNavLabel(){
    var b=document.querySelector('.nav button[data-page="home"]');if(b)b.innerHTML='<span>▦</span>Painel';
  }

  var previousGo=window.go;
  if(typeof previousGo==='function')window.go=function(page){var r=previousGo.apply(this,arguments);if(page==='home'){if($('pageTitle'))$('pageTitle').textContent='Painel';renderDashboard()}return r};

  window.renderHome=function(){renderDashboard()};
  window.renderDashboard=renderDashboard;

  updateNavLabel();
  if(!$('home')||!$('home').dataset.primeDashboard)buildDashboard();
  setPeriod('month');syncControls();
  if(session)renderDashboard();
})();
