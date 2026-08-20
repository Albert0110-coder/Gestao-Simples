(function(){
  'use strict';

  var LOGO='assets/prime-logo-transparent-v42.png?v=42';
  window.PRIME_LOGO_URL=LOGO;

  function setLogo(img){
    if(!img)return;
    img.removeAttribute('onerror');
    img.src=LOGO;
    img.alt='Prime';
  }

  function renderBrand(){
    document.title='Prime';
    var apple=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(apple)apple.setAttribute('content','Prime');

    var header=document.querySelector('header .brand .mark');
    if(header){
      header.className='mark prime-logo-header';
      header.innerHTML='<img alt="Prime">';
      setLogo(header.querySelector('img'));
    }

    var nav=document.querySelector('.navbrand');
    if(nav){
      nav.innerHTML='<img class="prime-logo-nav" alt="Prime">';
      setLogo(nav.querySelector('img'));
    }

    var login=document.getElementById('loginScreen');
    if(login){
      var current=login.querySelector('.mark,.prime-login-symbol,.prime-login-logo,.prime-official-login-logo,.prime-logo-login');
      if(current){
        var img=document.createElement('img');
        img.className='prime-logo-login';
        current.replaceWith(img);
        setLogo(img);
      }
      var title=login.querySelector('h2');
      if(title)title.style.setProperty('display','none','important');
    }
  }

  var style=document.createElement('style');
  style.id='primeBrandV42';
  style.textContent='\n.prime-logo-nav{display:block;width:178px;max-width:100%;height:auto;object-fit:contain}.navbrand{justify-content:center!important}.prime-logo-header{width:82px!important;height:46px!important;background:transparent!important;border-radius:0!important;overflow:visible!important;padding:0!important}.prime-logo-header img{display:block;width:100%;height:100%;object-fit:contain}.prime-logo-login{display:block;width:min(300px,92%);height:auto;margin:0 auto 15px;object-fit:contain}.login h2{display:none!important}.loginbox{overflow:visible}@media(min-width:900px){header .brand .prime-logo-header{display:none!important}.navbrand{padding:2px 7px 17px!important}}\n';
  document.head.appendChild(style);

  renderBrand();

  var baseCommercialDoc=window.commercialDoc;
  if(typeof baseCommercialDoc==='function'){
    window.commercialDoc=function(obj,kind){
      var html=String(baseCommercialDoc(obj,kind)||'');
      var brand='<header class="brandhead prime-receipt-brand"><img class="prime-receipt-logo" src="'+LOGO+'" alt="Prime"><div class="company"><span>Atendimento e serviços</span><span class="phone">WhatsApp: (93) 98436-5610</span></div></header><div class="accent"></div>';
      html=html.replace(/<header class="brandhead">[\s\S]*?<\/header><div class="accent"><\/div>/i,brand);
      html=html.replace('</style>','.prime-receipt-brand{min-height:150px!important;padding:12px 24px!important}.prime-receipt-logo{display:block;width:270px;max-width:62%;height:auto;object-fit:contain;background:transparent!important}@media(max-width:650px){.prime-receipt-brand{min-height:112px!important;padding:10px 14px!important}.prime-receipt-logo{width:230px;max-width:100%}}@media print{.prime-receipt-brand{min-height:138px!important}.prime-receipt-logo{width:250px}}</style>');
      return html;
    };
  }

  var after=window.afterLogin;
  if(typeof after==='function')window.afterLogin=async function(){var r=await after.apply(this,arguments);renderBrand();return r};
  setTimeout(renderBrand,150);
})();
