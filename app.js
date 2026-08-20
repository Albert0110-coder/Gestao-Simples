(function(){
  window.__primeDeferBoot=true;
  if(document.body)document.body.classList.add('prime-app-loading');

  function applyPrimeBranding(){
    document.title='Prime';
    var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle)appleTitle.setAttribute('content','Prime');

    var logoSrc='assets/prime-logo-official.jpg?v=39';
    var style=document.createElement('style');
    style.textContent='\nbody.prime-app-loading main{visibility:hidden}\n.prime-official-nav-logo{display:block;width:178px;max-width:100%;height:auto;border-radius:10px;background:#fff;object-fit:contain}\n.navbrand{justify-content:center!important}\n.prime-official-header-mark{width:82px!important;height:46px!important;background:#fff!important;border-radius:7px!important;overflow:hidden!important;padding:0!important}\n.prime-official-header-mark img{display:block;width:100%;height:100%;object-fit:contain}\n.prime-official-login-logo{display:block;width:min(300px,92%);height:auto;margin:0 auto 15px;border-radius:13px;background:#fff;object-fit:contain}\n.login h2{display:none!important}\n.login p{text-align:center;margin:0 0 14px}\n.loginbox{overflow:visible}\n@media(min-width:900px){header .brand .prime-official-header-mark{display:none!important}.navbrand{padding:2px 7px 17px!important}}\n';
    document.head.appendChild(style);

    var headerMark=document.querySelector('header .brand .mark');
    if(headerMark){
      headerMark.className='mark prime-official-header-mark';
      headerMark.innerHTML='<img src="'+logoSrc+'" alt="Logo Prime">';
    }

    var navBrand=document.querySelector('.navbrand');
    if(navBrand)navBrand.innerHTML='<img class="prime-official-nav-logo" src="'+logoSrc+'" alt="Logo Prime">';

    var login=document.getElementById('loginScreen');
    if(login){
      var loginMark=login.querySelector('.mark,.prime-login-symbol,.prime-official-login-logo');
      if(loginMark){
        var img=document.createElement('img');
        img.className='prime-official-login-logo';
        img.src=logoSrc;
        img.alt='Logo Prime';
        loginMark.replaceWith(img);
      }
      var loginTitle=login.querySelector('h2');
      if(loginTitle)loginTitle.style.setProperty('display','none','important');
    }

    var accountBrand=document.querySelector('#more .customerHero .muted');
    if(accountBrand)accountBrand.textContent='Prime';
  }

  function finishBoot(){
    if(document.body)document.body.classList.remove('prime-app-loading');
  }

  applyPrimeBranding();

  var files=['core_v8.js?v=39','sales_v8.js?v=39','admin_v8.js?v=39','prime_custom_v9.js?v=39','prime_service_v10.js?v=39','prime_permissions_v11.js?v=39','prime_product_code_v12.js?v=39','prime_preview_v13.js?v=39','prime_assignment_v14.js?v=39','prime_product_picker_v15.js?v=39','prime_receipt_v19.js?v=39','prime_stage_receipt_v20.js?v=39','prime_stock_v25.js?v=39','prime_procurement_v26.js?v=39','prime_quote_admin_restore_v28.js?v=39','prime_user_permissions_v31.js?v=39','prime_operational_dashboard_v31.js?v=39','prime_nav_cleanup_v32.js?v=39','prime_workspace_v33.js?v=39','prime_procurement_layout_cleanup_v34.js?v=39','prime_official_logo_v37.js?v=39'];
  function load(i){
    if(i>=files.length){
      window.__primeDeferBoot=false;
      if(typeof window.boot==='function'){
        Promise.resolve(window.boot()).then(finishBoot,function(e){console.error(e);finishBoot()});
      }else finishBoot();
      return;
    }
    var s=document.createElement('script');
    s.src=files[i];s.async=false;
    s.onload=function(){load(i+1)};
    s.onerror=function(){var m=document.getElementById('loginMsg');if(m)m.textContent='Falha ao carregar o sistema. Atualize a página.';finishBoot()};
    document.head.appendChild(s);
  }
  load(0);
})();