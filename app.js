
const SB_URL='https://lvoizfpdpvcqqhsrmflu.supabase.co';
const SB_KEY='sb_publishable_EjEA70CvIvAiU_v20wrL1A_F1jxNQmX';
const DATA_KEY='gestaoMobileV1', SESSION_KEY='gestaoCloudSession';
const $=id=>document.getElementById(id),money=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),today=()=>new Date().toISOString().slice(0,10),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let db;try{db=JSON.parse(localStorage.getItem(DATA_KEY))}catch{}db=db||{products:[],customers:[],suppliers:[],sales:[],buys:[]};
db.products=db.products||[];db.customers=db.customers||[];db.suppliers=db.suppliers||[];db.sales=db.sales||[];db.buys=db.buys||[];
let session=null,syncTimer=null,pushing=false,orderType='sale',simpleType='',editId=null;

function setSync(text,state=''){ $('syncText').textContent=text; $('syncDot').className='dot '+state; }
function authHeaders(token){return {'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}

async function apiAuth(path,body){
 const r=await fetch(SB_URL+'/auth/v1/'+path,{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const j=await r.json().catch(()=>({})); if(!r.ok)throw new Error(j.msg||j.message||j.error_description||'Erro de autenticação'); return j;
}
async function signup(){
 const email=$('authEmail').value.trim(),password=$('authPass').value;
 if(!email||password.length<6){$('authMsg').textContent='Informe um e-mail e uma senha com pelo menos 6 caracteres.';return}
 $('authMsg').textContent='Criando conta...';
 try{const j=await apiAuth('signup',{email,password});if(j.session){setSession(j.session);await afterLogin()}else $('authMsg').textContent='Conta criada. Confira seu e-mail para confirmar a conta e depois toque em Entrar.'}catch(e){$('authMsg').textContent=e.message}
}
async function login(){
 const email=$('authEmail').value.trim(),password=$('authPass').value;if(!email||!password){$('authMsg').textContent='Preencha e-mail e senha.';return}
 $('authMsg').textContent='Entrando...';
 try{const j=await apiAuth('token?grant_type=password',{email,password});setSession(j);await afterLogin()}catch(e){$('authMsg').textContent=e.message}
}
function setSession(s){session={access_token:s.access_token,refresh_token:s.refresh_token,user:s.user,expires_at:Date.now()+(Number(s.expires_in||3600)*1000)};localStorage.setItem(SESSION_KEY,JSON.stringify(session))}
async function ensureToken(){
 if(!session)throw new Error('Sem login');
 if(Date.now()<session.expires_at-60000)return session.access_token;
 const j=await apiAuth('token?grant_type=refresh_token',{refresh_token:session.refresh_token});setSession(j);return session.access_token;
}
async function afterLogin(){
 $('auth').classList.remove('on');setSync('Sincronizando...');await pullCloud(false,true);render();if(syncTimer)clearInterval(syncTimer);syncTimer=setInterval(()=>pullCloud(false),20000);
}
async function logout(){session=null;localStorage.removeItem(SESSION_KEY);if(syncTimer)clearInterval(syncTimer);$('auth').classList.add('on');$('authMsg').textContent='';setSync('Aguardando login')}
async function pushCloud(){
 if(!session||pushing)return;pushing=true;setSync('Salvando na nuvem...');
 try{const token=await ensureToken(),body={user_id:session.user.id,data:db,updated_at:new Date().toISOString()};const r=await fetch(SB_URL+'/rest/v1/gestao_data?on_conflict=user_id',{method:'POST',headers:{...authHeaders(token),'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());setSync('Sincronizado','ok')}catch(e){console.error(e);setSync('Sem sincronizar','bad')}finally{pushing=false}
}
async function pullCloud(manual=false,first=false){
 if(!session)return; if(manual)setSync('Buscando atualizações...');
 try{const token=await ensureToken(),r=await fetch(SB_URL+'/rest/v1/gestao_data?select=data,updated_at&user_id=eq.'+encodeURIComponent(session.user.id),{headers:authHeaders(token)});if(!r.ok)throw new Error(await r.text());const rows=await r.json();
 if(rows.length&&rows[0].data){db=rows[0].data;db.products=db.products||[];db.customers=db.customers||[];db.suppliers=db.suppliers||[];db.sales=db.sales||[];db.buys=db.buys||[];localStorage.setItem(DATA_KEY,JSON.stringify(db));render();setSync('Sincronizado','ok')}
 else if(first){await pushCloud()}else setSync('Sincronizado','ok')
 }catch(e){console.error(e);setSync('Sem sincronizar','bad')}
}
function save(){localStorage.setItem(DATA_KEY,JSON.stringify(db));render();clearTimeout(window.__pushDelay);window.__pushDelay=setTimeout(pushCloud,250)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)pullCloud(false)});window.addEventListener('focus',()=>{if(session)pullCloud(false)});

document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page,.nav button').forEach(x=>x.classList.remove('on'));$(b.dataset.p).classList.add('on');b.classList.add('on');$('pageTitle').textContent=b.textContent});
const product=id=>db.products.find(x=>x.id===id),cust=id=>db.customers.find(x=>x.id===id),supp=id=>db.suppliers.find(x=>x.id===id),orderTotal=o=>(o.items||[]).reduce((s,i)=>s+(+i.qty||0)*(+i.price||0),0);
function customerBalance(c){let b=+c.balance||0;db.sales.filter(o=>o.party===c.id&&o.pay==='Conta do cliente'&&o.status==='pending').forEach(o=>b+=orderTotal(o));return b}
function render(){
 const month=today().slice(0,7),sales=db.sales.filter(o=>o.date?.startsWith(month)),buys=db.buys.filter(o=>o.date?.startsWith(month)),sv=sales.reduce((s,o)=>s+orderTotal(o),0),bv=buys.reduce((s,o)=>s+orderTotal(o),0),pd=[...sales,...buys].filter(o=>o.status==='pending').reduce((s,o)=>s+orderTotal(o),0);
 $('kSales').textContent=money(sv);$('kBuy').textContent=money(bv);$('kResult').textContent=money(sv-bv);$('kPending').textContent=money(pd);
 const row=(o,t)=>`<div class="row"><div class="rowtop"><div><b>${esc(t==='sale'?(cust(o.party)?.name||'Venda'):(supp(o.party)?.name||'Compra'))}</b><div class="muted">${esc(o.date||'')} · ${(o.items||[]).length} item(ns)${t==='sale'?' · '+(o.fulfill==='delivery'?'Entrega':'Retirada'):''}</div></div><div style="text-align:right"><div class="total">${money(orderTotal(o))}</div><span class="pill">${o.status==='paid'?'Pago':'Pendente'}</span></div></div>${t==='sale'?`<div class="toolbar"><button onclick="receipt('${o.id}','receipt')">Recibo</button><button onclick="receipt('${o.id}','quote')">Orçamento</button><button class="danger" onclick="delOrder('sale','${o.id}')">Excluir</button></div>`:`<div class="toolbar"><button class="danger" onclick="delOrder('buy','${o.id}')">Excluir</button></div>`}</div>`;
 const rs=[...db.sales.map(o=>({...o,_t:'sale'})),...db.buys.map(o=>({...o,_t:'buy'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
 $('recent').innerHTML=rs.length?rs.map(o=>row(o,o._t)).join(''):'<div class="empty">Nenhum pedido ainda.</div>';
 $('salesList').innerHTML=db.sales.length?db.sales.slice().reverse().map(o=>row(o,'sale')).join(''):'<div class="empty">Nenhuma venda.</div>';
 $('buyList').innerHTML=db.buys.length?db.buys.slice().reverse().map(o=>row(o,'buy')).join(''):'<div class="empty">Nenhuma compra.</div>';
 $('productsList').innerHTML=db.products.length?db.products.map(p=>`<div class="row"><div class="rowtop"><div><b>${esc(p.name)}</b><div class="muted">Marca: ${esc(p.brand||'-')} · Custo ${money(p.cost)}</div></div><div class="total">${money(p.price)}</div></div><div class="toolbar"><button onclick="openProduct('${p.id}')">Editar</button><button class="danger" onclick="del('products','${p.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum produto.</div>';
 $('customersList').innerHTML=db.customers.length?db.customers.map(c=>`<div class="row"><div class="rowtop"><div><b>${esc(c.name)}</b><div class="muted">${esc(c.phone||'')}</div></div><div class="total ${customerBalance(c)>0?'y':'g'}">${money(customerBalance(c))}</div></div><div class="toolbar"><button onclick="openCustomer('${c.id}')">Editar</button><button class="danger" onclick="del('customers','${c.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum cliente.</div>';
 $('suppliersList').innerHTML=db.suppliers.length?db.suppliers.map(s=>`<div class="row"><b>${esc(s.name)}</b><div class="muted">${esc(s.phone||'')}</div><div class="toolbar"><button onclick="openSupplier('${s.id}')">Editar</button><button class="danger" onclick="del('suppliers','${s.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum fornecedor.</div>'
}
function closeModal(id){$(id).classList.remove('on')}
function openOrder(t){orderType=t;$('orderTitle').textContent=t==='sale'?'Nova venda':'Nova compra';$('partyLabel').firstChild.nodeValue=t==='sale'?'Cliente':'Fornecedor';$('fulfillLabel').style.display=t==='sale'?'block':'none';$('addressLabel').style.display='none';$('oParty').innerHTML='<option value="">Selecione...</option>'+(t==='sale'?db.customers:db.suppliers).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');$('oDate').value=today();$('oPay').value='Pix';$('oStatus').value='paid';$('oFulfill').value='pickup';$('oAddress').value='';$('oNotes').value='';$('oItems').innerHTML='';addItem();$('orderModal').classList.add('on')}
function toggleAddress(){$('addressLabel').style.display=$('oFulfill').value==='delivery'?'block':'none'}
function addItem(){const d=document.createElement('div');d.className='item';d.innerHTML=`<div class="itemgrid"><label>Produto<select class="ip">${'<option value="">Selecione...</option>'+db.products.map(p=>`<option value="${p.id}">${esc(p.name)}${p.brand?' — '+esc(p.brand):''}</option>`).join('')}</select></label><label>Qtd.<input class="iq" type="number" min="0.01" step="0.01" value="1"></label><label>Preço<input class="iv" type="number" min="0" step="0.01" value="0"></label><div class="item-actions"><button type="button" onclick="this.closest('.item').remove();calcOrder()">Remover</button></div></div>`;d.querySelector('.ip').onchange=e=>{const p=product(e.target.value);d.querySelector('.iv').value=orderType==='sale'?(p?.price||0):(p?.cost||0);calcOrder()};d.querySelectorAll('input').forEach(i=>i.oninput=calcOrder);$('oItems').appendChild(d);calcOrder()}
function calcOrder(){let n=0;document.querySelectorAll('#oItems .item').forEach(d=>n+=(+d.querySelector('.iq').value||0)*(+d.querySelector('.iv').value||0));$('oTotal').textContent=money(n)}
function saveOrder(){const items=[...document.querySelectorAll('#oItems .item')].map(d=>({productId:d.querySelector('.ip').value,qty:+d.querySelector('.iq').value||0,price:+d.querySelector('.iv').value||0})).filter(i=>i.productId&&i.qty>0);if(!items.length){alert('Adicione pelo menos um produto.');return}const o={id:uid(),date:$('oDate').value||today(),party:$('oParty').value,pay:$('oPay').value,status:$('oStatus').value,fulfill:orderType==='sale'?$('oFulfill').value:'',address:orderType==='sale'?$('oAddress').value:'',notes:$('oNotes').value,items};(orderType==='sale'?db.sales:db.buys).push(o);closeModal('orderModal');save()}
function openProduct(id=''){simpleType='products';editId=id;const p=product(id)||{};$('simpleTitle').textContent=id?'Editar produto':'Novo produto';$('simpleForm').innerHTML=`<label>Nome<input name="name" required value="${esc(p.name||'')}"></label><label>Marca<input name="brand" value="${esc(p.brand||'')}"></label><label>Custo (R$)<input name="cost" type="number" step="0.01" value="${+p.cost||0}"></label><label>Preço de venda (R$)<input name="price" type="number" step="0.01" value="${+p.price||0}"></label>`;$('simpleModal').classList.add('on')}
function openCustomer(id=''){simpleType='customers';editId=id;const c=cust(id)||{};$('simpleTitle').textContent=id?'Editar cliente':'Novo cliente';$('simpleForm').innerHTML=`<label>Nome<input name="name" required value="${esc(c.name||'')}"></label><label>Telefone / WhatsApp<input name="phone" value="${esc(c.phone||'')}"></label><label>Endereço<input name="address" value="${esc(c.address||'')}"></label><label>Saldo manual (R$)<input name="balance" type="number" step="0.01" value="${+c.balance||0}"></label>`;$('simpleModal').classList.add('on')}
function openSupplier(id=''){simpleType='suppliers';editId=id;const s=supp(id)||{};$('simpleTitle').textContent=id?'Editar fornecedor':'Novo fornecedor';$('simpleForm').innerHTML=`<label>Nome<input name="name" required value="${esc(s.name||'')}"></label><label>Telefone<input name="phone" value="${esc(s.phone||'')}"></label><label>Endereço<input name="address" value="${esc(s.address||'')}"></label>`;$('simpleModal').classList.add('on')}
function saveSimple(){const f=new FormData($('simpleForm')),obj=Object.fromEntries(f.entries());if(!obj.name){alert('Informe o nome.');return}if('cost'in obj)obj.cost=+obj.cost||0;if('price'in obj)obj.price=+obj.price||0;if('balance'in obj)obj.balance=+obj.balance||0;const a=db[simpleType],i=a.findIndex(x=>x.id===editId);if(i>=0)a[i]={...a[i],...obj};else a.push({id:uid(),...obj});closeModal('simpleModal');save()}
function del(type,id){if(confirm('Excluir este cadastro?')){db[type]=db[type].filter(x=>x.id!==id);save()}}
function delOrder(type,id){if(confirm('Excluir este pedido?')){if(type==='sale')db.sales=db.sales.filter(x=>x.id!==id);else db.buys=db.buys.filter(x=>x.id!==id);save()}}
function receipt(id,kind){const o=db.sales.find(x=>x.id===id);if(!o)return;const c=cust(o.party),title=kind==='quote'?'ORÇAMENTO':'RECIBO / PEDIDO',items=o.items.map(i=>{const p=product(i.productId);return `<tr><td>${esc(p?.name||'Produto')}${p?.brand?' - '+esc(p.brand):''}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`}).join('');const w=window.open('','_blank');w.document.write(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:Arial;padding:22px;color:#111}h2{margin-bottom:4px}.muted{color:#666}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:9px 5px;text-align:left}th:last-child,td:last-child{text-align:right}.total{text-align:right;font-size:20px;font-weight:bold;margin-top:18px}</style></head><body><h2>${title}</h2><div class="muted">Data: ${esc(o.date)}<br>Cliente: ${esc(c?.name||'Não informado')}<br>${o.fulfill==='delivery'?'Entrega: '+esc(o.address||c?.address||''):'Retirada'}<br>Pagamento: ${esc(o.pay)} · ${o.status==='paid'?'Pago':'Pendente'}</div><table><thead><tr><th>Item</th><th>Qtd.</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${items}</tbody></table><div class="total">Total: ${money(orderTotal(o))}</div><p>${esc(o.notes||'')}</p><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);w.document.close()}
render();
(function boot(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY))}catch{}if(session&&session.access_token){afterLogin().catch(()=>logout())}else{$('auth').classList.add('on');setSync('Aguardando login')}})();
