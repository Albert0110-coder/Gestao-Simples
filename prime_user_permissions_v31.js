(function(){
  'use strict';

  var permissionUsers=[];
  var currentPermissionUserId='';
  var DEFINITIONS=[
    {key:'create_orders',group:'Vendas',label:'Criar pedidos',desc:'Permite registrar novos pedidos.'},
    {key:'create_quotes',group:'Vendas',label:'Criar orçamentos',desc:'Permite criar novos orçamentos.'},
    {key:'edit_quotes',group:'Vendas',label:'Editar orçamentos',desc:'Permite alterar orçamentos existentes aos quais o usuário tem acesso.'},
    {key:'convert_quotes',group:'Vendas',label:'Transformar orçamento em pedido',desc:'Permite faturar um orçamento e gerar o pedido.'},
    {key:'change_order_status',group:'Vendas',label:'Alterar status dos pedidos',desc:'Permite mudar Pedido, Separação, Faturado e Concluído.'},
    {key:'view_all_sales',group:'Vendas',label:'Ver vendas de todos os usuários',desc:'Quando desligado, o usuário vê apenas os próprios pedidos e orçamentos.'},
    {key:'create_customers',group:'Clientes e produtos',label:'Cadastrar clientes',desc:'Permite adicionar novos clientes.'},
    {key:'edit_customers',group:'Clientes e produtos',label:'Editar clientes',desc:'Permite alterar cadastros de clientes existentes.'},
    {key:'manage_products',group:'Clientes e produtos',label:'Gerenciar produtos',desc:'Permite cadastrar e editar produtos e visualizar custo.'},
    {key:'view_purchases',group:'Compras e fornecedores',label:'Ver compras',desc:'Permite consultar compras registradas.'},
    {key:'manage_purchases',group:'Compras e fornecedores',label:'Registrar compras',desc:'Permite registrar novas compras e movimentar o estoque.'},
    {key:'view_suppliers',group:'Compras e fornecedores',label:'Ver fornecedores',desc:'Permite consultar fornecedores cadastrados.'},
    {key:'manage_suppliers',group:'Compras e fornecedores',label:'Gerenciar fornecedores',desc:'Permite cadastrar e editar fornecedores.'},
    {key:'delete_records',group:'Controle',label:'Excluir registros permitidos',desc:'Libera exclusão somente nas áreas que o usuário já pode gerenciar.'}
  ];

  function el(id){return document.getElementById(id)}
  function can(key){
    if(typeof isAdmin==='function'&&isAdmin())return true;
    return !!(session&&session.user&&session.user.permissions&&session.user.permissions[key]);
  }
  window.canPermission=can;

  function saveSession(){try{if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session))}catch(e){}}

  var originalApi=window.api;
  if(typeof originalApi==='function'){
    window.api=async function(action,extra){
      var result=await originalApi(action,extra);
      if(result&&result.user&&session){
        session.user=Object.assign({},session.user,result.user);
        saveSession();
        setTimeout(applyAccessUI,0);
      }
      return result;
    };
  }

  function setVisible(node,visible,display){if(node)node.style.display=visible?(display||''):'none'}

  function applyAccessUI(){
    var quoteCreate=can('create_quotes'),orderCreate=can('create_orders'),customerCreate=can('create_customers'),productManage=can('manage_products');
    document.querySelectorAll('button[onclick="openQuote()"],button[onclick="openQuote();"]').forEach(function(b){setVisible(b,quoteCreate)});
    document.querySelectorAll('button[onclick="openOrder()"],button[onclick="openOrder();"]').forEach(function(b){setVisible(b,orderCreate)});
    document.querySelectorAll('button[onclick="openCustomer()"],button[onclick="openCustomer();"]').forEach(function(b){setVisible(b,customerCreate)});
    setVisible(el('addProductBtn'),productManage);

    var pNav=el('primePurchasesNav'),sNav=el('primeSuppliersNav');
    if(pNav)pNav.classList.toggle('prime-admin-visible',can('view_purchases')||can('manage_purchases'));
    if(sNav)sNav.classList.toggle('prime-admin-visible',can('view_suppliers')||can('manage_suppliers')||can('view_purchases')||can('manage_purchases'));

    var menu=el('adminMenu');
    if(menu){
      var purchaseBtn=menu.querySelector('button[onclick="openPurchases()"]');
      var supplierBtn=menu.querySelector('button[onclick="openSuppliers()"]');
      var usersBtn=menu.querySelector('button[onclick="openUsers()"]');
      setVisible(purchaseBtn,can('view_purchases')||can('manage_purchases'));
      setVisible(supplierBtn,can('view_suppliers')||can('manage_suppliers')||can('view_purchases')||can('manage_purchases'));
      setVisible(usersBtn,typeof isAdmin==='function'&&isAdmin());
      setVisible(menu,(typeof isAdmin==='function'&&isAdmin())||can('view_purchases')||can('manage_purchases')||can('view_suppliers')||can('manage_suppliers'),'grid');
    }

    var purchaseTop=document.querySelector('#purchasesModal .proc-top-actions .primary');
    setVisible(purchaseTop,can('manage_purchases'));
    var supplierTop=document.querySelector('#suppliersModal .proc-top-actions .primary');
    setVisible(supplierTop,can('manage_suppliers'));

    var balance=el('cBalance');if(balance&&balance.closest('.field'))setVisible(balance.closest('.field'),typeof isAdmin==='function'&&isAdmin());
  }
  window.applyAccessUI=applyAccessUI;

  var originalRenderAll=window.renderAll;
  if(typeof originalRenderAll==='function'){
    window.renderAll=function(){var r=originalRenderAll.apply(this,arguments);applyAccessUI();return r};
  }

  var originalOpenOrder=window.openOrder;
  if(typeof originalOpenOrder==='function')window.openOrder=function(){if(!can('create_orders')){alert('Você não tem permissão para criar pedidos.');return}return originalOpenOrder.apply(this,arguments)};

  var originalOpenQuote=window.openQuote;
  if(typeof originalOpenQuote==='function')window.openQuote=function(id){
    if(id&&!can('edit_quotes')){alert('Você não tem permissão para editar orçamentos.');return}
    if(!id&&!can('create_quotes')){alert('Você não tem permissão para criar orçamentos.');return}
    return originalOpenQuote.apply(this,arguments);
  };

  var originalConvertQuote=window.convertQuote;
  if(typeof originalConvertQuote==='function')window.convertQuote=function(){if(!can('convert_quotes')){alert('Você não tem permissão para transformar orçamentos em pedidos.');return}return originalConvertQuote.apply(this,arguments)};

  var baseQuoteCard=window.quoteCard;
  if(typeof baseQuoteCard==='function')window.quoteCard=function(q){
    var html=baseQuoteCard(q);
    if(!can('edit_quotes'))html=html.replace(/<button class="secondary" onclick="openQuote\('[^']+'\)">Editar<\/button>/g,'');
    if(!can('convert_quotes'))html=html.replace(/<button class="primary" onclick="convertQuote\('[^']+'\)">[^<]*<\/button>/g,'');
    if(!(typeof isAdmin==='function'&&isAdmin())&&can('delete_records')){
      html=html.replace(/<\/div>\s*<\/div>\s*$/,'</div><div class="actions"><button class="danger" onclick="deleteEntity(\'quotes\',\''+esc(q.id)+'\')">Excluir</button></div></div>');
    }
    return html;
  };

  var baseOrderCard=window.orderCard;
  if(typeof baseOrderCard==='function')window.orderCard=function(o){
    var html=baseOrderCard(o);
    if(!(typeof isAdmin==='function'&&isAdmin())&&can('delete_records')){
      html=html.replace(/<\/div>\s*<\/div>\s*$/,'</div><div class="actions"><button class="danger" onclick="deleteEntity(\'sales\',\''+esc(o.id)+'\')">Excluir</button></div></div>');
    }
    return html;
  };

  window.stageSelect=function(o){
    var s=o&&o.orderStage||'order';
    if(!can('change_order_status'))return '<div class="stage" style="display:flex;align-items:center;justify-content:center;min-height:34px;cursor:default;color:var(--muted);background:#0b1711">Status: <strong style="color:var(--text);margin-left:5px">'+stageLabel(s)+'</strong></div>';
    return '<select class="stage" onchange="setOrderStage(\''+esc(o.id)+'\',this.value)">'+[['order','Pedido'],['separation','Em separação'],['invoiced','Faturado'],['completed','Concluído']].map(function(x){return '<option value="'+x[0]+'" '+(s===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>';
  };
  window.setOrderStage=async function(id,stage){
    if(!can('change_order_status')){alert('Você não tem permissão para alterar o status do pedido.');return}
    try{setSync('Atualizando etapa...');await api('update_sale_stage',{sale_id:id,stage:stage});await pull(false);setSync('Etapa atualizada','ok')}catch(e){alert(e.message);await pull(false)}
  };

  window.openCustomer=function(id){
    id=id||'';
    if(id&&!can('edit_customers')){alert('Você não tem permissão para editar clientes.');return}
    if(!id&&!can('create_customers')){alert('Você não tem permissão para cadastrar clientes.');return}
    editCustomerId=id;var c=customer(id)||{};
    el('customerTitle').textContent=id?'Editar cliente':'Novo cliente';el('cName').value=c.name||'';el('cPhone').value=c.phone||'';el('cAddress').value=c.address||'';el('cBalance').value=Number(c.balance||0);
    var f=el('cBalance').closest('.field');if(f)setVisible(f,typeof isAdmin==='function'&&isAdmin());
    el('customerModal').classList.add('on');
  };
  window.saveCustomer=async function(){
    var name=el('cName').value.trim();if(!name){alert('Informe o nome do cliente.');return}
    if(editCustomerId&&!can('edit_customers')){alert('Você não tem permissão para editar clientes.');return}
    if(!editCustomerId&&!can('create_customers')){alert('Você não tem permissão para cadastrar clientes.');return}
    var entity={id:editCustomerId||uid(),name:name,phone:el('cPhone').value.trim(),address:el('cAddress').value.trim(),balance:(typeof isAdmin==='function'&&isAdmin())?Number(el('cBalance').value)||0:0};
    try{setSync('Salvando cliente...');if(editCustomerId)await api('upsert_entity',{key:'customers',entity:entity});else await api('add_customer',{customer:entity});closeModal('customerModal');await pull(false);setSync('Cliente salvo','ok')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
  };
  var originalCustomerDetail=window.openCustomerDetail;
  if(typeof originalCustomerDetail==='function')window.openCustomerDetail=function(){var r=originalCustomerDetail.apply(this,arguments);setVisible(el('cdEdit'),can('edit_customers'));return r};

  window.renderProducts=function(){
    var q=el('productSearch').value.trim().toLowerCase();var a=(db.products||[]).filter(function(p){return !q||[p.name,p.brand].join(' ').toLowerCase().indexOf(q)>=0}).sort(function(a,b){return String(a.name).localeCompare(String(b.name))});
    setVisible(el('addProductBtn'),can('manage_products'));
    el('productsList').innerHTML=a.length?a.map(function(p){
      var manage=can('manage_products');
      return '<div class="product"><h4>'+esc(p.name)+'</h4><div class="meta">'+esc(p.brand||'Sem marca')+(manage?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+(manage?'<div class="actions"><button class="secondary" onclick="openProduct(\''+esc(p.id)+'\')">Editar</button>'+(can('delete_records')?'<button class="danger" onclick="deleteEntity(\'products\',\''+esc(p.id)+'\')">Excluir</button>':'')+'</div>':'')+'</div>';
    }).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
  };
  window.openProduct=function(id){
    if(!can('manage_products')){alert('Você não tem permissão para gerenciar produtos.');return}
    id=id||'';editProductId=id;var p=product(id)||{};el('productTitle').textContent=id?'Editar produto':'Novo produto';el('pName').value=p.name||'';el('pBrand').value=p.brand||'';el('pCost').value=Number(p.cost||0);el('pPrice').value=Number(p.price||0);el('productModal').classList.add('on');
  };
  window.saveProduct=async function(){
    if(!can('manage_products'))return;var name=el('pName').value.trim();if(!name){alert('Informe o nome.');return}
    var entity={id:editProductId||uid(),name:name,brand:el('pBrand').value.trim(),cost:Number(el('pCost').value)||0,price:Number(el('pPrice').value)||0};
    try{await api('upsert_entity',{key:'products',entity:entity});closeModal('productModal');await pull(false)}catch(e){alert(e.message)}
  };

  window.deleteEntity=async function(key,id){
    if(!(typeof isAdmin==='function'&&isAdmin())&&!can('delete_records')){alert('Você não tem permissão para excluir registros.');return}
    if(!confirm('Excluir este registro?'))return;
    try{await api('delete_entity',{key:key,id:id});await pull(false)}catch(e){alert(e.message)}
  };

  var originalRenderSuppliers=window.renderSuppliers;
  if(typeof originalRenderSuppliers==='function')window.renderSuppliers=function(){
    var r=originalRenderSuppliers.apply(this,arguments);
    document.querySelectorAll('#suppliersList .proc-actions .secondary').forEach(function(b){setVisible(b,can('manage_suppliers'))});
    document.querySelectorAll('#suppliersList .proc-actions .danger').forEach(function(b){setVisible(b,can('manage_suppliers')&&can('delete_records'))});
    return r;
  };
  window.openSuppliers=function(){
    if(!(can('view_suppliers')||can('manage_suppliers')||can('view_purchases')||can('manage_purchases'))){alert('Você não tem permissão para acessar fornecedores.');return}
    renderSuppliers();el('suppliersModal').classList.add('on');applyAccessUI();
  };
  window.openSupplier=function(id){
    if(!can('manage_suppliers')){alert('Você não tem permissão para gerenciar fornecedores.');return}
    id=id||'';editSupplierId=id;var s=supplier(id)||{};el('supplierTitle').textContent=id?'Editar fornecedor':'Novo fornecedor';
    ['Name','TradeName','Document','Contact','Phone','Whats','Email','Zip','City','State','Address','Notes'].forEach(function(k){var node=el('s'+k);if(node)node.value=s[k.charAt(0).toLowerCase()+k.slice(1)]||''});
    el('supplierForm').classList.add('on');setTimeout(function(){if(el('sName'))el('sName').focus()},60);
  };
  window.saveSupplier=async function(){
    if(!can('manage_suppliers'))return;var name=(el('sName').value||'').trim();if(!name){alert('Informe a razão social ou nome do fornecedor.');return}
    var entity={id:editSupplierId||uid(),name:name,tradeName:(el('sTradeName').value||'').trim(),document:(el('sDocument').value||'').trim(),contact:(el('sContact').value||'').trim(),phone:(el('sPhone').value||'').trim(),whats:(el('sWhats').value||'').trim(),email:(el('sEmail').value||'').trim(),zip:(el('sZip').value||'').trim(),city:(el('sCity').value||'').trim(),state:(el('sState').value||'').trim().toUpperCase(),address:(el('sAddress').value||'').trim(),notes:(el('sNotes').value||'').trim()};
    try{setSync('Salvando fornecedor...');await api('upsert_entity',{key:'suppliers',entity:entity});closeModal('supplierForm');await pull(false);renderSuppliers();setSync('Fornecedor salvo','ok')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
  };

  var originalRenderPurchases=window.renderPurchases;
  if(typeof originalRenderPurchases==='function')window.renderPurchases=function(){
    var r=originalRenderPurchases.apply(this,arguments);
    document.querySelectorAll('#purchasesList .proc-actions .danger').forEach(function(b){setVisible(b,can('manage_purchases')&&can('delete_records'))});
    return r;
  };
  window.openPurchases=function(){
    if(!(can('view_purchases')||can('manage_purchases'))){alert('Você não tem permissão para acessar compras.');return}
    renderPurchases();el('purchasesModal').classList.add('on');applyAccessUI();
  };
  window.openPurchaseForm=function(){
    if(!can('manage_purchases')){alert('Você não tem permissão para registrar compras.');return}
    el('bSupplier').innerHTML='<option value="">Selecione o fornecedor...</option>'+(db.suppliers||[]).slice().sort(function(a,b){return String((a.tradeName||a.name||'')).localeCompare(String((b.tradeName||b.name||'')))}).map(function(s){var label=s.tradeName||s.name||'Fornecedor';return '<option value="'+esc(s.id)+'">'+esc(label)+(s.document?' · '+esc(s.document):'')+'</option>'}).join('');
    el('bDate').value=today();if(el('bDocument'))el('bDocument').value='';el('bPay').value='Pix';el('bStatus').value='paid';el('bNotes').value='';el('bItems').innerHTML='';addBuyItem();calcBuy();el('purchaseForm').classList.add('on');
  };
  window.savePurchase=async function(){
    if(!can('manage_purchases'))return;if(!el('bSupplier').value){alert('Selecione o fornecedor.');return}
    var items=Array.prototype.slice.call(document.querySelectorAll('#bItems .proc-item')).map(function(d){return {productId:d.querySelector('.bp').value,qty:Number(d.querySelector('.bq').value)||0,price:Number(d.querySelector('.bv').value)||0}}).filter(function(i){return i.productId&&i.qty>0});
    if(!items.length){alert('Adicione pelo menos um produto à compra.');return}
    var buy={id:uid(),date:el('bDate').value||today(),party:el('bSupplier').value,documentNo:el('bDocument')?(el('bDocument').value||'').trim():'',pay:el('bPay').value,status:el('bStatus').value,notes:(el('bNotes').value||'').trim(),items:items};
    try{setSync('Registrando compra...');await api('append_buy',{buy:buy});closeModal('purchaseForm');await pull(false);if(typeof window.syncStockSnapshot==='function')await window.syncStockSnapshot(true);renderPurchases();setSync('Compra registrada e estoque atualizado','ok')}catch(e){alert(e.message);setSync('Erro ao registrar compra','bad')}
  };
  window.deletePurchasePro=async function(id){
    if(!can('manage_purchases')||!can('delete_records')){alert('Você não tem permissão para excluir compras.');return}
    if(!confirm('Excluir esta compra? As quantidades serão retiradas do estoque automaticamente.'))return;
    try{setSync('Excluindo compra...');await api('delete_entity',{key:'buys',id:id});await pull(false);if(typeof window.syncStockSnapshot==='function')await window.syncStockSnapshot(true);renderPurchases();setSync('Compra excluída e estoque ajustado','ok')}catch(e){alert(e.message);setSync('Erro ao excluir','bad')}
  };

  function ensurePermissionModal(){
    if(el('userPermissionsModal'))return;
    var modal=document.createElement('div');modal.id='userPermissionsModal';modal.className='modal';
    modal.innerHTML='<div class="sheet permission-sheet"><div class="sheethead"><div><h2 id="permissionTitle">Permissões</h2><div id="permissionSubtitle" class="meta"></div></div><button class="close" onclick="closeModal(\'userPermissionsModal\')">×</button></div><div id="permissionGroups"></div><div class="stickyfoot"><button class="secondary" onclick="closeModal(\'userPermissionsModal\')">Cancelar</button><button class="primary" onclick="saveUserPermissions()">Salvar permissões</button></div></div>';
    document.body.appendChild(modal);
    if(!el('primePermissionStyle')){
      var style=document.createElement('style');style.id='primePermissionStyle';style.textContent='\n.permission-sheet{max-width:760px!important}.perm-group{border:1px solid var(--line);background:#0a1711;border-radius:14px;padding:13px;margin-bottom:10px}.perm-group h3{margin:0 0 9px;font-size:13px}.perm-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}.perm-item{display:flex;align-items:flex-start;gap:9px;border:1px solid #1d3229;border-radius:11px;padding:10px;background:#08140f;cursor:pointer}.perm-item input{width:18px;height:18px;margin:1px 0 0;flex:none}.perm-item strong{display:block;font-size:11px}.perm-item small{display:block;color:var(--muted);font-size:9px;line-height:1.4;margin-top:3px}.user-perm-actions{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}.user-perm-count{display:inline-block;margin-top:5px;color:var(--green);font-size:9px;font-weight:800}@media(max-width:620px){.perm-list{grid-template-columns:1fr}}\n';document.head.appendChild(style);
    }
  }

  function permissionCount(p){return DEFINITIONS.reduce(function(n,d){return n+(p&&p[d.key]?1:0)},0)}
  async function renderUsersCustom(){
    if(!(typeof isAdmin==='function'&&isAdmin()))return;
    try{
      var j=await api('list_users');permissionUsers=j.users||[];
      el('usersList').innerHTML=permissionUsers.map(function(u){
        var self=session&&session.user&&u.id===session.user.id;
        var access=u.role==='admin'?'<span class="user-perm-count">Acesso total</span>':'<span class="user-perm-count">'+permissionCount(u.permissions)+' permissões ativas</span>';
        return '<div class="row"><div class="rowtop"><div><h4>'+esc(u.username)+'</h4><div class="meta">'+(u.role==='admin'?'Administrador':'Usuário')+' · '+(u.enabled?'Ativo':'Bloqueado')+'</div>'+access+'</div>'+(self?'<span class="pill">Você</span>':'')+'</div><div class="user-perm-actions">'+(u.role!=='admin'?'<button class="secondary" onclick="openUserPermissions(\''+esc(u.id)+'\')">Permissões</button>':'')+(!self?'<button class="secondary" onclick="setUser(\''+esc(u.id)+'\','+(!u.enabled)+')">'+(u.enabled?'Bloquear':'Ativar')+'</button>':'')+'</div></div>';
      }).join('');
    }catch(e){alert(e.message)}
  }
  window.renderUsers=renderUsersCustom;
  window.openUsers=async function(){if(!(typeof isAdmin==='function'&&isAdmin()))return;ensurePermissionModal();el('usersModal').classList.add('on');await renderUsersCustom()};
  window.openUserPermissions=function(id){
    if(!(typeof isAdmin==='function'&&isAdmin()))return;ensurePermissionModal();var u=permissionUsers.find(function(x){return x.id===id});if(!u||u.role==='admin')return;currentPermissionUserId=id;
    el('permissionTitle').textContent='Permissões de '+u.username;el('permissionSubtitle').textContent='Marque somente o que este usuário pode fazer no sistema.';
    var groups={};DEFINITIONS.forEach(function(d){(groups[d.group]||(groups[d.group]=[])).push(d)});
    el('permissionGroups').innerHTML=Object.keys(groups).map(function(group){return '<section class="perm-group"><h3>'+esc(group)+'</h3><div class="perm-list">'+groups[group].map(function(d){return '<label class="perm-item"><input type="checkbox" data-permission="'+d.key+'" '+(u.permissions&&u.permissions[d.key]?'checked':'')+'><span><strong>'+esc(d.label)+'</strong><small>'+esc(d.desc)+'</small></span></label>'}).join('')+'</div></section>'}).join('');
    el('userPermissionsModal').classList.add('on');
  };
  window.saveUserPermissions=async function(){
    if(!(typeof isAdmin==='function'&&isAdmin())||!currentPermissionUserId)return;
    var permissions={};DEFINITIONS.forEach(function(d){var n=document.querySelector('#userPermissionsModal [data-permission="'+d.key+'"]');permissions[d.key]=!!(n&&n.checked)});
    if(permissions.manage_purchases)permissions.view_purchases=true;if(permissions.manage_suppliers)permissions.view_suppliers=true;
    try{setSync('Salvando permissões...');await api('set_user_permissions',{user_id:currentPermissionUserId,permissions:permissions});closeModal('userPermissionsModal');await renderUsersCustom();setSync('Permissões atualizadas','ok')}catch(e){alert(e.message);setSync('Erro ao salvar permissões','bad')}
  };

  var previousAfterLogin=window.afterLogin;
  if(typeof previousAfterLogin==='function')window.afterLogin=async function(){var r=await previousAfterLogin.apply(this,arguments);applyAccessUI();return r};

  async function refreshPermissions(){
    if(!session||!session.token||typeof originalApi!=='function')return;
    try{var j=await originalApi('load');if(j&&j.user&&session){session.user=Object.assign({},session.user,j.user);saveSession();applyAccessUI();if(typeof window.renderHome==='function')window.renderHome()}}catch(e){}
  }

  ensurePermissionModal();
  applyAccessUI();
  setTimeout(applyAccessUI,300);
  setTimeout(refreshPermissions,600);
})();