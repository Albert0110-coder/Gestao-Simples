// Permissões e relatórios v4
const userPagesV4=new Set(['sales','products','customers']);

applyPermissions=function(){
 const admin=isAdmin();
 document.querySelectorAll('.nav button').forEach(b=>{b.style.display=(admin||userPagesV4.has(b.dataset.p))?'block':'none';});
 if($('usersBtn'))$('usersBtn').style.display=admin?'block':'none';
 if($('productAddBtn'))$('productAddBtn').style.display=admin?'block':'none';
 if($('logoutTop'))$('logoutTop').style.display=session?'block':'none';
 document.querySelector('.nav').style.gridTemplateColumns=admin?'repeat(6,1fr)':'repeat(3,1fr)';
 if(!admin){
   const active=document.querySelector('.page.on');
   if(!active||!userPagesV4.has(active.id)){
     document.querySelectorAll('.page,.nav button').forEach(x=>x.classList.remove('on'));
     $('sales').classList.add('on');
     const sb=document.querySelector('.nav button[data-p="sales"]');if(sb)sb.classList.add('on');
     $('pageTitle').textContent='Vendas';
   }
 }
 if($('salesTotalLabel'))$('salesTotalLabel').textContent=admin?'Total vendido no período':'Seu total vendido no período';
};

document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{
 if(!isAdmin()&&!userPagesV4.has(b.dataset.p))return;
 document.querySelectorAll('.page,.nav button').forEach(x=>x.classList.remove('on'));
 $(b.dataset.p).classList.add('on');b.classList.add('on');$('pageTitle').textContent=b.textContent;
});

function initSalesFilterV4(){
 if(!$('salesPeriod'))return;
 if(!$('salesFilter').value){
   $('salesPeriod').value='month';
   $('salesFilter').type='month';
   $('salesFilter').value=today().slice(0,7);
 }
 $('salesFilterLabel').firstChild.nodeValue=$('salesPeriod').value==='day'?'Dia':$('salesPeriod').value==='year'?'Ano':'Mês';
}
window.changeSalesPeriod=function(){
 const mode=$('salesPeriod').value,input=$('salesFilter'),label=$('salesFilterLabel');
 if(mode==='day'){
   input.type='date';input.removeAttribute('min');input.removeAttribute('max');input.value=today();label.firstChild.nodeValue='Dia';
 }else if(mode==='month'){
   input.type='month';input.removeAttribute('min');input.removeAttribute('max');input.value=today().slice(0,7);label.firstChild.nodeValue='Mês';
 }else{
   input.type='number';input.min='2000';input.max='2100';input.step='1';input.value=String(new Date().getFullYear());label.firstChild.nodeValue='Ano';
 }
 render();
};
function salesForPeriodV4(){
 const mode=$('salesPeriod')?.value||'month',value=$('salesFilter')?.value||'';
 return db.sales.filter(o=>{
   const d=String(o.date||'');
   if(mode==='day')return d===value;
   if(mode==='year')return d.startsWith(String(value)+'-');
   return d.startsWith(value);
 });
}
function orderRowV4(o,t){
 return `<div class="row"><div class="rowtop"><div><b>${esc(t==='sale'?(cust(o.party)?.name||'Venda'):(supp(o.party)?.name||'Compra'))}</b><div class="muted">${esc(o.date||'')} · ${(o.items||[]).length} item(ns)${t==='sale'?' · '+(o.fulfill==='delivery'?'Entrega':'Retirada'):''}${o.createdBy?' · '+esc(o.createdBy):''}</div></div><div style="text-align:right"><div class="total">${money(orderTotal(o))}</div><span class="pill">${o.status==='paid'?'Pago':'Pendente'}</span></div></div>${t==='sale'?`<div class="toolbar"><button onclick="receipt('${o.id}','receipt')">Recibo</button><button onclick="receipt('${o.id}','quote')">Orçamento</button>${isAdmin()?`<button class="danger" onclick="delOrder('sale','${o.id}')">Excluir</button>`:''}</div>`:(isAdmin()?`<div class="toolbar"><button class="danger" onclick="delOrder('buy','${o.id}')">Excluir</button></div>`:'')}</div>`;
}

