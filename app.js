(function(){
  var files=['core_v8.js?v=14','sales_v8.js?v=14','admin_v8.js?v=14','prime_custom_v9.js?v=14','prime_service_v10.js?v=14','prime_permissions_v11.js?v=14','prime_product_code_v12.js?v=14','prime_preview_v13.js?v=14','prime_assignment_v14.js?v=14'];
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
