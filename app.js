(function(){
  var files=['core_v7.js?v=7','sales_v7.js?v=7','admin_v7.js?v=7'];
  function load(i){
    if(i>=files.length)return;
    var s=document.createElement('script');
    s.src=files[i];
    s.async=false;
    s.onload=function(){load(i+1)};
    s.onerror=function(){
      var m=document.getElementById('loginMsg');
      if(m)m.textContent='Falha ao carregar o sistema. Atualize a página.';
    };
    document.head.appendChild(s);
  }
  load(0);
})();
