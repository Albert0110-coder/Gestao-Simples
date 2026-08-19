(function(){
  function applyPrimeBranding(){
    document.title='Prime';

    var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle)appleTitle.setAttribute('content','Prime');

    var style=document.createElement('style');
    style.textContent='.login .mark{margin:0 auto 16px!important}.login h2,.login p{text-align:center}';
    document.head.appendChild(style);

    var headerMark=document.querySelector('header .brand .mark');
    if(headerMark)headerMark.textContent='P';

    var navMark=document.querySelector('.navbrand .mark');
    if(navMark)navMark.textContent='P';

    var navName=document.querySelector('.navbrand strong');
    if(navName)navName.textContent='Prime';

    var loginMark=document.querySelector('#loginScreen .mark');
    if(loginMark)loginMark.textContent='P';

    var loginTitle=document.querySelector('#loginScreen h2');
    if(loginTitle)loginTitle.textContent='Prime';

    var accountBrand=document.querySelector('#more .customerHero .muted');
    if(accountBrand)accountBrand.textContent='Prime';
  }

  applyPrimeBranding();

  var files=['core_v8.js?v=15','sales_v8.js?v=15','admin_v8.js?v=15','prime_custom_v9.js?v=15','prime_service_v10.js?v=15','prime_permissions_v11.js?v=15','prime_product_code_v12.js?v=15','prime_preview_v13.js?v=15','prime_assignment_v14.js?v=15','prime_product_picker_v15.js?v=15'];
  function load(i){
    if(i>=files.length)return;
    var s=document.createElement('script');
    s.src=files[i];s.async=false;
    s.onload=function(){load(i+1)};
    s.onerror=function(){var m=document.getElementById('loginMsg');if(m)m.textContent='Falha ao carregar o sistema. Atualize a página.';};
    document.head.appendChild(s);
  }
  load(0);
})();
