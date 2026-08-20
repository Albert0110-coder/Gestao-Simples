(function(){
  window.__primeDeferBoot=true;
  if(document.body)document.body.classList.add('prime-app-loading');

  function applyPrimeBranding(){
    document.title='Prime';
    var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle)appleTitle.setAttribute('content','Prime');

    var style=document.createElement('style');
    style.textContent='\nbody.prime-app-loading main{visibility:hidden}\n.mark.prime-symbol-mark{background:transparent!important;color:transparent!important;border-radius:0!important;box-shadow:none!important;overflow:visible;padding:0!important}\n.mark.prime-symbol-mark img{display:block;width:100%;height:100%;object-fit:contain}\n.navbrand .mark.prime-symbol-mark{width:48px;height:56px;margin:-7px 0}\nheader .brand .mark.prime-symbol-mark{width:38px;height:44px}\n.prime-login-symbol{display:block;width:126px;height:148px;margin:0 auto 8px}\n.prime-login-symbol img{display:block;width:100%;height:100%;object-fit:contain}\n.login h2{display:block!important;text-align:center;font-size:30px;font-weight:900;letter-spacing:.08em;margin:0 0 8px;color:var(--text)}\n.login p{text-align:center;margin:0 0 14px}\n.loginbox{overflow:visible}\n';
    document.head.appendChild(style);

    function useSymbol(node){
      if(!node)return;
      node.classList.add('prime-symbol-mark');
      node.innerHTML='<img src="assets/prime-symbol.svg?v=36" alt="Logo Prime">';
    }

    useSymbol(document.querySelector('header .brand .mark'));
    useSymbol(document.querySelector('.navbrand .mark'));

    var navName=document.querySelector('.navbrand strong');
    if(navName)navName.textContent='Prime';

    var loginMark=document.querySelector('#loginScreen .mark');
    if(loginMark){
      var symbol=document.createElement('div');
      symbol.className='prime-login-symbol';
      symbol.setAttribute('role','img');
      symbol.setAttribute('aria-label','Logo Prime');
      symbol.innerHTML='<img src="assets/prime-symbol.svg?v=36" alt="">';
      loginMark.replaceWith(symbol);
    }

    var loginTitle=document.querySelector('#loginScreen h2');
    if(loginTitle){
      loginTitle.textContent='PRIME';
      loginTitle.style.display='block';
    }

    var accountBrand=document.querySelector('#more .customerHero .muted');
    if(accountBrand)accountBrand.textContent='Prime';
  }

  function finishBoot(){
    if(document.body)document.body.classList.remove('prime-app-loading');
  }

  applyPrimeBranding();

  var files=['core_v8.js?v=36','sales_v8.js?v=36','admin_v8.js?v=36','prime_custom_v9.js?v=36','prime_service_v10.js?v=36','prime_permissions_v11.js?v=36','prime_product_code_v12.js?v=36','prime_preview_v13.js?v=36','prime_assignment_v14.js?v=36','prime_product_picker_v15.js?v=36','prime_receipt_v19.js?v=36','prime_stage_receipt_v20.js?v=36','prime_stock_v25.js?v=36','prime_procurement_v26.js?v=36','prime_quote_admin_restore_v28.js?v=36','prime_user_permissions_v31.js?v=36','prime_operational_dashboard_v31.js?v=36','prime_nav_cleanup_v32.js?v=36','prime_workspace_v33.js?v=36','prime_procurement_layout_cleanup_v34.js?v=36'];
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
