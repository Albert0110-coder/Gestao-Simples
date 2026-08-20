(function(){
  'use strict';

  function el(id){return document.getElementById(id)}
  function can(key){return typeof window.canPermission==='function'?window.canPermission(key):(typeof isAdmin==='function'&&isAdmin())}

  function injectStyle(){
    if(el('primeProcurementLayoutCleanupV34'))return;
    var style=document.createElement('style');
    style.id='primeProcurementLayoutCleanupV34';
    style.textContent='\n#purchasesModal .proc-top-actions .primary,#suppliersModal .proc-top-actions .primary,#purchasesModal .proc-top .close,#suppliersModal .proc-top .close{display:none!important}\n#purchasesModal .proc-toolbar .primary,#suppliersModal .proc-toolbar .primary{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}\n';
    document.head.appendChild(style);
  }

  function sync(){
    injectStyle();
    var purchaseButton=document.querySelector('#purchasesModal .proc-toolbar .primary');
    var supplierButton=document.querySelector('#suppliersModal .proc-toolbar .primary');
    if(purchaseButton){
      purchaseButton.textContent='＋ Nova compra';
      purchaseButton.style.display=can('manage_purchases')?'inline-flex':'none';
    }
    if(supplierButton){
      supplierButton.textContent='＋ Novo Fornecedor';
      supplierButton.style.display=can('manage_suppliers')?'inline-flex':'none';
    }
  }

  var previousApply=window.applyAccessUI;
  if(typeof previousApply==='function')window.applyAccessUI=function(){var r=previousApply.apply(this,arguments);sync();return r};

  var previousPurchases=window.openPurchases;
  if(typeof previousPurchases==='function')window.openPurchases=function(){var r=previousPurchases.apply(this,arguments);sync();return r};

  var previousSuppliers=window.openSuppliers;
  if(typeof previousSuppliers==='function')window.openSuppliers=function(){var r=previousSuppliers.apply(this,arguments);sync();return r};

  var previousAfterLogin=window.afterLogin;
  if(typeof previousAfterLogin==='function')window.afterLogin=async function(){var r=await previousAfterLogin.apply(this,arguments);sync();return r};

  sync();
  setTimeout(sync,250);
  setTimeout(sync,900);
})();
