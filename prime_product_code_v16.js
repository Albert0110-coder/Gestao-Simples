(function(){
  'use strict';

  function formatCode(n){
    n=Number(n)||0;
    return '#'+String(n).padStart(2,'0');
  }

  function codeNumber(code){
    var m=String(code||'').trim().match(/^#(\d+)$/);
    return m?Number(m[1])||0:0;
  }

  function ensureVisibleCodes(){
    (db.products||[]).forEach(function(p,index){
      if(!codeNumber(p.code))p.code=formatCode(index+1);
    });
  }

  function nextCode(){
    ensureVisibleCodes();
    var max=0;
    (db.products||[]).forEach(function(p){max=Math.max(max,codeNumber(p.code))});
    return formatCode(max+1);
  }

  window.primeProductCode=function(p){
    if(!p)return '';
    ensureVisibleCodes();
    return p.code||'';
  };

  function ensureProductCodeField(){
    var input=document.getElementById('pCode');
    if(input){
      input.readOnly=true;
      input.setAttribute('aria-readonly','true');
      return;
    }
    var nameInput=document.getElementById('pName');
    if(!nameInput)return;
    var nameField=nameInput.closest('label');
    if(!nameField)return;
    var field=document.createElement('label');
    field.className='field';
    field.style.marginTop='10px';
    field.innerHTML='Código do produto <span style="color:var(--muted);font-weight:500">(automático)</span><input id="pCode" autocomplete="off" readonly aria-readonly="true" placeholder="#01">';
    nameField.insertAdjacentElement('afterend',field);
  }

  ensureProductCodeField();

  var search=document.getElementById('productSearch');
  if(search)search.placeholder='Buscar produto, código ou marca...';

  window.renderProducts=function(){
    ensureVisibleCodes();
    var input=document.getElementById('productSearch');
    var q=input?input.value.trim().toLowerCase():'';
    var a=(db.products||[]).filter(function(p){
      return !q||[p.code,p.name,p.brand].join(' ').toLowerCase().indexOf(q)>=0;
    }).sort(function(a,b){
      var ca=codeNumber(a.code),cb=codeNumber(b.code);
      if(ca&&cb&&ca!==cb)return ca-cb;
      return String(a.name||'').localeCompare(String(b.name||''));
    });
    var addBtn=document.getElementById('addProductBtn');
    if(addBtn)addBtn.style.display=isAdmin()?'block':'none';
    var list=document.getElementById('productsList');
    if(!list)return;
    list.innerHTML=a.length?a.map(function(p){
      var code='<div class="meta" style="margin-bottom:5px"><strong style="color:var(--green);font-size:12px">Código: '+esc(p.code)+'</strong></div>';
      return '<div class="product"><h4>'+esc(p.name)+'</h4>'+code+'<div class="meta">'+esc(p.brand||'Sem marca')+(isAdmin()?'<br>Custo: '+money(p.cost):'')+'</div><div class="price">'+money(p.price)+'</div>'+(isAdmin()?'<div class="actions"><button class="secondary" onclick="openProduct(\''+p.id+'\')">Editar</button><button class="danger" onclick="deleteEntity(\'products\',\''+p.id+'\')">Excluir</button></div>':'')+'</div>';
    }).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
  };

  window.openProduct=function(id){
    if(!isAdmin()){
      alert('Apenas administradores cadastram produtos.');
      return;
    }
    ensureVisibleCodes();
    ensureProductCodeField();
    id=id||'';
    editProductId=id;
    var p=product(id)||{};
    document.getElementById('productTitle').textContent=id?'Editar produto':'Novo produto';
    document.getElementById('pName').value=p.name||'';
    document.getElementById('pCode').value=id?(p.code||''):nextCode();
    document.getElementById('pBrand').value=p.brand||'';
    document.getElementById('pCost').value=Number(p.cost||0);
    document.getElementById('pPrice').value=Number(p.price||0);
    document.getElementById('productModal').classList.add('on');
  };

  window.saveProduct=async function(){
    if(!isAdmin())return;
    ensureVisibleCodes();
    ensureProductCodeField();
    var name=document.getElementById('pName').value.trim();
    if(!name){alert('Informe o nome.');return}
    var existing=editProductId?product(editProductId):null;
    var code=existing&&existing.code?existing.code:nextCode();
    var entity={
      id:editProductId||uid(),
      name:name,
      code:code,
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

  ensureVisibleCodes();
  if(typeof renderProducts==='function'&&session)renderProducts();
})();
