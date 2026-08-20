(function(){
  function applyPrimeBranding(){
    document.title='Prime';
    var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle)appleTitle.setAttribute('content','Prime');

    var style=document.createElement('style');
    style.textContent='\n.prime-login-symbol{display:block;width:126px;height:148px;margin:0 auto 8px}\n.prime-login-symbol svg{display:block;width:100%;height:100%;overflow:visible}\n.login h2{display:block!important;text-align:center;font-size:30px;font-weight:900;letter-spacing:.08em;margin:0 0 8px;color:var(--text)}\n.login p{text-align:center;margin:0 0 14px}\n.loginbox{overflow:visible}\n';
    document.head.appendChild(style);

    var headerMark=document.querySelector('header .brand .mark');
    if(headerMark)headerMark.textContent='P';

    var navMark=document.querySelector('.navbrand .mark');
    if(navMark)navMark.textContent='P';

    var navName=document.querySelector('.navbrand strong');
    if(navName)navName.textContent='Prime';

    var loginMark=document.querySelector('#loginScreen .mark');
    if(loginMark){
      var symbol=document.createElement('div');
      symbol.className='prime-login-symbol';
      symbol.setAttribute('role','img');
      symbol.setAttribute('aria-label','Logo Prime');
      symbol.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 250" aria-hidden="true"><defs><linearGradient id="primeGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1edcff"/><stop offset=".48" stop-color="#4770ff"/><stop offset="1" stop-color="#ef00ff"/></linearGradient></defs><rect x="45" y="12" width="130" height="190" rx="28" fill="none" stroke="url(#primeGradient)" stroke-width="13"/><path d="M91 12h38c0 12-6 18-17 18h-4c-11 0-17-6-17-18z" fill="url(#primeGradient)"/><path d="M132 58L48 153h52l-45 85 119-126h-54z" fill="url(#primeGradient)" stroke="#07110d" stroke-width="6" stroke-linejoin="miter"/></svg>';
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

  applyPrimeBranding();

  var files=['core_v8.js?v=22','sales_v8.js?v=22','admin_v8.js?v=22','prime_custom_v9.js?v=22','prime_service_v10.js?v=22','prime_permissions_v11.js?v=22','prime_product_code_v12.js?v=22','prime_preview_v13.js?v=22','prime_assignment_v14.js?v=22','prime_product_picker_v15.js?v=22','prime_receipt_v19.js?v=22','prime_stage_receipt_v20.js?v=22'];
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
