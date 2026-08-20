(function(){
  'use strict';
  var LOGO='assets/prime-logo-transparent-v42.png?v=43';
  var style=document.createElement('style');
  style.textContent='.prime-official-nav-logo{width:89px!important;max-width:50%!important}.prime-official-header-mark{width:41px!important;height:23px!important}.prime-official-login-logo{width:min(150px,46%)!important;height:auto!important}';
  document.head.appendChild(style);
  document.querySelectorAll('.prime-official-header-mark img,.prime-official-nav-logo,.prime-official-login-logo').forEach(function(img){img.removeAttribute('onerror');img.src=LOGO;img.alt='Prime'});
  var base=window.commercialDoc;
  if(typeof base==='function'){
    window.commercialDoc=function(obj,kind){
      var html=String(base(obj,kind)||'');
      var brand='<header class="brandhead"><img src="'+LOGO+'" alt="Prime" style="display:block;width:135px;max-width:31%;height:auto;object-fit:contain"><div class="company"><span>Atendimento e serviços</span><span class="phone">WhatsApp: (93) 98436-5610</span></div></header><div class="accent"></div>';
      return html.replace(/<header class="brandhead">[\s\S]*?<\/header><div class="accent"><\/div>/i,brand);
    };
  }
})();
