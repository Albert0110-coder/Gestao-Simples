(function(){
  'use strict';

  function logoUrl(){
    try{return new URL('assets/prime-logo-transparent.png?v=40',window.location.href).href}catch(e){return 'assets/prime-logo-transparent.png?v=40'}
  }

  function applyInterfaceLogo(){
    var src=logoUrl();
    var headerMark=document.querySelector('header .brand .mark');
    if(headerMark){
      headerMark.classList.remove('prime-symbol-mark');
      headerMark.classList.add('prime-official-header-mark');
      headerMark.innerHTML='<img src="'+src+'" alt="Logo Prime">';
    }

    var navBrand=document.querySelector('.navbrand');
    if(navBrand)navBrand.innerHTML='<img class="prime-official-nav-logo" src="'+src+'" alt="Logo Prime">';

    var login=document.getElementById('loginScreen');
    if(login){
      var old=login.querySelector('.mark,.prime-login-symbol,.prime-login-logo,.prime-official-login-logo');
      if(old){
        var img=document.createElement('img');
        img.className='prime-official-login-logo';
        img.src=src;
        img.alt='Logo Prime';
        old.replaceWith(img);
      }
      var title=login.querySelector('h2');
      if(title)title.style.setProperty('display','none','important');
    }
  }

  function injectStyle(){
    if(document.getElementById('primeOfficialLogoStyleV40'))return;
    ['primeOfficialLogoStyleV37','primeOfficialLogoStyleV38','primeOfficialLogoStyleV39'].forEach(function(id){var old=document.getElementById(id);if(old)old.remove()});
    var style=document.createElement('style');
    style.id='primeOfficialLogoStyleV40';
    style.textContent='\n.prime-official-nav-logo{display:block;width:178px;max-width:100%;height:auto;object-fit:contain}.navbrand{justify-content:center!important}.prime-official-header-mark{width:82px!important;height:46px!important;background:transparent!important;border-radius:0!important;overflow:visible!important;padding:0!important}.prime-official-header-mark img{display:block;width:100%;height:100%;object-fit:contain}.prime-official-login-logo{display:block;width:min(300px,92%);height:auto;margin:0 auto 15px;object-fit:contain}.loginbox{overflow:visible}.login h2{display:none!important}@media(min-width:900px){header .brand .prime-official-header-mark{display:none!important}.navbrand{padding:2px 7px 17px!important}}@media(max-width:899px){.prime-official-header-mark{display:block!important}}\n';
    document.head.appendChild(style);
  }

  injectStyle();
  applyInterfaceLogo();

  var previousCommercialDoc=window.commercialDoc;
  if(typeof previousCommercialDoc==='function'){
    window.commercialDoc=function(obj,kind){
      var html=previousCommercialDoc(obj,kind);
      var src=logoUrl();
      var official='<header class="brandhead official-brandhead-v40"><img class="official-receipt-logo-v40" src="'+src+'" alt="Prime"><div class="company"><span>Atendimento e serviços</span><span class="phone">WhatsApp: (93) 98436-5610</span></div></header><div class="accent"></div>';
      html=String(html||'').replace(/<header class="brandhead">[\s\S]*?<\/header><div class="accent"><\/div>/i,official);
      html=html.replace('</style>','.official-brandhead-v40{min-height:150px!important;padding:12px 24px!important}.official-receipt-logo-v40{display:block;width:270px;max-width:62%;height:auto;object-fit:contain}@media(max-width:650px){.official-brandhead-v40{min-height:112px!important;padding:10px 14px!important}.official-receipt-logo-v40{width:230px;max-width:100%}}@media print{.official-brandhead-v40{min-height:138px!important}.official-receipt-logo-v40{width:250px}}</style>');
      return html;
    };
  }

  var previousAfterLogin=window.afterLogin;
  if(typeof previousAfterLogin==='function')window.afterLogin=async function(){var r=await previousAfterLogin.apply(this,arguments);applyInterfaceLogo();return r};

  setTimeout(applyInterfaceLogo,250);
})();