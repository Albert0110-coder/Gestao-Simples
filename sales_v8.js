function renderAll(){renderHome();renderQuotes();renderOrders();renderCustomers();renderProducts();if(isAdmin()){renderPurchases();renderSuppliers()}}
function renderHome(){
  var d=today(),m=d.slice(0,7),st=db.sales.filter(function(o){return o.date===d}),sm=db.sales.filter(function(o){return String(o.date||'').indexOf(m)===0});
  var td=st.reduce(function(s,o){return s+orderTotal(o)},0),tm=sm.reduce(function(s,o){return s+orderTotal(o)},0);
  $('homeToday').textContent=money(td);$('homeMonth').textContent=money(tm);$('homeCount').textContent=String(sm.length);$('homeQuotes').textContent=String(db.quotes.length);
  var last=db.sales.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))}).slice(0,5);
  $('homeOrders').innerHTML=last.length?last.map(orderCard).join(''):'<div class="empty">Nenhum pedido registrado.</div>';
}
function stageLabel(s){return {order:'Pedido',separation:'Em separação',invoiced:'Faturado',completed:'Concluído'}[s||'order']||'Pedido'}
function stagePipeline(stage){
  var a=['order','separation','invoiced','completed'],labels=['Pedido','Separação','Faturado','Concluído'],idx=a.indexOf(stage||'order');if(idx<0)idx=0;
  return '<div class="pipeline">'+labels.map(function(l,i){return '<span class="step '+(i<=idx?'on':'')+'">'+l+'</span>'+(i<labels.length-1?'<span class="arrow">›</span>':'')}).join('')+'</div>';
}
function stageSelect(o){
  var s=o.orderStage||'order';
  return '<select class="stage" onchange="setOrderStage(\''+o.id+'\',this.value)">'+
    [['order','Pedido'],['separation','Em separação'],['invoiced','Faturado'],['completed','Concluído']].map(function(x){return '<option value="'+x[0]+'" '+(s===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>';
}
function orderCard(o){
  var c=customer(o.party),who=isAdmin()&&o.createdBy?' · '+esc(o.createdBy):'';
  return '<div class="row"><div class="rowtop"><div><h4>'+esc(c?c.name:'Cliente não informado')+'</h4><div class="meta">'+esc(o.date||'')+' · '+(o.items||[]).length+' item(ns)'+who+'</div></div><div style="text-align:right"><div class="value">'+money(orderTotal(o))+'</div><span class="pill">'+stageLabel(o.orderStage)+'</span></div></div>'+stagePipeline(o.orderStage)+'<div class="actions">'+stageSelect(o)+'<button class="secondary" onclick="downloadCommercial(\'order\',\''+o.id+'\')">Baixar pedido</button>'+(isAdmin()?'<button class="danger" onclick="deleteEntity(\'sales\',\''+o.id+'\')">Excluir</button>':'')+'</div></div>';
}
async function setOrderStage(id,stage){try{setSync('Atualizando etapa...');await api('update_sale_stage',{sale_id:id,stage:stage});await pull(false);setSync('Etapa atualizada','ok')}catch(e){alert(e.message);await pull(false)}}
window.setOrderStage=setOrderStage;

function quoteCard(q){
  var c=customer(q.party),who=isAdmin()&&q.createdBy?' · '+esc(q.createdBy):'',valid=q.validUntil?' · válido até '+esc(q.validUntil):'';
  return '<div class="row"><div class="rowtop"><div><h4>'+esc(c?c.name:'Cliente não informado')+'</h4><div class="meta">'+esc(q.date||'')+valid+' · '+(q.items||[]).length+' item(ns)'+who+'</div></div><div style="text-align:right"><div class="value">'+money(orderTotal(q))+'</div><span class="pill">Em negociação</span></div></div><div class="pipeline"><span class="step on">Orçamento</span><span class="arrow">›</span><span class="step">Pedido</span><span class="arrow">›</span><span class="step">Faturado</span><span class="arrow">›</span><span class="step">Concluído</span></div><div class="actions"><button class="secondary" onclick="downloadCommercial(\'quote\',\''+q.id+'\')">Baixar orçamento</button><button class="secondary" onclick="openQuote(\''+q.id+'\')">Editar</button><button class="primary" onclick="convertQuote(\''+q.id+'\')">Faturar / virar Pedido</button>'+(isAdmin()?'<button class="danger" onclick="deleteEntity(\'quotes\',\''+q.id+'\')">Excluir</button>':'')+'</div></div>';
}
function renderQuotes(){
  if(!$('quotesList'))return;var q=($('quoteSearch').value||'').trim().toLowerCase();
  var a=db.quotes.filter(function(x){var c=customer(x.party),name=String(c?c.name:'').toLowerCase();return !q||name.indexOf(q)>=0}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
  $('quotesTotal').textContent=money(a.reduce(function(s,o){return s+orderTotal(o)},0));$('quotesCount').textContent=String(a.length);$('quotesList').innerHTML=a.length?a.map(quoteCard).join(''):'<div class="empty">Nenhum orçamento em negociação.</div>';
}
window.renderQuotes=renderQuotes;

function initPeriod(){if(!$('orderPeriod'))return;$('orderPeriod').value='month';$('periodValue').type='month';$('periodValue').value=today().slice(0,7);$('periodLabel').firstChild.nodeValue='Mês'}
function periodChanged(){var mode=$('orderPeriod').value;if(mode==='day'){$('periodValue').type='date';$('periodValue').value=today();$('periodLabel').firstChild.nodeValue='Dia'}else if(mode==='year'){$('periodValue').type='number';$('periodValue').min='2000';$('periodValue').max='2100';$('periodValue').value=String(new Date().getFullYear());$('periodLabel').firstChild.nodeValue='Ano'}else{$('periodValue').type='month';$('periodValue').value=today().slice(0,7);$('periodLabel').firstChild.nodeValue='Mês'}renderOrders()}
window.periodChanged=periodChanged;
function filteredOrders(){var mode=$('orderPeriod').value,v=$('periodValue').value,q=$('orderSearch').value.trim().toLowerCase();return db.sales.filter(function(o){var d=String(o.date||''),dateOk=mode==='day'?d===v:mode==='year'?d.indexOf(v+'-')===0:d.indexOf(v)===0;var c=customer(o.party),name=String(c?c.name:'').toLowerCase();return dateOk&&(!q||name.indexOf(q)>=0)}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))})}
function renderOrders(){if(!$('ordersList'))return;var a=filteredOrders();$('ordersTotal').textContent=money(a.reduce(function(s,o){return s+orderTotal(o)},0));$('ordersCount').textContent=String(a.length);$('ordersList').innerHTML=a.length?a.map(orderCard).join(''):'<div class="empty">Nenhum pedido nesse período.</div>'}
window.renderOrders=renderOrders;
function customerOptions(selected){return '<option value="">Selecione o cliente...</option>'+db.customers.slice().sort(function(a,b){return String(a.name).localeCompare(String(b.name))}).map(function(c){return '<option value="'+esc(c.id)+'" '+(selected===c.id?'selected':'')+'>'+esc(c.name)+'</option>'}).join('')}
function productOptions(selected){return '<option value="">Selecione...</option>'+db.products.slice().sort(function(a,b){return String(a.name).localeCompare(String(b.name))}).map(function(p){return '<option value="'+esc(p.id)+'" '+(selected===p.id?'selected':'')+'>'+esc(p.name)+(p.brand?' · '+esc(p.brand):'')+'</option>'}).join('')}

function openQuote(id){
  id=id||'';editQuoteId=id;var q=quoteById(id)||{};$('quoteTitle').textContent=id?'Editar orçamento':'Novo orçamento';
  $('qCustomer').innerHTML=customerOptions(q.party||'');$('qDate').value=q.date||today();$('qValidUntil').value=q.validUntil||plusDays(q.date||today(),7);$('qPay').value=q.pay||'Pix';$('qFulfill').value=q.fulfill||'pickup';$('qAddress').value=q.address||'';$('qAddressWrap').style.display=(q.fulfill==='delivery')?'block':'none';$('qNotes').value=q.notes||'';$('qItems').innerHTML='';
  (q.items&&q.items.length?q.items:[null]).forEach(function(i){addQuoteItem(i)});calcQuote();$('quoteModal').classList.add('on');
}
window.openQuote=openQuote;
function toggleQuoteAddress(){$('qAddressWrap').style.display=$('qFulfill').value==='delivery'?'block':'none'}window.toggleQuoteAddress=toggleQuoteAddress;
function addQuoteItem(existing){
  var d=document.createElement('div');d.className='item';existing=existing||{};
  d.innerHTML='<div class="itemgrid"><label class="field">Produto<select class="qp">'+productOptions(existing.productId||'')+'</select></label><label class="field">Qtd.<input class="qq" type="number" min="0.01" step="0.01" value="'+(Number(existing.qty)||1)+'"></label><label class="field">Preço<input class="qv" type="number" min="0" step="0.01" value="'+(Number(existing.price)||0)+'"></label><button type="button" class="secondary remove">Remover</button></div>';
  d.querySelector('.qp').onchange=function(e){var p=product(e.target.value);d.querySelector('.qv').value=p?Number(p.price||0):0;calcQuote()};d.querySelectorAll('input').forEach(function(i){i.oninput=calcQuote});d.querySelector('.remove').onclick=function(){d.remove();calcQuote()};$('qItems').appendChild(d);
}
window.addQuoteItem=addQuoteItem;
function calcQuote(){var n=0;document.querySelectorAll('#qItems .item').forEach(function(d){n+=(Number(d.querySelector('.qq').value)||0)*(Number(d.querySelector('.qv').value)||0)});$('qTotal').textContent=money(n)}window.calcQuote=calcQuote;
async function saveQuote(){
  var items=Array.prototype.slice.call(document.querySelectorAll('#qItems .item')).map(function(d){return {productId:d.querySelector('.qp').value,qty:Number(d.querySelector('.qq').value)||0,price:Number(d.querySelector('.qv').value)||0}}).filter(function(i){return i.productId&&i.qty>0});
  if(!$('qCustomer').value){alert('Selecione um cliente.');return}if(!items.length){alert('Adicione pelo menos um produto.');return}
  var q={id:editQuoteId||uid(),date:$('qDate').value||today(),validUntil:$('qValidUntil').value,party:$('qCustomer').value,pay:$('qPay').value,fulfill:$('qFulfill').value,address:$('qAddress').value,notes:$('qNotes').value,items:items};
  try{setSync('Salvando orçamento...');if(editQuoteId)await api('update_quote',{quote:q});else await api('add_quote',{quote:q});closeModal('quoteModal');await pull(false);setSync('Orçamento salvo','ok');go('quotes')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
}
window.saveQuote=saveQuote;
async function convertQuote(id){if(!confirm('Cliente confirmou? Este orçamento sairá de Orçamentos e virará um Pedido.'))return;try{setSync('Faturando orçamento...');await api('convert_quote',{quote_id:id});await pull(false);setSync('Orçamento virou pedido','ok');go('orders')}catch(e){alert(e.message);setSync('Erro ao faturar','bad')}}
window.convertQuote=convertQuote;

function openOrder(){$('oCustomer').innerHTML=customerOptions('');$('oDate').value=today();$('oPay').value='Pix';$('oStatus').value='pending';$('oFulfill').value='pickup';$('oAddress').value='';$('oAddressWrap').style.display='none';$('oNotes').value='';$('oItems').innerHTML='';addOrderItem();calcOrder();$('orderModal').classList.add('on')}
window.openOrder=openOrder;
function toggleOrderAddress(){$('oAddressWrap').style.display=$('oFulfill').value==='delivery'?'block':'none'}window.toggleOrderAddress=toggleOrderAddress;
function addOrderItem(existing){var d=document.createElement('div');d.className='item';existing=existing||{};d.innerHTML='<div class="itemgrid"><label class="field">Produto<select class="ip">'+productOptions(existing.productId||'')+'</select></label><label class="field">Qtd.<input class="iq" type="number" min="0.01" step="0.01" value="'+(Number(existing.qty)||1)+'"></label><label class="field">Preço<input class="iv" type="number" min="0" step="0.01" value="'+(Number(existing.price)||0)+'"></label><button type="button" class="secondary remove">Remover</button></div>';d.querySelector('.ip').onchange=function(e){var p=product(e.target.value);d.querySelector('.iv').value=p?Number(p.price||0):0;calcOrder()};d.querySelectorAll('input').forEach(function(i){i.oninput=calcOrder});d.querySelector('.remove').onclick=function(){d.remove();calcOrder()};$('oItems').appendChild(d)}
window.addOrderItem=addOrderItem;
function calcOrder(){var n=0;document.querySelectorAll('#oItems .item').forEach(function(d){n+=(Number(d.querySelector('.iq').value)||0)*(Number(d.querySelector('.iv').value)||0)});$('oTotal').textContent=money(n)}window.calcOrder=calcOrder;
async function saveOrder(){
  var items=Array.prototype.slice.call(document.querySelectorAll('#oItems .item')).map(function(d){return {productId:d.querySelector('.ip').value,qty:Number(d.querySelector('.iq').value)||0,price:Number(d.querySelector('.iv').value)||0}}).filter(function(i){return i.productId&&i.qty>0});
  if(!$('oCustomer').value){alert('Selecione um cliente.');return}if(!items.length){alert('Adicione pelo menos um produto.');return}
  var o={id:uid(),date:$('oDate').value||today(),party:$('oCustomer').value,pay:$('oPay').value,status:$('oStatus').value,fulfill:$('oFulfill').value,address:$('oAddress').value,notes:$('oNotes').value,items:items,orderStage:'order'};
  try{setSync('Salvando pedido...');await api('add_sale',{sale:o});closeModal('orderModal');await pull(false);setSync('Pedido salvo','ok');go('orders')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
}
window.saveOrder=saveOrder;

function commercialDoc(obj,kind){
  var c=customer(obj.party),isQ=kind==='quote',title=isQ?'ORÇAMENTO':'PEDIDO',rows=(obj.items||[]).map(function(i){var p=product(i.productId);return '<tr><td>'+esc(p?p.name:'Produto')+'</td><td>'+i.qty+'</td><td>'+money(i.price)+'</td><td>'+money(Number(i.qty)*Number(i.price))+'</td></tr>'}).join(''),extra=isQ&&obj.validUntil?'<br>Válido até: '+esc(obj.validUntil):'';
  return '<html><head><meta name="viewport" content="width=device-width"><title>'+title+'</title><style>body{font-family:Arial;padding:28px;color:#111;max-width:820px;margin:auto}h1{margin:0 0 6px}.meta{color:#555;line-height:1.55}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border-bottom:1px solid #ddd;padding:10px 6px;text-align:left}th:last-child,td:last-child{text-align:right}.total{text-align:right;font-size:22px;font-weight:bold;margin-top:20px}.note{margin-top:20px;white-space:pre-wrap}</style></head><body><h1>'+title+'</h1><div class="meta">Data: '+esc(obj.date)+'<br>Cliente: '+esc(c?c.name:'Não informado')+extra+'<br>Pagamento: '+esc(obj.pay||'A combinar')+'<br>'+(obj.fulfill==='delivery'?'Entrega: '+esc(obj.address||(c&&c.address)||''):'Retirada')+'</div><table><thead><tr><th>Produto</th><th>Qtd.</th><th>Unit.</th><th>Total</th></tr></thead><tbody>'+rows+'</tbody></table><div class="total">Total: '+money(orderTotal(obj))+'</div><div class="note">'+esc(obj.notes||'')+'</div><script>setTimeout(function(){window.print()},350)<\/script></body></html>';
}
function downloadCommercial(kind,id){var obj=kind==='quote'?quoteById(id):db.sales.find(function(x){return x.id===id});if(!obj)return;var w=window.open('','_blank');if(!w){alert('Permita pop-ups para baixar o documento.');return}w.document.write(commercialDoc(obj,kind));w.document.close()}
window.downloadCommercial=downloadCommercial;

function renderCustomers(){var q=$('customerSearch').value.trim().toLowerCase();var a=db.customers.filter(function(c){return !q||[c.name,c.phone,c.address].join(' ').toLowerCase().indexOf(q)>=0}).sort(function(a,b){return String(a.name).localeCompare(String(b.name))});$('customersList').innerHTML=a.length?a.map(function(c){return '<div class="row" onclick="openCustomerDetail(\''+c.id+'\')"><div class="rowtop"><div><h4>'+esc(c.name)+'</h4><div class="meta">'+esc(c.phone||'Sem telefone')+(c.address?' · '+esc(c.address):'')+'</div></div><span class="pill">Ver histórico</span></div></div>'}).join(''):'<div class="empty">Nenhum cliente encontrado.</div>'}window.renderCustomers=renderCustomers;
function openCustomer(id){id=id||'';if(id&&!isAdmin()){alert('Apenas o administrador pode editar clientes existentes.');return}editCustomerId=id;var c=customer(id)||{};$('customerTitle').textContent=id?'Editar cliente':'Novo cliente';$('cName').value=c.name||'';$('cPhone').value=c.phone||'';$('cAddress').value=c.address||'';$('cBalance').value=Number(c.balance||0);var f=$('cBalance').closest('.field');if(f)f.style.display=isAdmin()?'block':'none';$('customerModal').classList.add('on')}window.openCustomer=openCustomer;
async function saveCustomer(){var name=$('cName').value.trim();if(!name){alert('Informe o nome do cliente.');return}var entity={id:editCustomerId||uid(),name:name,phone:$('cPhone').value.trim(),address:$('cAddress').value.trim(),balance:isAdmin()?Number($('cBalance').value)||0:0};try{setSync('Salvando cliente...');if(editCustomerId){if(!isAdmin()){alert('Sem permissão.');return}await api('upsert_entity',{key:'customers',entity:entity})}else await api('add_customer',{customer:entity});closeModal('customerModal');await pull(false);setSync('Cliente salvo','ok')}catch(e){alert(e.message);setSync('Erro ao salvar','bad')}}window.saveCustomer=saveCustomer;
function openCustomerDetail(id){currentCustomerId=id;var c=customer(id);if(!c)return;$('cdName').textContent=c.name;$('cdPhone').textContent=c.phone?'Telefone: '+c.phone:'Sem telefone';$('cdAddress').textContent=c.address?'Endereço: '+c.address:'Sem endereço';$('cdEdit').style.display=isAdmin()?'block':'none';var qs=db.quotes.filter(function(o){return o.party===id}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});var os=db.sales.filter(function(o){return o.party===id}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});$('cdQuotes').innerHTML=qs.length?qs.map(quoteCard).join(''):'<div class="empty">Nenhum orçamento em negociação.</div>';$('cdOrders').innerHTML=os.length?os.map(orderCard).join(''):'<div class="empty">Nenhum pedido desse cliente.</div>';$('customerDetail').classList.add('on')}
window.openCustomerDetail=openCustomerDetail;
function editCurrentCustomer(){closeModal('customerDetail');openCustomer(currentCustomerId)}window.editCurrentCustomer=editCurrentCustomer;

function renderProducts(){var q=$('productSearch').value.trim().toLowerCase();var a=db.products.filter(function(p){return !q||[p.name,p.brand].join(' ').toLowerCase().indexOf(q)>=0}).sort(function(a,b){return String(a.name).localeCompare(String(b.name))});$('addProductBtn').style.display=isAdmin()?'block':'none';$('productsList').innerHTML=a.length?a.map(function(p){return '<div class="product"><h4>'+esc(p.name)+'</h4><div class="meta">'+esc(p.brand||'Sem marca')+(isAdmin()?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+(isAdmin()?'<div class="actions"><button class="secondary" onclick="openProduct(\''+p.id+'\')">Editar</button><button class="danger" onclick="deleteEntity(\'products\',\''+p.id+'\')">Excluir</button></div>':'')+'</div>'}).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>'}window.renderProducts=renderProducts;
function openProduct(id){if(!isAdmin()){alert('Apenas administradores cadastram produtos.');return}id=id||'';editProductId=id;var p=product(id)||{};$('productTitle').textContent=id?'Editar produto':'Novo produto';$('pName').value=p.name||'';$('pBrand').value=p.brand||'';$('pCost').value=Number(p.cost||0);$('pPrice').value=Number(p.price||0);$('productModal').classList.add('on')}window.openProduct=openProduct;
async function saveProduct(){if(!isAdmin())return;var name=$('pName').value.trim();if(!name){alert('Informe o nome.');return}var entity={id:editProductId||uid(),name:name,brand:$('pBrand').value.trim(),cost:Number($('pCost').value)||0,price:Number($('pPrice').value)||0};try{await api('upsert_entity',{key:'products',entity:entity});closeModal('productModal');await pull(false)}catch(e){alert(e.message)}}window.saveProduct=saveProduct;
async function deleteEntity(key,id){if(!isAdmin())return;if(!confirm('Excluir este registro?'))return;try{await api('delete_entity',{key:key,id:id});await pull(false)}catch(e){alert(e.message)}}window.deleteEntity=deleteEntity;
