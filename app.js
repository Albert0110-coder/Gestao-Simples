const API='https://lvoizfpdpvcqqhsrmflu.supabase.co/functions/v1/gestao-api';
const SESSION_KEY='gestaoAdminSession';
const CACHE_KEY='gestaoMercosLikeV1';
const $=id=>document.getElementById(id);
const money=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const isAdmin=()=>session?.user?.role==='admin';
const product=id=>db.products.find(x=>x.id===id);
const customer=id=>db.customers.find(x=>x.id===id);
const supplier=id=>db.suppliers.find(x=>x.id===id);
const orderTotal=o=>(o.items||[]).reduce((s,i)=>s+(+i.qty||0)*(+i.price||0),0);

let session=null;
let db={products:[],customers:[],suppliers:[],sales:[],buys:[]};
let currentCustomerId='';
let editCustomerId='';
let editProductId='';
let editSupplierId='';
let syncTimer=null;

try{
  const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
  if(cached?.data) db={...db,...cached.data};
}catch{}

function setSync(text,state=''){
  $('syncText').textContent=text;
  $('syncDot').className='dot '+state;
}
async function api(action,extra={}){
  const r=await fetch(API,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action,token:session?.token||'',...extra})
  });
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error||'Erro no servidor');
  return j;
}
function cache(){
  localStorage.setItem(CACHE_KEY,JSON.stringify({data:db,at:Date.now()}));
}
function ensureArrays(){
  db.products=db.products||[];db.customers=db.customers||[];db.suppliers=db.suppliers||[];db.sales=db.sales||[];db.buys=db.buys||[];
}
async function login(){
  const username=$('loginUser').value.trim(),password=$('loginPass').value;
  if(!username||!password){$('loginMsg').textContent='Preencha usuário e senha.';return}
  $('loginMsg').textContent='Entrando...';
  try{
    const j=await api('login',{username,password});
    session={token:j.token,user:j.user};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    $('login').classList.remove('on');
    await afterLogin();
  }catch(e){$('loginMsg').textContent=e.message}
}
async function afterLogin(){
  $('hello').textContent='Olá, '+session.user.username;
  $('moreUser').textContent=session.user.username;
  $('roleLabel').textContent=isAdmin()?'Visão administrativa':'Minhas vendas';
  $('moreRole').textContent=isAdmin()?'Administrador':'Usuário';
  $('adminMenu').style.display=isAdmin()?'grid':'none';
  $('addProductBtn').style.display=isAdmin()?'block':'none';
  $('cBalance').closest('.field').style.display=isAdmin()?'block':'none';
  initPeriod();
  await pull(false);
  go('home');
  if(syncTimer)clearInterval(syncTimer);
  syncTimer=setInterval(()=>pull(false),20000);
}
async function logout(){
  try{if(session)await api('logout')}catch{}
  session=null;
  localStorage.removeItem(SESSION_KEY);
  if(syncTimer)clearInterval(syncTimer);
  $('loginPass').value='';
  $('loginMsg').textContent='';
  $('login').classList.add('on');
  setSync('Aguardando login');
}
async function pull(manual=false){
  if(!session)return;
  if(manual)setSync('Sincronizando...');
  try{
    const j=await api('load');
    db={products:[],customers:[],suppliers:[],sales:[],buys:[],...(j.data||{})};
    ensureArrays();cache();renderAll();setSync('Sincronizado','ok');
  }catch(e){
    console.error(e);
    setSync('Sem conexão','bad');
    if(/sessão|autenticado/i.test(e.message))logout();
  }
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)pull(false)});
window.addEventListener('focus',()=>{if(session)pull(false)});

function go(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('on'));
  $(page).classList.add('on');
  const btn=document.querySelector(`.nav button[data-page="${page}"]`);
  if(btn)btn.classList.add('on');
  const names={home:'Início',orders:'Pedidos',customers:'Clientes',products:'Produtos',more:'Mais'};
  $('pageTitle').textContent=names[page]||'Gestão Simples';
  if(page==='orders')renderOrders();
  if(page==='customers')renderCustomers();
  if(page==='products')renderProducts();
}
function closeModal(id){$(id).classList.remove('on')}

