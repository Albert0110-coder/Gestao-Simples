(function(){
  'use strict';

  function stockNumber(v){
    var n=Number(v||0);
    return Number.isFinite(n)?n:0;
  }

  function stockText(v){
    return stockNumber(v).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }

  function ensureStockField(){
    if(document.getElementById('pStock'))return;
    var price=document.getElementById('pPrice');
    if(!price)return;
    var priceField=price.closest('label');
    if(!priceField)return;
    var field=document.createElement('label');
    field.className='field';
    field.style.marginTop='10px';
    field.innerHTML='Quantidade em estoque<input id="pStock" type="number" min="0" step="1" value="0" inputmode="decimal">';
    priceField.insertAdjacentElement('afterend',field);
  }

  function injectStyle(){
    if(document.getElementById('primeStockStyle'))return;
    var style=document.createElement('style');
    style.id='primeStockStyle';
    style.textContent='\n.stockline{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:#08140f}\n.stockline span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:800}\n.stockline strong{font-size:14px;color:var(--green)}\n.stockline.low strong{color:var(--yellow)}\n.stockline.zero strong{color:var(--red)}\n';
    document.head.appendChild(style);
  }

  ensureStockField();
  injectStyle();

  window.renderProducts=function(){
    var input=document.getElementById('productSearch');
    var q=input?input.value.trim().toLowerCase():'';
    var a=db.products.filter(function(p){
      return !q||[p.code,p.name,p.brand].join(' ').toLowerCase().indexOf(q)>=0;
    }).sort(function(a,b){return String(a.name).localeCompare(String(b.name))});
    var addBtn=document.getElementById('addProductBtn');
    if(addBtn)addBtn.style.display=isAdmin()?'block':'none';
    var list=document.getElementById('productsList');
    if(!list)return;
    list.innerHTML=a.length?a.map(function(p){
      var code=p.code?'<div class="meta"><strong style="color:var(--text)">Código: '+esc(p.code)+'</strong></div>':'';
      var stock=stockNumber(p.stock);
      var stockClass=stock<=0?' zero':(stock<=5?' low':'');
      var stockLine=(isAdmin()||p.stock!=null)?'<div class="stockline'+stockClass+'"><span>Estoque</span><strong>'+stockText(stock)+' un.</strong></div>':'';
      return '<div class="product"><h4>'+esc(p.name)+'</h4>'+code+'<div class="meta">'+esc(p.brand||'Sem marca')+(isAdmin()?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+stockLine+(isAdmin()?'<div class="actions"><button class="secondary" onclick="openProduct(\''+p.id+'\')">Editar</button><button class="danger" onclick="deleteEntity(\'products\',\''+p.id+'\')">Excluir</button></div>':'')+'</div>';
    }).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
  };

  window.openProduct=function(id){
    if(!isAdmin()){
      alert('Apenas administradores cadastram produtos.');
      return;
    }
    ensureStockField();
    id=id||'';
    editProductId=id;
    var p=product(id)||{};
    document.getElementById('productTitle').textContent=id?'Editar produto':'Novo produto';
    document.getElementById('pName').value=p.name||'';
    if(document.getElementById('pCode'))document.getElementById('pCode').value=p.code||'';
    document.getElementById('pBrand').value=p.brand||'';
    document.getElementById('pCost').value=Number(p.cost||0);
    document.getElementById('pPrice').value=Number(p.price||0);
    document.getElementById('pStock').value=stockNumber(p.stock);
    document.getElementById('productModal').classList.add('on');
  };

  window.saveProduct=async function(){
    if(!isAdmin())return;
    ensureStockField();
    var name=document.getElementById('pName').value.trim();
    if(!name){alert('Informe o nome.');return}
    var stock=Math.max(0,Number(document.getElementById('pStock').value)||0);
    var entity={
      id:editProductId||uid(),
      name:name,
      code:document.getElementById('pCode')?document.getElementById('pCode').value.trim():'',
      brand:document.getElementById('pBrand').value.trim(),
      cost:Number(document.getElementById('pCost').value)||0,
      price:Number(document.getElementById('pPrice').value)||0,
      stock:stock
    };
    try{
      setSync('Salvando produto...');
      await api('upsert_entity',{key:'products',entity:entity});
      closeModal('productModal');
      await pull(false);
      setSync('Produto salvo','ok');
    }catch(e){
      alert(e.message);
      setSync('Erro ao salvar','bad');
    }
  };

  var previousRenderPurchases=window.renderPurchases;
  window.renderPurchases=function(){
    if(!document.getElementById('purchasesList'))return;
    var a=db.buys.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
    document.getElementById('purchasesList').innerHTML=a.length?a.map(function(o){
      var s=supplier(o.party);
      var units=(o.items||[]).reduce(function(sum,i){return sum+(Number(i.qty)||0)},0);
      return '<div class="row"><div class="rowtop"><div><h4>'+esc(s?s.name:'Compra')+'</h4><div class="meta">'+esc(o.date||'')+' · '+(o.items||[]).length+' produto(s) · <strong>'+stockText(units)+' unidade(s) adicionada(s)</strong></div></div><div class="value">'+money(orderTotal(o))+'</div></div><div class="actions"><button class="danger" onclick="deleteEntity(\'buys\',\''+o.id+'\')">Excluir</button></div></div>';
    }).join(''):'<div class="empty">Nenhuma compra.</div>';
  };

  if(session&&typeof renderProducts==='function')renderProducts();
})();
