'use strict';
var API='https://lvoizfpdpvcqqhsrmflu.supabase.co/functions/v1/gestao-api';
var SESSION_KEY='gestaoAdminSession';
var CACHE_KEY='gestaoMercosLikeV2';
var session=null;
var db={products:[],customers:[],suppliers:[],sales:[],buys:[],quotes:[]};
var currentCustomerId='',editCustomerId='',editProductId='',editSupplierId='',editQuoteId='',syncTimer=null;
function $(id){return document.getElementById(id)}
function money(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function today(){return new Date().toISOString().slice(0,10)}
function plusDays(dateStr,days){var d=new Date((dateStr||today())+'T12:00:00');d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function isAdmin(){return !!(session&&session.user&&session.user.role==='admin')}
function product(id){return db.products.find(function(x){return x.id===id})}
function customer(id){return db.customers.find(function(x){return x.id===id})}
function supplier(id){return db.suppliers.find(function(x){return x.id===id})}
function quoteById(id){return db.quotes.find(function(x){return x.id===id})}
function orderTotal(o){return (o.items||[]).reduce(function(s,i){return s+(Number(i.qty)||0)*(Number(i.price)||0)},0)}
function arrays(){['products','customers','suppliers','sales','buys','quotes'].forEach(function(k){if(!Array.isArray(db[k]))db[k]=[]})}
function setSync(t,state){if($('syncText'))$('syncText').textContent=t;if($('syncDot'))$('syncDot').className='dot '+(state||'')}
function cache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify({data:db,at:Date.now()}))}catch(e){}}
try{var c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(c&&c.data){db=Object.assign(db,c.data);arrays()}}catch(e){}

window.addEventListener('error',function(e){
  var m=$('loginMsg');
  if(m&&$('loginScreen')&&$('loginScreen').classList.contains('on'))m.textContent='Erro no sistema. Atualize a página e tente novamente.';
  console.error(e.error||e.message||e);
});

async function api(action,extra){
  var body=Object.assign({action:action,token:session&&session.token?session.token:''},extra||{});
  var r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw new Error(j.error||'Não foi possível conectar ao servidor.');
  return j;
}

async function doLogin(){
  var u=$('loginUser').value.trim(),p=$('loginPass').value;
  if(!u||!p){$('loginMsg').textContent='Preencha usuário e senha.';return}
  $('loginMsg').textContent='Entrando...';
  try{
    var j=await api('login',{username:u,password:p});
    if(!j.token||!j.user)throw new Error('Resposta de login inválida.');
    session={token:j.token,user:j.user};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    $('loginScreen').classList.remove('on');
    await afterLogin();
  }catch(e){$('loginMsg').textContent=e.message||'Não foi possível entrar.'}
}
window.doLogin=doLogin;

async function afterLogin(){
  if($('hello'))$('hello').textContent='Olá, '+session.user.username;
  if($('moreUser'))$('moreUser').textContent=session.user.username;
  if($('roleLabel'))$('roleLabel').textContent=isAdmin()?'Visão administrativa':'Minha carteira comercial';
  if($('moreRole'))$('moreRole').textContent=isAdmin()?'Administrador':'Usuário';
  if($('adminMenu'))$('adminMenu').style.display=isAdmin()?'grid':'none';
  if($('addProductBtn'))$('addProductBtn').style.display=isAdmin()?'block':'none';
  var bal=$('cBalance');if(bal&&bal.closest('.field'))bal.closest('.field').style.display=isAdmin()?'block':'none';
  initPeriod();
  await pull(false);
  go('home');
  if(syncTimer)clearInterval(syncTimer);
  syncTimer=setInterval(function(){pull(false)},20000);
}

async function logout(){
  try{if(session)await api('logout')}catch(e){}
  session=null;localStorage.removeItem(SESSION_KEY);if(syncTimer)clearInterval(syncTimer);
  $('loginPass').value='';$('loginMsg').textContent='';$('loginScreen').classList.add('on');setSync('Aguardando login');
}
window.logout=logout;

async function pull(manual){
  if(!session)return;
  if(manual)setSync('Sincronizando...');
  try{
    var j=await api('load');
    db={products:[],customers:[],suppliers:[],sales:[],buys:[],quotes:[]};Object.assign(db,j.data||{});arrays();cache();renderAll();setSync('Sincronizado','ok');
  }catch(e){setSync('Sem conexão','bad');if(/sessão|autenticado/i.test(e.message||''))await logout();}
}
window.pull=pull;
document.addEventListener('visibilitychange',function(){if(!document.hidden&&session)pull(false)});
window.addEventListener('focus',function(){if(session)pull(false)});

function go(page){
  document.querySelectorAll('.page').forEach(function(x){x.classList.remove('on')});
  document.querySelectorAll('.nav button').forEach(function(x){x.classList.remove('on')});
  if($(page))$(page).classList.add('on');
  var b=document.querySelector('.nav button[data-page="'+page+'"]');if(b)b.classList.add('on');
  var names={home:'Início',quotes:'Orçamentos',orders:'Pedidos',customers:'Clientes',products:'Produtos',more:'Mais'};$('pageTitle').textContent=names[page]||'Gestão Simples';
  if(page==='quotes')renderQuotes();if(page==='orders')renderOrders();if(page==='customers')renderCustomers();if(page==='products')renderProducts();
}
window.go=go;
function closeModal(id){if($(id))$(id).classList.remove('on')}
window.closeModal=closeModal;