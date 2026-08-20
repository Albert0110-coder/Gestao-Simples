(function(){
  'use strict';

  var workspaceIds=['quoteModal','orderModal','purchasesModal','purchaseForm','suppliersModal','supplierForm'];
  var workspaceBack={};
  var currentWorkspace='';

  function el(id){return document.getElementById(id)}
  function can(key){return typeof window.canPermission==='function'?window.canPermission(key):(typeof isAdmin==='function'&&isAdmin())}
  function stockNumber(v){var n=Number(v||0);return Number.isFinite(n)?n:0}
  function stockText(v){return stockNumber(v).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2})}
  function currentPage(){var n=document.querySelector('main > .page.on');return n?n.id:'home'}
  function titleForWorkspace(id){return {quoteModal:'Orçamento',orderModal:'Pedido',purchasesModal:'Compras',purchaseForm:'Registrar compra',suppliersModal:'Fornecedores',supplierForm:'Fornecedor'}[id]||'Prime'}

  function injectStyle(){
    if(el('primeWorkspaceStyleV33'))return;
    var style=document.createElement('style');
    style.id='primeWorkspaceStyleV33';
    style.textContent='\
      body.prime-workspace-open main>.page{display:none!important}\
      main>.prime-workspace.modal{position:static;inset:auto;z-index:auto;background:transparent;align-items:stretch;padding:0;min-height:0}\
      main>.prime-workspace.modal.on{display:block}\
      main>.prime-workspace .sheet{width:100%;max-width:none!important;max-height:none!important;overflow:visible!important;margin:0!important;border-radius:18px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}\
      main>.prime-workspace .sheethead,main>.prime-workspace .proc-top{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin:0 0 12px!important;padding:16px 17px!important;background:linear-gradient(145deg,#10231a,#0b1712)!important;border:1px solid var(--line)!important;border-radius:16px!important}\
      main>.prime-workspace .sheethead h2,main>.prime-workspace .proc-top h2{margin:0!important;font-size:21px!important;letter-spacing:-.02em}\
      main>.prime-workspace .proc-top p{margin:4px 0 0!important}\
      main>.prime-workspace .close{width:auto!important;height:auto!important;min-width:84px;padding:9px 11px!important;border:1px solid var(--line)!important;background:#0b1812!important;color:var(--text)!important;font-size:10px!important;font-weight:850!important;white-space:nowrap}\
      main>.prime-workspace .workspace-section{background:linear-gradient(145deg,#0d1a14,#09140f);border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:11px}\
      main>.prime-workspace .workspace-section-title{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#cad8d1}\
      main>.prime-workspace .workspace-section-title span{display:grid;place-items:center;width:25px;height:25px;border-radius:8px;background:#123022;color:var(--green);font-size:12px}\
      main>.prime-workspace .workspace-info.grid2{margin:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\
      main>.prime-workspace .workspace-products{background:linear-gradient(145deg,#0d1a14,#09140f);border:1px solid var(--line);border-radius:16px;padding:15px;margin:0 0 11px}\
      main>.prime-workspace .workspace-products>.sectionhead{margin-top:0!important;margin-bottom:10px!important}\
      main>.prime-workspace .workspace-products .items{margin:0;gap:7px}\
      main>.prime-workspace .workspace-products .item{background:#08130f;border:1px solid #1c3328;border-radius:11px;padding:10px}\
      main>.prime-workspace .workspace-products .itemgrid{align-items:end}\
      main>.prime-workspace .workspace-products .totalbox{margin-top:10px}\
      main>.prime-workspace .workspace-notes{background:linear-gradient(145deg,#0d1a14,#09140f);border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:11px}\
      main>.prime-workspace .stickyfoot{position:static!important;background:transparent!important;padding:4px 0 0!important;justify-content:flex-end!important}\
      main>.prime-workspace .stickyfoot button{flex:0 1 180px!important}\
      main>.prime-workspace .proc-body{padding:0!important;overflow:visible!important;max-height:none!important}\
      main>.prime-workspace .proc-kpis{margin:0 0 11px!important}\
      main>.prime-workspace .proc-toolbar{background:#0c1813;border:1px solid var(--line);border-radius:14px;padding:10px;margin-bottom:11px!important}\
      main>.prime-workspace .proc-card{border-radius:13px!important}\
      .stockline33{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;padding:10px 11px;border:1px solid #2c5542;border-radius:11px;background:#0a1b13}\
      .stockline33 span{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:900}.stockline33 strong{font-size:15px;color:var(--green);font-weight:950}.stockline33.low strong{color:var(--yellow)}.stockline33.zero{border-color:#5c2830;background:#1b1012}.stockline33.zero strong{color:var(--red)}\
      @media(min-width:900px){main>.prime-workspace .workspace-info.grid2{grid-template-columns:repeat(3,minmax(0,1fr))}main>.prime-workspace .workspace-products .itemgrid{grid-template-columns:minmax(280px,1.8fr) 95px 125px auto!important}}\
      @media(max-width:700px){main>.prime-workspace .sheethead,main>.prime-workspace .proc-top{padding:13px!important}main>.prime-workspace .workspace-section,main>.prime-workspace .workspace-products,main>.prime-workspace .workspace-notes{padding:12px}main>.prime-workspace .workspace-info.grid2{grid-template-columns:1fr}.prime-workspace .stickyfoot{display:flex!important}.prime-workspace .stickyfoot button{flex:1!important}.prime-workspace .proc-top-actions .primary{display:inline-flex!important}}\
    ';
    document.head.appendChild(style);
  }

  function ensureStockField(){
    if(el('pStock'))return;
    var price=el('pPrice');if(!price)return;
    var priceField=price.closest('label');if(!priceField)return;
    var field=document.createElement('label');field.className='field';field.style.marginTop='10px';field.innerHTML='Quantidade em estoque<input id="pStock" type="number" min="0" step="1" value="0" inputmode="decimal">';
    priceField.insertAdjacentElement('afterend',field);
  }

  function prepareCommercialWorkspace(id,label,icon){
    var modal=el(id);if(!modal)return;
    modal.classList.add('prime-workspace','commercial-workspace');
    var sheet=modal.querySelector('.sheet');if(!sheet)return;
    var grid=sheet.querySelector(':scope > .grid2');
    if(grid&&!grid.closest('.workspace-section')){
      grid.classList.add('workspace-info');
      var wrap=document.createElement('section');wrap.className='workspace-section';
      var heading=document.createElement('div');heading.className='workspace-section-title';heading.innerHTML='<span>'+icon+'</span>'+label;
      grid.parentNode.insertBefore(wrap,grid);wrap.appendChild(heading);wrap.appendChild(grid);
    }
    var items=id==='quoteModal'?el('qItems'):el('oItems');
    if(items&&!items.closest('.workspace-products')){
      var sectionHead=items.previousElementSibling;
      var total=items.nextElementSibling;
      var productWrap=document.createElement('section');productWrap.className='workspace-products';
      sectionHead.parentNode.insertBefore(productWrap,sectionHead);productWrap.appendChild(sectionHead);productWrap.appendChild(items);if(total&&total.classList.contains('totalbox'))productWrap.appendChild(total);
    }
    var notes=id==='quoteModal'?el('qNotes'):el('oNotes');
    if(notes){var noteLabel=notes.closest('label');if(noteLabel&&!noteLabel.closest('.workspace-notes')){var noteWrap=document.createElement('section');noteWrap.className='workspace-notes';noteLabel.parentNode.insertBefore(noteWrap,noteLabel);noteWrap.appendChild(noteLabel)}}
  }

  function prepareWorkspaces(){
    injectStyle();
    var main=document.querySelector('main');if(!main)return;
    workspaceIds.forEach(function(id){var node=el(id);if(!node)return;node.classList.add('prime-workspace');if(node.parentNode!==main)main.appendChild(node);var close=node.querySelector('.close');if(close){close.textContent='← Voltar';close.setAttribute('aria-label','Voltar')}});
    prepareCommercialWorkspace('quoteModal','Cliente e detalhes','♙');
    prepareCommercialWorkspace('orderModal','Cliente e detalhes','♙');
  }

  function hideWorkspaces(except){workspaceIds.forEach(function(id){if(id!==except){var n=el(id);if(n)n.classList.remove('on')}})}
  function showWorkspace(id,title,back){
    var node=el(id);if(!node)return;
    prepareWorkspaces();
    var previous=currentWorkspace&&el(currentWorkspace)&&el(currentWorkspace).classList.contains('on')?{type:'workspace',id:currentWorkspace,title:titleForWorkspace(currentWorkspace)}:{type:'page',id:currentPage()};
    workspaceBack[id]=back||previous;
    document.querySelectorAll('main > .page').forEach(function(p){p.classList.remove('on')});
    document.querySelectorAll('.nav button').forEach(function(b){b.classList.remove('on')});
    hideWorkspaces(id);node.classList.add('on');currentWorkspace=id;document.body.classList.add('prime-workspace-open');
    if(el('pageTitle'))el('pageTitle').textContent=title||titleForWorkspace(id);
    window.scrollTo({top:0,behavior:'auto'});
  }
  function restoreFromWorkspace(id){
    var back=workspaceBack[id];delete workspaceBack[id];currentWorkspace='';
    hideWorkspaces();document.body.classList.remove('prime-workspace-open');
    if(back&&back.type==='workspace'&&el(back.id)){
      currentWorkspace=back.id;el(back.id).classList.add('on');document.body.classList.add('prime-workspace-open');if(el('pageTitle'))el('pageTitle').textContent=back.title||titleForWorkspace(back.id);return;
    }
    var page=back&&back.type==='page'?back.id:(id==='quoteModal'?'quotes':id==='orderModal'?'orders':'home');
    if(typeof window.go==='function')window.go(page||'home');
  }

  var baseClose=window.closeModal;
  window.closeModal=function(id){
    if(workspaceIds.indexOf(id)>=0&&el(id)&&el(id).classList.contains('on')){
      if(typeof baseClose==='function')baseClose(id);else el(id).classList.remove('on');
      restoreFromWorkspace(id);return;
    }
    if(typeof baseClose==='function')return baseClose.apply(this,arguments);
  };

  var baseGo=window.go;
  if(typeof baseGo==='function')window.go=function(page){
    hideWorkspaces();currentWorkspace='';document.body.classList.remove('prime-workspace-open');
    var r=baseGo.apply(this,arguments);return r;
  };

  function wrapOpen(name,id,titleFn){
    var base=window[name];if(typeof base!=='function')return;
    window[name]=function(){
      var prior=currentWorkspace;
      var result=base.apply(this,arguments);
      var node=el(id);
      if(node&&node.classList.contains('on')){
        var back=prior?{type:'workspace',id:prior,title:titleForWorkspace(prior)}:{type:'page',id:currentPage()};
        showWorkspace(id,typeof titleFn==='function'?titleFn.apply(null,arguments):titleFn,back);
      }
      return result;
    };
  }

  wrapOpen('openQuote','quoteModal',function(id){return id?'Editar orçamento':'Novo orçamento'});
  wrapOpen('openOrder','orderModal','Novo pedido');
  wrapOpen('openPurchases','purchasesModal','Compras');
  wrapOpen('openPurchaseForm','purchaseForm','Registrar compra');
  wrapOpen('openSuppliers','suppliersModal','Fornecedores');
  wrapOpen('openSupplier','supplierForm',function(id){return id?'Editar fornecedor':'Novo fornecedor'});

  window.renderProducts=function(fromStockSync){
    ensureStockField();
    var input=el('productSearch'),q=input?input.value.trim().toLowerCase():'';
    var a=(db.products||[]).filter(function(p){return !q||[p.code,p.name,p.brand].join(' ').toLowerCase().indexOf(q)>=0}).sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''))});
    var manage=can('manage_products'),add=el('addProductBtn');if(add)add.style.display=manage?'block':'none';
    var list=el('productsList');if(!list)return;
    list.innerHTML=a.length?a.map(function(p){
      var stock=stockNumber(p.stock),stockClass=stock<=0?' zero':(stock<=5?' low':'');
      var code=p.code?'<div class="meta"><strong style="color:var(--text)">Código: '+esc(p.code)+'</strong></div>':'';
      var stockLine='<div class="stockline33'+stockClass+'"><span>Quantidade em estoque</span><strong>'+stockText(stock)+' un.</strong></div>';
      return '<div class="product"><h4>'+esc(p.name)+'</h4>'+code+'<div class="meta">'+esc(p.brand||'Sem marca')+(manage?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+stockLine+(manage?'<div class="actions"><button class="secondary" onclick="openProduct(\''+esc(p.id)+'\')">Editar</button>'+(can('delete_records')?'<button class="danger" onclick="deleteEntity(\'products\',\''+esc(p.id)+'\')">Excluir</button>':'')+'</div>':'')+'</div>';
    }).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
    if(!fromStockSync&&typeof window.syncStockSnapshot==='function')window.syncStockSnapshot(false);
  };

  window.openProduct=function(id){
    if(!can('manage_products')){alert('Você não tem permissão para gerenciar produtos.');return}
    ensureStockField();id=id||'';editProductId=id;var p=product(id)||{};
    el('productTitle').textContent=id?'Editar produto':'Novo produto';el('pName').value=p.name||'';if(el('pCode'))el('pCode').value=p.code||'';el('pBrand').value=p.brand||'';el('pCost').value=Number(p.cost||0);el('pPrice').value=Number(p.price||0);el('pStock').value=stockNumber(p.stock);el('productModal').classList.add('on');
  };

  window.saveProduct=async function(){
    if(!can('manage_products'))return;ensureStockField();var name=el('pName').value.trim();if(!name){alert('Informe o nome.');return}
    var entity={id:editProductId||uid(),name:name,code:el('pCode')?el('pCode').value.trim():'',brand:el('pBrand').value.trim(),cost:Number(el('pCost').value)||0,price:Number(el('pPrice').value)||0,stock:Math.max(0,Number(el('pStock').value)||0)};
    try{setSync('Salvando produto...');await api('upsert_entity',{key:'products',entity:entity});closeModal('productModal');await pull(false);if(typeof window.syncStockSnapshot==='function')await window.syncStockSnapshot(true);setSync('Produto salvo','ok')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
  };

  var baseAfterLogin=window.afterLogin;
  if(typeof baseAfterLogin==='function')window.afterLogin=async function(){var r=await baseAfterLogin.apply(this,arguments);prepareWorkspaces();if(typeof window.renderProducts==='function')window.renderProducts(false);return r};

  prepareWorkspaces();
  ensureStockField();
  if(typeof window.renderProducts==='function')window.renderProducts(false);
})();
