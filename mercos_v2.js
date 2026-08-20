(function(){
  'use strict';

  function icon(name){
    var icons={
      home:'⌁',quotes:'▤',orders:'▣',customers:'♙',products:'▦',more:'☰'
    };
    return icons[name]||'•';
  }

  function setNavLabel(page,label){
    var b=document.querySelector('.nav button[data-page="'+page+'"]');
    if(!b)return;
    b.innerHTML='<span>'+icon(page)+'</span>'+label;
  }

  function decorateNavigation(){
    setNavLabel('home','Painel');
    setNavLabel('quotes','Orçamentos');
    setNavLabel('orders','Pedidos');
    setNavLabel('customers','Clientes');
    setNavLabel('products','Produtos');
    setNavLabel('more','Mais');

    var nav=document.querySelector('.nav');
    if(nav&&!nav.querySelector('.v2-nav-section')){
      var first=nav.querySelector('button[data-page="home"]');
      var products=nav.querySelector('button[data-page="products"]');
      if(first){
        var a=document.createElement('div');a.className='v2-nav-section';a.textContent='Comercial';nav.insertBefore(a,first);
      }
      if(products){
        var b=document.createElement('div');b.className='v2-nav-section';b.textContent='Cadastros';nav.insertBefore(b,products);
      }
    }
  }

  function decorateHome(){
    var home=document.getElementById('home');
    if(!home)return;
    if(!home.querySelector('.v2-context')){
      var ctx=document.createElement('div');
      ctx.className='v2-context';
      ctx.innerHTML='<span class="active">Painéis</span><span>Indicadores comerciais</span><span>Visão geral</span>';
      home.insertBefore(ctx,home.firstChild);
    }
  }

  function renamePageTitle(){
    var title=document.getElementById('pageTitle');
    if(title&&title.textContent.trim()==='Início')title.textContent='Painel';
  }

  function apply(){
    document.body.classList.add('mercos-v2');
    document.documentElement.classList.add('mercos-v2-root');
    document.title='Prime · Força de Vendas';
    decorateNavigation();
    decorateHome();
    renamePageTitle();

    var navName=document.querySelector('.navbrand strong');
    if(navName)navName.textContent='PRIME';
    var navSub=document.querySelector('.navbrand small');
    if(navSub)navSub.textContent='Força de vendas';
  }

  var oldGo=window.go;
  if(typeof oldGo==='function'){
    window.go=function(page){
      var r=oldGo.apply(this,arguments);
      if(page==='home'){
        var title=document.getElementById('pageTitle');if(title)title.textContent='Painel';
        setTimeout(decorateHome,0);
      }
      return r;
    };
  }

  apply();

  var observer=new MutationObserver(function(){
    decorateNavigation();
    decorateHome();
    renamePageTitle();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
})();
