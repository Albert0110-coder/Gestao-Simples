(function(){
  'use strict';

  function injectStyles(){
    if(document.getElementById('primePickerStyles'))return;
    var s=document.createElement('style');
    s.id='primePickerStyles';
    s.textContent='\
      .prime-product-picker{position:sticky;top:0;z-index:12;background:var(--panel);padding:9px 0 11px;margin:0 0 10px;border-bottom:1px solid var(--line)}\
      .prime-product-picker .picker-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;color:var(--muted);font-size:11px;font-weight:800}\
      .prime-product-picker .picker-label strong{color:var(--text);font-size:12px}\
      .prime-picker-box{position:relative}\
      .prime-picker-input{margin:0!important;padding:13px 42px 13px 14px!important;border-color:#2c6748!important;background:#07130e!important;font-size:14px;font-weight:700}\
      .prime-picker-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--green);pointer-events:none;font-size:18px}\
      .prime-picker-results{display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:40;background:#091710;border:1px solid #315d46;border-radius:13px;overflow:hidden;box-shadow:0 18px 45px #0009;max-height:300px;overflow-y:auto}\
      .prime-picker-results.on{display:block}\
      .prime-picker-option{width:100%;border:0;border-bottom:1px solid var(--line);background:#091710;color:var(--text);padding:11px 13px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:12px}\
      .prime-picker-option:last-child{border-bottom:0}\
      .prime-picker-option:hover,.prime-picker-option:focus{background:#10251a;outline:none}\
      .prime-picker-option .p-main{min-width:0}.prime-picker-option .p-name{display:block;font-size:12px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.prime-picker-option .p-meta{display:block;color:var(--muted);font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.prime-picker-option .p-price{color:var(--green);font-size:12px;font-weight:900;white-space:nowrap}\
      .prime-picker-empty{padding:14px;color:var(--muted);font-size:11px;text-align:center}\
      .prime-line-item{padding:12px!important;transition:border-color .18s,background .18s}.prime-line-item.added{border-color:var(--green)!important;background:#10251a!important}\
      .prime-line-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}.prime-line-name{font-size:12px;font-weight:900;line-height:1.3}.prime-line-meta{font-size:10px;color:var(--muted);margin-top:3px}.prime-line-remove{flex:none!important;width:auto!important;margin:0!important;padding:7px 10px!important}\
      .prime-line-grid{display:grid;grid-template-columns:110px 1fr;gap:8px}.prime-line-grid .field{margin:0}.prime-line-grid input{margin-top:5px}.prime-price-fixed{opacity:.74;cursor:not-allowed}\
      @media(max-width:520px){.prime-product-picker{top:0}.prime-picker-results{max-height:250px}.prime-line-grid{grid-template-columns:92px 1fr}.prime-picker-option{padding:12px 11px}}\
    ';
    document.head.appendChild(s);
  }

  function norm(v){
    return String(v==null?'':v).normalize?String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase():String(v==null?'':v).toLowerCase();
  }

  function cfg(kind){
    return kind==='quote'
      ?{items:'qItems',picker:'qProductPicker',input:'qProductSearch',results:'qProductResults',pclass:'qp',qclass:'qq',vclass:'qv',calc:function(){calcQuote()}}
      :{items:'oItems',picker:'oProductPicker',input:'oProductSearch',results:'oProductResults',pclass:'ip',qclass:'iq',vclass:'iv',calc:function(){calcOrder()}};
  }

  function setupPicker(kind){
    injectStyles();
    var c=cfg(kind),items=document.getElementById(c.items);
    if(!items)return null;
    var existing=document.getElementById(c.picker);
    if(existing)return existing;

    var head=items.previousElementSibling;
    if(head&&head.classList&&head.classList.contains('sectionhead')){
      var addButton=head.querySelector('button');
      if(addButton)addButton.style.display='none';
    }

    var picker=document.createElement('div');
    picker.id=c.picker;
    picker.className='prime-product-picker';
    picker.innerHTML='<div class="picker-label"><strong>Adicionar produto</strong><span>Pesquise e toque no item</span></div>'+
      '<div class="prime-picker-box"><input id="'+c.input+'" class="prime-picker-input" type="search" autocomplete="off" placeholder="Pesquisar por produto, código ou marca..."><span class="prime-picker-icon">⌕</span><div id="'+c.results+'" class="prime-picker-results"></div></div>';
    items.parentNode.insertBefore(picker,items);

    var input=document.getElementById(c.input),results=document.getElementById(c.results);
    input.addEventListener('input',function(){renderResults(kind)});
    input.addEventListener('focus',function(){renderResults(kind)});
    input.addEventListener('keydown',function(e){
      if(e.key==='Escape'){results.classList.remove('on');input.blur();return}
      if(e.key==='Enter'){
        e.preventDefault();
        var first=results.querySelector('.prime-picker-option');
        if(first)first.click();
      }
    });
    return picker;
  }

  function productText(p){return norm([p&&p.code,p&&p.name,p&&p.brand].join(' '))}

  function renderResults(kind){
    var c=cfg(kind),input=document.getElementById(c.input),results=document.getElementById(c.results);
    if(!input||!results)return;
    var q=norm(input.value.trim());
    var products=(db.products||[]).slice().filter(function(p){return !q||productText(p).indexOf(q)>=0}).sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''))}).slice(0,12);
    if(!products.length){results.innerHTML='<div class="prime-picker-empty">Nenhum produto encontrado.</div>';results.classList.add('on');return}
    results.innerHTML=products.map(function(p){
      var meta=[];if(p.code)meta.push('Cód. '+esc(p.code));if(p.brand)meta.push(esc(p.brand));
      return '<button type="button" class="prime-picker-option" data-product-id="'+esc(p.id)+'"><span class="p-main"><span class="p-name">'+esc(p.name||'Produto')+'</span><span class="p-meta">'+(meta.join(' · ')||'Produto cadastrado')+'</span></span><span class="p-price">'+money(p.price)+'</span></button>';
    }).join('');
    Array.prototype.forEach.call(results.querySelectorAll('.prime-picker-option'),function(btn){
      btn.addEventListener('mousedown',function(e){e.preventDefault()});
      btn.addEventListener('click',function(){addPickedProduct(kind,btn.getAttribute('data-product-id'))});
    });
    results.classList.add('on');
  }

  function closeResults(kind){
    var c=cfg(kind),results=document.getElementById(c.results);
    if(results)results.classList.remove('on');
  }

  function flashItem(row){
    if(!row)return;
    row.classList.add('added');
    setTimeout(function(){row.classList.remove('added')},450);
  }

  function appendLine(kind,existing){
    existing=existing||{};
    if(!existing.productId)return null;
    var c=cfg(kind),items=document.getElementById(c.items),p=product(existing.productId);
    if(!items||!p)return null;
    var isQ=kind==='quote',locked=isQ&&!isAdmin();
    var qty=Number(existing.qty);if(!qty||qty<=0)qty=1;
    var price=existing.price===0?0:(existing.price!=null&&existing.price!==''?Number(existing.price):Number(p.price||0));
    if(!Number.isFinite(price))price=0;
    var meta=[];if(p.code)meta.push('Cód. '+esc(p.code));if(p.brand)meta.push(esc(p.brand));

    var d=document.createElement('div');
    d.className='item prime-line-item';
    d.innerHTML='<input type="hidden" class="'+c.pclass+'" value="'+esc(p.id)+'">'+
      '<div class="prime-line-head"><div><div class="prime-line-name">'+esc(p.name||'Produto')+'</div><div class="prime-line-meta">'+(meta.join(' · ')||'Produto cadastrado')+'</div></div><button type="button" class="secondary remove prime-line-remove">Remover</button></div>'+
      '<div class="prime-line-grid"><label class="field">Qtd.<input class="'+c.qclass+'" type="number" min="0.01" step="0.01" value="'+qty+'"></label><label class="field">'+(locked?'Preço (fixo)':'Preço')+'<input class="'+c.vclass+(locked?' prime-price-fixed':'')+'" type="number" min="0" step="0.01" value="'+price+'" '+(locked?'readonly aria-readonly="true"':'')+'></label></div>';
    var qtyInput=d.querySelector('.'+c.qclass),priceInput=d.querySelector('.'+c.vclass);
    qtyInput.addEventListener('input',c.calc);
    if(!locked)priceInput.addEventListener('input',c.calc);
    d.querySelector('.remove').addEventListener('click',function(){d.remove();c.calc()});
    items.appendChild(d);
    c.calc();
    return d;
  }

  function addPickedProduct(kind,id){
    var c=cfg(kind),items=document.getElementById(c.items),p=product(id);
    if(!items||!p)return;
    var rows=Array.prototype.slice.call(items.querySelectorAll('.prime-line-item'));
    var found=rows.find(function(row){var el=row.querySelector('.'+c.pclass);return el&&el.value===id});
    if(found){
      var qty=found.querySelector('.'+c.qclass);
      qty.value=(Number(qty.value)||0)+1;
      c.calc();flashItem(found);
    }else{
      flashItem(appendLine(kind,{productId:id,qty:1,price:Number(p.price||0)}));
    }
    var input=document.getElementById(c.input);
    if(input){input.value='';input.focus()}
    closeResults(kind);
  }

  window.addQuoteItem=function(existing){
    setupPicker('quote');
    if(existing&&existing.productId)return appendLine('quote',existing);
    return null;
  };

  window.addOrderItem=function(existing){
    setupPicker('order');
    if(existing&&existing.productId)return appendLine('order',existing);
    return null;
  };

  var previousOpenQuote=window.openQuote;
  if(typeof previousOpenQuote==='function'){
    window.openQuote=function(id){
      setupPicker('quote');
      var r=previousOpenQuote.apply(this,arguments);
      closeResults('quote');
      var input=document.getElementById('qProductSearch');if(input)input.value='';
      return r;
    };
  }

  var previousOpenOrder=window.openOrder;
  if(typeof previousOpenOrder==='function'){
    window.openOrder=function(){
      setupPicker('order');
      var r=previousOpenOrder.apply(this,arguments);
      closeResults('order');
      var input=document.getElementById('oProductSearch');if(input)input.value='';
      return r;
    };
  }

  document.addEventListener('click',function(e){
    ['quote','order'].forEach(function(kind){
      var c=cfg(kind),picker=document.getElementById(c.picker);
      if(picker&&!picker.contains(e.target))closeResults(kind);
    });
  });

  setupPicker('quote');
  setupPicker('order');
})();