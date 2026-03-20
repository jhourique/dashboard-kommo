const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Credenciais via variáveis de ambiente
const DASHBOARD_USER = process.env.DASH_USER || 'admin';
const DASHBOARD_PASS = process.env.DASH_PASS || 'clinica123';
const KOMMO_TOKEN    = process.env.KOMMO_TOKEN || '';
const KOMMO_DOMAIN   = process.env.KOMMO_DOMAIN || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── LOGIN ────────────────────────────────────────────────────
app.post('/auth', (req, res) => {
  const { user, pass } = req.body;
  if (user === DASHBOARD_USER && pass === DASHBOARD_PASS) {
    res.json({ ok: true, token: Buffer.from(`${user}:${pass}`).toString('base64') });
  } else {
    res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos' });
  }
});

app.get('/auth/check', (req, res) => {
  const auth = req.headers.authorization || '';
  const decoded = Buffer.from(auth.replace('Basic ', ''), 'base64').toString();
  const [user, pass] = decoded.split(':');
  if (user === DASHBOARD_USER && pass === DASHBOARD_PASS) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

// ── MIDDLEWARE DE AUTH ───────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const decoded = Buffer.from(auth.replace('Basic ', ''), 'base64').toString();
  const [user, pass] = decoded.split(':');
  if (user === DASHBOARD_USER && pass === DASHBOARD_PASS) return next();
  res.status(401).json({ error: 'Não autorizado' });
}

// ── PROXY KOMMO ──────────────────────────────────────────────
app.get('/api/kommo/*', requireAuth, async (req, res) => {
  const path = req.params[0];
  const query = req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '';
  const url = `https://${KOMMO_DOMAIN}.kommo.com/api/v4/${path}${query}`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${KOMMO_TOKEN}` } });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── FRONTEND ─────────────────────────────────────────────────
app.get('*', (req, res) => res.send(HTML));

// ── HTML DO DASHBOARD ────────────────────────────────────────
const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard IA — Clínica Ariane</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#0a0c10;color:#e8eaf0;font-size:14px;line-height:1.5}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2e38;border-radius:3px}
.hidden{display:none!important}
/* LOGIN */
#login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.login-card{background:#111418;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:40px;max-width:400px;width:100%}
.login-card h1{font-size:20px;font-weight:600;margin-bottom:6px}
.login-card p{font-size:13px;color:#6b7280;margin-bottom:28px}
label{display:block;font-size:11px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
input[type=text],input[type=password]{width:100%;background:#181c22;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 14px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:16px;outline:none;transition:border-color .2s}
input:focus{border-color:#6ee7b7}
.btn{width:100%;background:#6ee7b7;color:#0a0c10;border:none;border-radius:8px;padding:12px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity .2s}
.btn:hover{opacity:.85}
.err{color:#f87171;font-size:12px;margin-top:10px;text-align:center}
/* TOPBAR */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#111418;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;z-index:100}
.logo{display:flex;align-items:center;gap:10px}
.dot{width:8px;height:8px;border-radius:50%;background:#6ee7b7}
.topbar h2{font-size:15px;font-weight:600}
.meta{font-size:12px;color:#6b7280;margin-left:4px}
.btn-sm{background:#181c22;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8eaf0;padding:6px 14px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:border-color .2s}
.btn-sm:hover{border-color:#6ee7b7}
/* TABS */
.tabs{display:flex;gap:2px;padding:10px 24px 0;background:#111418;border-bottom:1px solid rgba(255,255,255,0.07);overflow-x:auto}
.tab{padding:7px 16px 10px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#6b7280;white-space:nowrap;transition:color .2s,border-color .2s}
.tab.active{color:#6ee7b7;border-bottom-color:#6ee7b7}
.tab:hover:not(.active){color:#e8eaf0}
/* CONTENT */
.content{padding:24px}
.page{display:none}.page.active{display:block}
/* GRID */
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
@media(max-width:768px){.g4{grid-template-columns:repeat(2,1fr)}.g2,.g3{grid-template-columns:1fr}.content{padding:16px}}
/* CARDS */
.card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px}
.card-title{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px}
.stat-card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px}
.stat-lbl{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
.stat-val{font-size:28px;font-weight:600;line-height:1;margin-bottom:6px}
.stat-sub{font-size:12px;color:#6b7280}
.badge{display:inline-block;font-size:11px;font-weight:500;padding:2px 10px;border-radius:20px;margin-top:8px}
/* BARS */
.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.bar-label{font-size:13px;min-width:110px}
.bar-wrap{flex:1;background:#181c22;border-radius:4px;height:8px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width 1s cubic-bezier(.16,1,.3,1)}
.bar-cnt{font-size:12px;color:#6b7280;min-width:40px;text-align:right;font-family:'DM Mono',monospace}
.bar-pct{font-size:12px;color:#6b7280;min-width:36px;text-align:right;font-family:'DM Mono',monospace}
/* FUNIL */
.funil-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07)}
.funil-row:last-child{border-bottom:none}
.funil-name{flex:1;font-size:13px}
.funil-bar{width:100px;background:#181c22;border-radius:3px;height:6px;overflow:hidden}
.funil-fill{height:100%;background:#818cf8;border-radius:3px;transition:width 1s}
.funil-cnt{font-family:'DM Mono',monospace;font-size:12px;color:#6b7280;min-width:24px;text-align:right}
/* TABLE */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.07)}
td{padding:10px 12px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)}
tr:hover td{background:rgba(255,255,255,.02)}
/* ALERTS */
.alert{display:flex;gap:12px;padding:12px 16px;border-radius:10px;margin-bottom:10px;border:1px solid}
.alert.red{background:rgba(248,113,113,.06);border-color:rgba(248,113,113,.2)}
.alert.yellow{background:rgba(251,191,36,.06);border-color:rgba(251,191,36,.2)}
.alert.green{background:rgba(52,211,153,.06);border-color:rgba(52,211,153,.2)}
.alert-icon{font-size:16px;margin-top:1px}
.alert-title{font-size:13px;font-weight:600;margin-bottom:3px}
.alert-body{font-size:12px;color:#6b7280;line-height:1.6}
/* INSIGHTS */
.insight{background:linear-gradient(135deg,rgba(110,231,183,.05),rgba(129,140,248,.05));border:1px solid rgba(110,231,183,.15);border-radius:12px;padding:20px;margin-bottom:14px}
.insight-tag{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.insight-title{font-size:13px;font-weight:600;color:#6ee7b7;margin-bottom:8px}
.insight-body{font-size:13px;line-height:1.7}
.sugestao{background:#111418;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px;margin-bottom:12px}
.sug-tipo{font-size:11px;color:#f472b6;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.sug-msg{font-size:13px;background:#181c22;border-radius:8px;padding:12px;border-left:3px solid #6ee7b7;line-height:1.7;font-style:italic;margin-bottom:8px}
.sug-why{font-size:12px;color:#6b7280}
/* LOADING */
#loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
.spinner{width:36px;height:36px;border:2px solid rgba(255,255,255,.1);border-top-color:#6ee7b7;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.sec-title{font-size:16px;font-weight:600;margin-bottom:14px}
.empty{text-align:center;padding:40px;color:#6b7280;font-size:13px}
.ai-load{display:flex;align-items:center;gap:8px;color:#6b7280;font-size:13px;padding:20px}
.ai-spin{width:16px;height:16px;border:1.5px solid rgba(255,255,255,.1);border-top-color:#6ee7b7;border-radius:50%;animation:spin .8s linear infinite}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login">
  <div class="login-card">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <div class="dot"></div>
      <h1>Dashboard IA</h1>
    </div>
    <p>Clínica Ariane — Gestão inteligente de leads</p>
    <label>Usuário</label>
    <input type="text" id="u" placeholder="admin" />
    <label>Senha</label>
    <input type="password" id="p" placeholder="••••••••" onkeydown="if(event.key==='Enter')login()" />
    <button class="btn" onclick="login()">Entrar</button>
    <div class="err hidden" id="err">Usuário ou senha incorretos</div>
  </div>
</div>

<!-- LOADING -->
<div id="loading" class="hidden">
  <div class="spinner"></div>
  <span style="color:#6b7280;font-size:13px" id="load-msg">Carregando...</span>
</div>

<!-- APP -->
<div id="app" class="hidden">
  <div class="topbar">
    <div class="logo">
      <div class="dot"></div>
      <h2>Dashboard IA</h2>
      <span class="meta" id="acc-name"></span>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <span class="meta" id="upd-time"></span>
      <button class="btn-sm" onclick="recarregar()">↻ Atualizar</button>
      <button class="btn-sm" onclick="sair()">Sair</button>
    </div>
  </div>
  <div class="tabs">
    <div class="tab active" onclick="showTab('geral',this)">Visão Geral</div>
    <div class="tab" onclick="showTab('origem',this)">Origem dos Leads</div>
    <div class="tab" onclick="showTab('followup',this)">Follow-up</div>
    <div class="tab" onclick="showTab('insights',this)">Insights IA</div>
    <div class="tab" onclick="showTab('alertas',this)">Alertas</div>
  </div>
  <div class="content">
    <div class="page active" id="pg-geral">
      <div class="g4" id="stats-top"></div>
      <div class="g2">
        <div class="card"><div class="card-title">Origem dos leads</div><div id="orig-mini"></div></div>
        <div class="card"><div class="card-title">Leads por etapa</div><div id="funil-mini"></div></div>
      </div>
      <div class="card"><div class="card-title">Principais alertas</div><div id="alert-mini"></div></div>
    </div>
    <div class="page" id="pg-origem">
      <div class="g3" id="orig-stats"></div>
      <div class="card"><div class="card-title">Detalhamento por origem</div><div id="orig-det"></div></div>
    </div>
    <div class="page" id="pg-followup">
      <div class="g3" id="fu-stats"></div>
      <div class="card"><div class="card-title">Leads aguardando follow-up</div>
        <div class="tbl-wrap"><table><thead><tr><th>Lead</th><th>Etapa</th><th>Última atividade</th><th>Dias parado</th><th>Status</th></tr></thead><tbody id="fu-tbody"></tbody></table></div>
      </div>
    </div>
    <div class="page" id="pg-insights">
      <div class="sec-title">Insights estratégicos</div>
      <div id="ins-cont"><div class="ai-load"><div class="ai-spin"></div>Gerando análise com IA...</div></div>
      <div class="sec-title" style="margin-top:24px">Sugestões de mensagens</div>
      <div id="sug-cont"><div class="ai-load"><div class="ai-spin"></div>Elaborando sugestões...</div></div>
    </div>
    <div class="page" id="pg-alertas">
      <div class="sec-title">O que melhorar agora</div>
      <div id="alert-cont"></div>
    </div>
  </div>
</div>

<script>
const COLORS=['#6ee7b7','#818cf8','#f472b6','#fb923c','#fbbf24','#60a5fa','#a78bfa'];
let AUTH='', DATA={};

function sair(){AUTH='';show('login');hide('app')}
function show(id){document.getElementById(id).classList.remove('hidden')}
function hide(id){document.getElementById(id).classList.add('hidden')}
function showTab(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('pg-'+id).classList.add('active');
  el.classList.add('active');
}

async function login(){
  const u=document.getElementById('u').value.trim();
  const p=document.getElementById('p').value.trim();
  if(!u||!p)return;
  try{
    const r=await fetch('/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user:u,pass:p})});
    const d=await r.json();
    if(d.ok){AUTH=d.token;hide('login');document.getElementById('err').classList.add('hidden');carregar();}
    else{document.getElementById('err').classList.remove('hidden');}
  }catch(e){document.getElementById('err').classList.remove('hidden');}
}

async function kFetch(path){
  const r=await fetch('/api/kommo/'+path,{headers:{Authorization:'Basic '+AUTH}});
  if(!r.ok)throw new Error('Erro '+r.status);
  return r.json();
}

function diasAtras(ts){if(!ts)return 999;return Math.floor((Date.now()/1000-ts)/86400);}

function origem(lead){
  const src=(lead.utm_source||'').toLowerCase();
  const tags=(lead._embedded?.tags||[]).map(t=>t.name.toLowerCase());
  const name=(lead.name||'').toLowerCase();
  const all=[src,name,...tags].join(' ');
  if(all.includes('instagram')||all.includes('insta')||src==='ig')return'Instagram';
  if(all.includes('indica')||all.includes('referral'))return'Indicação';
  if(all.includes('recorr')||all.includes('retorno')||all.includes('cliente antigo'))return'Recorrência';
  if(all.includes('whatsapp')||all.includes('waba'))return'WhatsApp';
  if(all.includes('facebook')||src==='facebook')return'Facebook';
  if(all.includes('google')||src==='google')return'Google';
  return'Sem origem';
}

async function carregar(){
  hide('app');show('loading');setMsg('Buscando conta...');
  try{
    const acc=await kFetch('account');
    setMsg('Buscando pipelines...');
    const pipes=await kFetch('leads/pipelines');
    const pipelines=pipes._embedded?.pipelines||[];
    setMsg('Buscando leads...');
    const p1=await kFetch('leads?limit=250&with=contacts');
    let leads=p1._embedded?.leads||[];
    const pages=Math.min(p1._page_count||1,8);
    if(pages>1){
      setMsg('Carregando '+pages+' páginas...');
      const reqs=[];for(let i=2;i<=pages;i++)reqs.push(kFetch('leads?limit=250&page='+i+'&with=contacts'));
      const rs=await Promise.all(reqs);rs.forEach(r=>{leads=leads.concat(r._embedded?.leads||[]);});
    }
    const stageMap={};
    pipelines.forEach(p=>p.statuses?.forEach(s=>{stageMap[s.id]=s.name;}));
    const total=leads.length;
    const abertos=leads.filter(l=>l.status_id!==142&&l.status_id!==143).length;
    const fechados=leads.filter(l=>l.status_id===142).length;
    const perdidos=leads.filter(l=>l.status_id===143).length;
    const taxaConv=total>0?(fechados/total*100).toFixed(1):0;
    const vl=leads.filter(l=>l.price>0);
    const ticket=vl.length>0?Math.round(vl.reduce((s,l)=>s+l.price,0)/vl.length):0;
    const origMap={};leads.forEach(l=>{const o=origem(l);origMap[o]=(origMap[o]||0)+1;});
    const origArr=Object.entries(origMap).sort((a,b)=>b[1]-a[1]);
    const funilMap={};
    leads.filter(l=>l.status_id!==142&&l.status_id!==143).forEach(l=>{const s=stageMap[l.status_id]||'Desconhecida';funilMap[s]=(funilMap[s]||0)+1;});
    const funilArr=Object.entries(funilMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const parados=leads.filter(l=>l.status_id!==142&&l.status_id!==143).map(l=>({...l,dias:diasAtras(l.updated_at),etapa:stageMap[l.status_id]||'—'})).sort((a,b)=>b.dias-a.dias);
    DATA={acc,total,abertos,fechados,perdidos,taxaConv,ticket,origArr,origMap,funilArr,parados,stageMap};
    renderizar();
    document.getElementById('acc-name').textContent=acc.name||'';
    document.getElementById('upd-time').textContent='Atualizado agora';
    hide('loading');show('app');
    setTimeout(()=>gerarIA(),500);
  }catch(e){hide('loading');show('login');alert('Erro: '+e.message);}
}
function recarregar(){carregar();}
function setMsg(m){document.getElementById('load-msg').textContent=m;}

function renderizar(){
  const {total,abertos,fechados,perdidos,taxaConv,ticket,origArr,origMap,funilArr,parados}=DATA;
  const p7=parados.filter(l=>l.dias>=7);
  const p3=parados.filter(l=>l.dias>=3&&l.dias<7);

  // Stats
  document.getElementById('stats-top').innerHTML=[
    {lbl:'Total de leads',val:total,sub:'todos os tempos',b:null},
    {lbl:'Leads abertos',val:abertos,sub:'em andamento',b:{c:'#818cf8',t:'ativos'}},
    {lbl:'Taxa de conversão',val:taxaConv+'%',sub:fechados+' convertidos',b:{c:taxaConv>=30?'#34d399':'#fbbf24',t:taxaConv>=30?'bom':'a melhorar'}},
    {lbl:'Ticket médio',val:ticket>0?'R$ '+ticket.toLocaleString('pt-BR'):'—',sub:'leads com valor',b:null},
  ].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.lbl}</div><div class="stat-val">${s.val}</div><div class="stat-sub">${s.sub}</div>${s.b?`<div class="badge" style="background:${s.b.c}22;color:${s.b.c}">${s.b.t}</div>`:''}</div>`).join('');

  const maxO=origArr[0]?.[1]||1;
  const barHTML=(arr,max)=>arr.slice(0,5).map(([n,c],i)=>`<div class="bar-row"><span class="bar-label">${n}</span><div class="bar-wrap"><div class="bar-fill" style="width:${(c/max*100).toFixed(0)}%;background:${COLORS[i%COLORS.length]}"></div></div><span class="bar-cnt">${c}</span><span class="bar-pct">${(c/total*100).toFixed(0)}%</span></div>`).join('');
  document.getElementById('orig-mini').innerHTML=barHTML(origArr,maxO)||'<div class="empty">Sem dados</div>';

  const maxF=funilArr[0]?.[1]||1;
  document.getElementById('funil-mini').innerHTML=funilArr.map(([n,c])=>`<div class="funil-row"><span class="funil-name">${n}</span><div class="funil-bar"><div class="funil-fill" style="width:${(c/maxF*100).toFixed(0)}%"></div></div><span class="funil-cnt">${c}</span></div>`).join('')||'<div class="empty">Sem etapas</div>';

  // Alertas
  const alertas=gerarAlertas(p7,p3,taxaConv,origMap,total);
  const alertHTML=alertas.map(a=>`<div class="alert ${a.t}"><span class="alert-icon">${a.i}</span><div><div class="alert-title">${a.title}</div>${a.body?`<div class="alert-body">${a.body}</div>`:''}</div></div>`).join('');
  document.getElementById('alert-mini').innerHTML=alertas.slice(0,3).map(a=>`<div class="alert ${a.t}"><span class="alert-icon">${a.i}</span><div><div class="alert-title">${a.title}</div></div></div>`).join('')||'<div class="empty">Sem alertas</div>';
  document.getElementById('alert-cont').innerHTML=alertHTML||'<div class="empty">Tudo em ordem!</div>';

  // Origem page
  const insta=origMap['Instagram']||0,indica=origMap['Indicação']||0,rec=origMap['Recorrência']||0;
  document.getElementById('orig-stats').innerHTML=[
    {lbl:'Instagram',val:insta,c:'#f472b6'},{lbl:'Indicação',val:indica,c:'#818cf8'},{lbl:'Recorrência',val:rec,c:'#6ee7b7'}
  ].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.lbl}</div><div class="stat-val" style="color:${s.c}">${s.val}</div><div class="stat-sub">${(s.val/total*100).toFixed(0)}% do total</div></div>`).join('');
  document.getElementById('orig-det').innerHTML=origArr.map(([n,c],i)=>`<div style="border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:4px"><div class="bar-row"><span class="bar-label" style="font-weight:500">${n}</span><div class="bar-wrap"><div class="bar-fill" style="width:${(c/total*100).toFixed(0)}%;background:${COLORS[i%COLORS.length]}"></div></div><span class="bar-cnt">${c}</span><span class="bar-pct">${(c/total*100).toFixed(0)}%</span></div></div>`).join('');

  // Follow-up page
  document.getElementById('fu-stats').innerHTML=[
    {lbl:'Parados +7 dias',val:p7.length,c:p7.length>0?'#f87171':'#34d399',t:p7.length>0?'urgente':'ok'},
    {lbl:'Parados 3–7 dias',val:p3.length,c:p3.length>0?'#fbbf24':'#34d399',t:p3.length>0?'atenção':'ok'},
    {lbl:'Ativos (< 3 dias)',val:parados.filter(l=>l.dias<3).length,c:'#34d399',t:'em dia'},
  ].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.lbl}</div><div class="stat-val">${s.val}</div><div class="badge" style="background:${s.c}22;color:${s.c};margin-top:8px">${s.t}</div></div>`).join('');

  document.getElementById('fu-tbody').innerHTML=parados.slice(0,30).map(l=>{
    const dt=l.updated_at?new Date(l.updated_at*1000).toLocaleDateString('pt-BR'):'—';
    const [c,t]=l.dias>=7?['#f87171','urgente']:l.dias>=3?['#fbbf24','atenção']:['#34d399','ok'];
    return`<tr><td style="font-weight:500">${l.name||'Lead sem nome'}</td><td style="color:#9ca3af">${l.etapa}</td><td style="color:#9ca3af">${dt}</td><td style="font-family:'DM Mono',monospace">${l.dias}d</td><td><span class="badge" style="background:${c}22;color:${c};margin:0">${t}</span></td></tr>`;
  }).join('')||'<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:24px">Nenhum lead parado!</td></tr>';
}

