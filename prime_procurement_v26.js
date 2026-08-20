(function(){
  'use strict';

  function el(id){return document.getElementById(id)}
  function num(v){var n=Number(v||0);return Number.isFinite(n)?n:0}
  function qtyText(v){return num(v).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2})}
  function fmtDate(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:String(s||'')}
  function initials(name){return String(name||'?').trim().split(/\s+/).slice(0,2).map(function(x){return x.charAt(0).toUpperCase()}).join('')||'?'}
  function safe(v){return esc(v==null?'':v)}
  function supplierLabel(s){return s?(s.tradeName||s.name||'Fornecedor'):'Fornecedor'}
  function supplierSub(s){
    if(!s)return '';
    return [s.document,s.contact,s.phone,s.email,s.city&&s.state?(s.city+' / '+s.state):(s.city||s.state)].filter(Boolean).join(' · ');
  }

  function injectStyle(){
    if(el('primeProcurementStyleV26'))return;
    var style=document.createElement('style');
    style.id='primeProcurementStyleV26';
    style.textContent='\
      .proc-sheet{max-width:920px!important;padding:0!important;overflow:hidden!important}.proc-body{padding:16px;overflow:auto;max-height:calc(94vh - 76px)}.proc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:17px 18px;border-bottom:1px solid var(--line);background:linear-gradient(145deg,#10231a,#0d1914)}.proc-top h2{margin:0;font-size:19px}.proc-top p{margin:4px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.proc-top-actions{display:flex;gap:8px;align-items:center;flex:none}.proc-top .close{flex:none}.proc-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px}.proc-kpi{background:#0a1711;border:1px solid var(--line);border-radius:13px;padding:12px}.proc-kpi span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.06em;font-weight:850}.proc-kpi strong{display:block;font-size:18px;margin-top:6px}.proc-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:12px}.proc-toolbar .search{flex:1}.proc-toolbar .primary{white-space:nowrap}.proc-card{background:#0b1812;border:1px solid var(--line);border-radius:14px;padding:13px;margin-bottom:9px}.proc-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.proc-avatar{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#153323;border:1px solid #2b5e43;color:var(--green);font-weight:950;flex:none}.proc-ident{display:flex;gap:10px;min-width:0}.proc-ident h4{margin:0;font-size:14px}.proc-sub{font-size:10px;color:var(--muted);line-height:1.5;margin-top:4px;word-break:break-word}.proc-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.proc-tag{font-size:9px;padding:4px 7px;border-radius:999px;background:#10241a;border:1px solid #294a39;color:#a8c4b4}.proc-tag.ok{color:#baffd6;border-color:#2d6747;background:#10321f}.proc-tag.warn{color:#ffe3a4;border-color:#695029;background:#2b2110}.proc-amount{text-align:right;white-space:nowrap}.proc-amount strong{font-size:16px}.proc-amount small{display:block;color:var(--muted);font-size:9px;margin-top:4px}.proc-actions{display:flex;gap:7px;margin-top:11px;justify-content:flex-end}.proc-actions button{padding:8px 10px;font-size:10px}.proc-form-section{border:1px solid var(--line);border-radius:14px;padding:13px;background:#0a1711;margin-bottom:11px}.proc-section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px}.proc-section-title h3{margin:0;font-size:13px}.proc-section-title span{color:var(--muted);font-size:9px}.proc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.proc-grid.three{grid-template-columns:repeat(3,1fr)}.proc-grid .span2{grid-column:1/-1}.proc-grid .span3{grid-column:1/-1}.proc-hint{font-size:9px;color:var(--muted);margin-top:5px;line-height:1.4}.proc-items{display:grid;gap:8px}.proc-item{background:#08140f;border:1px solid var(--line);border-radius:12px;padding:10px}.proc-item-grid{display:grid;grid-template-columns:minmax(210px,1.7fr) 85px 110px 120px auto;gap:8px;align-items:end}.proc-item-total{padding:10px 9px;border:1px solid var(--line);border-radius:10px;background:#0d1b14;min-height:40px}.proc-item-total span{display:block;color:var(--muted);font-size:8px;text-transform:uppercase}.proc-item-total strong{display:block;font-size:12px;margin-top:3px}.proc-remove{width:40px;height:40px;padding:0!important;display:grid;place-items:center}.proc-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}.proc-summary>div{background:#08140f;border:1px solid var(--line);border-radius:11px;padding:10px}.proc-summary span{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.05em}.proc-summary strong{display:block;margin-top:5px;font-size:15px}.proc-total{border-color:#2e6748!important;background:#0b2418!important}.proc-total strong{color:var(--green);font-size:19px!important}.proc-savebar{position:sticky;bottom:-16px;margin:14px -16px -16px;padding:18px 16px calc(16px + env(safe-area-inset-bottom));display:flex;gap:8px;justify-content:flex-end;background:linear-gradient(transparent,#0d1a14 22%,#0d1a14);z-index:3}.proc-savebar button{min-width:140px}.proc-status{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800}.proc-status.paid{background:#0d2d1c;color:#aef4c9;border-color:#285c40}.proc-status.pending{background:#2b2110;color:#ffe2a3;border-color:#674f28}.proc-stock{font-size:9px;color:var(--muted);margin-top:4px}.proc-stock strong{color:var(--green)}\
      @media(max-width:700px){.proc-top{padding:14px}.proc-body{padding:12px}.proc-top-actions .primary{display:none}.proc-kpis{grid-template-columns:1fr 1fr}.proc-kpis .proc-kpi:last-child{grid-column:1/-1}.proc-toolbar{align-items:stretch;flex-direction:column}.proc-grid,.proc-grid.three{grid-template-columns:1fr}.proc-grid .span2,.proc-grid .span3{grid-column:auto}.proc-item-grid{grid-template-columns:1fr 1fr}.proc-item-grid .proc-product-field{grid-column:1/-1}.proc-item-total{align-self:end}.proc-remove{justify-self:end}.proc-summary{grid-template-columns:1fr 1fr}.proc-summary .proc-total{grid-column:1/-1}.proc-card-head{flex-direction:column}.proc-amount{text-align:left}.proc-actions{justify-content:flex-start}.proc-savebar button{min-width:0;flex:1}}\
    ';
    document.head.appendChild(style);
  }

  function rebuildShells(){
    var sm=el('suppliersModal');
    if(sm)sm.innerHTML='<div class="sheet proc-sheet"><div class="proc-top"><div><h2>Fornecedores</h2><p>Cadastro completo dos parceiros de compra e contatos comerciais.</p></div><div class="proc-top-actions"><button class="primary" onclick="openSupplier()">＋ Novo fornecedor</button><button class="close" onclick="closeModal(\'suppliersModal\')">×</button></div></div><div class="proc-body"><div id="supplierStats" class="proc-kpis"></div><div class="proc-toolbar"><div class="search"><input id="supplierSearchPro" placeholder="Buscar por nome, CNPJ/CPF, cidade, contato..." oninput="renderSuppliers()"></div><button class="primary" onclick="openSupplier()">＋ Novo fornecedor</button></div><div id="suppliersList"></div></div></div>';

    var sf=el('supplierForm');
    if(sf)sf.innerHTML='<div class="sheet proc-sheet"><div class="proc-top"><div><h2 id="supplierTitle">Novo fornecedor</h2><p>Organize dados fiscais, comerciais e de contato em um único cadastro.</p></div><button class="close" onclick="closeModal(\'supplierForm\')">×</button></div><div class="proc-body"><section class="proc-form-section"><div class="proc-section-title"><h3>Identificação</h3><span>Dados principais</span></div><div class="proc-grid"><label class="field">Razão social / Nome *<input id="sName" autocomplete="organization"></label><label class="field">Nome fantasia<input id="sTradeName" autocomplete="organization-title"></label><label class="field">CNPJ / CPF<input id="sDocument" inputmode="numeric" placeholder="00.000.000/0000-00"></label><label class="field">Contato principal<input id="sContact" placeholder="Nome do vendedor ou responsável"></label></div></section><section class="proc-form-section"><div class="proc-section-title"><h3>Contato</h3><span>Como falar com o fornecedor</span></div><div class="proc-grid three"><label class="field">Telefone<input id="sPhone" inputmode="tel" autocomplete="tel"></label><label class="field">WhatsApp<input id="sWhats" inputmode="tel"></label><label class="field">E-mail<input id="sEmail" type="email" autocomplete="email"></label></div></section><section class="proc-form-section"><div class="proc-section-title"><h3>Endereço</h3><span>Localização do fornecedor</span></div><div class="proc-grid three"><label class="field">CEP<input id="sZip" inputmode="numeric" placeholder="00000-000"></label><label class="field">Cidade<input id="sCity"></label><label class="field">UF<input id="sState" maxlength="2" placeholder="PA"></label><label class="field span3">Endereço completo<input id="sAddress" autocomplete="street-address"></label></div></section><section class="proc-form-section"><div class="proc-section-title"><h3>Observações</h3><span>Informações internas</span></div><label class="field">Anotações<textarea id="sNotes" placeholder="Prazos, condições, pessoa de contato, dias de entrega..."></textarea></label></section><div class="proc-savebar"><button class="secondary" onclick="closeModal(\'supplierForm\')">Cancelar</button><button class="primary" onclick="saveSupplier()">Salvar fornecedor</button></div></div></div>';

    var pm=el('purchasesModal');
    if(pm)pm.innerHTML='<div class="sheet proc-sheet"><div class="proc-top"><div><h2>Compras</h2><p>Registre entradas de mercadoria e acompanhe o valor investido em estoque.</p></div><div class="proc-top-actions"><button class="primary" onclick="openPurchaseForm()">＋ Nova compra</button><button class="close" onclick="closeModal(\'purchasesModal\')">×</button></div></div><div class="proc-body"><div id="purchaseStats" class="proc-kpis"></div><div class="proc-toolbar"><div class="search"><input id="purchaseSearchPro" placeholder="Buscar fornecedor, documento ou pagamento..." oninput="renderPurchases()"></div><button class="primary" onclick="openPurchaseForm()">＋ Nova compra</button></div><div id="purchasesList"></div></div></div>';

    var pf=el('purchaseForm');
    if(pf)pf.innerHTML='<div class="sheet proc-sheet"><div class="proc-top"><div><h2>Registrar compra</h2><p>Ao salvar, as quantidades são adicionadas automaticamente ao estoque.</p></div><button class="close" onclick="closeModal(\'purchaseForm\')">×</button></div><div class="proc-body"><section class="proc-form-section"><div class="proc-section-title"><h3>Dados da compra</h3><span>Fornecedor e documento</span></div><div class="proc-grid three"><label class="field span2">Fornecedor *<select id="bSupplier"></select></label><label class="field">Data *<input id="bDate" type="date"></label><label class="field">Documento / NF<input id="bDocument" placeholder="Ex.: NF 1548"></label><label class="field">Pagamento<select id="bPay"><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option><option>Transferência</option><option>Outro</option></select></label><label class="field">Situação<select id="bStatus"><option value="paid">Pago</option><option value="pending">Pendente</option></select></label></div></section><section class="proc-form-section"><div class="proc-section-title"><div><h3>Produtos da compra</h3><div class="proc-hint">Informe a quantidade recebida e o custo unitário real da compra.</div></div><button class="secondary" onclick="addBuyItem()">＋ Adicionar item</button></div><div id="bItems" class="proc-items"></div><div class="proc-summary"><div><span>Produtos diferentes</span><strong id="bProductsCount">0</strong></div><div><span>Unidades recebidas</span><strong id="bUnits">0</strong></div><div class="proc-total"><span>Total da compra</span><strong id="bTotal">R$ 0,00</strong></div></div></section><section class="proc-form-section"><div class="proc-section-title"><h3>Observações</h3><span>Opcional</span></div><label class="field">Anotações da compra<textarea id="bNotes" placeholder="Frete, prazo, condição especial, lote, observações da nota..."></textarea></label></section><div class="proc-savebar"><button class="secondary" onclick="closeModal(\'purchaseForm\')">Cancelar</button><button class="primary" onclick="savePurchase()">Registrar compra</button></div></div></div>';
  }

  window.openSuppliers=function(){
    if(!isAdmin())return;
    renderSuppliers();
    el('suppliersModal').classList.add('on');
  };

  window.renderSuppliers=function(){
    var list=el('suppliersList');if(!list)return;
    var q=(el('supplierSearchPro')?el('supplierSearchPro').value:'').trim().toLowerCase();
    var all=(db.suppliers||[]).slice().sort(function(a,b){return String(a.tradeName||a.name||'').localeCompare(String(b.tradeName||b.name||''))});
    var a=all.filter(function(s){return !q||[s.name,s.tradeName,s.document,s.contact,s.phone,s.whats,s.email,s.city,s.state,s.address].join(' ').toLowerCase().indexOf(q)>=0});
    var withDoc=all.filter(function(s){return !!s.document}).length;
    var withContact=all.filter(function(s){return !!(s.phone||s.whats||s.email)}).length;
    if(el('supplierStats'))el('supplierStats').innerHTML='<div class="proc-kpi"><span>Fornecedores</span><strong>'+all.length+'</strong></div><div class="proc-kpi"><span>Com documento</span><strong>'+withDoc+'</strong></div><div class="proc-kpi"><span>Com contato</span><strong>'+withContact+'</strong></div>';
    list.innerHTML=a.length?a.map(function(s){
      var name=supplierLabel(s), sub=supplierSub(s);
      return '<article class="proc-card"><div class="proc-card-head"><div class="proc-ident"><div class="proc-avatar">'+safe(initials(name))+'</div><div><h4>'+safe(name)+'</h4>'+(s.tradeName&&s.name&&s.tradeName!==s.name?'<div class="proc-sub">'+safe(s.name)+'</div>':'')+'<div class="proc-sub">'+(sub?safe(sub):'Cadastro sem dados de contato adicionais')+'</div><div class="proc-tags">'+(s.document?'<span class="proc-tag ok">Documento cadastrado</span>':'<span class="proc-tag warn">Sem CNPJ/CPF</span>')+(s.whats?'<span class="proc-tag">WhatsApp</span>':'')+(s.email?'<span class="proc-tag">E-mail</span>':'')+'</div></div></div></div><div class="proc-actions"><button class="secondary" onclick="openSupplier(\''+safe(s.id)+'\')">Editar cadastro</button><button class="danger" onclick="deleteEntity(\'suppliers\',\''+safe(s.id)+'\')">Excluir</button></div></article>';
    }).join(''):'<div class="empty">Nenhum fornecedor encontrado.</div>';
  };

  window.openSupplier=function(id){
    if(!isAdmin())return;
    id=id||'';editSupplierId=id;
    var s=supplier(id)||{};
    el('supplierTitle').textContent=id?'Editar fornecedor':'Novo fornecedor';
    ['Name','TradeName','Document','Contact','Phone','Whats','Email','Zip','City','State','Address','Notes'].forEach(function(k){var node=el('s'+k);if(node)node.value=s[k.charAt(0).toLowerCase()+k.slice(1)]||''});
    el('supplierForm').classList.add('on');
    setTimeout(function(){if(el('sName'))el('sName').focus()},60);
  };

  window.saveSupplier=async function(){
    if(!isAdmin())return;
    var name=(el('sName').value||'').trim();if(!name){alert('Informe a razão social ou nome do fornecedor.');return}
    var entity={
      id:editSupplierId||uid(),
      name:name,
      tradeName:(el('sTradeName').value||'').trim(),
      document:(el('sDocument').value||'').trim(),
      contact:(el('sContact').value||'').trim(),
      phone:(el('sPhone').value||'').trim(),
      whats:(el('sWhats').value||'').trim(),
      email:(el('sEmail').value||'').trim(),
      zip:(el('sZip').value||'').trim(),
      city:(el('sCity').value||'').trim(),
      state:(el('sState').value||'').trim().toUpperCase(),
      address:(el('sAddress').value||'').trim(),
      notes:(el('sNotes').value||'').trim()
    };
    try{
      setSync('Salvando fornecedor...');
      await api('upsert_entity',{key:'suppliers',entity:entity});
      closeModal('supplierForm');await pull(false);renderSuppliers();setSync('Fornecedor salvo','ok');
    }catch(e){alert(e.message);setSync('Erro ao salvar','bad')}
  };

  window.openPurchases=function(){
    if(!isAdmin())return;
    renderPurchases();
    el('purchasesModal').classList.add('on');
  };

  window.renderPurchases=function(){
    var list=el('purchasesList');if(!list)return;
    var q=(el('purchaseSearchPro')?el('purchaseSearchPro').value:'').trim().toLowerCase();
    var all=(db.buys||[]).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
    var totalValue=all.reduce(function(sum,o){return sum+orderTotal(o)},0);
    var totalUnits=all.reduce(function(sum,o){return sum+(o.items||[]).reduce(function(s,i){return s+num(i.qty)},0)},0);
    if(el('purchaseStats'))el('purchaseStats').innerHTML='<div class="proc-kpi"><span>Compras registradas</span><strong>'+all.length+'</strong></div><div class="proc-kpi"><span>Investido</span><strong>'+money(totalValue)+'</strong></div><div class="proc-kpi"><span>Unidades recebidas</span><strong>'+qtyText(totalUnits)+'</strong></div>';
    var a=all.filter(function(o){var s=supplier(o.party)||{};return !q||[s.name,s.tradeName,o.documentNo,o.pay,o.status,o.date].join(' ').toLowerCase().indexOf(q)>=0});
    list.innerHTML=a.length?a.map(function(o){
      var s=supplier(o.party), units=(o.items||[]).reduce(function(sum,i){return sum+num(i.qty)},0), items=(o.items||[]).length;
      var status=o.status==='pending'?'pending':'paid';
      return '<article class="proc-card"><div class="proc-card-head"><div class="proc-ident"><div class="proc-avatar">↓</div><div><h4>'+safe(supplierLabel(s))+'</h4><div class="proc-sub">'+fmtDate(o.date)+(o.documentNo?' · '+safe(o.documentNo):'')+' · '+safe(o.pay||'Pagamento não informado')+'</div><div class="proc-tags"><span class="proc-status '+status+'">'+(status==='pending'?'Pendente':'Pago')+'</span><span class="proc-tag ok">＋ '+qtyText(units)+' un. no estoque</span><span class="proc-tag">'+items+' produto(s)</span></div></div></div><div class="proc-amount"><strong>'+money(orderTotal(o))+'</strong><small>Total da compra</small></div></div><div class="proc-actions"><button class="danger" onclick="deletePurchasePro(\''+safe(o.id)+'\')">Excluir compra</button></div></article>';
    }).join(''):'<div class="empty">Nenhuma compra encontrada.</div>';
  };

  window.openPurchaseForm=function(){
    if(!isAdmin())return;
    el('bSupplier').innerHTML='<option value="">Selecione o fornecedor...</option>'+(db.suppliers||[]).slice().sort(function(a,b){return String(supplierLabel(a)).localeCompare(String(supplierLabel(b)))}).map(function(s){return '<option value="'+safe(s.id)+'">'+safe(supplierLabel(s))+(s.document?' · '+safe(s.document):'')+'</option>'}).join('');
    el('bDate').value=today();el('bDocument').value='';el('bPay').value='Pix';el('bStatus').value='paid';el('bNotes').value='';el('bItems').innerHTML='';addBuyItem();calcBuy();el('purchaseForm').classList.add('on');
  };

  window.addBuyItem=function(){
    var d=document.createElement('div');d.className='proc-item';
    var opts=(db.products||[]).slice().sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''))}).map(function(p){return '<option value="'+safe(p.id)+'">'+safe((p.code?p.code+' · ':'')+p.name)+'</option>'}).join('');
    d.innerHTML='<div class="proc-item-grid"><label class="field proc-product-field">Produto<select class="bp"><option value="">Selecione o produto...</option>'+opts+'</select><div class="proc-stock">Estoque atual: <strong class="bstock">—</strong></div></label><label class="field">Quantidade<input class="bq" type="number" min="1" step="1" value="1" inputmode="decimal"></label><label class="field">Custo unitário<input class="bv" type="number" min="0" step="0.01" value="0" inputmode="decimal"></label><div class="proc-item-total"><span>Subtotal</span><strong class="bsub">R$ 0,00</strong></div><button type="button" class="danger proc-remove" aria-label="Remover item">×</button></div>';
    var sel=d.querySelector('.bp'),q=d.querySelector('.bq'),v=d.querySelector('.bv');
    sel.onchange=function(){var p=product(sel.value);v.value=p?num(p.cost):0;d.querySelector('.bstock').textContent=p?qtyText(p.stock)+' un.':'—';calcBuy()};
    q.oninput=calcBuy;v.oninput=calcBuy;d.querySelector('.proc-remove').onclick=function(){d.remove();if(!el('bItems').children.length)addBuyItem();calcBuy()};
    el('bItems').appendChild(d);calcBuy();
  };

  window.calcBuy=function(){
    var total=0,units=0,products=0;
    document.querySelectorAll('#bItems .proc-item').forEach(function(d){var q=num(d.querySelector('.bq').value),v=num(d.querySelector('.bv').value),has=!!d.querySelector('.bp').value;var sub=q*v;total+=sub;if(has){units+=q;products++}d.querySelector('.bsub').textContent=money(sub)});
    if(el('bTotal'))el('bTotal').textContent=money(total);if(el('bUnits'))el('bUnits').textContent=qtyText(units);if(el('bProductsCount'))el('bProductsCount').textContent=String(products);
  };

  window.savePurchase=async function(){
    if(!isAdmin())return;
    if(!el('bSupplier').value){alert('Selecione o fornecedor.');return}
    var items=Array.prototype.slice.call(document.querySelectorAll('#bItems .proc-item')).map(function(d){return {productId:d.querySelector('.bp').value,qty:num(d.querySelector('.bq').value),price:num(d.querySelector('.bv').value)}}).filter(function(i){return i.productId&&i.qty>0});
    if(!items.length){alert('Adicione pelo menos um produto à compra.');return}
    var invalid=items.some(function(i){return i.price<0});if(invalid){alert('Verifique o custo dos produtos.');return}
    var buy={id:uid(),date:el('bDate').value||today(),party:el('bSupplier').value,documentNo:(el('bDocument').value||'').trim(),pay:el('bPay').value,status:el('bStatus').value,notes:(el('bNotes').value||'').trim(),items:items};
    try{
      setSync('Registrando compra...');
      await api('append_buy',{buy:buy});closeModal('purchaseForm');await pull(false);if(typeof window.syncStockSnapshot==='function')await window.syncStockSnapshot(true);renderPurchases();setSync('Compra registrada e estoque atualizado','ok');
    }catch(e){alert(e.message);setSync('Erro ao registrar compra','bad')}
  };

  window.deletePurchasePro=async function(id){
    if(!isAdmin()||!id)return;
    if(!confirm('Excluir esta compra? As quantidades serão retiradas do estoque automaticamente.'))return;
    try{setSync('Excluindo compra...');await api('delete_entity',{key:'buys',id:id});await pull(false);if(typeof window.syncStockSnapshot==='function')await window.syncStockSnapshot(true);renderPurchases();setSync('Compra excluída e estoque ajustado','ok')}catch(e){alert(e.message);setSync('Erro ao excluir','bad')}
  };

  injectStyle();rebuildShells();
})();
