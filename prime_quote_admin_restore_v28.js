(function(){
  'use strict';

  function el(id){return document.getElementById(id)}

  function hideQuoteValidity(){
    var input=el('qValidUntil');
    if(!input)return;
    input.value='';
    var field=input.closest('label');
    if(field){
      field.style.setProperty('display','none','important');
      field.setAttribute('aria-hidden','true');
    }
  }

  function stripValidityFromCard(html,q){
    html=String(html||'');
    if(q&&q.validUntil){
      var value=typeof esc==='function'?esc(q.validUntil):String(q.validUntil);
      html=html.split(' · válido até '+value).join('');
    }
    return html.replace(/ · válido até [^·<]+/gi,'');
  }

  function stripValidityFromDocument(html){
    return String(html||'')
      .replace(/<br>\s*Válido até:\s*[\s\S]*?(?=<br>\s*Pagamento:)/gi,'')
      .replace(/<br>\s*Validade:\s*[\s\S]*?(?=<br>)/gi,'');
  }

  hideQuoteValidity();

  var originalOpenQuote=window.openQuote;
  if(typeof originalOpenQuote==='function'){
    window.openQuote=function(){
      var result=originalOpenQuote.apply(this,arguments);
      hideQuoteValidity();
      return result;
    };
  }

  var originalQuoteCard=window.quoteCard;
  if(typeof originalQuoteCard==='function'){
    window.quoteCard=function(q){
      return stripValidityFromCard(originalQuoteCard(q),q);
    };
  }

  var originalCommercialDoc=window.commercialDoc;
  if(typeof originalCommercialDoc==='function'){
    window.commercialDoc=function(obj,kind){
      var html=originalCommercialDoc(obj,kind);
      return kind==='quote'?stripValidityFromDocument(html):html;
    };
  }

  var originalApi=window.api;
  if(typeof originalApi==='function'){
    window.api=async function(action,extra){
      if((action==='add_quote'||action==='update_quote')&&extra&&extra.quote){
        var cleanExtra=Object.assign({},extra);
        cleanExtra.quote=Object.assign({},extra.quote);
        delete cleanExtra.quote.validUntil;
        return originalApi(action,cleanExtra);
      }
      return originalApi(action,extra);
    };
  }

  function injectAdminNavStyle(){
    if(el('primeAdminNavStyleV28'))return;
    var style=document.createElement('style');
    style.id='primeAdminNavStyleV28';
    style.textContent='\n.prime-admin-nav{display:none!important}\n@media(min-width:900px){.prime-admin-nav.prime-admin-visible{display:flex!important}}\n';
    document.head.appendChild(style);
  }

  function makeNavButton(id,icon,label,handler){
    var b=document.createElement('button');
    b.id=id;
    b.type='button';
    b.className='prime-admin-nav';
    b.innerHTML='<span>'+icon+'</span>'+label;
    b.addEventListener('click',function(){
      if(typeof handler==='function')handler();
    });
    return b;
  }

  function ensureAdminNav(){
    injectAdminNavStyle();
    var nav=document.querySelector('.nav');
    if(!nav)return;
    var more=nav.querySelector('button[data-page="more"]');
    if(!more)return;

    if(!el('primePurchasesNav')){
      nav.insertBefore(makeNavButton('primePurchasesNav','▣','Compras',function(){
        if(typeof window.openPurchases==='function')window.openPurchases();
      }),more);
    }
    if(!el('primeSuppliersNav')){
      nav.insertBefore(makeNavButton('primeSuppliersNav','♢','Fornecedores',function(){
        if(typeof window.openSuppliers==='function')window.openSuppliers();
      }),more);
    }
  }

  function syncAdminNav(){
    ensureAdminNav();
    var admin=false;
    try{admin=typeof window.isAdmin==='function'&&window.isAdmin()}catch(e){}
    ['primePurchasesNav','primeSuppliersNav'].forEach(function(id){
      var b=el(id);
      if(b)b.classList.toggle('prime-admin-visible',admin);
    });
    var menu=el('adminMenu');
    if(menu)menu.style.display=admin?'grid':'none';
  }

  var originalAfterLogin=window.afterLogin;
  if(typeof originalAfterLogin==='function'){
    window.afterLogin=async function(){
      var result=await originalAfterLogin.apply(this,arguments);
      hideQuoteValidity();
      syncAdminNav();
      return result;
    };
  }

  var login=el('loginScreen');
  if(login&&typeof MutationObserver!=='undefined'){
    new MutationObserver(function(){syncAdminNav();}).observe(login,{attributes:true,attributeFilter:['class']});
  }

  syncAdminNav();
  setTimeout(syncAdminNav,250);
  setTimeout(syncAdminNav,1000);
  if(typeof window.renderQuotes==='function')window.renderQuotes();
})();
