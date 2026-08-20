(function(){
  'use strict';

  function brDate(v){
    var s=String(v||'').trim();
    var m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:s;
  }

  function docRef(obj){
    var s=String(obj&&obj.id||'').replace(/[^a-zA-Z0-9]/g,'');
    return s?s.slice(-8).toUpperCase():'—';
  }

  function paymentStatus(obj){
    if(obj&&obj.status==='paid')return 'Pago';
    if(obj&&obj.status==='pending')return 'Pendente';
    return '';
  }

  function lockedQuoteItem(existing){
    var d=document.createElement('div');
    d.className='item';
    existing=existing||{};
    var locked=!isAdmin();
    d.innerHTML='<div class="itemgrid">'+
      '<label class="field">Produto<select class="qp">'+productOptions(existing.productId||'')+'</select></label>'+
      '<label class="field">'+(locked?'Preço (fixo)':'Preço')+
        '<input class="qv" type="number" min="0" step="0.01" value="'+(Number(existing.price)||0)+'" '+(locked?'readonly aria-readonly="true" title="Preço definido no cadastro do produto" style="opacity:.72;cursor:not-allowed"':'')+'>'+
      '</label>'+
      '<label class="field">Qtd.<input class="qq" type="number" min="0.01" step="0.01" value="'+(Number(existing.qty)||1)+'"></label>'+
      '<button type="button" class="secondary remove">Remover</button>'+
    '</div>';
    var select=d.querySelector('.qp'), price=d.querySelector('.qv'), qty=d.querySelector('.qq');
    select.onchange=function(e){
      var p=product(e.target.value);
      price.value=p?Number(p.price||0):0;
      calcQuote();
    };
    qty.oninput=calcQuote;
    if(!locked)price.oninput=calcQuote;
    d.querySelector('.remove').onclick=function(){d.remove();calcQuote()};
    $('qItems').appendChild(d);
  }
  window.addQuoteItem=lockedQuoteItem;

  function primeCommercialDoc(obj,kind){
    var c=customer(obj.party),isQ=kind==='quote',title=isQ?'ORÇAMENTO':'PEDIDO';
    var fulfill=obj.fulfill==='delivery'?'Entrega':'Retirada';
    var fulfillDetail=obj.fulfill==='delivery'?(obj.address||(c&&c.address)||'Endereço a combinar'):'Retirada combinada';
    var clientPhone=c&&c.phone?esc(c.phone):'Não informado';
    var clientAddress=c&&c.address?esc(c.address):'Não informado';
    var status=paymentStatus(obj);
    var rows=(obj.items||[]).map(function(i){
      var p=product(i.productId);
      return '<tr>'+
        '<td class="prod"><strong>'+esc(p?p.name:'Produto')+'</strong>'+(p&&p.brand?'<small>'+esc(p.brand)+'</small>':'')+'</td>'+
        '<td class="num">'+esc(i.qty)+'</td>'+
        '<td class="num">'+money(i.price)+'</td>'+
        '<td class="num totalcell">'+money(Number(i.qty)*Number(i.price))+'</td>'+
      '</tr>';
    }).join('');
    var validity=isQ&&obj.validUntil?'<div class="info"><span>Validade</span><strong>'+brDate(obj.validUntil)+'</strong></div>':'';
    var statusBox=!isQ&&status?'<div class="info"><span>Situação</span><strong>'+status+'</strong></div>':'';
    var notes=obj.notes?'<section class="notes"><h3>Observações</h3><div>'+esc(obj.notes)+'</div></section>':'';
    var conditions=isQ
      ?'<div class="terms">Este orçamento é válido até <strong>'+brDate(obj.validUntil||'')+'</strong>. Valores e disponibilidade podem ser atualizados após o prazo de validade.</div>'
      :'<div class="terms">Documento referente ao pedido registrado no sistema PRIME.</div>';

    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
      '<title>'+title+' - PRIME</title>'+
      '<style>'+
      '@page{size:A4;margin:10mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
      'html,body{margin:0;padding:0;background:#eef0f5;color:#171923;font-family:Arial,Helvetica,sans-serif}body{padding:22px}'+
      '.page{width:min(820px,100%);margin:auto;background:#fff;border:1px solid #e4e6ed;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px #1112}'+
      '.brandhead{min-height:132px;background:#050505;display:flex;align-items:center;justify-content:space-between;padding:18px 28px;gap:24px}'+
      '.brandlock{display:flex;align-items:center;gap:18px}.phoneMark{width:50px;height:76px;border:4px solid transparent;border-radius:13px;background:linear-gradient(#050505,#050505) padding-box,linear-gradient(160deg,#16d9ff,#5870ff 48%,#ea16f5) border-box;position:relative;flex:none}.phoneMark:before{content:"";position:absolute;width:19px;height:5px;border-radius:0 0 7px 7px;background:#050505;left:50%;top:-1px;transform:translateX(-50%)}.bolt{position:absolute;left:50%;top:50%;width:30px;height:48px;transform:translate(-50%,-50%) skew(-7deg);background:linear-gradient(160deg,#19d4ff,#596dff 48%,#e61af4);clip-path:polygon(58% 0,18% 48%,48% 48%,31% 100%,83% 39%,54% 39%)}'+
      '.brandWord strong{display:block;font-size:34px;font-style:italic;letter-spacing:.12em;background:linear-gradient(90deg,#f6f6f7 4%,#74b7ff 40%,#7b63ff 64%,#e51cf4);-webkit-background-clip:text;background-clip:text;color:transparent}.brandWord small{display:block;color:#e5e5ea;font-size:11px;letter-spacing:.28em;margin-top:5px;white-space:nowrap}.company{text-align:right;color:#fff}.company span{display:block;color:#cdd0dc;font-size:12px;margin-top:7px}.company .phone{font-size:15px;color:#fff;font-weight:700}'+
      '.accent{height:5px;background:linear-gradient(90deg,#1bc7ff,#6068ff,#d417f5)}'+
      '.content{padding:28px 30px 26px}.dochead{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:1px solid #e6e8ef;padding-bottom:19px}'+
      '.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#6d7180;font-weight:800}.dochead h1{font-size:31px;margin:5px 0 0;letter-spacing:.04em}.ref{text-align:right}.ref strong{display:block;font-size:15px}.ref span{display:block;color:#6d7180;font-size:12px;margin-top:6px}'+
      '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.info{border:1px solid #e4e6ed;border-radius:11px;padding:11px 12px;background:#fafafd}.info span{display:block;color:#777b89;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.info strong{display:block;margin-top:5px;font-size:13px}'+
      '.client{margin-top:18px;border:1px solid #e4e6ed;border-radius:13px;padding:15px 16px}.client h3,.notes h3{margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#5d6170}.client strong{font-size:17px}.clientmeta{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin-top:9px;color:#626674;font-size:12px;line-height:1.45}'+
      'table{width:100%;border-collapse:separate;border-spacing:0;margin-top:20px;border:1px solid #e4e6ed;border-radius:13px;overflow:hidden}thead th{background:#f2f3f8;color:#4b4f5d;font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:11px 12px;text-align:left}tbody td{padding:13px 12px;border-top:1px solid #eceef3;font-size:13px}tbody tr:first-child td{border-top:0}.prod strong{display:block}.prod small{display:block;color:#777b89;margin-top:3px}.num{text-align:right;white-space:nowrap}.totalcell{font-weight:800}'+
      '.sumrow{display:flex;justify-content:flex-end;margin-top:17px}.totalboxdoc{min-width:280px;background:#11131a;color:#fff;border-radius:13px;padding:14px 17px;display:flex;align-items:center;justify-content:space-between;gap:18px}.totalboxdoc span{font-size:12px;color:#c9ccd6}.totalboxdoc strong{font-size:22px;white-space:nowrap}'+
      '.notes{margin-top:18px;border:1px solid #e4e6ed;border-radius:13px;padding:15px 16px}.notes div{white-space:pre-wrap;font-size:12px;line-height:1.55;color:#4f5360}.terms{margin-top:18px;font-size:10.5px;line-height:1.5;color:#737785}'+
      '.signatures{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:38px}.sign{border-top:1px solid #9da1ad;padding-top:7px;text-align:center;color:#6c7080;font-size:10px}'+
      '.footer{margin-top:24px;padding-top:14px;border-top:1px solid #eceef3;text-align:center;color:#7c808d;font-size:10px}.footer strong{color:#252733}'+
      '@media(max-width:650px){body{padding:0}.page{border-radius:0;border:0}.brandhead{padding:14px 16px}.phoneMark{width:40px;height:62px}.bolt{width:24px;height:38px}.brandlock{gap:10px}.brandWord strong{font-size:25px}.brandWord small{font-size:8px;letter-spacing:.18em}.company{display:none}.content{padding:20px 16px}.grid{grid-template-columns:1fr 1fr}.clientmeta{grid-template-columns:1fr}.dochead h1{font-size:25px}.sumrow{display:block}.totalboxdoc{min-width:0;width:100%}}'+
      '@media print{html,body{background:#fff}body{padding:0}.page{width:100%;border:0;border-radius:0;box-shadow:none}.content{padding:22px 24px 18px}.brandhead{min-height:120px}.signatures{margin-top:32px}}'+
      '</style></head><body><div class="page">'+
      '<header class="brandhead"><div class="brandlock"><div class="phoneMark"><span class="bolt"></span></div><div class="brandWord"><strong>PRIME</strong><small>SEU CELULAR, COMO NOVO.</small></div></div><div class="company"><span>Atendimento e serviços</span><span class="phone">WhatsApp: (93) 98436-5610</span></div></header><div class="accent"></div>'+
      '<main class="content">'+
      '<section class="dochead"><div><div class="eyebrow">Documento comercial</div><h1>'+title+'</h1></div><div class="ref"><strong>Ref. '+docRef(obj)+'</strong><span>Emitido em '+brDate(obj.date)+'</span></div></section>'+
      '<section class="grid"><div class="info"><span>Data</span><strong>'+brDate(obj.date)+'</strong></div>'+validity+'<div class="info"><span>Pagamento</span><strong>'+esc(obj.pay||'A combinar')+'</strong></div><div class="info"><span>'+fulfill+'</span><strong>'+esc(fulfillDetail)+'</strong></div>'+statusBox+'</section>'+
      '<section class="client"><h3>Cliente</h3><strong>'+esc(c?c.name:'Não informado')+'</strong><div class="clientmeta"><div><b>Telefone:</b> '+clientPhone+'</div><div><b>Endereço:</b> '+clientAddress+'</div></div></section>'+
      '<table><thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Unitário</th><th class="num">Total</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="sumrow"><div class="totalboxdoc"><span>Total '+(isQ?'do orçamento':'do pedido')+'</span><strong>'+money(orderTotal(obj))+'</strong></div></div>'+
      notes+conditions+
      '<section class="signatures"><div class="sign">PRIME</div><div class="sign">Aprovação do cliente</div></section>'+
      '<footer class="footer"><strong>PRIME</strong> · WhatsApp (93) 98436-5610 · Obrigado pela preferência.</footer>'+
      '</main></div><script>setTimeout(function(){window.print()},600)<\/script></body></html>';
  }
  window.commercialDoc=primeCommercialDoc;
})();