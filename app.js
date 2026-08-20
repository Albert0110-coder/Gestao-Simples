(function(){
  window.__primeDeferBoot=true;
  if(document.body)document.body.classList.add('prime-app-loading');

  document.title='Prime';
  var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if(appleTitle)appleTitle.setAttribute('content','Prime');

  var logo='assets/prime-logo-transparent-v42.png?v=44';
  document.querySelectorAll('.prime-official-header-mark img,.prime-official-nav-logo,.prime-official-login-logo').forEach(function(img){
    img.removeAttribute('onerror');
    img.src=logo;
    img.alt='Prime';
  });

  var style=document.createElement('style');
  style.textContent='body.prime-app-loading main{visibility:hidden}.login p{text-align:center;margin:0 0 14px}';
  document.head.appendChild(style);

  function finishBoot(){
    if(document.body)document.body.classList.remove('prime-app-loading');
  }

  var files=['core_v8.js?v=44','sales_v8.js?v=44','admin_v8.js?v=44','prime_custom_v9.js?v=44','prime_service_v10.js?v=44','prime_permissions_v11.js?v=44','prime_product_code_v12.js?v=44','prime_preview_v13.js?v=44','prime_assignment_v14.js?v=44','prime_product_picker_v15.js?v=44','prime_receipt_v19.js?v=44','prime_stage_receipt_v20.js?v=44','prime_stock_v25.js?v=44','prime_procurement_v26.js?v=44','prime_quote_admin_restore_v28.js?v=44','prime_user_permissions_v31.js?v=44','prime_operational_dashboard_v31.js?v=44','prime_nav_cleanup_v32.js?v=44','prime_workspace_v33.js?v=44','prime_procurement_layout_cleanup_v34.js?v=44','prime_brand_v43.js?v=44','prime_theme_v44.js?v=44'];

  function load(i){
    if(i>=files.length){
      window.__primeDeferBoot=false;
      if(typeof window.boot==='function'){
        Promise.resolve(window.boot()).then(finishBoot,function(e){console.error(e);finishBoot()});
      }else finishBoot();
      return;
    }
    var s=document.createElement('script');
    s.src=files[i];
    s.async=false;
    s.onload=function(){load(i+1)};
    s.onerror=function(){
      var m=document.getElementById('loginMsg');
      if(m)m.textContent='Falha ao carregar o sistema. Atualize a página.';
      finishBoot();
    };
    document.head.appendChild(s);
  }

  load(0);
})();
