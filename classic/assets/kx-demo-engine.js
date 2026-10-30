/* Kirby Operations Hub: live demo engine.
   Every demo plays on one screen: the systems involved, the business story, the approval or stop window,
   live telemetry, alerts being grouped and cleared, the runbook running step by step, the terminal,
   every Copilot Studio decision with its tag, and the one ServiceNow ticket. Sample data; nothing touches a live system. */
(function(){
'use strict';
const kx=window.kx;
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 5.3L20 9.5l-4.4 3.8L17 19l-5-3-5 3 1.4-5.7L4 9.5l5.8-1.2z"/></svg>';

/* ---------- the systems that can appear on a demo screen ---------- */
const TOOLS={
 opsramp:{n:'HPE OpsRamp',logo:'opsramp',c:'#16a085',idle:'Monitoring 175 nodes'},
 azmon:{n:'Azure Monitor',m:'AZ',c:'#0078d4',idle:'AVS and Azure telemetry'},
 cw:{n:'AWS CloudWatch',m:'CW',c:'#c2410c',idle:'300+ AWS resources'},
 sentinel:{n:'Microsoft Sentinel',logo:'sentinel',c:'#2563eb',idle:'SIEM · 2,100 EPS'},
 defender:{n:'Defender XDR',logo:'defender',c:'#7c3aed',idle:'2,209 devices covered'},
 dfc:{n:'Defender for Cloud',logo:'defender',c:'#0284c7',idle:'Azure and AWS posture'},
 dvm:{n:'Defender Vulnerability Mgmt',logo:'defender',c:'#0e7490',idle:'Exposure across 2,209 devices'},
 entra:{n:'Microsoft Entra ID',m:'EN',c:'#5b2d91',idle:'2,007 users'},
 pim:{n:'Entra PIM',m:'PI',c:'#9333ea',idle:'Just-in-time admin'},
 intune:{n:'Microsoft Intune',m:'IN',c:'#2563eb',idle:'2,092 endpoints'},
 pan:{n:'Palo Alto Panorama',m:'PA',c:'#ea580c',idle:'4 firewalls'},
 velo:{n:'VeloCloud Orchestrator',m:'VC',c:'#334155',idle:'SD-WAN edges'},
 meraki:{n:'Meraki Dashboard',m:'MK',c:'#16a34a',idle:'Switches and Wi-Fi'},
 nw:{n:'Dell NetWorker',m:'NW',c:'#1d4ed8',idle:'Nightly save sets'},
 js:{n:'JetStream DR',m:'JS',c:'#0f766e',idle:'RPO 30 min · RTO 15 min'},
 avs:{n:'vCenter · Azure VMware Solution',m:'VM',c:'#0b7285',idle:'AV64 cluster, 23 VMs'},
 snow:{n:'ServiceNow',logo:'servicenow',c:'#293e40',idle:'ITSM, CMDB, SecOps'},
 cps:{n:'Copilot Studio',mk:1,c:'#0f6cbd',idle:'Agents listening'},
 pa:{n:'Power Automate',m:'PF',c:'#0066ff',idle:'Agent flows ready'},
 aa:{n:'Azure Automation',m:'AA',c:'#0078d4',idle:'Runbook worker ready'},
 ansible:{n:'Ansible Automation Platform',m:'AN',c:'#cc0000',idle:'Job templates ready'},
 vault:{n:'Azure Key Vault',m:'KV',c:'#5c2d91',idle:'Vault locked'},
 teams:{n:'Microsoft Teams',m:'TE',c:'#4f46e5',idle:'Nothing sent'},
 pbi:{n:'Power BI',m:'BI',c:'#ca8a04',idle:'Service report'},
 carrier:{n:'Carrier portal',m:'CP',c:'#64748b',idle:'KEMS, Zain, STC, ITC, Etisalat'},
 audit:{n:'Audit log',m:'AU',c:'#475569',idle:'0 entries'},
 cc:{n:'Contact centre · voice',m:'CC',c:'#0d9488',idle:'IVR, ACD, recording'},
 oem:{n:'Oracle Enterprise Manager',m:'OE',c:'#c74634',idle:'Oracle 19c on SUSE'},
 solman:{n:'SAP Solution Manager',m:'SM',c:'#0a6ed1',idle:'SAP ERP, BW, Portal'},
 ssm:{n:'AWS Systems Manager',m:'SS',c:'#dd6b20',idle:'Run Command ready'},
 cad:{n:'Engineering licence server',m:'LS',c:'#6b7280',idle:'Tekla, Bocad, ZWCAD'},
 ups:{n:'UPS and facilities',m:'UP',c:'#6b7280',idle:'Site power'},
 pbx:{n:'Avaya / MiTel',m:'AV',c:'#b91c1c',idle:'Voice platforms'}
};
kx.DTOOLS=TOOLS;
const tmark=(k,sz)=>{const t=TOOLS[k]||{n:k,m:k.slice(0,2).toUpperCase(),c:'#555'};if(t.mk)return `<i class="kd-mk" style="width:${sz||18}px;height:${sz||18}px">${MK}</i>`;if(t.logo)return `<img class="kd-logo" src="assets/logos/${t.logo}.png" alt="">`;return `<i class="kd-mono" style="background:${t.c}">${E(t.m)}</i>`};
kx.tmark=tmark;
const MODES={AUTO:{n:'Runs on its own',long:'Autonomous',cls:'auto',why:'Low risk, easy to undo, confidence 80% or more, no freeze, and the change is pre-approved.'},ON:{n:'Runs unless stopped',long:'Human-on-the-loop',cls:'on',why:'A standard, pre-approved change with confidence 80% or more that should not wait. A person watches and can stop it in the stop window.'},IN:{n:'A person approves',long:'Human-in-the-loop',cls:'in',why:'Confidence below 80%, a production SAP or plant change, security or fleet-wide, or anything that costs money. Nothing changes until a named person approves.'}};
kx.MODES=MODES;
const EXEC={ansible:'ansible',powershell:'aa',python:'aa',kql:'sentinel',intune:'intune',flow:'pa',ssm:'ssm',voice:'cc'};

/* ---------- registry ---------- */
kx.DEMOS=[];
kx.D=(id,d)=>{d.id=id;kx.DEMOS.push(d);return d};
const tw=()=>[...new Set(kx.DEMOS.map(d=>d.tower))];

/* ---------- build the ordered step list for a demo ---------- */
function plan(d){
 const S=[];const P=(ph,tag,text,o={})=>S.push(Object.assign({ph,tag,text},o));
 const src=d.metric[6]||d.tools[0];const ex=d.exec||EXEC[d.rb[2]]||'aa';const ag=d.agents||{};
 const n=d.nalerts||24;
 // Detect
 P(0,'INTAKE',`${n} signals from ${d.srcNames||TOOLS[src].n} about ${d.ci}.`,{tool:src,tile:{[src]:['alarm',`${n} alerts firing`]},alerts:'stream',metric:'rise',agent:'Intake agent',dt:1500});
 if(d.call){d.call.forEach((c,i)=>P(0,c[0]==='a'?'AGENT':'CALLER',c[1],{tool:'cc',tile:{cc:['work',i===0?'Call answered in 2 s':'On the call']},say:i,agent:c[0]==='a'?'Service Desk agent':'',dt:1600}))}
 // Correlate
 P(1,'CORRELATE',`${n} signals grouped into one ticket ${d.inc} (${d.pri}).`,{tool:'cps',tile:{cps:['work','Correlating'],snow:['work',`${d.inc} · New`]},alerts:'group',ticket:'New',note:['Correlation agent',`${n} signals from ${d.srcNames||TOOLS[src].n} grouped into this one ticket.`],agent:'Correlation agent'});
 (d.evidence||[]).forEach((e,i)=>P(1,'EVIDENCE',e[1]||e,{tool:e[0]&&TOOLS[e[0]]?e[0]:src,tile:e[0]&&TOOLS[e[0]]?{[e[0]]:['work','Evidence pulled']}:null,agent:'Diagnosis agent'}));
 // Decide
 (d.ruled||[]).forEach(r=>P(2,'RULED OUT','✗ '+r,{tool:'cps',agent:'Diagnosis agent',dt:800}));
 P(2,'DIAGNOSE',`${d.conf}% · ${d.cause}`,{tool:'cps',tile:{cps:['work',`Root cause ${d.conf}%`]},note:['Diagnosis agent',`Root cause (${d.conf}% confidence): ${d.cause}${d.causeWhy?' '+d.causeWhy:''}`],agent:'Diagnosis agent',dt:1500});
 const pre=d.pre||{};const host=d.rb[4];
 const checks=[`CMDB: ${host} → ${pre.ci||'CI00'+(64000+(d.id.charCodeAt(3)*37+d.id.charCodeAt(4)*11)%999)}, support group ${d.group}`,pre.cal||`Change calendar: no other change on ${host} in the next 2 hours`,pre.model||(d.mode==='IN'?`Change model: normal change, needs ${d.approver?d.approver.split('·')[0].trim():'the resolver lead'}`:`Change model: standard change STD-${d.rb[0].replace(/\D/g,'')} "${d.rb[1]}", pre-approved by the CAB`),pre.blast||`Blast radius: checked against the Service Graph`,pre.back||`Rollback: ${d.back||'restore the previous state'}`];
 if(d.rb[2]!=='voice')checks.push(pre.cred||`Credential: one-time Key Vault secret scoped to ${host}, expires in 15 minutes`);
 checks.forEach((c,i)=>P(2,'PRE-CHECK','✓ '+c,{tool:i===0?'snow':'cps',tile:i===0?{snow:['work','CMDB checked']}:null,agent:'Change guard',dt:650}));
 P(2,'DECIDE',`${d.rb[0]} ${d.rb[1]} · risk ${d.risk||(d.mode==='IN'?'Medium':'Low')} · ${d.mode==='AUTO'?'runs now':d.mode==='ON'?'runs in 10 s unless stopped':'waits for '+(d.approver||'a named approver')}`,{tool:'cps',tile:{cps:['work',`Decided: ${d.rb[0]}`]},note:['Change guard','[PRE-CHECKS] '+checks.join(' · ')],agent:'Change guard'});
 if(d.mode==='ON')P(2,'APPROVAL','Human-on-the-loop: executing in 10 seconds unless stopped',{tool:'teams',tile:{teams:['wait','Stop window open']},gate:'ON',agent:'Change guard'});
 if(d.mode==='IN')P(2,'APPROVAL',`Human-in-the-loop: plan, evidence and rollback sent to ${d.approver||'the approver'} in Teams`,{tool:'teams',tile:{teams:['wait','Approval requested']},gate:'IN',ticket:'Awaiting approval',agent:'Change guard'});
 if(d.mode==='AUTO')P(2,'APPROVAL','Autonomous inside policy: low risk, easy to undo, confidence above 80%',{tool:'cps',agent:'Change guard',dt:800});
 // Act
 if(d.rb[2]!=='voice')P(3,'CREDENTIAL',pre.credOut||`Key Vault: secret checked out for ${TOOLS[ex].n} · KV-SESSION-${3300+d.id.charCodeAt(4)*7%600}`,{tool:'vault',tile:{vault:['work','Checked out']},agent:'Runbook agent',dt:900});
 d.tasks.forEach((t,i)=>P(3,'ACT',t[0],{tool:ex,tile:Object.assign({[ex]:['work',`Task ${i+1} of ${d.tasks.length}`]},i===0?{cps:['work','Remediating'],snow:['work',`${d.inc} · In Progress`]}:{}),task:i,metric:i===d.tasks.length-1?'fix':null,ticket:i===0?'In Progress':null,agent:'Runbook agent',dt:1400}));
 // Verify
 (d.verify||[]).forEach((v,i)=>P(4,'VERIFY','✓ '+v,{tool:src,tile:i===(d.verify.length-1)?{[src]:['done','Back to normal']}:{[src]:['work','Verifying']},alerts:i===(d.verify.length-1)?'clear':null,agent:'Verification agent',dt:1300}));
 if(d.rb[2]!=='voice')P(4,'CREDENTIAL','Credential checked back in and rotated',{tool:'vault',tile:{vault:['done','Checked back in']},agent:'Runbook agent',dt:700});
 // Record
 P(5,'TICKET',`${d.inc} resolved with evidence, root cause and the runbook output attached`,{tool:'snow',tile:{snow:['done',`${d.inc} · Resolved`],[ex]:['done','Done']},ticket:'Resolved',note:['Ticket agent',`Resolved. Root cause: ${d.cause} Evidence and runbook output attached.`],agent:'Ticket agent'});
 if(d.notify)P(5,'NOTIFY',d.notify,{tool:'teams',tile:{teams:['done','Message sent']},agent:'Comms agent'});
 if(d.learn)P(5,'LEARN',d.learn,{tool:'cps',agent:'Knowledge agent'});
 P(5,'DONE',d.outcome,{tool:'audit',tile:{audit:['done',`${S.length+1} entries`],cps:['done','Done']},done:1,agent:'Copilot Studio'});
 return S;
}

/* ---------- player state ---------- */
const R={d:null,steps:[],i:-1,timer:null,live:null,speed:1,t0:0,el:0,paused:false,gate:null,stopped:false,done:false,tiles:{},cnt:{},series:[],acted:-1,alerts:[],alertMode:'none',ticket:'—',log:[],notes:[],term:[],cur:-1,mval:0,target:0};
kx.R=R;
function reset(d){clearTimeout(R.timer);clearInterval(R.live);Object.assign(R,{d,steps:plan(d),i:-1,el:0,paused:false,gate:null,stopped:false,done:false,tiles:{},cnt:{},series:[],acted:-1,alerts:[],alertMode:'none',ticket:'—',log:[],notes:[],term:[],cur:-1,say:-1});
 const m=d.metric;R.mval=m[2];R.target=m[2];for(let i=0;i<40;i++)R.series.push(+(m[2]+(Math.random()-.5)*Math.abs(m[3]-m[2])*.06).toFixed(2));
 d.tools.forEach(k=>{R.tiles[k]=['idle',TOOLS[k]?TOOLS[k].idle:''];R.cnt[k]=0});
 const at=d.alerts;R.pool=[];for(let i=0;i<(d.nalerts||24);i++){const a=at[i%at.length];R.pool.push({sev:a[0],txt:a[1],where:a[2]+(at.length<(d.nalerts||24)&&i>=at.length?` · ${Math.floor(i/at.length)+1}`:''),n:a[3]||'',src:a[4]||d.metric[6]||d.tools[0],st:'firing'})}}
kx.play=(id,auto)=>{const d=kx.DEMOS.find(x=>x.id===id);if(!d)return;R.auto=!!auto;reset(d);draw();R.live=setInterval(live,500);R.t0=Date.now();next()};
kx.closeDemo=()=>{clearTimeout(R.timer);clearInterval(R.live);const s=document.getElementById('kdstage');if(s)s.remove();document.body.classList.remove('kd-open');R.d=null};
const clk=()=>new Date(S.now).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Asia/Kolkata'});
const fmtT=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');

function next(){if(!R.d||R.done||R.stopped)return;if(R.gate)return;
 R.i++;const st=R.steps[R.i];if(!st)return;apply(st);
 if(st.gate==='ON'){R.gate={kind:'ON',left:10};countdown();return}
 if(st.gate==='IN'){R.gate={kind:'IN'};drawGate();if(R.auto)R.timer=setTimeout(()=>kx.decide(true,'auto'),6500/R.speed);return}
 if(st.done){finish();return}
 R.timer=setTimeout(next,(st.dt||1100)/R.speed)}
function countdown(){drawGate();if(!R.gate||R.gate.kind!=='ON')return;if(R.gate.left<=0){R.gate=null;logAdd({tag:'APPROVAL',text:'No stop received: proceeding',agent:'Change guard'});drawGate();R.timer=setTimeout(next,600/R.speed);return}R.timer=setTimeout(()=>{if(!R.gate)return;R.gate.left--;countdown()},1000/R.speed)}
kx.stop=()=>{if(!R.gate)return;clearTimeout(R.timer);R.gate=null;R.stopped=true;logAdd({tag:'APPROVAL',text:'Stopped by you. No change made; the plan stays on the ticket.',agent:'Change guard'});R.ticket='On Hold';R.notes.unshift(['You','Stopped in the stop window. No change made.']);R.state='HELD';drawAll();endCard(true)};
kx.decide=(ok,who)=>{if(!R.gate)return;clearTimeout(R.timer);R.gate=null;const name=who==='auto'?(R.d.approver||'approver').split('·')[0].trim():'You';
 if(!ok){R.stopped=true;logAdd({tag:'APPROVAL',text:`Declined by ${name}. No change made.`,agent:'Change guard'});R.ticket='On Hold';R.notes.unshift([name,'Declined in Teams. No change made; the reason is on the ticket.']);R.state='HELD';drawAll();endCard(true);return}
 logAdd({tag:'APPROVAL',text:`Approved by ${name} in Teams at ${clk()}`,agent:'Change guard'});R.notes.unshift([name,'Approved in Teams.']);R.tiles.teams=['done','Approved'];R.ticket='In Progress';drawAll();R.timer=setTimeout(next,700/R.speed)};
function logAdd(o){R.log.unshift({t:clk(),tag:o.tag,text:o.text,agent:o.agent})}
function apply(st){const d=R.d;
 logAdd(st);
 if(st.tile)Object.entries(st.tile).forEach(([k,v])=>{if(R.tiles[k]){R.tiles[k]=v;R.cnt[k]++}});
 if(st.tool&&R.cnt[st.tool]!=null&&!st.tile)R.cnt[st.tool]++;
 if(st.metric==='rise')R.target=d.metric[3];
 if(st.metric==='fix'){R.target=d.metric[4];R.acted=R.series.length-1}
 if(st.alerts==='stream')R.alertMode='stream';
 if(st.alerts==='group'){R.alertMode='group';R.pool.forEach(a=>a.st='grouped')}
 if(st.alerts==='clear'){R.pool.forEach(a=>a.st='cleared')}
 if(st.ticket)R.ticket=st.ticket;
 if(st.note)R.notes.unshift([st.note[0],st.note[1]]);
 if(st.say!=null)R.say=st.say;
 if(st.task!=null){R.cur=st.task;const t=d.tasks[st.task];const k=d.rb[2];
  if(k==='ansible'){R.term.push({c:'h',t:`TASK [${t[0]}] ${'*'.repeat(Math.max(4,40-t[0].length))}`});R.term.push({c:'ok',t:`changed: [${d.rb[4]}] => ${t[2]}`})}
  else if(k==='kql'){R.term.push({c:'h',t:`> ${t[0]}`});R.term.push({c:'ok',t:t[2]})}
  else if(k==='voice'){R.term.push({c:'ok',t:`✓ ${t[0]} → ${t[2]}`})}
  else{R.term.push({c:'h',t:`PS> ${t[1].split('\n')[0].slice(0,90)}`});R.term.push({c:'ok',t:t[2]})}
  if(st.task===d.tasks.length-1){if(k==='ansible')R.term.push({c:'h',t:`PLAY RECAP ${'*'.repeat(30)}`},{c:'ok',t:`${d.rb[4]} : ok=${d.tasks.length+1} changed=${d.tasks.length} unreachable=0 failed=0`});else R.term.push({c:'ok',t:`Runbook ${d.rb[0]} completed: ${d.tasks.length} steps, 0 errors`})}}
 if(st.tag==='CREDENTIAL'&&R.cur>=0)R.term.push({c:'dim',t:'# credential checked back in'});
 R.phase=st.ph;R.state=['DETECTING','CORRELATING','DECIDING','REMEDIATING','VERIFYING','RECORDING'][st.ph];
 drawAll()}
function live(){if(!R.d)return;const m=R.d.metric;const span=Math.abs(m[3]-m[2])||Math.abs(m[2])*.1||1;R.mval+=(R.target-R.mval)*.22;const v=+Math.max(0,R.mval+(Math.random()-.5)*span*.05).toFixed(m[2]<10&&m[3]<10?2:1);R.series.push(v);R.series.shift();if(R.acted>=0)R.acted--;
 if(!R.done&&!R.stopped&&!R.gate)R.el+=.5*R.speed;
 if(R.alertMode==='stream'){R.shown=Math.min(R.pool.length,(R.shown||0)+2)}else if(R.alertMode!=='none')R.shown=R.pool.length;
 drawLive()}
function finish(){R.done=true;R.state='RESOLVED';R.tiles.cps=['done','Done'];drawAll();endCard(false);audit('Copilot Studio · demo',R.d.title+' · '+R.d.outcome);
 if(R.auto){const i=kx.DEMOS.indexOf(R.d);R.timer=setTimeout(()=>{const n=kx.guidedList?kx.guidedList[kx.guidedList.indexOf(R.d.id)+1]:null;if(n)kx.play(n,true)},5000)}}

/* ---------- drawing ---------- */
const $k=id=>document.getElementById(id);
function draw(){let w=$k('kdstage');if(!w){w=document.createElement('div');w.id='kdstage';w.className='kd';w.setAttribute('role','dialog');w.setAttribute('aria-label','Live demo');document.body.appendChild(w);document.body.classList.add('kd-open')}
 const d=R.d,i=kx.DEMOS.indexOf(d);const ex=d.exec||EXEC[d.rb[2]];
 w.innerHTML=`<div class="kd-win">
 <div class="kd-h"><span class="kd-ic">${tmark(d.metric[6]||d.tools[0],22)}</span><div class="kd-tt"><b>${E(d.title)}</b><small>${E(d.tower)} · ${E(d.where)}</small></div>
 <span class="kd-badge ${MODES[d.mode].cls}">${E(MODES[d.mode].long)}</span><span class="kd-badge k">${tmark(ex,14)} ${E(TOOLS[ex].n.split(' ')[0])} · ${E(d.rb[2]==='powershell'?'PowerShell':d.rb[2]==='ansible'?'Ansible':d.rb[2]==='kql'?'KQL':d.rb[2]==='voice'?'Voice':d.rb[2]==='python'?'Python':d.rb[2])}</span>
 <span class="kd-clock"><i></i><b id="kdtime">00:00</b> <span id="kdstate">STARTING</span></span>
 <button class="kd-b" onclick="kx.play('${d.id}')">↻ Restart</button><button class="kd-b" onclick="kx.explain()">Explain</button><button class="kd-b x" aria-label="Close" onclick="kx.closeDemo()">✕</button></div>
 <div class="kd-ph" id="kdph"></div>
 <div class="kd-tiles" id="kdtiles" style="grid-template-columns:repeat(${Math.min(8,d.tools.length)},minmax(0,1fr))"></div>
 <div class="kd-biz"><div><label>The problem</label><p>${E(d.problem)}</p></div><div><label>Impact</label><p>${E(d.impact)}</p></div><div><label id="kdrisk">At risk</label><p>${E(d.risk)}</p></div><div><label id="kdres">Expected result</label><p>${E(d.result)}</p></div></div>
 <div id="kdgate"></div>
 <div class="kd-main">
  <div class="kd-col">
   <div class="kd-card"><div class="kd-ch">${tmark(d.metric[6]||d.tools[0])}<b>${E(TOOLS[d.metric[6]||d.tools[0]].n)}</b><span>live · ${E(d.metricSrc||'1 s refresh')}</span></div><div class="kd-chart"><div class="kd-cl"><span>${E(d.metric[0])}</span><span>last 20 s</span></div><div id="kdchart"></div></div></div>
   <div class="kd-stats" id="kdstats"></div>
   <div class="kd-card kd-al"><div class="kd-ch">${tmark(d.metric[6]||d.tools[0])}<b>Alerts</b><span id="kdalc"></span><em id="kdinc"></em></div><div id="kdalerts" class="kd-alist"></div></div>
  </div>
  <div class="kd-col">
   <div class="kd-card kd-code"><div class="kd-ch"><span class="kd-tag">${tmark(ex,14)} ${E(TOOLS[ex].n)}</span><span class="mono">${E(d.rb[3])}</span><span id="kdcst" class="r">READY</span></div><div id="kdcode" class="kd-src"></div></div>
   <div class="kd-card kd-term"><div class="kd-ch"><i class="dots"><b></b><b></b><b></b></i><span class="mono">${E(d.rb[2]==='voice'?'copilot-studio@contact-centre: ~/actions':'runner@kirby-hub: ~/runbooks')}</span></div><div id="kdterm" class="kd-tx"></div></div>
  </div>
  <div class="kd-col">
   <div class="kd-card kd-dec"><div class="kd-ch"><i class="kd-mk">${MK}</i><b>Copilot Studio decisions</b><span id="kdag" class="r"></span></div><div id="kdlog" class="kd-log"></div></div>
   <div class="kd-card kd-sn"><div class="kd-snh"><img src="assets/logos/servicenow.png" alt="ServiceNow"><b>${E(d.inc)}</b><span id="kdtst" class="kd-st">—</span></div><div class="kd-snb"><b>${E(d.title)}</b><div class="kd-kv"><span>Priority <b>${E(d.pri)}</b></span><span>Group <b>${E(d.group)}</b></span><span>Assigned <b>Copilot Studio</b></span><span>CI <b>${E(d.ci)}</b></span></div><h5>Activity · newest first</h5><div id="kdnotes" class="kd-notes"></div></div><div class="kd-snf"><button class="kd-b sm" onclick="kx.closeDemo();if(typeof kx.open==='function')kx.open('${E(d.inc)}')">Open the ticket</button><button class="kd-b sm" onclick="kx.closeDemo();go('${d.screen||'incidents'}')">Open in console</button></div></div>
  </div>
 </div>
 <div class="kd-f"><span id="kdfoot">Copilot Studio is working.</span><span class="sp"></span><span class="kd-n">Demo ${i+1} of ${kx.DEMOS.length}</span><button class="kd-b sm" onclick="kx.prevDemo()">Previous</button><button class="kd-b sm" onclick="kx.nextDemo()">Next</button><span class="kd-seg">${[1,2,4].map(s=>`<button class="${R.speed===s?'on':''}" onclick="kx.speed(${s})">${s}×</button>`).join('')}</span><button class="kd-b sm" onclick="kx.skip()">Skip to end</button></div>
 </div>`;
 drawAll()}
function drawAll(){if(!$k('kdstage'))return;drawPh();drawTiles();drawGate();drawLog();drawCode();drawTerm();drawTicket();drawLive()}
function drawPh(){const fl=['Detect','Correlate','Decide','Act','Verify','Record'];const p=R.done?6:R.phase==null?-1:R.phase;$k('kdph').innerHTML=fl.map((f,i)=>`<span class="${i<p?'done':i===p?'now':''}"><i>${i<p?'✓':i+1}</i>${f}</span>`).join('<em></em>')+`<small>Run RUN-${String(1000+kx.DEMOS.indexOf(R.d)).slice(1)} · ${E(R.d.rb[0])}</small>`}
function drawTiles(){$k('kdtiles').innerHTML=R.d.tools.map(k=>{const t=TOOLS[k],s=R.tiles[k]||['idle',''];return `<div class="kd-tl ${s[0]}"><div class="a">${tmark(k)}<span>${E(t.n)}</span><b>${R.cnt[k]||''}</b><i class="dot"></i></div><div class="b">${E(s[1])}</div></div>`}).join('')}
function drawGate(){const g=$k('kdgate');if(!g)return;if(R.gate&&R.gate.kind==='ON'){g.innerHTML=`<div class="kd-gate on"><span class="kd-spin"></span><b>Copilot Studio runs this in ${R.gate.left} s unless someone stops it.</b><span>${E(R.d.rb[0])} · ${E(R.d.rb[1])}</span><button class="kd-b stop" onclick="kx.stop()">■ Stop</button></div>`;return}
 if(R.gate&&R.gate.kind==='IN'){g.innerHTML=`<div class="kd-gate in"><b>Waiting for ${E(R.d.approver||'approval')} in Teams.</b><span>Plan, evidence and rollback are on ${E(R.d.inc)}. ${R.auto?'Guided demo approves in a few seconds.':''}</span><button class="kd-b ok" onclick="kx.decide(true)">✓ Approve</button><button class="kd-b" onclick="kx.decide(false)">Decline</button></div>`;return}
 if(R.done||R.stopped)return;g.innerHTML=''}
function endCard(held){const g=$k('kdgate');const d=R.d;const i=kx.DEMOS.indexOf(d),n=kx.DEMOS[(i+1)%kx.DEMOS.length];
 const rl=$k('kdrisk');if(rl&&!held){rl.textContent='Protected';rl.classList.add('ok')}const rs=$k('kdres');if(rs&&!held){rs.textContent='Result';rs.classList.add('ok')}
 g.innerHTML=`<div class="kd-gate ${held?'held':'res'}"><b>${held?'Held: no change made. A person decides next.':'✓ '+E(d.outcome)}</b><span class="sp"></span><button class="kd-b sm" onclick="kx.play('${d.id}')">Replay</button><button class="kd-b sm" onclick="kx.explain()">Explain</button><button class="kd-b sm ok" onclick="kx.play('${n.id}')">Next demo: ${E(n.title.slice(0,40))}${n.title.length>40?'…':''} →</button></div>`;
 const f=$k('kdfoot');if(f)f.innerHTML=held?'Held for a person. The plan, evidence and the reason are on the ticket.':`<b>Outcome:</b> ${E(d.outcome)}`;
 const st=$k('kdstate');if(st)st.textContent=held?'HELD':'RESOLVED'}
const TAGC={INTAKE:'in',CALLER:'in',AGENT:'cp',CORRELATE:'cp',EVIDENCE:'ev','RULED OUT':'ro',DIAGNOSE:'dg','PRE-CHECK':'pc',DECIDE:'de',APPROVAL:'ap',CREDENTIAL:'cr',ACT:'ac',VERIFY:'ok',TICKET:'tk',NOTIFY:'nt',LEARN:'lr',DONE:'ok'};
function drawLog(){$k('kdlog').innerHTML=R.log.slice(0,40).map((l,i)=>`<div class="${i===0?'nw':''}"><time>${l.t}</time><span class="kd-tg ${TAGC[l.tag]||''}">${E(l.tag)}</span><p>${E(l.text)}${l.agent&&i<1?`<small>${E(l.agent)}</small>`:''}</p></div>`).join('')||'<p class="kd-empty">Waiting for the first signal.</p>';const ag=$k('kdag');if(ag)ag.textContent=R.log[0]&&R.log[0].agent?R.log[0].agent:''}
function codeLines(){const d=R.d,k=d.rb[2];if(d.code)return d.code;
 if(k==='ansible'){const L=[`# Copilot Studio runbook ${d.rb[0]}: ${d.rb[1]}`,`- name: ${d.rb[1]}`,`  hosts: ${d.rb[4]}`,`  gather_facts: false`,`  tasks:`];d.tasks.forEach((t,i)=>{L.push(`    - name: ${t[0]}`);t[1].split('\n').forEach((x,j)=>L.push((j?'        ':'      ')+x));L.push('')});return L}
 if(k==='kql'){const L=[`// Copilot Studio hunt ${d.rb[0]}: ${d.rb[1]}`];d.tasks.forEach(t=>{L.push(`// ${t[0]}`);t[1].split('\n').forEach(x=>L.push(x));L.push('')});return L}
 if(k==='voice'){return (d.call||[]).map(c=>(c[0]==='a'?'AGENT  ':'CALLER ')+c[1])}
 if(k==='python'){const L=[`# Copilot Studio runbook ${d.rb[0]}: ${d.rb[1]}`,`# runs on the Azure Automation hybrid worker in the India hub`];d.tasks.forEach((t,i)=>{L.push(`# step ${i+1}: ${t[0]}`);t[1].split('\n').forEach(x=>L.push(x));L.push('')});return L}
 const L=[`# Copilot Studio runbook ${d.rb[0]}: ${d.rb[1]}`,`# Azure Automation · hybrid worker HYD-HW-01 · PowerShell 7.4`,`param([string]$Target = '${d.rb[4]}', [string]$Ticket = '${d.inc}')`,''];d.tasks.forEach((t,i)=>{L.push(`# Step ${i+1}: ${t[0]}`);t[1].split('\n').forEach(x=>L.push(x));L.push('')});return L}
function drawCode(){const d=R.d,L=codeLines(),k=d.rb[2];let cur=-1,done=-1;
 if(k==='voice'){cur=R.say==null?-1:R.say;done=cur-1}
 else{const hdr=L.map((l,i)=>/^\s*- name: |^# Step \d|^\/\/ |^# step \d/.test(l)&&!/^# Copilot|^\/\/ Copilot/.test(l)?i:-1).filter(i=>i>=0);const taskHdr=k==='ansible'?hdr.slice(1):hdr;cur=R.cur>=0?taskHdr[R.cur]:-1;done=R.cur>0?taskHdr[R.cur-1]:-1;R._hdr=taskHdr}
 const box=$k('kdcode');box.innerHTML=L.map((l,i)=>{const isT=R._hdr&&R._hdr.includes(i);const ti=R._hdr?R._hdr.indexOf(i):-1;const st=k==='voice'?(i<=cur?'ok':''):(ti>=0&&ti<R.cur?'ok':ti===R.cur&&R.cur>=0?'run':'');return `<div class="${i===cur?'hl':''} ${k==='voice'&&i>cur?'fut':''}"><i>${i+1}</i><span>${syn(l,k)}</span>${st==='ok'?'<b class="tk">✓</b>':st==='run'&&!R.done?'<b class="sp2"></b>':''}</div>`}).join('');
 const el=box.querySelector('.hl');if(el)box.scrollTop=Math.max(0,el.offsetTop-box.clientHeight/3);
 const cs=$k('kdcst');if(cs)cs.textContent=R.done?'DONE':R.cur>=0?'RUNNING':R.gate?'WAITING':'READY'}
function syn(l,k){let s=E(l);if(/^\s*(#|\/\/)/.test(l))return `<em class="c">${s}</em>`;if(k==='voice')return s.replace(/^(AGENT|CALLER)/,'<b class="k">$1</b>');s=s.replace(/^(\s*-?\s*)([\w.\-]+):/,'$1<b class="k">$2</b>:').replace(/(&quot;[^&]*&quot;|'[^']*')/g,'<em class="s">$1</em>').replace(/\b(Invoke-[\w-]+|Get-[\w-]+|Set-[\w-]+|Restart-[\w-]+|New-[\w-]+|Start-[\w-]+|Stop-[\w-]+|Remove-[\w-]+|Update-[\w-]+|Add-[\w-]+|Test-[\w-]+|Resize-[\w-]+|Disable-[\w-]+|Enable-[\w-]+|Revoke-[\w-]+|Move-[\w-]+|Clear-[\w-]+|Send-[\w-]+)\b/g,'<b class="f">$1</b>').replace(/\b(where|summarize|project|join|extend|by|and|or|ago|import|def|return|if|for|in)\b/g,'<b class="k">$1</b>');return s}
function drawTerm(){const t=$k('kdterm');const g=R.gate&&R.gate.kind==='ON'?[{c:'h',t:`# ${R.d.rb[0]} starts in ${R.gate.left} seconds unless someone stops it.`}]:R.gate&&R.gate.kind==='IN'?[{c:'h',t:`# ${R.d.rb[0]} is staged. Waiting for approval in Teams.`}]:[];const all=[...R.term,...g];t.innerHTML=all.map(x=>`<div class="${x.c}">${E(x.t)}</div>`).join('')||`<div class="dim"># ${E(R.d.rb[0])} ${E(R.d.rb[1])}: waiting for a decision</div>`;t.scrollTop=t.scrollHeight}
function drawTicket(){const st=$k('kdtst');if(st){st.textContent=R.ticket;st.className='kd-st '+(R.ticket==='Resolved'?'ok':R.ticket==='On Hold'||R.ticket==='Awaiting approval'?'wait':'')}const n=$k('kdnotes');if(n)n.innerHTML=R.notes.map(x=>`<div><time>${clk()}</time><b>${E(x[0])}</b><p>${E(x[1])}</p></div>`).join('')||'<p class="kd-empty">No record yet. ServiceNow raises it once the signals are correlated.</p>'}
function drawLive(){if(!$k('kdstage')||!R.d)return;const d=R.d,m=d.metric;
 $k('kdtime').textContent=fmtT(R.el);const st=$k('kdstate');if(st&&!R.done&&!R.stopped)st.textContent=R.gate?(R.gate.kind==='ON'?'STARTS IN '+R.gate.left+' s':'WAITING FOR APPROVAL'):(R.state||'STARTING');
 // chart
 const w=560,h=200,l=40,r=8,t=10,b=18;const mx=Math.max(m[5]*1.3,...R.series,m[3])*1.05,mn=0;const X=i=>l+i/(R.series.length-1)*(w-l-r),Y=v=>t+(1-(v-mn)/(mx-mn))*(h-t-b);const bad=m[3]>m[2];
 const path=R.series.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('');const now=R.series[R.series.length-1];const over=bad?now>=m[5]:now<=m[5];
 let s=`<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="none" style="height:100%">`;
 s+=`<rect x="${l}" y="${t}" width="${w-l-r}" height="${Y(m[5])-t}" fill="${bad?'rgba(239,68,68,.10)':'rgba(34,197,94,.08)'}"/><rect x="${l}" y="${Y(m[5])}" width="${w-l-r}" height="${h-b-Y(m[5])}" fill="${bad?'rgba(34,197,94,.08)':'rgba(239,68,68,.10)'}"/>`;
 [0,.5,1].forEach(f=>{const v=mx*f;s+=`<text x="${l-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#7f8a96">${+v.toFixed(v<10?1:0)}${E(m[1])}</text>`});
 s+=`<line x1="${l}" x2="${w-r}" y1="${Y(m[5])}" y2="${Y(m[5])}" stroke="#ef4444" stroke-dasharray="5 4"/><text x="${w-r-4}" y="${Y(m[5])-5}" text-anchor="end" font-size="11" fill="#f87171">threshold ${m[5]}${E(m[1])}</text>`;
 if(R.acted>=0)s+=`<line x1="${X(R.acted)}" x2="${X(R.acted)}" y1="${t}" y2="${h-b}" stroke="#60a5fa" stroke-dasharray="3 3"/><text x="${X(R.acted)-4}" y="${h-b-6}" text-anchor="end" font-size="11" fill="#93c5fd">Copilot Studio acted</text>`;
 s+=`<path d="${path}" fill="none" stroke="${over?'#f87171':'#4ade80'}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="${X(R.series.length-1)}" cy="${Y(now)}" r="4" fill="${over?'#f87171':'#4ade80'}"/><text x="${l+8}" y="${t+16}" font-size="12" font-weight="700" fill="${over?'#f87171':'#4ade80'}">now ${now}${E(m[1])}</text></svg>`;
 $k('kdchart').innerHTML=s;
 const firing=R.pool.filter((a,i)=>i<(R.shown||0)&&a.st!=='cleared').length;
 $k('kdstats').innerHTML=`<div class="kd-sc"><label>Alerts firing</label><b class="${firing?'bad':'ok'}">${firing}</b><small>of ${R.pool.length} raw</small></div><div class="kd-sc"><label>State</label><b class="${R.done?'ok':'info'}" style="font-size:16px">${E(R.done?'RESOLVED':R.stopped?'HELD':(R.state||'STARTING'))}</b><small>${E(d.rb[0])}</small></div><div class="kd-sc"><label>Now</label><b class="${over?'bad':'ok'}">${now}${E(m[1])}</b><small>was ${m[2]}${E(m[1])} · target ${bad?'under':'over'} ${m[5]}${E(m[1])}</small></div>`;
 const sh=R.pool.slice(0,R.shown||0).slice().reverse();$k('kdalc').textContent=`${sh.length} shown of ${R.pool.length}`;$k('kdinc').textContent=R.alertMode==='group'||R.alertMode==='stream'&&R.ticket!=='—'?'→ '+d.inc:'';
 $k('kdalerts').innerHTML=sh.slice(0,40).map(a=>`<div class="${a.st}"><span class="sv ${a.sev}">${a.sev==='crit'?'CRITICAL':a.sev==='warn'?'WARNING':'INFO'}</span>${tmark(a.src,14)}<span class="tx">${E(a.txt)}</span><span class="wh">${E(a.where)}</span>${a.n?`<span class="nn">${E(a.n)}</span>`:''}<span class="tg">${a.st==='firing'?'':a.st}</span></div>`).join('')||'<p class="kd-empty">Quiet. Waiting for the first signal.</p>'}

/* ---------- controls ---------- */
kx.speed=s=>{R.speed=s;document.querySelectorAll('.kd-seg button').forEach(b=>b.classList.toggle('on',b.textContent===s+'×'))};
kx.skip=()=>{if(!R.d||R.done)return;clearTimeout(R.timer);if(R.gate){R.gate=null;logAdd({tag:'APPROVAL',text:R.d.mode==='IN'?`Approved by ${(R.d.approver||'approver').split('·')[0].trim()} in Teams`:'No stop received: proceeding',agent:'Change guard'})}while(R.i<R.steps.length-1){R.i++;const st=R.steps[R.i];apply(st);if(st.done)break}R.target=R.d.metric[4];R.mval=R.d.metric[4];R.series=R.series.map((v,i)=>i>28?R.d.metric[4]:v);R.shown=R.pool.length;finish()};
kx.nextDemo=()=>{const i=kx.DEMOS.indexOf(R.d);kx.play(kx.DEMOS[(i+1)%kx.DEMOS.length].id)};
kx.prevDemo=()=>{const i=kx.DEMOS.indexOf(R.d);kx.play(kx.DEMOS[(i-1+kx.DEMOS.length)%kx.DEMOS.length].id)};
document.addEventListener('keydown',e=>{if(!R.d||!$k('kdstage'))return;if(e.key==='Escape'){if($k('kdx'))$k('kdx').remove();else kx.closeDemo()}if(e.key==='ArrowRight')kx.nextDemo();if(e.key==='ArrowLeft')kx.prevDemo()});

/* ---------- Explain: business view and technical view ---------- */
kx.explain=(id,view)=>{const d=id?kx.DEMOS.find(x=>x.id===id):R.d;if(!d)return;const v=view||'biz';let x=$k('kdx');if(!x){x=document.createElement('div');x.id='kdx';x.className='kd-x';document.body.appendChild(x)}
 const ex=d.exec||EXEC[d.rb[2]];const src=d.metric[6]||d.tools[0];
 const biz=`<div class="kd-xg"><div><h5>Problem</h5><p>${E(d.problem)}</p></div><div><h5>Impact</h5><p>${E(d.impact)}</p></div><div><h5>What was protected</h5><p>${E(d.risk)}</p></div><div><h5>Result</h5><p>${E(d.outcome)}</p></div></div>
 <h5>In five steps</h5><ol class="kd-5"><li><b>Summary.</b> ${E(d.line||d.problem)}</li><li><b>Root cause (${d.conf}%).</b> ${E(d.cause)}</li><li><b>Actions.</b> ${E(d.tasks.map(t=>t[0]).join('; '))}.</li><li><b>Records.</b> One ServiceNow ticket ${E(d.inc)} (${E(d.pri)}, ${E(d.group)}) with evidence, decisions and runbook output.</li><li><b>Resolution.</b> ${E((d.verify||[]).join('; '))}.</li></ol>
 <h5>Evidence</h5><ul>${(d.evidence||[]).map(e=>`<li>${E(e[1]||e)}</li>`).join('')}</ul><h5>Ruled out</h5><ul>${(d.ruled||[]).map(r=>`<li>${E(r)}</li>`).join('')}</ul>`;
 const tech=`<div class="kd-q"><h5>1. Where the data comes from</h5><p>${E(d.feeds||`${TOOLS[src].n} collects ${d.metric[0].toLowerCase()} for ${d.ci} every 60 seconds (critical metrics every 30 seconds) and forwards alerts by webhook to Copilot Studio through ServiceNow Event Management. No duplicate collectors: Azure Monitor and CloudWatch feed OpsRamp.`)}</p></div>
 <div class="kd-q"><h5>2. The alert and its threshold</h5><p>${E(d.rule||`${d.metric[0]} ${d.metric[3]>d.metric[2]?'above':'below'} ${d.metric[5]}${d.metric[1]} for 5 minutes. The threshold is kept in the OpsRamp monitoring template for this CI class and mirrored in the ServiceNow event rule.`)}</p></div>
 <div class="kd-q"><h5>3. How it is confirmed</h5><p>${E((d.evidence||[]).map(e=>e[1]||e).join(' '))} Ruled out: ${E((d.ruled||[]).join('; '))}.</p></div>
 <div class="kd-q"><h5>4. How the action is taken</h5><p>Runbook ${E(d.rb[0])} "${E(d.rb[1])}" runs on ${E(TOOLS[ex].n)} against ${E(d.rb[4])}. ${E(d.rb[2]==='voice'?'The voice agent calls actions through Power Automate agent flows.':'The credential is a one-time Azure Key Vault secret scoped to this target, checked out for 15 minutes and rotated afterwards.')} Steps: ${E(d.tasks.map((t,i)=>(i+1)+'. '+t[0]).join(' '))} Undo: ${E(d.back||'restore the previous state')}.</p></div>
 <div class="kd-q"><h5>5. How it is checked afterwards</h5><p>${E((d.verify||[]).join('. '))}. The incident closes only when the checks hold for 10 minutes.</p></div>
 <div class="kd-q"><h5>6. The control mode and why</h5><p><b>${E(MODES[d.mode].long)}.</b> ${E(d.modeWhy||MODES[d.mode].why)}${d.approver?' Approver: '+E(d.approver)+'.':''}</p></div>`;
 x.innerHTML=`<div class="kd-xw" role="dialog" aria-label="Explain"><div class="kd-xh"><div><small>${E(d.tower)} · ${E(d.id)}</small><b>${E(d.title)}</b></div><span class="kd-seg"><button class="${v==='biz'?'on':''}" onclick="kx.explain('${d.id}','biz')">Business view</button><button class="${v==='tech'?'on':''}" onclick="kx.explain('${d.id}','tech')">Technical view</button></span><button class="kd-b x" onclick="document.getElementById('kdx').remove()">✕</button></div><div class="kd-xb">${v==='biz'?biz:tech}</div></div>`;
 x.onclick=e=>{if(e.target===x)x.remove()}};

/* old demo buttons across the console open the new engine */
const OLD={D01:'NOC-01',D02:'NOC-02',D03:'CMP-03',D04:'NET-01',D05:'BDR-01',D06:'SOC-01',D07:'SOC-02',D08:'SOC-03',D09:'BDR-04',D10:'INT-01'};
kx.OLD=OLD;
})();