function gerarAlertas(p7,p3,taxaConv,origMap,total){
  const a=[];
  if(p7.length>0)a.push({t:'red',i:'🔴',title:`${p7.length} lead(s) sem contato há +7 dias`,body:'Priorize o contato hoje — leads frios têm alta taxa de perda.'});
  if(p3.length>0)a.push({t:'yellow',i:'🟡',title:`${p3.length} lead(s) entre 3–7 dias sem atividade`,body:'Agende follow-up para hoje ou amanhã.'});
  if(taxaConv<20)a.push({t:'red',i:'📉',title:`Taxa de conversão baixa: ${taxaConv}%`,body:'Revise o processo de qualificação e as mensagens.'});
  if((origMap['Instagram']||0)===0&&(origMap['Indicação']||0)===0)a.push({t:'yellow',i:'🔍',title:'Origem dos leads não identificada',body:'Configure tags no Kommo para rastrear a origem.'});
  if((origMap['Recorrência']||0)>0)a.push({t:'green',i:'✅',title:`${origMap['Recorrência']} lead(s) de recorrência`,body:'Clientes que voltam são sinal de satisfação.'});
  if(taxaConv>=30)a.push({t:'green',i:'🎯',title:`Boa taxa de conversão: ${taxaConv}%`,body:'Acima de 30% é positivo. Continue monitorando.'});
  return a;
}

