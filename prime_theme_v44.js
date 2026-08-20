(function(){
  'use strict';
  if(document.getElementById('primeThemeV44'))return;

  var style=document.createElement('style');
  style.id='primeThemeV44';
  style.textContent=`
:root{
  --bg:#070914;
  --panel:#0d1120;
  --panel2:#151a2c;
  --line:#29314d;
  --text:#f5f7ff;
  --muted:#959db8;
  --green:#27d8f2;
  --green2:#79dcff;
  --blue:#5f82ff;
  --purple:#8a55ff;
  --magenta:#e13cff;
  --success:#63e5a5;
  --red:#ff708d;
  --yellow:#ffd166;
  --shadow:0 16px 42px #0008;
}
html,body{background:var(--bg)!important}
body{background:radial-gradient(circle at 70% -10%,#35105a55 0,transparent 30%),radial-gradient(circle at 15% 0,#073b6455 0,transparent 28%),var(--bg)!important}
header{background:#080b18e8!important;border-bottom-color:var(--line)!important}
.nav{background:#090c1af5!important;border-color:var(--line)!important}
.hero,.card,.row,.filters,.menu button,.sheet,.product,.customerHero,.loginbox{background-color:var(--panel)!important;border-color:var(--line)!important}
.hero{background:linear-gradient(145deg,#111831,#0c1020)!important}
.secondary,.iconbtn,.close{background:#151a2c!important;border-color:var(--line)!important}
.primary{background:linear-gradient(135deg,#20d8f4 0%,#5d7cff 52%,#db3cff 100%)!important;border-color:transparent!important;color:#fff!important;box-shadow:0 8px 22px #5d64ff30}
.primary:hover{filter:brightness(1.06)}
input,select,textarea,.stage{background:#090d1b!important;border-color:var(--line)!important}
input:focus,select:focus,textarea:focus{border-color:#7180ff!important;box-shadow:0 0 0 3px #6e62ff24!important}
.eyebrow,.linkbtn,.price,.totalbox strong,.nav button.on{color:var(--green)!important}
.dot.ok{background:var(--success)!important}.dot.bad{background:var(--red)!important}
.nav button.on{background:linear-gradient(90deg,#102b4255,#41205b66)!important;box-shadow:inset 2px 0 0 #27d8f2}
.step.on{background:linear-gradient(135deg,#22d7f3,#6b70ff 60%,#d83bff)!important;border-color:transparent!important;color:#fff!important}
.totalbox{background:#0d1227!important;border-color:#39489b!important}
.login{background:radial-gradient(circle at 50% 0,#183a6855 0,#21104455 24%,#070914 52%)!important}
.loginbox{box-shadow:0 22px 70px #0009,0 0 45px #5d62ff14!important}
.actions button:not(.danger){border-color:#34416c!important}
.pill,.step{border-color:#35405f!important}
#home .po-filter,#home .po-kpi,#home .po-panel{background:linear-gradient(145deg,#11172b,#0b1020)!important;border-color:var(--line)!important}
#home .po-kpi:after{background:linear-gradient(90deg,#20d8f4,#6577ff,#dc3cff)!important;opacity:.85!important}
#home .po-icon{background:#111b38!important;color:#55ddff!important}
#home .po-track{background:#090d1b!important;border-color:#29314d!important}
#home .po-fill{background:linear-gradient(90deg,#23d8f2,#6677ff,#d83cff)!important}
#home .po-stage,#home .po-order{border-color:#252e49!important}
#home .po-period-summary{border-color:#252e49!important}
#home .po-period-summary div{background:#0a0f20!important;border-color:#29314d!important}
#home .po-stage-info span{color:#cdd4eb!important}
#home .po-stage.po-completed{color:var(--success)!important;border-color:#246747!important}
@media(min-width:900px){.nav{background:#090c1afa!important}}
`;
  document.head.appendChild(style);
})();