function renderAll(){
  renderHome();renderOrders();renderCustomers();renderProducts();
  if(isAdmin()){renderPurchases();renderSuppliers()}
}
function renderHome(){
  const d=today(),m=d.slice(0,7);
  const salesToday=db.sales.filter(o=>o.date===d);
  const salesMonth=db.sales.filter(o=>String(o.date||'').startsWith(m));
  const totalToday=salesToday.reduce((s,o)=>s+orderTotal(o),0);
  const totalMonth=salesMonth.reduce((s,o)=>s+orderTotal(o),0);
  $('homeToday').textContent=money(totalToday);
  $('homeMonth').textContent=money(totalMonth);
  $('homeCount').textContent=String(salesMonth.length);
  $('homeTicket').textContent=money(salesMonth.length?totalMonth/salesMonth.length:0);
  const last=db.sales.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5);
  $('homeOrders').innerHTML=last.length?last.map(orderCard).join(''):'<div class="empty">Nenhum pedido registrado.</div>';
}
function orderCard(o){
  const c=customer(o.party);
  return `<div class="row">
    <div class="rowtop"><div><h4>${esc(c?.name||'Cliente não informado')}</h4>
    <div class="meta">${esc(o.date||'')} · ${(o.items||[]).length} item(ns)${isAdmin()&&o.createdBy?' · '+esc(o.createdBy):''}</div></div>
    <div style="text-align:right"><div class="value">${money(orderTotal(o))}</div><span class="pill">${o.status==='paid'?'Pago':'Pendente'}</span></div></div>
    <div class="actions"><button class="secondary" onclick="receipt('${o.id}','receipt')">Recibo</button><button class="secondary" onclick="receipt('${o.id}','quote')">Orçamento</button>${isAdmin()?`<button class="danger" onclick="deleteEntity('sales','${o.id}')">Excluir</button>`:''}</div>
  </div>`;
}
function initPeriod(){
  $('orderPeriod').value='month';
  $('periodValue').type='month';
  $('periodValue').value=today().slice(0,7);
  $('periodLabel').firstChild.nodeValue='Mês';
}
function periodChanged(){
  const mode=$('orderPeriod').value;
  if(mode==='day'){$('periodValue').type='date';$('periodValue').value=today();$('periodLabel').firstChild.nodeValue='Dia'}
  else if(mode==='year'){$('periodValue').type='number';$('periodValue').min='2000';$('periodValue').max='2100';$('periodValue').value=String(new Date().getFullYear());$('periodLabel').firstChild.nodeValue='Ano'}
  else{$('periodValue').type='month';$('periodValue').value=today().slice(0,7);$('periodLabel').firstChild.nodeValue='Mês'}
  renderOrders();
}
function filteredOrders(){
  const mode=$('orderPeriod')?.value||'month',v=$('periodValue')?.value||'',q=($('orderSearch')?.value||'').trim().toLowerCase();
  return db.sales.filter(o=>{
    const d=String(o.date||'');
    const dateOk=mode==='day'?d===v:mode==='year'?d.startsWith(v+'-'):d.startsWith(v);
    const name=(customer(o.party)?.name||'').toLowerCase();
    return dateOk&&(!q||name.includes(q));
  }).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function renderOrders(){
  if(!$('ordersList'))return;
  const arr=filteredOrders();
  $('ordersTotal').textContent=money(arr.reduce((s,o)=>s+orderTotal(o),0));
  $('ordersCount').textContent=String(arr.length);
  $('ordersList').innerHTML=arr.length?arr.map(orderCard).join(''):'<div class="empty">Nenhum pedido nesse período.</div>';
}

function openOrder(){
  $('oCustomer').innerHTML='<option value="">Selecione o cliente...</option>'+db.customers.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  $('oDate').value=today();$('oPay').value='Pix';$('oStatus').value='paid';$('oFulfill').value='pickup';$('oAddress').value='';$('oAddressWrap').style.display='none';$('oNotes').value='';$('oItems').innerHTML='';
  addOrderItem();calcOrder();$('orderModal').classList.add('on');
}
function toggleOrderAddress(){$('oAddressWrap').style.display=$('oFulfill').value==='delivery'?'block':'none'}
function addOrderItem(){
  const d=document.createElement('div');d.className='item';
  d.innerHTML=`<div class="itemgrid"><label class="field">Produto<select class="ip"><option value="">Selecione...</option>${db.products.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.id}">${esc(p.name)}${p.brand?' · '+esc(p.brand):''}</option>`).join('')}</select></label><label class="field">Qtd.<input class="iq" type="number" min="0.01" step="0.01" value="1"></label><label class="field">Preço<input class="iv" type="number" min="0" step="0.01" value="0"></label><button type="button" class="secondary remove" onclick="this.closest('.item').remove();calcOrder()">Remover</button></div>`;
  d.querySelector('.ip').onchange=e=>{const p=product(e.target.value);d.querySelector('.iv').value=+p?.price||0;calcOrder()};
  d.querySelectorAll('input').forEach(i=>i.oninput=calcOrder);
  $('oItems').appendChild(d);
}
function calcOrder(){
  let n=0;document.querySelectorAll('#oItems .item').forEach(d=>n+=(+d.querySelector('.iq').value||0)*(+d.querySelector('.iv').value||0));
  $('oTotal').textContent=money(n);
}
async function saveOrder(){
  const items=[...document.querySelectorAll('#oItems .item')].map(d=>({productId:d.querySelector('.ip').value,qty:+d.querySelector('.iq').value||0,price:+d.querySelector('.iv').value||0})).filter(i=>i.productId&&i.qty>0);
  if(!$('oCustomer').value){alert('Selecione um cliente.');return}
  if(!items.length){alert('Adicione pelo menos um produto.');return}
  const o={id:uid(),date:$('oDate').value||today(),party:$('oCustomer').value,pay:$('oPay').value,status:$('oStatus').value,fulfill:$('oFulfill').value,address:$('oAddress').value,notes:$('oNotes').value,items};
  try{
    setSync('Salvando pedido...');
    await api('add_sale',{sale:o});
    closeModal('orderModal');await pull(false);setSync('Pedido salvo','ok');go('orders');
  }catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
}

function renderCustomers(){
  const q=($('customerSearch')?.value||'').trim().toLowerCase();
  const arr=db.customers.filter(c=>!q||[c.name,c.phone,c.address].join(' ').toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  $('customersList').innerHTML=arr.length?arr.map(c=>`<div class="row" onclick="openCustomerDetail('${c.id}')"><div class="rowtop"><div><h4>${esc(c.name)}</h4><div class="meta">${esc(c.phone||'Sem telefone')}${c.address?' · '+esc(c.address):''}</div></div><span class="pill">Ver histórico</span></div></div>`).join(''):'<div class="empty">Nenhum cliente encontrado.</div>';
}
function openCustomer(id=''){
  if(id&&!isAdmin()){alert('Apenas o administrador pode editar clientes existentes.');return}
  editCustomerId=id;
  const c=customer(id)||{};
  $('customerTitle').textContent=id?'Editar cliente':'Novo cliente';
  $('cName').value=c.name||'';$('cPhone').value=c.phone||'';$('cAddress').value=c.address||'';$('cBalance').value=+c.balance||0;
  $('cBalance').closest('.field').style.display=isAdmin()?'block':'none';
  $('customerModal').classList.add('on');
}
async function saveCustomer(){
  const name=$('cName').value.trim();if(!name){alert('Informe o nome do cliente.');return}
  const entity={id:editCustomerId||uid(),name,phone:$('cPhone').value.trim(),address:$('cAddress').value.trim(),balance:isAdmin()?+$('cBalance').value||0:0};
  try{
    setSync('Salvando cliente...');
    if(editCustomerId){
      if(!isAdmin()){alert('Sem permissão.');return}
      await api('upsert_entity',{key:'customers',entity});
    }else await api('add_customer',{customer:entity});
    closeModal('customerModal');await pull(false);setSync('Cliente salvo','ok');
  }catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
}
function openCustomerDetail(id){
  currentCustomerId=id;const c=customer(id);if(!c)return;
  $('cdName').textContent=c.name;$('cdPhone').textContent=c.phone?'Telefone: '+c.phone:'Sem telefone';$('cdAddress').textContent=c.address?'Endereço: '+c.address:'Sem endereço';
  $('cdEdit').style.display=isAdmin()?'block':'none';
  const sales=db.sales.filter(o=>o.party===id).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  $('cdOrders').innerHTML=sales.length?sales.map(orderCard).join(''):'<div class="empty">Nenhum pedido desse cliente.</div>';
  $('customerDetail').classList.add('on');
}
function editCurrentCustomer(){closeModal('customerDetail');openCustomer(currentCustomerId)}

function renderProducts(){
  const q=($('productSearch')?.value||'').trim().toLowerCase();
  const arr=db.products.filter(p=>!q||[p.name,p.brand].join(' ').toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  $('addProductBtn').style.display=isAdmin()?'block':'none';
  $('productsList').innerHTML=arr.length?arr.map(p=>`<div class="product"><h4>${esc(p.name)}</h4><div class="meta">${esc(p.brand||'Sem marca')}${isAdmin()?`<br>Custo: ${money(p.cost)}`:''}</div><div class="price">${money(p.price)}</div>${isAdmin()?`<div class="actions"><button class="secondary" onclick="openProduct('${p.id}')">Editar</button><button class="danger" onclick="deleteEntity('products','${p.id}')">Excluir</button></div>`:''}</div>`).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
}
function openProduct(id=''){
  if(!isAdmin()){alert('Apenas administradores cadastram produtos.');return}
  editProductId=id;const p=product(id)||{};
  $('productTitle').textContent=id?'Editar produto':'Novo produto';
  $('pName').value=p.name||'';$('pBrand').value=p.brand||'';$('pCost').value=+p.cost||0;$('pPrice').value=+p.price||0;
  $('productModal').classList.add('on');
}
async function saveProduct(){
  if(!isAdmin())return;
  const name=$('pName').value.trim();if(!name){alert('Informe o nome.');return}
  const entity={id:editProductId||uid(),name,brand:$('pBrand').value.trim(),cost:+$('pCost').value||0,price:+$('pPrice').value||0};
  try{setSync('Salvando produto...');await api('upsert_entity',{key:'products',entity});closeModal('productModal');await pull(false);setSync('Produto salvo','ok')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
}

async function deleteEntity(key,id){
  if(!isAdmin())return;
  if(!confirm('Excluir este registro?'))return;
  try{setSync('Excluindo...');await api('delete_entity',{key,id});await pull(false);setSync('Excluído','ok')}catch(e){alert(e.message);setSync('Erro ao excluir','bad')}
}

function openPurchases(){if(!isAdmin())return;renderPurchases();$('purchasesModal').classList.add('on')}
function renderPurchases(){
  const arr=db.buys.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  $('purchasesList').innerHTML=arr.length?arr.map(o=>`<div class="row"><div class="rowtop"><div><h4>${esc(supplier(o.party)?.name||'Compra')}</h4><div class="meta">${esc(o.date||'')} · ${(o.items||[]).length} item(ns)</div></div><div class="value">${money(orderTotal(o))}</div></div><div class="actions"><button class="danger" onclick="deleteEntity('buys','${o.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhuma compra.</div>';
}
function openPurchaseForm(){
  $('bSupplier').innerHTML='<option value="">Selecione...</option>'+db.suppliers.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
  $('bDate').value=today();$('bPay').value='Pix';$('bStatus').value='paid';$('bNotes').value='';$('bItems').innerHTML='';addBuyItem();calcBuy();$('purchaseForm').classList.add('on');
}
function addBuyItem(){
  const d=document.createElement('div');d.className='item';
  d.innerHTML=`<div class="itemgrid"><label class="field">Produto<select class="bp"><option value="">Selecione...</option>${db.products.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label class="field">Qtd.<input class="bq" type="number" min="0.01" step="0.01" value="1"></label><label class="field">Custo<input class="bv" type="number" min="0" step="0.01" value="0"></label><button class="secondary remove" onclick="this.closest('.item').remove();calcBuy()">Remover</button></div>`;
  d.querySelector('.bp').onchange=e=>{d.querySelector('.bv').value=+product(e.target.value)?.cost||0;calcBuy()};
  d.querySelectorAll('input').forEach(i=>i.oninput=calcBuy);$('bItems').appendChild(d);
}
function calcBuy(){let n=0;document.querySelectorAll('#bItems .item').forEach(d=>n+=(+d.querySelector('.bq').value||0)*(+d.querySelector('.bv').value||0));$('bTotal').textContent=money(n)}
async function savePurchase(){
  const items=[...document.querySelectorAll('#bItems .item')].map(d=>({productId:d.querySelector('.bp').value,qty:+d.querySelector('.bq').value||0,price:+d.querySelector('.bv').value||0})).filter(i=>i.productId&&i.qty>0);
  if(!items.length){alert('Adicione produtos.');return}
  const buy={id:uid(),date:$('bDate').value||today(),party:$('bSupplier').value,pay:$('bPay').value,status:$('bStatus').value,notes:$('bNotes').value,items};
  try{await api('append_buy',{buy});closeModal('purchaseForm');await pull(false);renderPurchases()}catch(e){alert(e.message)}
}

