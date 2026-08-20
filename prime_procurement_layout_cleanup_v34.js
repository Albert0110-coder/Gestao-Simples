(function(){
  'use strict';

  function el(id){return document.getElementById(id)}
  function can(key){return typeof window.canPermission==='function'?window.canPermission(key):(typeof isAdmin==='function'&&isAdmin())}
  function num(v){var n=Number(v||0);return Number.isFinite(n)?n:0}
  function qty(v){return num(v).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2})}
  function fmtDate(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'')}
  function supplierName(s){return s?(s.tradeName||s.name||'Fornecedor'):'Fornecedor'}
  function jsq(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}

  function injectStyle(){
    if(el('primeProcurementLayoutCleanupV34'))return;
    var style=document.createElement('style');
    style.id='primeProcurementLayoutCleanupV34';
    style.textContent='\n#purchasesModal .proc-top-actions .primary,#suppliersModal .proc-top-actions .primary,#purchasesModal .proc-top .close,#suppliersModal .proc-top .close{display:none!important}\n#purchasesModal .proc-toolbar .primary,#suppliersModal .proc-toolbar .primary{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}\n.purchase-detail36{display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}\n.purchase-detail36.on{display:block}\n.purchase-detail36 h5{margin:0 0 8px;font-size:11px;color:var(--text);text-transform:uppercase;letter-spacing:.06em}\n.purchase-items36{display:grid;gap:7px}\n.purchase-item36{display:grid;grid-template-columns:minmax(0,1fr) 76px 105px 110px;gap:9px;align-items:center;padding:9px 10px;background:#08140f;border:1px solid #1d3429;border-radius:10px}\n.purchase-item36 strong{font-size:11px}.purchase-item36 small{display:block;color:var(--muted);font-size:9px;margin-top:3px}.purchase-item36 span{text-align:right;font-size:10px}.purchase-item36 span b{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;margin-bottom:2px}\n.purchase-note36{margin-top:10px;padding:10px 11px;border:1px solid #294a39;border-radius:10px;background:#0b1b14;white-space:pre-wrap;font-size:10px;line-height:1.55;color:#d7e3dc}\n.purchase-note36.empty{color:var(--muted);border-style:dashed;background:transparent;text-align:left}\n.purchase-detail-actions36{display:flex;gap:7px;justify-content:flex-end;margin-top:10px}\n@media(max-width:700px){.purchase-item36{grid-template-columns:1fr 1fr}.purchase-item36>div:first-child{grid-column:1/-1}.purchase-item36 span{text-align:left}}\n';
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

  window.togglePurchaseDetails=function(id){
    var box=el('purchaseDetail36_'+id),btn=el('purchaseDetailButton36_'+id);
    if(!box)return;
    var open=!box.classList.contains('on');
    box.classList.toggle('on',open);
    if(btn)btn.textContent=open?'Ocultar detalhes':'Ver detalhes';
  };

  window.renderPurchases=function(){
    var list=el('purchasesList');if(!list)return;
    var q=(el('purchaseSearchPro')?el('purchaseSearchPro').value:'').trim().toLowerCase();
    var all=(db.buys||[]).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
    var totalValue=all.reduce(function(sum,o){return sum+orderTotal(o)},0);
    var totalUnits=all.reduce(function(sum,o){return sum+(o.items||[]).reduce(function(s,i){return s+num(i.qty)},0)},0);
    if(el('purchaseStats'))el('purchaseStats').innerHTML='<div class="proc-kpi"><span>Compras registradas</span><strong>'+all.length+'</strong></div><div class="proc-kpi"><span>Investido</span><strong>'+money(totalValue)+'</strong></div><div class="proc-kpi"><span>Unidades recebidas</span><strong>'+qty(totalUnits)+'</strong></div>';

    var a=all.filter(function(o){
      var s=supplier(o.party)||{};
      var products=(o.items||[]).map(function(i){var p=product(i.productId)||{};return [p.name,p.code,p.brand].join(' ')}).join(' ');
      return !q||[s.name,s.tradeName,o.documentNo,o.pay,o.status,o.date,o.notes,products].join(' ').toLowerCase().indexOf(q)>=0;
    });

    list.innerHTML=a.length?a.map(function(o){
      var s=supplier(o.party),items=o.items||[],units=items.reduce(function(sum,i){return sum+num(i.qty)},0),status=o.status==='pending'?'pending':'paid';
      var rows=items.length?items.map(function(i){
        var p=product(i.productId)||{},lineTotal=num(i.qty)*num(i.price);
        return '<div class="purchase-item36"><div><strong>'+esc(p.name||'Produto')+'</strong>'+(p.code?'<small>Código: '+esc(p.code)+'</small>':'')+'</div><span><b>Qtd.</b>'+qty(i.qty)+'</span><span><b>Custo un.</b>'+money(i.price)+'</span><span><b>Subtotal</b>'+money(lineTotal)+'</span></div>';
      }).join(''):'<div class="empty" style="padding:14px">Nenhum item salvo nesta compra.</div>';
      var note=String(o.notes||'').trim();
      var detailId=String(o.id||'');
      return '<article class="proc-card"><div class="proc-card-head"><div class="proc-ident"><div class="proc-avatar">↓</div><div><h4>'+esc(supplierName(s))+'</h4><div class="proc-sub">'+fmtDate(o.date)+(o.documentNo?' · '+esc(o.documentNo):'')+' · '+esc(o.pay||'Pagamento não informado')+'</div><div class="proc-tags"><span class="proc-status '+status+'">'+(status==='pending'?'Pendente':'Pago')+'</span><span class="proc-tag ok">＋ '+qty(units)+' un. no estoque</span><span class="proc-tag">'+items.length+' produto(s)</span></div></div></div><div class="proc-amount"><strong>'+money(orderTotal(o))+'</strong><small>Total da compra</small></div></div><div class="proc-actions"><button id="purchaseDetailButton36_'+esc(detailId)+'" class="secondary" onclick="togglePurchaseDetails(\''+jsq(detailId)+'\')">Ver detalhes</button>'+(can('manage_purchases')&&can('delete_records')?'<button class="danger" onclick="deletePurchasePro(\''+jsq(detailId)+'\')">Excluir compra</button>':'')+'</div><div id="purchaseDetail36_'+esc(detailId)+'" class="purchase-detail36"><h5>Produtos comprados</h5><div class="purchase-items36">'+rows+'</div><h5 style="margin-top:12px">Observação</h5><div class="purchase-note36'+(note?'':' empty')+'">'+(note?esc(note):'Nenhuma observação informada nesta compra.')+'</div></div></article>';
    }).join(''):'<div class="empty">Nenhuma compra encontrada.</div>';
    sync();
  };

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
