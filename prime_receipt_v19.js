(function(){
  'use strict';

  var previousCommercialDoc=window.commercialDoc;
  if(typeof previousCommercialDoc!=='function')return;

  function receiptTag(obj){
    if(typeof window.serviceTag==='function')return window.serviceTag(obj);
    var n=Number(obj&&obj.serviceNo)||0;
    return '#'+String(Math.max(1,Math.trunc(n))).padStart(2,'0');
  }

  function orderStageLabel(obj){
    var stage=String(obj&&obj.orderStage||'order');
    if(stage==='separation')return 'Em separação';
    if(stage==='invoiced')return 'Faturado';
    if(stage==='completed')return 'Concluído';
    return 'Pedido';
  }

  function addProductCodes(html,obj){
    var items=(obj&&obj.items)||[];
    var idx=0;
    return html.replace(/<td class="prod"><strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/td>/g,function(full,name,extra){
      var item=items[idx++]||{};
      var p=typeof product==='function'?product(item.productId):null;
      var code=p&&p.code?String(p.code).trim():'';
      if(!code)return full;
      if(/Código:/i.test(extra))return full;
      return '<td class="prod"><strong>'+name+'</strong>'+extra+'<small><b>Código:</b> '+esc(code)+'</small></td>';
    });
  }

  window.commercialDoc=function(obj,kind){
    var html=previousCommercialDoc(obj,kind);
    var upper=kind==='quote'?'ORÇAMENTO':'PEDIDO';
    var tag=receiptTag(obj);

    // Número fica somente ao lado do tipo do documento.
    html=html.replace(new RegExp('<h1>'+upper+'(?:\\s*#\\d+)?<\\/h1>','i'),'<h1>'+upper+' '+tag+'</h1>');
    html=html.replace(new RegExp('<title>'+upper+'(?:\\s*#\\d+)?\\s*-\\s*PRIME<\\/title>','i'),'<title>'+upper+' '+tag+' - PRIME</title>');

    // Remove referência, atendimento e número de atendimento do cabeçalho.
    html=html.replace(/<div class="ref">[\s\S]*?<\/div>/gi,'');
    html=html.replace(/<strong>Atendimento\s*#?\d+<\/strong>/gi,'');
    html=html.replace(/Atendimento\s*#?\d+/gi,'');
    html=html.replace(/Ref\.\s*[^<·]+(?:\s*·\s*)?/gi,'');

    // Remove validade do recibo e o texto de validade no rodapé.
    html=html.replace(/<div class="info"><span>Validade<\/span><strong>[\s\S]*?<\/strong><\/div>/gi,'');
    html=html.replace(/<div class="terms">Este orçamento é válido até[\s\S]*?<\/div>/gi,'');
    if(kind==='quote')html=html.replace('grid-template-columns:repeat(4,1fr)','grid-template-columns:repeat(3,1fr)');

    // A situação do pedido acompanha a etapa operacional, não o pagamento.
    if(kind==='order'){
      var situation='<div class="info"><span>Situação</span><strong>'+esc(orderStageLabel(obj))+'</strong></div>';
      if(/<div class="info"><span>Situação<\/span><strong>[\s\S]*?<\/strong><\/div>/i.test(html)){
        html=html.replace(/<div class="info"><span>Situação<\/span><strong>[\s\S]*?<\/strong><\/div>/i,situation);
      }else{
        html=html.replace(/(<section class="grid">[\s\S]*?)(<\/section>)/i,'$1'+situation+'$2');
      }
    }

    // Exibe o código cadastrado de cada produto no recibo.
    html=addProductCodes(html,obj);
    return html;
  };
})();
