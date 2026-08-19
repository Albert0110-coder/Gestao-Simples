(function(){
  'use strict';

  var originalStageSelect=window.stageSelect;
  window.stageSelect=function(o){
    if(isAdmin()&&typeof originalStageSelect==='function')return originalStageSelect(o);
    return '<div class="stage" style="display:flex;align-items:center;justify-content:center;min-height:34px;cursor:default;color:var(--muted);background:#0b1711">Status: <strong style="color:var(--text);margin-left:5px">'+stageLabel(o&&o.orderStage)+'</strong></div>';
  };

  var originalSetOrderStage=window.setOrderStage;
  window.setOrderStage=async function(id,stage){
    if(!isAdmin()){
      alert('Apenas administradores podem alterar o status do pedido.');
      return;
    }
    return originalSetOrderStage(id,stage);
  };

  if(typeof renderAll==='function'&&session)renderAll();
})();
