(function(){
  'use strict';

  var OWNER_API='https://lvoizfpdpvcqqhsrmflu.supabase.co/functions/v1/gestao-owner';
  var baseApi=window.api;

  function ensureOwnerField(kind){
    var isQuote=kind==='quote';
    var selectId=isQuote?'qOwner':'oOwner';
    var customerId=isQuote?'qCustomer':'oCustomer';
    if(document.getElementById(selectId))return document.getElementById(selectId);
    var customer=document.getElementById(customerId);
    if(!customer)return null;
    var customerField=customer.closest('label');
    if(!customerField)return null;
    var field=document.createElement('label');
    field.className='field';
    field.id=selectId+'Wrap';
    field.innerHTML='Responsável pela venda<select id="'+selectId+'"></select>';
    customerField.insertAdjacentElement('afterend',field);
    return document.getElementById(selectId);
  }

  function ownerFieldVisibility(){
    ['qOwnerWrap','oOwnerWrap'].forEach(function(id){
      var el=document.getElementById(id);
      if(el)el.style.display=isAdmin()?'block':'none';
    });
  }

  function userLabel(u){
    return esc(u.username)+(u.role==='admin'?' · Administrador':'');
  }

  async function loadOwners(selectId,selectedId,selectedName){
    var sel=document.getElementById(selectId);
    if(!sel||!isAdmin())return;
    var fallbackId=selectedId||(session&&session.user&&session.user.id)||'';
    var fallbackName=selectedName||(session&&session.user&&session.user.username)||'Administrador';
    sel.innerHTML='<option value="'+esc(fallbackId)+'">'+esc(fallbackName)+'</option>';
    sel.value=fallbackId;
    sel.disabled=true;
    try{
      var j=await baseApi('list_users');
      var users=(j.users||[]).filter(function(u){return u&&u.enabled;}).sort(function(a,b){
        if(a.role!==b.role)return a.role==='user'?-1:1;
        return String(a.username||'').localeCompare(String(b.username||''));
      });
      if(!users.length)throw new Error('Nenhum usuário ativo encontrado.');
      sel.innerHTML=users.map(function(u){return '<option value="'+esc(u.id)+'">'+userLabel(u)+'</option>';}).join('');
      if(users.some(function(u){return u.id===fallbackId;}))sel.value=fallbackId;
      else sel.value=users[0].id;
      sel.disabled=false;
    }catch(e){
      sel.disabled=false;
      sel.title=e.message||'Não foi possível carregar os usuários.';
    }
  }

  ensureOwnerField('quote');
  ensureOwnerField('order');
  ownerFieldVisibility();

  var previousOpenQuote=window.openQuote;
  if(typeof previousOpenQuote==='function'){
    window.openQuote=function(id){
      var r=previousOpenQuote(id);
      ensureOwnerField('quote');
      ownerFieldVisibility();
      if(isAdmin()){
        var q=id?quoteById(id):null;
        loadOwners('qOwner',q&&q.createdByUserId,q&&q.createdBy);
      }
      return r;
    };
  }

  var previousOpenOrder=window.openOrder;
  if(typeof previousOpenOrder==='function'){
    window.openOrder=function(){
      var r=previousOpenOrder.apply(this,arguments);
      ensureOwnerField('order');
      ownerFieldVisibility();
      if(isAdmin())loadOwners('oOwner',session&&session.user&&session.user.id,session&&session.user&&session.user.username);
      return r;
    };
  }

  async function assignOwner(key,id,userId){
    if(!id||!userId)return null;
    var r=await fetch(OWNER_API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:session&&session.token?session.token:'',key:key,id:id,assigned_user_id:userId})
    });
    var j={};
    try{j=await r.json()}catch(e){}
    if(!r.ok)throw new Error(j.error||'Não foi possível definir o responsável.');
    return j;
  }

  if(typeof baseApi==='function'){
    window.api=async function(action,extra){
      var result=await baseApi(action,extra);
      if(!isAdmin())return result;

      var key='',id='',selectId='';
      if(action==='add_quote'){
        key='quotes';
        id=result&&result.quote&&result.quote.id||(extra&&extra.quote&&extra.quote.id)||'';
        selectId='qOwner';
      }else if(action==='update_quote'){
        key='quotes';
        id=extra&&extra.quote&&extra.quote.id||'';
        selectId='qOwner';
      }else if(action==='add_sale'){
        key='sales';
        id=result&&result.sale&&result.sale.id||(extra&&extra.sale&&extra.sale.id)||'';
        selectId='oOwner';
      }

      if(key&&id){
        var sel=document.getElementById(selectId);
        var userId=sel&&sel.value?sel.value:(session&&session.user&&session.user.id)||'';
        if(userId)await assignOwner(key,id,userId);
      }
      return result;
    };
  }

  var previousAfterLogin=window.afterLogin;
  if(typeof previousAfterLogin==='function'){
    window.afterLogin=async function(){
      var r=await previousAfterLogin.apply(this,arguments);
      ensureOwnerField('quote');
      ensureOwnerField('order');
      ownerFieldVisibility();
      return r;
    };
  }
})();