async function gerarIA(){
  const {total,abertos,fechados,perdidos,taxaConv,origArr,funilArr,parados,ticket}=DATA;
  const p7=parados.filter(l=>l.dias>=7).length;
  const p3=parados.filter(l=>l.dias>=3&&l.dias<7).length;
  const resumo=\`Clínica de estética. Leads: \${total} total, \${abertos} abertos, \${fechados} convertidos (\${taxaConv}%), \${perdidos} perdidos. Origens: \${origArr.slice(0,5).map(([n,c])=>n+':'+c).join(', ')}. Parados: \${p7} leads +7 dias, \${p3} leads 3-7 dias. Ticket médio: R$\${ticket}.\`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:'Especialista em vendas para clínicas de estética. Dados: '+resumo+' Gere 4 insights estratégicos. Retorne APENAS JSON: {"insights":[{"titulo":"...","descricao":"...","tag":"urgente|atenção|oportunidade|positivo"}]}'}]})});
    const d=await r.json();
    const p=JSON.parse(d.content[0].text.replace(/\`\`\`json|\`\`\`/g,'').trim());
    const tc={urgente:'#f87171',atenção:'#fbbf24',oportunidade:'#818cf8',positivo:'#34d399'};
    document.getElementById('ins-cont').innerHTML=p.insights.map(i=>\`<div class="insight"><div class="insight-tag" style="background:\${tc[i.tag]||'#6ee7b7'}22;color:\${tc[i.tag]||'#6ee7b7'}">\${i.tag}</div><div class="insight-title">✦ \${i.titulo}</div><div class="insight-body">\${i.descricao}</div></div>\`).join('');
  }catch(e){document.getElementById('ins-cont').innerHTML='<div class="empty">Não foi possível gerar insights agora.</div>';}

  try{
    const r2=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:'Especialista em comunicação para clínicas de estética. Crie 3 mensagens de follow-up para WhatsApp: (1) lead novo do Instagram, (2) lead sem resposta há 5 dias, (3) cliente antigo para recorrência. Retorne APENAS JSON: {"sugestoes":[{"tipo":"...","mensagem":"...","motivo":"..."}]}'}]})});
    const d2=await r2.json();
    const p2=JSON.parse(d2.content[0].text.replace(/\`\`\`json|\`\`\`/g,'').trim());
    document.getElementById('sug-cont').innerHTML=p2.sugestoes.map(s=>\`<div class="sugestao"><div class="sug-tipo">\${s.tipo}</div><div class="sug-msg">\${s.mensagem}</div><div class="sug-why">💡 \${s.motivo}</div></div>\`).join('');
  }catch(e){document.getElementById('sug-cont').innerHTML='<div class="empty">Não foi possível gerar sugestões agora.</div>';}
}
</script>
</body>
</html>`;

app.listen(PORT, () => console.log('Dashboard rodando na porta', PORT));