render=function(){
 const month=today().slice(0,7),
 salesMonth=db.sales.filter(o=>o.date?.startsWith(month)),
 buysMonth=db.buys.filter(o=>o.date?.startsWith(month)),
 sv=salesMonth.reduce((s,o)=>s+orderTotal(o),0),
 bv=buysMonth.reduce((s,o)=>s+orderTotal(o),0),
 pd=[...salesMonth,...buysMonth].filter(o=>o.status==='pending').reduce((s,o)=>s+orderTotal(o),0);
 $('kSales').textContent=money(sv);$('kBuy').textContent=money(bv);$('kResult').textContent=money(sv-bv);$('kPending').textContent=money(pd);

 const filtered=salesForPeriodV4().slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 if($('salesPeriodTotal'))$('salesPeriodTotal').textContent=money(filtered.reduce((s,o)=>s+orderTotal(o),0));
 if($('salesPeriodCount'))$('salesPeriodCount').textContent=String(filtered.length);
 if($('salesTotalLabel'))$('salesTotalLabel').textContent=isAdmin()?'Total vendido no período':'Seu total vendido no período';
 $('salesList').innerHTML=filtered.length?filtered.map(o=>orderRowV4(o,'sale')).join(''):'<div class="empty">Nenhuma venda nesse período.</div>';

 const rs=[...db.sales.map(o=>({...o,_t:'sale'})),...db.buys.map(o=>({...o,_t:'buy'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
 $('recent').innerHTML=rs.length?rs.map(o=>orderRowV4(o,o._t)).join(''):'<div class="empty">Nenhum pedido ainda.</div>';
 $('buyList').innerHTML=db.buys.length?db.buys.slice().reverse().map(o=>orderRowV4(o,'buy')).join(''):'<div class="empty">Nenhuma compra.</div>';

 $('productsList').innerHTML=db.products.length?db.products.map(p=>{
   const details=isAdmin()?`Marca: ${esc(p.brand||'-')} · Custo ${money(p.cost)}`:`Marca: ${esc(p.brand||'-')}`;
   const actions=isAdmin()?`<div class="toolbar"><button onclick="openProduct('${p.id}')">Editar</button><button class="danger" onclick="del('products','${p.id}')">Excluir</button></div>`:'';
   return `<div class="row"><div class="rowtop"><div><b>${esc(p.name)}</b><div class="muted">${details}</div></div><div class="total">${money(p.price)}</div></div>${actions}</div>`;
 }).join(''):'<div class="empty">Nenhum produto.</div>';

 $('customersList').innerHTML=db.customers.length?db.customers.map(c=>{
   if(!isAdmin())return `<div class="row"><b>${esc(c.name)}</b><div class="muted">${esc(c.phone||'')}${c.address?' · '+esc(c.address):''}</div></div>`;
   return `<div class="row"><div class="rowtop"><div><b>${esc(c.name)}</b><div class="muted">${esc(c.phone||'')}</div></div><div class="total ${customerBalance(c)>0?'y':'g'}">${money(customerBalance(c))}</div></div><div class="toolbar"><button onclick="openCustomer('${c.id}')">Editar</button><button class="danger" onclick="del('customers','${c.id}')">Excluir</button></div></div>`;
 }).join(''):'<div class="empty">Nenhum cliente.</div>';

 $('suppliersList').innerHTML=db.suppliers.length?db.suppliers.map(s=>`<div class="row"><b>${esc(s.name)}</b><div class="muted">${esc(s.phone||'')}</div><div class="toolbar"><button onclick="openSupplier('${s.id}')">Editar</button><button class="danger" onclick="del('suppliers','${s.id}')">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum fornecedor.</div>';
};

openCustomer=function(id=''){
 if(!isAdmin()&&id){alert('Usuários comuns podem cadastrar clientes, mas não editar cadastros existentes.');return}
 simpleType='customers';editId=id;const c=cust(id)||{};
 $('simpleTitle').textContent=id?'Editar cliente':'Novo cliente';
 $('simpleForm').innerHTML=`<label>Nome<input name="name" required value="${esc(c.name||'')}"></label><label>Telefone / WhatsApp<input name="phone" value="${esc(c.phone||'')}"></label><label>Endereço<input name="address" value="${esc(c.address||'')}"></label>${isAdmin()?`<label>Saldo manual (R$)<input name="balance" type="number" step="0.01" value="${+c.balance||0}"></label>`:''}`;
 $('simpleModal').classList.add('on');
};

saveSimple=async function(){
 const f=new FormData($('simpleForm')),obj=Object.fromEntries(f.entries());
 if(!obj.name){alert('Informe o nome.');return}
 if(simpleType==='customers'&&!isAdmin()){
   if(editId){alert('Usuários comuns não podem editar clientes existentes.');return}
   const customer={id:uid(),name:obj.name,phone:obj.phone||'',address:obj.address||''};
   try{
     setSync('Cadastrando cliente...');
     await api('add_customer',{customer});
     closeModal('simpleModal');
     await pullCloud(false);
     setSync('Cliente cadastrado','ok');
   }catch(e){alert(e.message);setSync('Erro ao cadastrar','bad')}
   return;
 }
 if(!requireAdmin())return;
 if('cost'in obj)obj.cost=+obj.cost||0;if('price'in obj)obj.price=+obj.price||0;if('balance'in obj)obj.balance=+obj.balance||0;
 const a=db[simpleType],i=a.findIndex(x=>x.id===editId);
 if(i>=0)a[i]={...a[i],...obj};else a.push({id:uid(),...obj});
 closeModal('simpleModal');save();
};

const logoutV3=logout;
logout=async function(){
 await logoutV3();
 if($('logoutTop'))$('logoutTop').style.display='none';
};

initSalesFilterV4();
applyPermissions();
render();
