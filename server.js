const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const DASHBOARD_USER = process.env.DASH_USER || 'admin';
const DASHBOARD_PASS = process.env.DASH_PASS || 'clinica123';
const KOMMO_TOKEN    = process.env.KOMMO_TOKEN || '';
const KOMMO_DOMAIN   = process.env.KOMMO_DOMAIN || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth', (req, res) => {
  const { user, pass } = req.body;
  if (user === DASHBOARD_USER && pass === DASHBOARD_PASS) {
    res.json({ ok: true, token: Buffer.from(user + ':' + pass).toString('base64') });
  } else {
    res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos' });
  }
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const decoded = Buffer.from(auth.replace('Basic ', ''), 'base64').toString();
  const parts = decoded.split(':');
  if (parts[0] === DASHBOARD_USER && parts[1] === DASHBOARD_PASS) return next();
  res.status(401).json({ error: 'Não autorizado' });
}

app.get('/api/kommo/*', requireAuth, async (req, res) => {
  const path = req.params[0];
  const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const url = 'https://' + KOMMO_DOMAIN + '.kommo.com/api/v4/' + path + qs;
  try {
    const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + KOMMO_TOKEN } });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getHTML());
});

function getHTML() {
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard IA</title>' +
  '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">' +
  '<style>' +
  '*{box-sizing:border-box;margin:0;padding:0}' +
  'body{font-family:"DM Sans",sans-serif;background:#0a0c10;color:#e8eaf0;font-size:14px;line-height:1.5}' +
  '::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#2a2e38;border-radius:3px}' +
  '.hidden{display:none!important}' +
  '#login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}' +
  '.login-card{background:#111418;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:40px;max-width:400px;width:100%}' +
  '.login-card h1{font-size:20px;font-weight:600;margin-bottom:6px}' +
  '.login-card p{font-size:13px;color:#6b7280;margin-bottom:28px}' +
  'label{display:block;font-size:11px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}' +
  'input[type=text],input[type=password]{width:100%;background:#181c22;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 14px;color:#e8eaf0;font-size:13px;margin-bottom:16px;outline:none}' +
  '.btn{width:100%;background:#6ee7b7;color:#0a0c10;border:none;border-radius:8px;padding:12px;font-weight:600;font-size:14px;cursor:pointer}' +
  '.err{color:#f87171;font-size:12px;margin-top:10px;text-align:center}' +
  '.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#111418;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;z-index:100}' +
  '.logo{display:flex;align-items:center;gap:10px}' +
  '.dot{width:8px;height:8px;border-radius:50%;background:#6ee7b7}' +
  '.meta{font-size:12px;color:#6b7280}' +
  '.btn-sm{background:#181c22;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8eaf0;padding:6px 14px;font-size:12px;cursor:pointer}' +
  '.tabs{display:flex;padding:10px 24px 0;background:#111418;border-bottom:1px solid rgba(255,255,255,0.07);overflow-x:auto;gap:2px}' +
  '.tab{padding:7px 16px 10px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#6b7280;white-space:nowrap}' +
  '.tab.active{color:#6ee7b7;border-bottom-color:#6ee7b7}' +
  '.content{padding:24px}' +
  '.page{display:none}.page.active{display:block}' +
  '.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}' +
  '.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}' +
  '.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}' +
  '@media(max-width:768px){.g4{grid-template-columns:repeat(2,1fr)}.g2,.g3{grid-template-columns:1fr}.content{padding:16px}}' +
  '.card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px}' +
  '.card-title{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px}' +
  '.sc{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px}' +
  '.sl{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}' +
  '.sv{font-size:28px;font-weight:600;line-height:1;margin-bottom:6px}' +
  '.ss{font-size:12px;color:#6b7280}' +
  '.badge{display:inline-block;font-size:11px;font-weight:500;padding:2px 10px;border-radius:20px;margin-top:8px}' +
  '.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}' +
  '.bar-label{font-size:13px;min-width:110px}' +
  '.bar-wrap{flex:1;background:#181c22;border-radius:4px;height:8px;overflow:hidden}' +
  '.bar-fill{height:100%;border-radius:4px}' +
  '.bar-cnt{font-size:12px;color:#6b7280;min-width:40px;text-align:right;font-family:"DM Mono",monospace}' +
  '.bar-pct{font-size:12px;color:#6b7280;min-width:36px;text-align:right;font-family:"DM Mono",monospace}' +
  '.fr{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07)}' +
  '.fr:last-child{border-bottom:none}' +
  '.fn{flex:1;font-size:13px}' +
  '.fb{width:100px;background:#181c22;border-radius:3px;height:6px;overflow:hidden}' +
  '.ff{height:100%;background:#818cf8;border-radius:3px}' +
  '.fc{font-family:"DM Mono",monospace;font-size:12px;color:#6b7280;min-width:24px;text-align:right}' +
  '.tbl-wrap{overflow-x:auto}' +
  'table{width:100%;border-collapse:collapse}' +
  'th{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.07)}' +
  'td{padding:10px 12px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)}' +
  '.alert{display:flex;gap:12px;padding:12px 16px;border-radius:10px;margin-bottom:10px;border:1px solid}' +
  '.alert.red{background:rgba(248,113,113,.06);border-color:rgba(248,113,113,.2)}' +
  '.alert.yellow{background:rgba(251,191,36,.06);border-color:rgba(251,191,36,.2)}' +
  '.alert.green{background:rgba(52,211,153,.06);border-color:rgba(52,211,153,.2)}' +
  '.at{font-size:13px;font-weight:600;margin-bottom:3px}' +
  '.ab{font-size:12px;color:#6b7280;line-height:1.6}' +
  '.insight{background:linear-gradient(135deg,rgba(110,231,183,.05),rgba(129,140,248,.05));border:1px solid rgba(110,231,183,.15);border-radius:12px;padding:20px;margin-bottom:14px}' +
  '.itag{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}' +
  '.ititle{font-size:13px;font-weight:600;color:#6ee7b7;margin-bottom:8px}' +
  '.ibody{font-size:13px;line-height:1.7}' +
  '.sug{background:#111418;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px;margin-bottom:12px}' +
  '.stipo{font-size:11px;color:#f472b6;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}' +
  '.smsg{font-size:13px;background:#181c22;border-radius:8px;padding:12px;border-left:3px solid #6ee7b7;line-height:1.7;font-style:italic;margin-bottom:8px}' +
  '.swhy{font-size:12px;color:#6b7280}' +
  '#loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}' +
  '.spinner{width:36px;height:36px;border:2px solid rgba(255,255,255,.1);border-top-color:#6ee7b7;border-radius:50%;animation:spin .8s linear infinite}' +
  '@keyframes spin{to{transform:rotate(360deg)}}' +
  '.sec{font-size:16px;font-weight:600;margin-bottom:14px}' +
  '.empty{text-align:center;padding:40px;color:#6b7280;font-size:13px}' +
  '.aiload{display:flex;align-items:center;gap:8px;color:#6b7280;font-size:13px;padding:20px}' +
  '.aispin{width:16px;height:16px;border:1.5px solid rgba(255,255,255,.1);border-top-color:#6ee7b7;border-radius:50%;animation:spin .8s linear infinite}' +
  '</style></head><body>' +
  '<div id="login"><div class="login-card">' +
  '<div class="logo" style="margin-bottom:6px"><div class="dot"></div><h1>Dashboard IA</h1></div>' +
  '<p>Clinica Ariane - Gestao inteligente de leads</p>' +
  '<label>Usuario</label><input type="text" id="u" placeholder="admin"/>' +
  '<label>Senha</label><input type="password" id="p" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" onkeydown="if(event.key===\'Enter\')login()"/>' +
  '<button class="btn" onclick="login()">Entrar</button>' +
  '<div class="err hidden" id="err">Usuario ou senha incorretos</div>' +
  '</div></div>' +
  '<div id="loading" class="hidden"><div class="spinner"></div><span style="color:#6b7280;font-size:13px" id="lmsg">Carregando...</span></div>' +
  '<div id="app" class="hidden">' +
  '<div class="topbar"><div class="logo"><div class="dot"></div><strong style="font-size:15px">Dashboard IA</strong><span class="meta" id="aname" style="margin-left:8px"></span></div>' +
  '<div style="display:flex;gap:8px;align-items:center"><span class="meta" id="utime"></span><button class="btn-sm" onclick="recarregar()">Atualizar</button><button class="btn-sm" onclick="sair()">Sair</button></div></div>' +
  '<div class="tabs">' +
  '<div class="tab active" onclick="showTab(\'geral\',this)">Visao Geral</div>' +
  '<div class="tab" onclick="showTab(\'origem\',this)">Origem</div>' +
  '<div class="tab" onclick="showTab(\'followup\',this)">Follow-up</div>' +
  '<div class="tab" onclick="showTab(\'insights\',this)">Insights IA</div>' +
  '<div class="tab" onclick="showTab(\'alertas\',this)">Alertas</div>' +
  '</div>' +
  '<div class="content">' +
  '<div class="page active" id="pg-geral"><div class="g4" id="s-top"></div><div class="g2"><div class="card"><div class="card-title">Origem dos leads</div><div id="o-mini"></div></div><div class="card"><div class="card-title">Etapas do funil</div><div id="f-mini"></div></div></div><div class="card"><div class="card-title">Alertas principais</div><div id="a-mini"></div></div></div>' +
  '<div class="page" id="pg-origem"><div class="g3" id="o-stats"></div><div class="card"><div class="card-title">Detalhamento</div><div id="o-det"></div></div></div>' +
  '<div class="page" id="pg-followup"><div class="g3" id="f-stats"></div><div class="card"><div class="card-title">Leads aguardando follow-up</div><div class="tbl-wrap"><table><thead><tr><th>Lead</th><th>Etapa</th><th>Ultima atividade</th><th>Dias</th><th>Status</th></tr></thead><tbody id="f-tbody"></tbody></table></div></div></div>' +
  '<div class="page" id="pg-insights"><div class="sec">Insights estrategicos</div><div id="ins"><div class="aiload"><div class="aispin"></div>Gerando analise com IA...</div></div><div class="sec" style="margin-top:24px">Sugestoes de mensagens</div><div id="sug"><div class="aiload"><div class="aispin"></div>Elaborando sugestoes...</div></div></div>' +
  '<div class="page" id="pg-alertas"><div class="sec">O que melhorar agora</div><div id="a-cont"></div></div>' +
  '</div></div>' +
  '<script>' +
  'var COLORS=["#6ee7b7","#818cf8","#f472b6","#fb923c","#fbbf24","#60a5fa","#a78bfa"];' +
  'var AUTH="",DATA={};' +
  'function sair(){AUTH="";show("login");hide("app");}' +
  'function show(id){document.getElementById(id).classList.remove("hidden");}' +
  'function hide(id){document.getElementById(id).classList.add("hidden");}' +
  'function showTab(id,el){' +
  'document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active");});' +
  'document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active");});' +
  'document.getElementById("pg-"+id).classList.add("active");' +
  'el.classList.add("active");}' +
  'function login(){' +
  'var u=document.getElementById("u").value.trim();' +
  'var p=document.getElementById("p").value.trim();' +
  'if(!u||!p)return;' +
  'fetch("/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:u,pass:p})})' +
  '.then(function(r){return r.json();})' +
  '.then(function(d){' +
  'if(d.ok){AUTH=d.token;hide("login");document.getElementById("err").classList.add("hidden");carregar();}' +
  'else{document.getElementById("err").classList.remove("hidden");}' +
  '}).catch(function(){document.getElementById("err").classList.remove("hidden");});}' +
  'function kFetch(path){' +
  'return fetch("/api/kommo/"+path,{headers:{Authorization:"Basic "+AUTH}}).then(function(r){' +
  'if(!r.ok)throw new Error("Erro "+r.status);return r.json();});}' +
  'function diasAtras(ts){if(!ts)return 999;return Math.floor((Date.now()/1000-ts)/86400);}' +
  'function origem(lead){' +
  'var src=(lead.utm_source||"").toLowerCase();' +
  'var tags=(lead._embedded&&lead._embedded.tags||[]).map(function(t){return t.name.toLowerCase();});' +
  'var name=(lead.name||"").toLowerCase();' +
  'var all=[src,name].concat(tags).join(" ");' +
  'if(all.indexOf("instagram")>=0||all.indexOf("insta")>=0||src==="ig")return"Instagram";' +
  'if(all.indexOf("indica")>=0||all.indexOf("referral")>=0)return"Indicacao";' +
  'if(all.indexOf("recorr")>=0||all.indexOf("retorno")>=0)return"Recorrencia";' +
  'if(all.indexOf("whatsapp")>=0||all.indexOf("waba")>=0)return"WhatsApp";' +
  'if(all.indexOf("facebook")>=0||src==="facebook")return"Facebook";' +
  'if(all.indexOf("google")>=0||src==="google")return"Google";' +
  'return"Sem origem";}' +
  'function setMsg(m){document.getElementById("lmsg").textContent=m;}' +
  'function recarregar(){carregar();}' +
  'function carregar(){' +
  'hide("app");show("loading");setMsg("Conectando...");' +
  'kFetch("account").then(function(acc){' +
  'setMsg("Buscando pipelines...");' +
  'return kFetch("leads/pipelines").then(function(pipes){' +
  'var pipelines=pipes._embedded&&pipes._embedded.pipelines||[];' +
  'setMsg("Buscando leads...");' +
  'return kFetch("leads?limit=250&with=contacts").then(function(p1){' +
  'var leads=p1._embedded&&p1._embedded.leads||[];' +
  'var pages=Math.min(p1._page_count||1,8);' +
  'var reqs=[];' +
  'for(var i=2;i<=pages;i++){reqs.push(kFetch("leads?limit=250&page="+i+"&with=contacts"));}' +
  'return Promise.all(reqs).then(function(rs){' +
  'rs.forEach(function(r){leads=leads.concat(r._embedded&&r._embedded.leads||[]);});' +
  'var stageMap={};' +
  'pipelines.forEach(function(p){(p.statuses||[]).forEach(function(s){stageMap[s.id]=s.name;});});' +
  'var total=leads.length;' +
  'var abertos=leads.filter(function(l){return l.status_id!==142&&l.status_id!==143;}).length;' +
  'var fechados=leads.filter(function(l){return l.status_id===142;}).length;' +
  'var perdidos=leads.filter(function(l){return l.status_id===143;}).length;' +
  'var taxaConv=total>0?(fechados/total*100).toFixed(1):0;' +
  'var vl=leads.filter(function(l){return l.price>0;});' +
  'var ticket=vl.length>0?Math.round(vl.reduce(function(s,l){return s+l.price;},0)/vl.length):0;' +
  'var origMap={};' +
  'leads.forEach(function(l){var o=origem(l);origMap[o]=(origMap[o]||0)+1;});' +
  'var origArr=Object.entries(origMap).sort(function(a,b){return b[1]-a[1];});' +
  'var funilMap={};' +
  'leads.filter(function(l){return l.status_id!==142&&l.status_id!==143;}).forEach(function(l){var s=stageMap[l.status_id]||"Desconhecida";funilMap[s]=(funilMap[s]||0)+1;});' +
  'var funilArr=Object.entries(funilMap).sort(function(a,b){return b[1]-a[1];}).slice(0,8);' +
  'var parados=leads.filter(function(l){return l.status_id!==142&&l.status_id!==143;}).map(function(l){return Object.assign({},l,{dias:diasAtras(l.updated_at),etapa:stageMap[l.status_id]||"---"});}).sort(function(a,b){return b.dias-a.dias;});' +
  'DATA={acc:acc,total:total,abertos:abertos,fechados:fechados,perdidos:perdidos,taxaConv:taxaConv,ticket:ticket,origArr:origArr,origMap:origMap,funilArr:funilArr,parados:parados};' +
  'renderizar();' +
  'document.getElementById("aname").textContent=acc.name||"";' +
  'document.getElementById("utime").textContent="Atualizado agora";' +
  'hide("loading");show("app");' +
  'setTimeout(gerarIA,500);});});});' +
  '}).catch(function(e){hide("loading");show("login");alert("Erro: "+e.message);});}' +
  'function statCard(lbl,val,sub,bc,bt){' +
  'var badge=bc?\'<div class="badge" style="background:\'+bc+\'22;color:\'+bc+\'">\'+bt+"</div>":"";' +
  'return\'<div class="sc"><div class="sl">\'+lbl+\'</div><div class="sv">\'+val+\'</div><div class="ss">\'+sub+"</div>"+badge+"</div>";}' +
  'function barRow(nome,cnt,total,color){' +
  'var pct=(cnt/total*100).toFixed(0);' +
  'return\'<div class="bar-row"><span class="bar-label">\'+nome+\'</span><div class="bar-wrap"><div class="bar-fill" style="width:\'+pct+\'%;background:\'+color+\'"></div></div><span class="bar-cnt">\'+cnt+\'</span><span class="bar-pct">\'+pct+"%</span></div>";}' +
  'function alertCard(tipo,icon,title,body){' +
  'return\'<div class="alert \'+tipo+\'"><span style="font-size:16px">\'+icon+\'</span><div><div class="at">\'+title+"</div>"+(body?\'<div class="ab">\'+body+"</div>":"")+"</div></div>";}' +
  'function gerarAlertas(){' +
  'var d=DATA;var p7=d.parados.filter(function(l){return l.dias>=7;});' +
  'var p3=d.parados.filter(function(l){return l.dias>=3&&l.dias<7;});' +
  'var a=[];' +
  'if(p7.length>0)a.push(alertCard("red","🔴",p7.length+" lead(s) sem contato ha +7 dias","Priorize o contato hoje."));' +
  'if(p3.length>0)a.push(alertCard("yellow","🟡",p3.length+" lead(s) entre 3-7 dias sem atividade","Agende follow-up."));' +
  'if(d.taxaConv<20)a.push(alertCard("red","📉","Taxa de conversao baixa: "+d.taxaConv+"%","Revise o processo de qualificacao."));' +
  'if((d.origMap["Instagram"]||0)===0)a.push(alertCard("yellow","🔍","Origem dos leads nao identificada","Configure tags no Kommo."));' +
  'if((d.origMap["Recorrencia"]||0)>0)a.push(alertCard("green","✅",(d.origMap["Recorrencia"])+" lead(s) de recorrencia","Clientes que voltam sao sinal de satisfacao."));' +
  'if(d.taxaConv>=30)a.push(alertCard("green","🎯","Boa taxa de conversao: "+d.taxaConv+"%","Acima de 30% e positivo."));' +
  'return a;}' +
  'function renderizar(){' +
  'var d=DATA;var total=d.total;var maxO=d.origArr[0]?d.origArr[0][1]:1;' +
  'var maxF=d.funilArr[0]?d.funilArr[0][1]:1;' +
  'var p7=d.parados.filter(function(l){return l.dias>=7;});' +
  'var p3=d.parados.filter(function(l){return l.dias>=3&&l.dias<7;});' +
  'document.getElementById("s-top").innerHTML=' +
  'statCard("Total de leads",total,"todos os tempos","","")' +
  '+statCard("Leads abertos",d.abertos,"em andamento","#818cf8","ativos")' +
  '+statCard("Taxa de conversao",d.taxaConv+"%",d.fechados+" convertidos",d.taxaConv>=30?"#34d399":"#fbbf24",d.taxaConv>=30?"bom":"a melhorar")' +
  '+statCard("Ticket medio",d.ticket>0?"R$ "+d.ticket.toLocaleString("pt-BR"):"---","leads com valor","","");' +
  'document.getElementById("o-mini").innerHTML=d.origArr.slice(0,5).map(function(x,i){return barRow(x[0],x[1],total,COLORS[i%COLORS.length]);}).join("")||\'<div class="empty">Sem dados</div>\';' +
  'document.getElementById("f-mini").innerHTML=d.funilArr.map(function(x){return\'<div class="fr"><span class="fn">\'+x[0]+\'</span><div class="fb"><div class="ff" style="width:\'+Math.round(x[1]/maxF*100)+\'%"></div></div><span class="fc">\'+x[1]+"</span></div>";}).join("")||\'<div class="empty">Sem etapas</div>\';' +
  'var alertas=gerarAlertas();' +
  'document.getElementById("a-mini").innerHTML=alertas.slice(0,3).join("")||\'<div class="empty">Sem alertas</div>\';' +
  'document.getElementById("a-cont").innerHTML=alertas.join("")||\'<div class="empty">Tudo em ordem!</div>\';' +
  'document.getElementById("o-stats").innerHTML=' +
  'statCard("Instagram",d.origMap["Instagram"]||0,(((d.origMap["Instagram"]||0)/total*100).toFixed(0))+"% do total","#f472b6","instagram")' +
  '+statCard("Indicacao",d.origMap["Indicacao"]||0,(((d.origMap["Indicacao"]||0)/total*100).toFixed(0))+"% do total","#818cf8","organico")' +
  '+statCard("Recorrencia",d.origMap["Recorrencia"]||0,(((d.origMap["Recorrencia"]||0)/total*100).toFixed(0))+"% do total","#6ee7b7","fieis");' +
  'document.getElementById("o-det").innerHTML=d.origArr.map(function(x,i){return\'<div style="border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:4px">\'+barRow(x[0],x[1],total,COLORS[i%COLORS.length])+"</div>";}).join("");' +
  'document.getElementById("f-stats").innerHTML=' +
  'statCard("Parados +7 dias",p7.length,"urgente",p7.length>0?"#f87171":"#34d399",p7.length>0?"urgente":"ok")' +
  '+statCard("Parados 3-7 dias",p3.length,"atencao",p3.length>0?"#fbbf24":"#34d399",p3.length>0?"atencao":"ok")' +
  '+statCard("Ativos < 3 dias",d.parados.filter(function(l){return l.dias<3;}).length,"em dia","#34d399","em dia");' +
  'document.getElementById("f-tbody").innerHTML=d.parados.slice(0,30).map(function(l){' +
  'var dt=l.updated_at?new Date(l.updated_at*1000).toLocaleDateString("pt-BR"):"---";' +
  'var c=l.dias>=7?"#f87171":l.dias>=3?"#fbbf24":"#34d399";' +
  'var t=l.dias>=7?"urgente":l.dias>=3?"atencao":"ok";' +
  'return"<tr><td style=\'font-weight:500\'>"+(l.name||"Lead sem nome")+"</td><td style=\'color:#9ca3af\'>"+l.etapa+"</td><td style=\'color:#9ca3af\'>"+dt+"</td><td style=\'font-family:DM Mono,monospace\'>"+l.dias+"d</td><td><span class=\'badge\' style=\'background:"+c+"22;color:"+c+";margin:0\'>"+t+"</span></td></tr>";' +
  '}).join("")||"<tr><td colspan=5 style=\'text-align:center;color:#6b7280;padding:24px\'>Nenhum lead parado!</td></tr>";}' +
  'function gerarIA(){' +
  'var d=DATA;' +
  'var p7=d.parados.filter(function(l){return l.dias>=7;}).length;' +
  'var p3=d.parados.filter(function(l){return l.dias>=3&&l.dias<7;}).length;' +
  'var resumo="Clinica de estetica. Leads: "+d.total+" total, "+d.abertos+" abertos, "+d.fechados+" convertidos ("+d.taxaConv+"%), "+d.perdidos+" perdidos. Origens: "+d.origArr.slice(0,5).map(function(x){return x[0]+":"+x[1];}).join(", ")+". Parados: "+p7+" leads +7 dias, "+p3+" leads 3-7 dias. Ticket medio: R$"+d.ticket+".";' +
  'fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:"Especialista em vendas para clinicas de estetica. Dados: "+resumo+" Gere 4 insights. Retorne APENAS JSON: {\\"insights\\":[{\\"titulo\\":\\"\\",\\"descricao\\":\\"\\",\\"tag\\":\\"urgente|atencao|oportunidade|positivo\\"}]}"}]})})' +
  '.then(function(r){return r.json();})' +
  '.then(function(data){' +
  'var txt=data.content[0].text.replace(/```json|```/g,"").trim();' +
  'var p=JSON.parse(txt);' +
  'var tc={urgente:"#f87171",atencao:"#fbbf24",oportunidade:"#818cf8",positivo:"#34d399"};' +
  'document.getElementById("ins").innerHTML=p.insights.map(function(i){' +
  'return\'<div class="insight"><div class="itag" style="background:\'+(tc[i.tag]||"#6ee7b7")+\'22;color:\'+(tc[i.tag]||"#6ee7b7")+\'">\'+i.tag+\'</div><div class="ititle">* \'+i.titulo+\'</div><div class="ibody">\'+i.descricao+"</div></div>";' +
  '}).join("");' +
  '}).catch(function(){document.getElementById("ins").innerHTML=\'<div class="empty">Nao foi possivel gerar insights.</div>\';});' +
  'fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:"Especialista em comunicacao para clinicas de estetica. Crie 3 mensagens de follow-up para WhatsApp: lead novo Instagram, lead sem resposta 5 dias, cliente antigo recorrencia. APENAS JSON: {\\"sugestoes\\":[{\\"tipo\\":\\"\\",\\"mensagem\\":\\"\\",\\"motivo\\":\\"\\"}]}"}]})})' +
  '.then(function(r){return r.json();})' +
  '.then(function(data){' +
  'var txt=data.content[0].text.replace(/```json|```/g,"").trim();' +
  'var p=JSON.parse(txt);' +
  'document.getElementById("sug").innerHTML=p.sugestoes.map(function(s){' +
  'return\'<div class="sug"><div class="stipo">\'+s.tipo+\'</div><div class="smsg">\'+s.mensagem+\'</div><div class="swhy">💡 \'+s.motivo+"</div></div>";' +
  '}).join("");' +
  '}).catch(function(){document.getElementById("sug").innerHTML=\'<div class="empty">Nao foi possivel gerar sugestoes.</div>\';});' +
  '}' +
  '</script></body></html>';
}

app.listen(PORT, () => console.log('Servidor rodando na porta', PORT));
