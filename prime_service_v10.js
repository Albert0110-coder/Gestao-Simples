(function(){
  'use strict';

  function legacyServiceNo(obj){
    var base=String((obj&&obj.quoteId)||(obj&&obj.id)||'');
    var h=0;
    for(var i=0;i<base.length;i++)h=(h*31+base.charCodeAt(i))%9000;
    return 1+h;
  }

  function serviceNo(obj){
    var n=Number(obj&&obj.serviceNo);
    return Number.isFinite(n)&&n>0?Math.trunc(n):legacyServiceNo(obj);
  }

  function serviceTag(obj){return '#'+String(serviceNo(obj)).padStart(2,'0')}
  window.serviceNo=serviceNo;
  window.serviceTag=serviceTag;

  var originalOpenQuote=window.openQuote;
  if(typeof originalOpenQuote==='function'){
    window.openQuote=function(id){
      originalOpenQuote(id);
      if(id){
        var q=quoteById(id);
        if(q&&$('quoteTitle'))$('quoteTitle').textContent='Editar orçamento '+serviceTag(q);
      }
    };
  }

  window.orderCard=function(o){
    var c=customer(o.party),who=isAdmin()&&o.createdBy?' · '+esc(o.createdBy):'';
    return '<div class="row"><div class="rowtop"><div><h4>'+esc(c?c.name:'Cliente não informado')+'</h4><div class="meta"><strong style="color:var(--green);font-size:12px">Pedido '+serviceTag(o)+'</strong> · '+esc(o.date||'')+' · '+(o.items||[]).length+' item(ns)'+who+'</div></div><div style="text-align:right"><div class="value">'+money(orderTotal(o))+'</div><span class="pill">'+stageLabel(o.orderStage)+'</span></div></div>'+stagePipeline(o.orderStage)+'<div class="actions">'+stageSelect(o)+'<button class="secondary" onclick="downloadCommercial(\'order\',\''+o.id+'\')">Baixar pedido '+serviceTag(o)+'</button>'+(isAdmin()?'<button class="danger" onclick="deleteEntity(\'sales\',\''+o.id+'\')">Excluir</button>':'')+'</div></div>';
  };

  window.quoteCard=function(q){
    var c=customer(q.party),who=isAdmin()&&q.createdBy?' · '+esc(q.createdBy):'',valid=q.validUntil?' · válido até '+esc(q.validUntil):'';
    return '<div class="row"><div class="rowtop"><div><h4>'+esc(c?c.name:'Cliente não informado')+'</h4><div class="meta"><strong style="color:var(--green);font-size:12px">Orçamento '+serviceTag(q)+'</strong> · '+esc(q.date||'')+valid+' · '+(q.items||[]).length+' item(ns)'+who+'</div></div><div style="text-align:right"><div class="value">'+money(orderTotal(q))+'</div><span class="pill">Em negociação</span></div></div><div class="pipeline"><span class="step on">Orçamento</span><span class="arrow">›</span><span class="step">Pedido</span><span class="arrow">›</span><span class="step">Faturado</span><span class="arrow">›</span><span class="step">Concluído</span></div><div class="actions"><button class="secondary" onclick="downloadCommercial(\'quote\',\''+q.id+'\')">Baixar orçamento '+serviceTag(q)+'</button><button class="secondary" onclick="openQuote(\''+q.id+'\')">Editar</button><button class="primary" onclick="convertQuote(\''+q.id+'\')">Faturar '+serviceTag(q)+'</button>'+(isAdmin()?'<button class="danger" onclick="deleteEntity(\'quotes\',\''+q.id+'\')">Excluir</button>':'')+'</div></div>';
  };

  var originalCommercialDoc=window.commercialDoc;
  if(typeof originalCommercialDoc==='function'){
    window.commercialDoc=function(obj,kind){
      var html=originalCommercialDoc(obj,kind),tag=serviceTag(obj);
      html=html.replace(/<div class="ref"><strong>Ref\. ([^<]*)<\/strong><span>Emitido em ([^<]*)<\/span><\/div>/,
        '<div class="ref"><strong>Atendimento '+tag+'</strong><span>Ref. $1 · Emitido em $2</span></div>');
      html=html.replace('<title>ORÇAMENTO - PRIME</title>','<title>ORÇAMENTO '+tag+' - PRIME</title>');
      html=html.replace('<title>PEDIDO - PRIME</title>','<title>PEDIDO '+tag+' - PRIME</title>');
      return html;
    };
  }

  var originalConvertQuote=window.convertQuote;
  if(typeof originalConvertQuote==='function'){
    window.convertQuote=async function(id){
      var q=quoteById(id);
      if(!q)return;
      if(!confirm('Cliente confirmou o orçamento '+serviceTag(q)+'? Ele sairá de Orçamentos e virará um Pedido mantendo o mesmo código.'))return;
      try{
        setSync('Faturando orçamento '+serviceTag(q)+'...');
        await api('convert_quote',{quote_id:id});
        await pull(false);
        setSync('Orçamento '+serviceTag(q)+' virou pedido','ok');
        go('orders');
      }catch(e){alert(e.message);setSync('Erro ao faturar','bad')}
    };
  }

  if(typeof renderQuotes==='function')renderQuotes();
  if(typeof renderOrders==='function')renderOrders();
})();
