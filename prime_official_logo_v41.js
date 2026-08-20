(function(){
  'use strict';
  var LOGO='assets/prime-logo-transparent.png?v=42';
  var base=window.commercialDoc;
  if(typeof base==='function'){
    window.commercialDoc=function(obj,kind){
      var html=String(base(obj,kind)||'');
      var brand='<header class="brandhead"><img src="'+LOGO+'" alt="Prime" style="display:block;width:270px;max-width:62%;height:auto;object-fit:contain"><div class="company"><span>Atendimento e serviços</span><span class="phone">WhatsApp: (93) 98436-5610</span></div></header><div class="accent"></div>';
      return html.replace(/<header class="brandhead">[\s\S]*?<\/header><div class="accent"><\/div>/i,brand);
    };
  }
})();
