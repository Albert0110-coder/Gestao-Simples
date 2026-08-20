(function(){
  'use strict';

  var previousCommercialDoc=window.commercialDoc;
  if(typeof previousCommercialDoc!=='function')return;

  function orderStageLabel(obj){
    var stage=String(obj&&obj.orderStage||'order');
    if(stage==='separation')return 'Em separação';
    if(stage==='invoiced')return 'Faturado';
    if(stage==='completed')return 'Concluído';
    return 'Pedido';
  }

  window.commercialDoc=function(obj,kind){
    var html=previousCommercialDoc(obj,kind);
    if(kind!=='order')return html;

    var label=orderStageLabel(obj);
    var situation='<div class="info"><span>Situação</span><strong>'+esc(label)+'</strong></div>';

    if(/<div class="info"><span>Situação<\/span><strong>[\s\S]*?<\/strong><\/div>/i.test(html)){
      html=html.replace(/<div class="info"><span>Situação<\/span><strong>[\s\S]*?<\/strong><\/div>/i,situation);
    }else{
      html=html.replace(/(<section class="grid">[\s\S]*?)(<\/section>)/i,'$1'+situation+'$2');
    }
    return html;
  };
})();