function openSuppliers(){if(!isAdmin())return;renderSuppliers();$('suppliersModal').classList.add('on')}
function renderSuppliers(){
  $('suppliersList').innerHTML=db.suppliers.length?db.suppliers.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`<div class="row"><div class="rowtop"><div><h4>${esc(s.name)}</h4><div class="meta">${esc(s.phone||'')}${s.address?' · '+esc(s.address):''}</div></div></div><div class="actions"><button class="secondary" onclick="openSupplier('${s.id}')">Editar</button><button class="danger" onclick="deleteEntity('suppliers','${s.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum fornecedor.</div>';
}
function openSupplier(id=''){
  if(!isAdmin())return;editSupplierId=id;const s=supplier(id)||{};
  $('supplierTitle').textContent=id?'Editar fornecedor':'Novo fornecedor';$('sName').value=s.name||'';$('sPhone').value=s.phone||'';$('sAddress').value=s.address||'';$('supplierForm').classList.add('on');
}
async function saveSupplier(){
  const name=$('sName').value.trim();if(!name){alert('Informe o nome.');return}
  const entity={id:editSupplierId||uid(),name,phone:$('sPhone').value.trim(),address:$('sAddress').value.trim()};
  try{await api('upsert_entity',{key:'suppliers',entity});closeModal('supplierForm');await pull(false);renderSuppliers()}catch(e){alert(e.message)}
}

async function openUsers(){if(!isAdmin())return;$('usersModal').classList.add('on');await renderUsers()}
async function renderUsers(){
  try{
    const j=await api('list_users');
    $('usersList').innerHTML=(j.users||[]).map(u=>`<div class="row"><div class="rowtop"><div><h4>${esc(u.username)}</h4><div class="meta">${u.role==='admin'?'Administrador':'Usuário'} · ${u.enabled?'Ativo':'Bloqueado'}</div></div>${u.username===session.user.username?'<span class="pill">Você</span>':''}</div>${u.username!==session.user.username?`<div class="actions"><button class="secondary" onclick="setUser('${u.id}',${!u.enabled})">${u.enabled?'Bloquear':'Ativar'}</button></div>`:''}</div>`).join('');
  }catch(e){alert(e.message)}
}
async function saveUser(){
  const username=$('uName').value.trim(),password=$('uPass').value,role=$('uRole').value;
  if(username.length<2||password.length<6){alert('Usuário com pelo menos 2 caracteres e senha com pelo menos 6.');return}
  try{await api('create_user',{username,password,role});$('uName').value='';$('uPass').value='';await renderUsers()}catch(e){alert(e.message)}
}
async function setUser(user_id,enabled){try{await api('set_user_enabled',{user_id,enabled});await renderUsers()}catch(e){alert(e.message)}

function receipt(id,kind){
  const o=db.sales.find(x=>x.id===id);if(!o)return;const c=customer(o.party);
  const title=kind==='quote'?'ORÇAMENTO':'PEDIDO / RECIBO';
  const items=(o.items||[]).map(i=>{const p=product(i.productId);return `<tr><td>${esc(p?.name||'Produto')}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`}).join('');
  const w=window.open('','_blank');
  if(!w){alert('Permita pop-ups para gerar o documento.');return}
  w.document.write(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:Arial;padding:22px;color:#111}h2{margin-bottom:4px}.muted{color:#666;line-height:1.5}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:9px 5px;text-align:left}th:last-child,td:last-child{text-align:right}.total{text-align:right;font-size:20px;font-weight:bold;margin-top:18px}</style></head><body><h2>${title}</h2><div class="muted">Data: ${esc(o.date)}<br>Cliente: ${esc(c?.name||'Não informado')}<br>${o.fulfill==='delivery'?'Entrega: '+esc(o.address||c?.address||''):'Retirada'}<br>Pagamento: ${esc(o.pay)} · ${o.status==='paid'?'Pago':'Pendente'}</div><table><thead><tr><th>Item</th><th>Qtd.</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${items}</tbody></table><div class="total">Total: ${money(orderTotal(o))}</div><p>${esc(o.notes||'')}</p><script>setTimeout(()=>window.print(),350)<\/script></body></html>`);
  w.document.close();
}

(function boot(){
  try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{}
  initPeriod();
  renderAll();
  if(session?.token){$('login').classList.remove('on');afterLogin().catch(()=>logout())}
  else{$('login').classList.add('on');setSync('Aguardando login')}
})();