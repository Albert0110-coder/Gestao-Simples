(function(){
  'use strict';

  var originalCommercialDoc=window.commercialDoc;
  if(typeof originalCommercialDoc==='function'){
    window.commercialDoc=function(obj,kind){
      var html=originalCommercialDoc(obj,kind);
      // Remove qualquer impressão automática: o documento fica apenas como visualização.
      html=html.replace(/<script[^>]*>[\s\S]*?window\.print\(\)[\s\S]*?<\/script>/gi,'');
      return html;
    };
  }

  window.downloadCommercial=function(kind,id){
    var obj=kind==='quote'?quoteById(id):db.sales.find(function(x){return x.id===id});
    if(!obj)return;
    var w=window.open('','_blank');
    if(!w){
      alert('Permita pop-ups para abrir o documento.');
      return;
    }
    w.document.open();
    w.document.write(commercialDoc(obj,kind));
    w.document.close();
  };
})();
