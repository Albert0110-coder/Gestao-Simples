(function(){
  'use strict';

  function injectStyle(){
    if(document.getElementById('primeNavCleanupV32'))return;
    var style=document.createElement('style');
    style.id='primeNavCleanupV32';
    style.textContent='\n@media(min-width:900px){#adminMenu button[onclick="openPurchases()"],#adminMenu button[onclick="openSuppliers()"]{display:none!important}}\n';
    document.head.appendChild(style);
  }

  injectStyle();
})();
