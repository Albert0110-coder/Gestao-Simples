(function(){
  'use strict';

  function ensureProductCodeField(){
    if(document.getElementById('pCode'))return;
    var nameInput=document.getElementById('pName');
    if(!nameInput)return;
    var nameField=nameInput.closest('label');
    if(!nameField)return;
    var field=document.createElement('label');
    field.className='field';
    field.style.marginTop='10px';
    field.innerHTML='Código do produto<input id="pCode" autocomplete="off" placeholder="Ex.: MIC-001">';
    nameField.insertAdjacentElement('afterend',field);
  }

  ensureProductCodeField();

  var search=document.getElementById('productSearch');
  if(search)search.placeholder='Buscar produto, código ou marca...';

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
      return '<div class="product"><h4>'+esc(p.name)+'</h4>'+code+'<div class="meta">'+esc(p.brand||'Sem marca')+(isAdmin()?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+(isAdmin()?'<div class="actions"><button class="secondary" onclick="openProduct(\''+p.id+'\')">Editar</button><button class="danger" onclick="deleteEntity(\'products\',\''+p.id+'\')">Excluir</button></div>':'')+'</div>';
    }).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
  };

  window.openProduct=function(id){
    if(!isAdmin()){
      alert('Apenas administradores cadastram produtos.');
      return;
    }
    ensureProductCodeField();
    id=id||'';
    editProductId=id;
    var p=product(id)||{};
    document.getElementById('productTitle').textContent=id?'Editar produto':'Novo produto';
    document.getElementById('pName').value=p.name||'';
    document.getElementById('pCode').value=p.code||'';
    document.getElementById('pBrand').value=p.brand||'';
    document.getElementById('pCost').value=Number(p.cost||0);
    document.getElementById('pPrice').value=Number(p.price||0);
    document.getElementById('productModal').classList.add('on');
  };

  window.saveProduct=async function(){
    if(!isAdmin())return;
    ensureProductCodeField();
    var name=document.getElementById('pName').value.trim();
    if(!name){alert('Informe o nome.');return}
    var entity={
      id:editProductId||uid(),
      name:name,
      code:document.getElementById('pCode').value.trim(),
      brand:document.getElementById('pBrand').value.trim(),
      cost:Number(document.getElementById('pCost').value)||0,
      price:Number(document.getElementById('pPrice').value)||0
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

  if(typeof renderProducts==='function'&&session)renderProducts();
})();
