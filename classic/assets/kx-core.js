/* Kirby Operations Hub: Copilot Studio as the AI and action layer, plus drill-down on every screen.
   Loads after hub.js. Everything here is sample data. Nothing calls a live system. */
(function(){
'use strict';
const kx=window.kx={};

/* ---------- small helpers ---------- */
const rng=seed=>{let h=typeof seed==='number'?seed:hash(String(seed));return()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296}};
const ser=(seed,n,base,amp,trend=0,min=0,max=1e9)=>{const r=rng(seed);let v=base;return Array.from({length:n},(_,i)=>{v+=(r()-.5)*amp+trend;v+=(base+trend*i-v)*.18;return +Math.min(max,Math.max(min,v)).toFixed(base<10?2:base<100?1:0)})};
const pk=(r,a)=>a[Math.floor(r()*a.length)];
const nowT=()=>new Date(S.now).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Asia/Kolkata'});
const wk=n=>Array.from({length:n},(_,i)=>'W'+(i+1));
const COL=['var(--s1)','var(--s2)','var(--s3)','var(--s5)','var(--s4)','var(--info)'];
kx.rng=rng;kx.ser=ser;kx.pk=pk;kx.COL=COL;kx.wk=wk;

const MARK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 5.3L20 9.5l-4.4 3.8L17 19l-5-3-5 3 1.4-5.7L4 9.5l5.8-1.2z"/></svg>';
const mk=(lg)=>`<span class="kx-mk ${lg?'lg':''}" aria-hidden="true">${MARK}</span>`;
kx.mk=mk;
const tierCls=t=>t==='Act'?'kx-t-act':t==='Act and notify'?'kx-t-notify':'kx-t-stage';
const tierChip=t=>`<span class="kx-tier ${tierCls(t)}">${esc(t)}</span>`;
kx.tierChip=tierChip;

/* horizontal bars: [{label,value,max?,color?,text?,dd?}] */
kx.hbars=(items,o={})=>{const mx=o.max||Math.max(...items.map(i=>i.max||i.value))||1;return `<div class="kx-hb">${items.map(i=>`<span class="${i.dd?'kx-dd':''}" ${i.dd?`onclick="kx.open('${esc(i.dd)}')"`:''}>${esc(i.label)}</span><div class="t" data-tip="${esc(i.label+': '+(i.text||i.value))}">${(Array.isArray(i.value)?i.value:[i.value]).map((v,k)=>`<i style="width:${v/(i.max||mx)*100}%;background:${(i.colors||[])[k]||i.color||COL[k]}"></i>`).join('')}</div><span class="v">${esc(i.text!=null?i.text:i.value)}</span>`).join('')}</div>`};
/* heat map: rows, cols, fn(r,c)->0..1, tip(r,c), color */
kx.heat=(rows,cols,fn,tip,color='var(--info)',lw=96)=>{let s=`<div class="kx-hm" style="grid-template-columns:${lw}px repeat(${cols.length},minmax(0,1fr))"><span></span>${cols.map(c=>`<span style="text-align:center">${esc(c)}</span>`).join('')}`;rows.forEach((r,ri)=>{s+=`<span>${esc(r)}</span>`;cols.forEach((c,ci)=>{const v=Math.max(0,Math.min(1,fn(ri,ci)));s+=`<i style="background:${color};opacity:${(.08+v*.92).toFixed(2)}" data-tip="${esc(tip(ri,ci,v))}"></i>`})});return s+'</div>'};
kx.legend=items=>`<div class="kx-leg">${items.map(i=>`<span><i style="background:${i[1]}"></i>${esc(i[0])}</span>`).join('')}</div>`;
kx.stacked=(cols,series,o={})=>{const w=o.w||460,h=o.h||180,l=40,r=8,t=8,b=24;const tot=cols.map((_,i)=>series.reduce((a,s)=>a+s.data[i],0));const mx=o.max||(kx.nm?kx.nm(Math.max(...tot)*1.04):nice(Math.max(...tot)*1.05));const n=cols.length,band=(w-l-r)/n,bw=Math.min(band-3,Math.max(band*.62,4));const Y=v=>t+(1-v/mx)*(h-t-b);let s=`<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(o.label||'Stacked bars')}">`;for(let i=0;i<=4;i++){const v=mx*i/4,y=Y(v);s+=`<line x1="${l}" x2="${w-r}" y1="${y}" y2="${y}" stroke="var(--grid)"/><text x="${l-6}" y="${y+3.5}" text-anchor="end" font-size="10.5" fill="var(--ink3)">${+v.toFixed(mx<10?1:0)}</text>`}
 cols.forEach((c,i)=>{const x=l+i*band+(band-bw)/2;let acc=0;series.forEach(z=>{const y0=Y(acc),y1=Y(acc+z.data[i]);s+=`<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(0,y0-y1-.5)}" fill="${z.color}"/>`;acc+=z.data[i]});s+=`<rect x="${l+i*band}" y="${t}" width="${band}" height="${h-t-b}" fill="transparent" data-tip="${esc(c+'\n'+series.map(z=>z.name+': '+z.data[i]).join('\n'))}"/>`;if(!o.skip||i%o.skip===0)s+=`<text x="${x+bw/2}" y="${h-8}" text-anchor="middle" font-size="10.5" fill="var(--ink3)">${esc(c)}</text>`});
 return s+'</svg>'+kx.legend(series.map(z=>[z.name,z.color]))};
kx.panel=(t,n,b,cls)=>`<div class="card flush ${cls||''}"><div class="hd" style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><h2>${t}</h2>${n?`<span class="note">${n}</span>`:''}</div><div class="kx-pad">${b}</div></div>`;
kx.table=(head,data,o={})=>`<div class="tw"><table class="tbl"><thead><tr>${head.map((h,i)=>`<th class="${(o.n||[]).includes(i)?'n':''}">${h}</th>`).join('')}</tr></thead><tbody>${data.map(r=>`<tr ${r.dd?`data-kx="${esc(r.dd)}"`:''}>${(r.c||r).map((c,i)=>`<td class="${(o.n||[]).includes(i)?'n':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

/* ---------- Copilot Studio agents ---------- */
const AGENTS=[
 {id:'sd',name:'Service Desk agent',ch:'Teams, portal, voice',topics:46,actions:18,s7:3184,res:62,csat:4.5,state:'Production',grounding:'Knowledge base, Intune, Entra, ServiceNow catalog',owner:'Service Desk lead'},
 {id:'noc',name:'NOC agent',ch:'Teams NOC channel, OpsRamp webhook',topics:22,actions:24,s7:1412,res:71,csat:4.4,state:'Production',grounding:'CMDB, OpsRamp topology, runbook library, past incidents',owner:'NOC lead'},
 {id:'soc',name:'SOC agent',ch:'Teams SOC channel, Sentinel automation rule',topics:19,actions:16,s7:688,res:48,csat:4.6,state:'Production',grounding:'Sentinel incidents, Defender evidence, threat intelligence, playbooks',owner:'SOC lead'},
 {id:'chg',name:'Change agent',ch:'ServiceNow change form, Teams approvals',topics:11,actions:9,s7:214,res:83,csat:4.3,state:'Production',grounding:'Change history, CMDB, freeze calendar, risk model',owner:'Change manager'},
 {id:'kb',name:'Knowledge agent',ch:'ServiceNow resolve event',topics:7,actions:5,s7:396,res:88,csat:4.2,state:'Production',grounding:'Resolved tickets, existing articles, SOPs',owner:'Knowledge manager'},
 {id:'fin',name:'FinOps agent',ch:'Teams, Power BI',topics:9,actions:7,s7:162,res:76,csat:4.4,state:'Pilot',grounding:'Azure Cost Management, AWS Cost Explorer, tagging policy',owner:'Cloud FinOps lead'},
 {id:'mi',name:'Major incident agent',ch:'Teams bridge',topics:8,actions:11,s7:41,res:39,csat:4.7,state:'Production',grounding:'Service Graph, incident timeline, comms templates',owner:'Incident manager'}];
kx.AGENTS=AGENTS;
const agent=id=>AGENTS.find(a=>a.id===id)||AGENTS[1];

/* action catalog: what agents can do, through which connector, under which control tier */
const ACTIONS=[
 ['Summarise and find similar incidents','noc','ServiceNow, OpsRamp','Act',1840,99.6,6],
 ['Route and assign with CMDB context','noc','ServiceNow','Act',2210,99.8,3],
 ['Run approved runbook','noc','OpsRamp, Azure Automation','Stage for approval',412,98.8,212],
 ['Restart a hung Windows service','noc','OpsRamp','Act and notify',388,99.2,40],
 ['Open carrier case with evidence','noc','Carrier portal, ServiceNow','Act and notify',58,98.3,24],
 ['Steer SD-WAN traffic','noc','VeloCloud Orchestrator','Stage for approval',31,100,18],
 ['Re-run failed NetWorker save set','noc','NetWorker REST','Act',97,96.9,600],
 ['Enrich and score security incident','soc','Sentinel, Defender, threat intel','Act',1204,99.5,9],
 ['Isolate a device','soc','Defender XDR','Stage for approval',41,100,4],
 ['Revoke sessions and reset password','soc','Entra ID','Stage for approval',29,100,6],
 ['Block domain, hash and IP indicators','soc','Defender, Palo Alto','Act and notify',63,98.4,11],
 ['Hunt across all endpoints','soc','Defender advanced hunting','Act',152,99.3,38],
 ['Reset password and unlock account','sd','Entra ID','Act',1690,99.7,5],
 ['Repair Teams or Outlook (click-to-fix)','sd','Intune remediation','Act and notify',540,97.6,90],
 ['Raise catalog request','sd','ServiceNow catalog','Act',1310,99.9,3],
 ['Hand over to a person with full context','sd','ServiceNow, Teams','Act',820,100,2],
 ['Risk-score a change','chg','ServiceNow change, CMDB','Act',214,100,5],
 ['Request approval in Teams','chg','Teams approvals','Act and notify',260,100,2],
 ['Hold a patch wave','chg','Intune, ServiceNow','Stage for approval',6,100,8],
 ['Draft knowledge article','kb','ServiceNow knowledge','Act',396,99.0,12],
 ['Rightsize recommendation to change','fin','Azure Advisor, ServiceNow','Stage for approval',22,100,15],
 ['Shut down idle dev/test out of hours','fin','Azure Automation, AWS SSM','Act and notify',96,99.0,20],
 ['Open the major-incident bridge','mi','Teams, ServiceNow','Act and notify',9,100,6],
 ['Draft the business update','mi','Teams, Outlook','Stage for approval',14,100,10]];
kx.ACTIONS=ACTIONS;

/* running action log shared by screens */
kx.stream=[];
const STREAM_SEED=[['noc','Route and assign with CMDB context','INC0048222 to Infra / Cloud L2','ok'],['sd','Reset password and unlock account','RITM40142, Haridwar Plant','ok'],['soc','Enrich and score security incident','SEC-3192 scored 82','ok'],['noc','Summarise and find similar incidents','INC0048219, 6 similar','ok'],['chg','Request approval in Teams','CHG30415 to Network lead','wait'],['kb','Draft knowledge article','From INC0048284','ok'],['sd','Repair Teams or Outlook (click-to-fix)','RITM40141, Jeddah','ok'],['fin','Shut down idle dev/test out of hours','6 SAP sandbox VMs','ok'],['noc','Restart a hung Windows service','UiPath on VM Server11','ok'],['soc','Block domain, hash and IP indicators','3 indicators, 4 firewalls','ok']];
STREAM_SEED.forEach((x,i)=>kx.stream.push({t:Date.now()-mins(2+i*4),a:x[0],act:x[1],obj:x[2],st:x[3]}));
const POOL=[['sd','Reset password and unlock account',()=>'RITM'+(40143+Math.floor(Math.random()*40))+', '+pick(SITES).name],['sd','Raise catalog request',()=>'RITM'+(40150+Math.floor(Math.random()*40))+', software request'],['noc','Route and assign with CMDB context',()=>pick(INCIDENTS).no+' to '+pick(['Network L2','Infra / Cloud L2','SAP Basis'])],['noc','Summarise and find similar incidents',()=>pick(INCIDENTS).no+', '+(2+Math.floor(Math.random()*5))+' similar'],['soc','Enrich and score security incident',()=>pick(CASES).no+' scored '+(40+Math.floor(Math.random()*55))],['sd','Repair Teams or Outlook (click-to-fix)',()=>'RITM'+(40160+Math.floor(Math.random()*40))+', '+pick(SITES).name],['kb','Draft knowledge article',()=>'From '+pick(INCIDENTS).no],['noc','Restart a hung Windows service',()=>pick(['Spooler on India Server 12','UiPath on VM Server11','Tekla licence on India Server 27'])]];
function pick(a){return a[Math.floor(Math.random()*a.length)]}
kx.pulse=()=>{const p=pick(POOL);kx.stream.unshift({t:S.now,a:p[0],act:p[1],obj:p[2](),st:'ok',neu:1});if(kx.stream.length>60)kx.stream.pop()};

/* ---------- entity resolution for drill-down ---------- */
const RX=/(INC\d{5,}|SEC-\d{4}|CHG\d{5}|RB-\d{3}|RITM\d{5}|NET-\d{2}|KEMS-\d+|\bL\d{2}\b|MI-\d{4})/;
kx.ref=t=>{const m=String(t).match(RX);return m?m[1]:null};
const siteBy=t=>SITES.find(s=>s.id===t)||SITES.find(s=>s.name===t)||SITES.find(s=>String(t).includes(s.name));

function build(ref,ctx){
 if(!ref)return null;
 if(typeof ref==='object')return ref;
 if(ref.startsWith('agent:'))return bAgent(agent(ref.slice(6)));
 if(ref.startsWith('action:'))return bAction(ACTIONS[+ref.slice(7)]);
 if(ref.startsWith('site:'))return bSite(siteBy(ref.slice(5)));
 if(ref.startsWith('svc:'))return bService(SERVICES.find(s=>s.id===ref.slice(4)||s.name===ref.slice(4)));
 if(ref.startsWith('chart:'))return bChart(ref.slice(6),ctx);
 if(ref.startsWith('row:'))return bRow(ctx);
 let o;
 if((o=INCIDENTS.find(i=>i.no===ref)))return bInc(o);
 if((o=CASES.find(c=>c.no===ref)))return bCase(o);
 if((o=CHANGES.find(c=>c.no===ref)))return bChange(o);
 if((o=RUNBOOKS.find(r=>r[0]===ref)))return bRunbook(o);
 if((o=DESK.find(d=>d[0]===ref)))return bDesk(o);
 if((o=LINKS.find(l=>l.id===ref)))return bLink(o);
 if((o=DEVICES.find(d=>d.id===ref)))return bDevice(o);
 if((o=siteBy(ref)))return bSite(o);
 return bGeneric(ref,ctx);
}

const A=(label,tier,agentId,connector,steps,effect,desc)=>({label,tier,agent:agentId,connector,steps,effect,desc});
const sevCls=s=>s==='P1'||s==='High'?'bad':s==='P2'||s==='Medium'?'warn':'info';

function relFor(text){const out=new Set();String(text).replace(new RegExp(RX.source,'g'),m=>{out.add(m);return m});return [...out]}

function bInc(i){const r=rng(i.no),pr=PRIORITY[i.pri]||PRIORITY.P3,age=Math.round((S.now-i.opened)/60000);const sim=INCIDENTS.filter(x=>x!==i&&(x.svc===i.svc||x.site===i.site)).slice(0,3);const chg=CHANGES.filter(c=>c.site===i.site);const ag=i.src==='SOC'?'soc':'noc';
 return {kind:'Incident',id:i.no,title:i.title,chips:[[i.pri,i.pri],[i.state,'info'],[i.src,'']],crumb:['Incidents',siteName(i.site)],
  kpis:[['Open for',dur(age)],['Respond SLA',pr.tta+' min'],['Resolve SLA',dur(pr.tts)],['Alerts grouped',String(3+Math.floor(r()*40))]],
  kv:[['Site',siteName(i.site)],['Configuration item',i.ci],['Business service',i.svc],['Resolver group',i.team],['Opened',hhmm(i.opened)+' IST'],['Why',i.why]],
  trend:{name:i.ci+' · key metric, last 6 hours',data:ser(i.no,48,60,9,.35,0,100),thr:85,unit:'%'},
  agent:{id:ag,conf:78+Math.floor(r()*18),summary:i.why+' '+(sim.length?`${sim.length} similar record${sim.length>1?'s':''} on the same service or site; the last one was fixed with ${pk(r,['an archive purge after a backup check','a carrier case and QoS change','a service restart','a save set re-run'])}.`:'No similar record in 90 days.'),
   bullets:[`Business impact: ${i.svc} users at ${siteName(i.site)}${SERVICES.find(s=>s.name===i.svc)?.tier===1?' (tier 1 service)':''}.`,`Recommended next step: ${i.state==='Assigned'?'start the matched runbook':i.state==='With carrier'?'chase the carrier with the evidence pack':'confirm the fix and close with evidence'}.`,'Grounded on: CMDB, OpsRamp topology, 90 days of incidents, runbook library.']},
  related:[...sim.map(x=>x.no),...chg.map(c=>c.no),'site:'+i.site,...(SERVICES.find(s=>s.name===i.svc)?['svc:'+SERVICES.find(s=>s.name===i.svc).id]:[]),...relFor(i.why)],
  timeline:[[i.opened,'OpsRamp raised the alert and grouped related events'],[i.opened+mins(1),'ServiceNow incident created with CI and service from the CMDB'],[i.opened+mins(2),'Copilot Studio NOC agent routed it to '+i.team,1],[i.opened+mins(6),'Acknowledged by '+i.team],[S.now-mins(3),'Latest reading attached to the work notes']],
  actions:[A('Summarise for the shift','Act',ag,'ServiceNow, OpsRamp',['Read incident, CI and 6 hours of metrics','Search 90 days of similar incidents','Post the summary to work notes'],null,'Adds a plain-language summary to the ticket'),
   A('Run the matched runbook','Stage for approval',ag,'OpsRamp, ServiceNow',['Match runbook to CI and symptom','Pre-check: backup and dependencies','Attach plan and rollback to the ticket','Wait for approval from the resolver lead','Run and verify for 10 minutes'],()=>{i.state='Monitoring'},'Runs only after a named person approves'),
   A('Escalate to L2 with full context','Act and notify',ag,'ServiceNow, Teams',['Reassign to the L2 group','Attach timeline, metrics and similar fixes','Post in the L2 Teams channel'],()=>{i.state='Assigned'},'No re-asking the user or L1'),
   A('Open a Teams bridge','Act and notify','mi','Teams, ServiceNow',['Create the bridge and invite the on-call','Pin the summary and the service map','Start the shared timeline'],null,'One bridge, one timeline'),
   A('Notify business owners','Act and notify','mi','Teams, Outlook',['Look up service owners in the CMDB','Draft a plain update with ETA','Send to '+i.svc+' owners'],null,'Plain-language update with ETA'),
   A('Close with evidence','Act',ag,'ServiceNow',['Confirm metric back in range for 10 minutes','Attach evidence and root cause','Close and ask the knowledge agent for an article'],()=>{i.state='Closed'},'Closes only when the check passes')]}}

function bCase(c){const r=rng(c.no);const sc=40+Math.floor(r()*58);
 return {kind:'Security case',id:c.no,title:c.title,chips:[[c.sev,sevCls(c.sev)],[c.state,'info'],[c.tactic,'']],crumb:['SOC',siteName(c.site)],
  kpis:[['Risk score',String(sc)],['Asset value',c.crit||'Medium'],['Alerts',String(2+Math.floor(r()*9))],['Age',dur(c.ago||30)]],
  kv:[['Asset',c.asset],['User',c.user],['Source',tok(c.src)],['MITRE',c.tactic+' · '+c.tech],['Analyst',c.analyst],['Site',siteName(c.site)]],
  trend:{name:'Related alerts, last 6 hours',data:ser(c.no,48,4,3,0,0,30),unit:''},
  agent:{id:'soc',conf:70+Math.floor(r()*25),summary:`${c.title}. ${c.user} on ${c.asset}; ${pk(r,['no lateral movement seen so far','one other device saw the same hash','sign-in from a new host 4 minutes earlier'])}. Matches ${c.tech} (${c.tactic}).`,
   bullets:['Blast radius: '+pk(r,['MEA File Server via SMB','2 engineering workstations','no servers reachable']),'Recommended: '+(c.sev==='High'?'isolate the device, revoke sessions, block indicators':'enrich, then close or monitor'),'Grounded on: Sentinel incident, Defender evidence, Entra sign-ins, threat intelligence.']},
  related:['site:'+c.site,...INCIDENTS.filter(i=>i.why&&i.why.includes(c.no)).map(i=>i.no),...CASES.filter(x=>x!==c&&x.site===c.site).slice(0,2).map(x=>x.no)],
  timeline:[[S.now-mins(c.ago||30),tok(c.src)+' raised the first alert'],[S.now-mins((c.ago||30)-1),'Sentinel grouped the alerts into one incident'],[S.now-mins((c.ago||30)-2),'Copilot Studio SOC agent enriched and scored it '+sc,1],[S.now-mins(Math.max(1,(c.ago||30)-8)),'Picked up by '+c.analyst]],
  actions:[A('Enrich and score','Act','soc','Sentinel, Defender, threat intel',['Pull device, user and sign-in evidence','Check hash, domain and IP reputation','Write score and reasoning to the case'],null,'Adds evidence and a score'),
   A('Isolate the device','Stage for approval','soc','Defender XDR',['Confirm the device is not a server or OT','Ask the SOC L2 on shift to approve','Isolate and confirm it is offline'],()=>{c.state='Contained'},'Can be undone from Defender'),
   A('Revoke sessions and reset password','Stage for approval','soc','Entra ID',['Find active sessions for '+c.user,'Ask the SOC L2 on shift to approve','Revoke and force a reset'],null,'User is told in Teams'),
   A('Block indicators','Act and notify','soc','Defender, Palo Alto',['Extract hash, domain and IPs','Push blocks to Defender and 4 firewalls','Post to the SOC channel'],null,'All firewalls in one step'),
   A('Hunt across all endpoints','Act','soc','Defender advanced hunting',['Run KQL for hash, domain and IPs across 2,209 devices','List any hits on the case'],null,'Usually under a minute'),
   A('Close as benign','Act','soc','Sentinel, ServiceNow',['Record the reasoning','Tune the rule to cut repeats','Close in Sentinel and ServiceNow'],()=>{c.state='Closed, benign'},'Reason is kept for audit')]}}

function bChange(c){const r=rng(c.no);const sc=c.risk==='High'?78:c.risk==='Medium'?52:24;
 return {kind:'Change',id:c.no,title:c.title,chips:[[c.risk+' risk',c.risk==='High'?'bad':c.risk==='Medium'?'warn':'good'],[c.state,'info']],crumb:['Approvals & Changes',siteName(c.site)],
  kpis:[['Risk score',String(sc+Math.floor(r()*8))],['Similar, 12 months',String(2+Math.floor(r()*9))],['Success rate','9'+(4+Math.floor(r()*5))+'%'],['Conflicts','0']],
  kv:[['When',c.when],['Approver',c.approver],['Plan',c.plan],['Back-out',c.back],['Site',siteName(c.site)]],
  agent:{id:'chg',conf:84+Math.floor(r()*12),summary:`${c.risk} risk. No overlap with month-end freeze or other changes on the same CIs. Similar changes succeeded ${8+Math.floor(r()*10)} of ${10+Math.floor(r()*10)} times; failures were caused by a missed pre-check.`,bullets:['Pre-checks in the plan: backup verified, standby in sync.','Approver is on shift and reachable in Teams.','Recommended: approve with the pre-check as a gate.']},
  related:['site:'+c.site,...INCIDENTS.filter(i=>i.why&&i.why.includes(c.no)).map(i=>i.no),...relFor(c.plan)],
  timeline:[[S.now-mins(300),'Change raised from the incident'],[S.now-mins(298),'Copilot Studio change agent risk-scored it',1],[S.now-mins(120),'CAB reviewed'],[S.now-mins(20),'Approval requested in Teams',1]],
  actions:[A('Risk-score this change','Act','chg','ServiceNow change, CMDB',['Read affected CIs and services','Compare with 12 months of similar changes','Write the score and reasoning'],null,'Scored the same way every time'),
   A('Check conflicts and freeze windows','Act','chg','ServiceNow, calendar',['Check freeze calendar','Check overlapping changes on the same CIs'],null,'Month-end and plant shutdowns included'),
   A('Send approval in Teams','Act and notify','chg','Teams approvals',['Post the plan, risk and back-out to '+c.approver,'Track the response on the change'],null,'Approver answers from Teams'),
   A('Approve and schedule','Stage for approval','chg','ServiceNow change',['Record approval from '+c.approver,'Schedule for '+c.when,'Tell the implementer'],()=>{c.state='Scheduled'},'A person approves')]}}

function bRunbook(b){const[id,name,team,tier,runs,fails,save]=b;
 return {kind:'Runbook',id,title:name,chips:[[tier,tier==='Autonomous'?'good':tier==='Stage'?'brand':'info'],[team,'']],crumb:['AI & Automation'],
  kpis:[['Runs, 90 days',String(runs)],['Failures',String(fails)],['Success',(100-fails/Math.max(1,runs)*100).toFixed(1)+'%'],['Hours saved',String(Math.round(runs*save/60))]],
  kv:[['Called by','Copilot Studio '+(team==='SOC'?'SOC':'NOC')+' agent'],['Control tier',tier],['Minutes saved each',String(save)],['Promotion rule','25 clean runs to Act and notify, 100 to Autonomous']],
  chart:{title:'Runs per week',html:barChart(ser(id,12,runs/13,runs/30,0,0).map((v,i)=>({label:'W'+(i+1),value:Math.round(v),color:'var(--s2)'})),{h:150})},
  agent:{id:team==='SOC'?'soc':'noc',conf:91,summary:`${name} has ${runs} runs and ${fails} failure${fails===1?'':'s'} in 90 days. ${tier==='Stage'&&runs>=25&&fails===0?'It qualifies for promotion to Act and notify.':'It stays at its current tier.'}`,bullets:['Each run writes evidence to the ticket.','A failed verification moves it back one tier.']},
  related:INCIDENTS.filter(i=>i.why&&i.why.includes(id)).map(i=>i.no),
  actions:[A('Dry run on a test CI','Act',team==='SOC'?'soc':'noc','OpsRamp',['Run with --check on the test CI','Report what would change'],null,'Changes nothing'),
   A('Run now on its target','Stage for approval',team==='SOC'?'soc':'noc','OpsRamp, ServiceNow',['Pre-check','Ask '+team+' lead to approve','Run','Verify and attach evidence'],null,'Runs after approval'),
   A('Propose promotion','Stage for approval','chg','ServiceNow',['Compile run history and failures','Send to the automation board'],()=>{if(b[3]==='Stage')b[3]='Act and notify'},'The board decides')]}}

function bDesk(d){const[id,t,site,ch,st,m,who]=d;const r=rng(id);
 return {kind:'Service request',id,title:t,chips:[[st,st==='Resolved'?'good':'info'],[who==='Copilot'?'Copilot Studio':'Agent','']],crumb:['Service Desk',site],
  kpis:[['Time to resolve',m+' min'],['Channel',pk(r,['Teams','Portal','Voice'])],['CSAT',(4+r()).toFixed(1)],['Touches',who==='Copilot'?'0':'2']],
  kv:[['Site',site],['How',ch],['Handled by',who==='Copilot'?'Copilot Studio Service Desk agent':'Service Desk agent']],
  agent:{id:'sd',conf:88,summary:`${t}. ${who==='Copilot'?'Resolved by the agent without a person: it verified the user in Entra and ran the action.':'Handed to a person because it needs a licence check; the full conversation went with it.'}`,bullets:['Topic: '+pk(r,['Access','Collaboration','Software','Hardware']),'Knowledge used: KB0010'+(10+Math.floor(r()*80))]},
  chat:[['u',t],['a','I can help with that. I have checked your account in Entra.'],['a',who==='Copilot'?'Done. '+ch+' completed. Anything else?':'This needs a person. I have passed it to the desk with everything you told me.'],['u','Thanks']],
  related:['site:'+(siteBy(site)?.id||'hyd')],
  actions:[A('Draft a reply to the user','Act','sd','Teams',['Read the conversation','Draft the reply in plain language'],null,''),
   A('Resolve with click-to-fix','Act and notify','sd','Intune remediation',['Run the remediation on the device','Confirm with the user in Teams'],()=>{d[4]='Resolved'},''),
   A('Turn into a knowledge article','Act','kb','ServiceNow knowledge',['Draft the article from the fix','Send to the knowledge reviewer'],null,'')]}}

function bSite(s){if(!s)return bGeneric('Site');const r=rng(s.id);const inc=INCIDENTS.filter(i=>i.site===s.id&&i.state!=='Closed'),cs=CASES.filter(c=>c.site===s.id),ln=LINKS.filter(l=>l.site===s.id),dv=DEVICES.filter(d=>d.site===s.id);const h=siteHealth(s.id);
 return {kind:'Site',id:s.code||s.id,title:s.name,chips:[[h==='good'?'Healthy':h==='warn'?'Degraded':'Down',h],[s.kind,''],[s.country,'']],crumb:['Sites'],
  kpis:[['Users',String(s.users||0)],['Links',String(ln.length)],['Devices',String(dv.length)],['Open incidents',String(inc.length)]],
  kv:[['Kind',s.kind],['Country',s.country],['Security cases',String(cs.length)],['Site IT contact',pk(r,['Duc T.','Faisal N.','Rahul D.','Ritu B.'])]],
  trend:{name:'Users online, today',data:ser(s.id,48,(s.users||50)*.7,(s.users||50)*.08,0,0),unit:''},
  chart:ln.length?{title:'Links at this site',html:kx.hbars(ln.map(l=>({label:l.id+' · '+l.isp+' '+l.label,value:Math.round(l.util),max:100,text:Math.round(l.util)+'%',color:l.util>=85?'var(--warnbar)':'var(--s2)',dd:l.id})))}:null,
  agent:{id:'noc',conf:82,summary:inc.length?`${inc.length} open incident${inc.length>1?'s':''} at ${s.name}. ${inc[0].title}.`:`${s.name} is quiet. No open incidents; all links within normal range.`,bullets:[ln.some(l=>l.util>=85)?'One link is running hot during shift hours.':'Link use is within range.','Next maintenance window: Sunday 01:00 local.']},
  related:[...inc.map(i=>i.no),...cs.map(c=>c.no),...ln.map(l=>l.id),...dv.slice(0,4).map(d=>d.id)],
  actions:[A('Run a site health check','Act','noc','OpsRamp',['Poll devices and links at '+s.name,'Compare to the 7-day baseline','Post the result'],null,''),
   A('Open Site 360','Act','noc','Console',['Open the site view'],()=>{S.site360=s.id;kx.close();go('site')},''),
   A('Notify the site IT coordinator','Act and notify','noc','Teams',['Draft a plain status for '+s.name,'Send in Teams'],null,''),
   A('Open carrier case','Act and notify','noc','Carrier portal',['Collect latency and loss evidence','Open the case with the carrier','Link it to the incident'],null,'')]}}

function bLink(l){const s=siteById(l.site);
 return {kind:'WAN link',id:l.id,title:`${s?s.name:l.site} to ${l.to}`,chips:[[l.type,''],[l.isp,''],[Math.round(l.util)+'% used',utilCls(l.util)]],crumb:['Network & Links',s?s.name:''],
  kpis:[['Capacity',l.label],['Use',Math.round(l.util)+'%'],['Latency',Math.round(l.lat)+' ms'],['Loss',l.loss.toFixed(2)+'%']],
  trend:{name:'Use, last 6 hours',data:ser(l.id,48,l.util,6,0,0,100),thr:85,unit:'%'},
  agent:{id:'noc',conf:86,summary:l.util>=85?`${l.id} is near capacity at shift hours. It is load, not a fault.`:`${l.id} is healthy.`,bullets:[l.mbps<=4?'This is a thin backup link: failing over to it would not carry the site.':'Failover path is sized for the site.','Carrier '+l.isp+': last case closed in '+(2+l.id.charCodeAt(2)%5)+' hours.']},
  related:['site:'+l.site,...INCIDENTS.filter(i=>i.ci===l.id).map(i=>i.no)],
  actions:[A('Test path and latency','Act','noc','OpsRamp, VeloCloud',['Run path test to the hub','Report latency, jitter and loss'],null,''),
   A('Steer SD-WAN traffic','Stage for approval','noc','VeloCloud Orchestrator',['Prefer SAP over bulk traffic on '+l.id,'Ask Network L2 to approve','Apply and watch for 10 minutes'],null,''),
   A('Open carrier case','Act and notify','noc','Carrier portal',['Collect evidence','Open the case with '+l.isp],null,'')]}}

function bDevice(d){const s=siteById(d.site);const r=rng(d.id);
 return {kind:'Network device',id:d.id,title:`${d.oem} ${d.model}`,chips:[[d.kind,''],[s?s.name:d.site,'']],crumb:['Hybrid Estate',s?s.name:''],
  kpis:[['CPU',Math.round(20+r()*50)+'%'],['Memory',Math.round(30+r()*50)+'%'],['Uptime',Math.round(20+r()*300)+' d'],['Config backup',pk(r,['Today','Yesterday'])]],
  trend:{name:'CPU, last 6 hours',data:ser(d.id,48,35,10,0,0,100),unit:'%'},
  agent:{id:'noc',conf:80,summary:`${d.oem} ${d.model} at ${s?s.name:d.site}. ${/3750|2960|C9/.test(d.model)?'This model is past end of support; plan a replacement.':'Firmware is on a supported release.'}`,bullets:['Last config change: '+(2+Math.floor(r()*40))+' days ago.']},
  related:['site:'+d.site],
  actions:[A('Pull config backup','Act','noc','OpsRamp',['Fetch running config','Diff against last backup','Store in the backup vault'],null,''),
   A('Check support status','Act','noc','Vendor API',['Look up end-of-support date','Write it to the CMDB'],null,''),
   A('Raise replacement change','Stage for approval','chg','ServiceNow change',['Draft change with model and site','Ask Network lead to approve'],null,'')]}}

function bService(v){if(!v)return bGeneric('Service');const r=rng(v.id);
 return {kind:'Business service',id:v.name,title:v.name,chips:[['Tier '+v.tier,v.tier===1?'brand':''],[svcState(v.id,v.name)==='good'?'Healthy':'Attention',svcState(v.id,v.name)==='good'?'good':'warn']].filter(c=>c[0]),crumb:['Service Map & CMDB'],
  kpis:[['CIs',String(v.cis.length)],['Depends on',String(v.deps.length)],['Feeds',String(v.upstream.length)],['Availability','99.9'+Math.floor(r()*10)+'%']],
  kv:[['Owner',v.owner],['CIs',v.cis.join(', ')]],
  trend:{name:'Response time, last 6 hours',data:ser(v.id,48,320,40,0,100),unit:' ms'},
  agent:{id:'noc',conf:83,summary:`${v.name} depends on ${v.deps.length} services and feeds ${v.upstream.length}. Any incident on ${v.cis[0]} affects it directly.`,bullets:['CMDB relationships last verified by discovery today.']},
  related:INCIDENTS.filter(i=>i.svc===v.name).map(i=>i.no),
  actions:[A('Explain the impact path','Act','noc','ServiceNow Service Graph',['Walk dependencies','List affected user groups'],null,''),
   A('Notify service owner','Act and notify','mi','Teams',['Draft status for '+v.owner,'Send in Teams'],null,'')]}}

function bAgent(a){const r=rng(a.id);const acts=ACTIONS.map((x,i)=>[x,i]).filter(x=>x[0][1]===a.id);
 return {kind:'Copilot Studio agent',id:a.name,title:a.name,chips:[[a.state,a.state==='Production'?'good':'warn'],[a.ch,'']],crumb:['Copilot Studio'],
  kpis:[['Sessions, 7 days',a.s7.toLocaleString()],['Resolved by agent',a.res+'%'],['CSAT',String(a.csat)],['Actions',String(a.actions)]],
  kv:[['Channels',a.ch],['Grounding',a.grounding],['Topics',String(a.topics)],['Owner',a.owner],['Authentication','Microsoft Entra ID, per user'],['Environment','Kirby Production (Power Platform), DLP: Business only']],
  trend:{name:'Sessions per hour, today',data:ser('ag'+a.id,48,a.s7/7/24,a.s7/7/24*.35,0,0),unit:''},
  chart:{title:'Actions this agent can take',html:kx.table(['Action','Connector','Tier','Runs, 30 days'],acts.map(([x,i])=>({dd:'action:'+i,c:[esc(x[0]),esc(x[2]),tierChip(x[3]),String(x[4])]})),{n:[3]})},
  agent:{id:a.id,conf:95,summary:`${a.name} resolved ${a.res}% of ${a.s7.toLocaleString()} sessions this week without a person. The top unanswered topic is "${pk(r,['VPN on a new laptop','SAP role request','Printer at the plant','Tekla licence'])}"; adding one topic would cover about ${4+Math.floor(r()*6)}% more.`,bullets:['Every action is logged to ServiceNow and Purview audit.','Stage-for-approval actions always wait for a named person.']},
  actions:[A('Test the agent','Act',a.id,'Copilot Studio test pane',['Open a test conversation','Run the 20 regression utterances','Report pass rate'],null,''),
   A('Add the missing topic','Stage for approval','kb','Copilot Studio',['Draft the topic from 30 days of escalations','Ask the agent owner to review','Publish to production'],null,''),
   A('Publish to a new channel','Stage for approval',a.id,'Copilot Studio',['Add the channel','Ask the owner to approve','Publish'],null,'')]}}

function bAction(x){const[name,ag,con,tier,runs,succ,secs]=x;const a=agent(ag);
 return {kind:'Copilot Studio action',id:name,title:name,chips:[[tier,tier==='Act'?'good':tier==='Act and notify'?'info':'brand'],[a.name,'']],crumb:['Copilot Studio','Actions'],
  kpis:[['Runs, 30 days',String(runs)],['Success',succ+'%'],['Typical time',secs<60?secs+' s':Math.round(secs/60)+' min'],['Tier',tier.replace('Stage for approval','Stage')]],
  kv:[['Agent',a.name],['Connector',con],['Built as','Copilot Studio agent flow (Power Automate)'],['Runs as','Service principal with least privilege'],['Audit','ServiceNow work note and Purview audit log']],
  chart:{title:'Runs per day, 30 days',html:barChart(ser(name,30,runs/30,runs/30*.5,0,0).map((v,i)=>({label:String(i+1),value:Math.round(v),color:'var(--cps)'})),{h:140,skip:5})},
  agent:{id:ag,conf:96,summary:`${name} runs through ${con}. ${tier==='Stage for approval'?'It always waits for a named person to approve in Teams.':tier==='Act and notify'?'It runs on its own and tells the owner in Teams.':'It runs on its own; the result is written to the record.'}`,bullets:['A failed verification drops it one tier until it earns trust back.']},
  actions:[A('Run it now (sample)',tier,ag,con,['Validate inputs','Call '+con,'Write the result to the record'],null,'')]}}

function bChart(tip,ctx){const lines=String(tip).split('\n');const head=lines[0];const r=rng(tip);const scr=(NAV.flatMap(g=>g[1]).find(n=>n[0]===S.route)||[0,'Screen'])[1];
 const bySite=SITES.slice().sort(()=>r()-.5).slice(0,6).map(s=>({label:s.name,value:Math.round(5+r()*40),dd:'site:'+s.id}));
 const inc=INCIDENTS.slice().sort(()=>r()-.5).slice(0,4);
 return {kind:'Drill-down',id:scr,title:head,chips:[[scr,'']],crumb:[scr],
  kv:lines.slice(1).filter(Boolean).map(x=>{const p=x.split(':');return [p[0],p.slice(1).join(':').trim()||'']}),
  chart:{title:'Where it comes from: top sites',html:kx.hbars(bySite)},
  chart2:{title:'By tower',html:`<div class="kx-split">${donut([{label:'NOC',value:40+Math.floor(r()*20),color:'var(--s1)'},{label:'SOC',value:15+Math.floor(r()*15),color:'var(--s3)'},{label:'Service Desk',value:20+Math.floor(r()*20),color:'var(--s2)'},{label:'Cloud',value:5+Math.floor(r()*10),color:'var(--s5)'}],'100%','share')}${kx.legend([['NOC','var(--s1)'],['SOC','var(--s3)'],['Service Desk','var(--s2)'],['Cloud','var(--s5)']])}</div>`},
  agent:{id:'noc',conf:80,summary:`${head}: ${lines.slice(1).join(', ')||'value as shown'}. ${pk(r,['Two sites account for most of it.','It is in line with the 4-week pattern.','It is above the 4-week average; month-end load is the likely cause.'])}`,bullets:['Click any site or record below to go one level deeper.']},
  related:inc.map(i=>i.no),
  actions:[A('Explain this point','Act','noc','Power BI, ServiceNow',['Compare with the 4-week baseline','List the top contributors'],null,''),
   A('Share in Teams','Act and notify','mi','Teams',['Snapshot the chart','Post to the ops channel with the summary'],null,''),
   A('Add to the watchlist','Act','noc','Console',['Track this measure on the Predictive Watchlist'],null,'')]}}

function bRow(ctx){const r=rng(ctx.cells.join('|'));const scr=(NAV.flatMap(g=>g[1]).find(n=>n[0]===S.route)||[0,'Screen'])[1];
 return {kind:ctx.table||scr,id:ctx.cells[0],title:ctx.cells.slice(0,2).filter(Boolean).join(' · '),chips:[[scr,'']],crumb:[scr],
  kv:ctx.head.map((h,i)=>[h||'Field',ctx.cells[i]]).filter(x=>x[1]),
  trend:{name:'Trend, last 30 days (sample)',data:ser(ctx.cells.join(),30,50,12,0,0),unit:''},
  agent:{id:S.route==='soc'||S.route==='identity'||S.route==='vuln'||S.route==='cloudsec'?'soc':S.route==='desk'||S.route==='knowledge'?'sd':S.route==='finops'?'fin':S.route==='changes'?'chg':'noc',conf:76+Math.floor(r()*18),summary:`${ctx.cells[0]}: ${ctx.cells.slice(1,4).filter(Boolean).join(', ')}. ${pk(r,['Trend is steady over 30 days.','Up 12% on last month.','Down 8% on last month after the last fix.'])}`,bullets:['Owner and next step come from the CMDB and the runbook library.']},
  related:relFor(ctx.cells.join(' ')),
  actions:[A('Explain this','Act','noc','ServiceNow, OpsRamp',['Gather context for '+ctx.cells[0],'Summarise in plain language'],null,''),
   A('Create a ServiceNow record','Act and notify','noc','ServiceNow',['Draft a task with this context','Assign to the owning group','Tell the group in Teams'],null,''),
   A('Share in Teams','Act and notify','mi','Teams',['Post this row and the summary to the ops channel'],null,'')]}}

function bGeneric(ref){return {kind:'Record',id:ref,title:ref,chips:[],crumb:[],kv:[['Reference',ref]],agent:{id:'noc',conf:70,summary:'Sample record. Ask the agent for more detail.',bullets:[]},actions:[A('Explain this','Act','noc','ServiceNow',['Look up the record','Summarise'],null,'')]}}

/* ---------- root cause and predict/prevent for every drill-down ---------- */
const causeOf=t=>{t=String(t).toLowerCase();return /capacity|near capacity|link use|92% of 60/.test(t)?['Shift-start load above the circuit size','Load, not a fault; backup path too thin to fail over','Raise the circuit to 100 Mbps and apply SAP-first QoS']:/database volume|disk|volume/.test(t)?['Oracle archive logs not purged after month-end','Archive growth 8 points in 12 days','Weekly archive purge after backup check, alert at 85%']:/backup|save set|kirdra/.test(t)?['Save set timed out in an overlapping backup window','Window overlaps the SAP batch by 40 minutes','Move the SAP save set 60 minutes earlier']:/loss|stc|jeddah/.test(t)?['Carrier circuit errors upstream of the CPE','CRC errors on the carrier side, CPE clean','Carrier SLA review and SD-WAN steering policy']:/restart|uipath|hung/.test(t)?['Memory leak in the service after the last update','Working set grows 4% an hour','Pin the previous build and schedule a nightly recycle']:/flap|port|meraki/.test(t)?['Faulty SFP on the uplink port','Port errors align with every flap','Replace the SFP and add port-error alerting']:/clock|time sync|ntp/.test(t)?['Time source unreachable from the plant VLAN','NTP to the hub blocked after a firewall change','Restore the NTP rule and alert on drift above 2 s']:/powershell|ransom|encrypt|malware|hash/.test(t)?['Phishing attachment opened by the user','Macro launched encoded PowerShell','Block macros from internet mail for engineering users']:/privileged|role|admin|pim/.test(t)?['Role activation without a travel record','Sign-in from a new country 6 minutes earlier','Require approval and compliant device for admin roles']:/service account|svc-|lateral|pass-the-hash/.test(t)?['Service account reused from a compromised workstation','NTLM logons from one device to 3 hosts','Restrict the account to its server and rotate monthly']:/journal|rpo|jetstream|\bdr\b|drill|recovery/.test(t)?['Month-end write volume is larger than the DR journal','Journal fill tracks SAP batch writes','Grow the journal 40% and test failover each quarter']:/bucket|iam|secure score|public|wildcard|encrypt/.test(t)?['Policy gap: resources created outside the landing-zone guardrails','No deny policy for this setting','Azure Policy and AWS SCP deny rules']:/budget|spend|run-rate|reserv|idle|rightsiz|cost/.test(t)?['Idle and oversized capacity with expiring commitments','Usage flat while spend climbs','Out-of-hours shutdown, rightsizing and a savings plan']:/rota|cover|pages|on-call|fair share/.test(t)?['Rota built without page-load data','One person carries most night pages','Balance the rota by page load each week']:/article|topic|search|knowledge|stale/.test(t)?['Fixes resolved by people never reach the knowledge base','Repeat questions with no matching article','Knowledge agent drafts an article from every L2 fix']:/sla|error budget|first-level|breach/.test(t)?['Repeat incidents on two network paths eat the error budget','80% of breach minutes from 2 sites','Fix the two paths and add a burn-rate alert']:/phish|macro|mail/.test(t)?['Macro-enabled attachments allowed from internet mail','Engineering mailboxes targeted weekly','Block internet macros and add a report button']:/licen/.test(t)?['Patch changed the licence service start order','Failures began 2 minutes after logon','Add a dependency check to the patch ring']:/cpu|memory|host/.test(t)?['Host memory pressure from one oversized VM','12 VMs share the same parent host','Rightsize the VM and set host memory alerts']:['Configuration drift after the last change','Last change on this CI 3 days ago','Add the CI to drift detection with auto-revert']};
function deepen(o){if(!o||o.rca!==undefined)return o;const r=rng('rca'+o.id+o.title);let c,pred=null;
 if(o.kind==='Incident'){const i=INCIDENTS.find(x=>x.no===o.id);const svc=SERVICES.find(s=>s.name===i.svc);c=causeOf(i.title+' '+i.why);
  o.rca=[{k:'Symptom',label:i.title.split(',')[0],ev:'Raised '+hhmm(i.opened)+' IST'},{k:'Business service',label:i.svc,ev:svc?'Tier '+svc.tier+' · '+svc.upstream.length+' services depend on it':'',dd:svc?'svc:'+svc.id:null},{k:'Site',label:siteName(i.site),ev:LINKS.filter(l=>l.site===i.site).length+' links',dd:'site:'+i.site},{k:'Configuration item',label:i.ci,ev:'From the CMDB',dd:LINKS.some(l=>l.id===i.ci)?i.ci:null},{k:'Root cause',label:c[0],ev:c[1],cause:1}]}
 else if(o.kind==='Security case'){const k=CASES.find(x=>x.no===o.id);c=causeOf(k.title+' '+k.tactic);o.rca=[{k:'Alert',label:k.title,ev:tok(k.src)},{k:'Device',label:k.asset,ev:'Value: '+(k.crit||'Medium')},{k:'Identity',label:k.user,ev:'Entra sign-ins checked'},{k:'Technique',label:k.tech,ev:k.tactic},{k:'Root cause',label:c[0],ev:c[1],cause:1}]}
 else if(o.kind==='WAN link'){const l=LINKS.find(x=>x.id===o.id);c=l.util>=85?causeOf('capacity'):l.loss>.8?causeOf('loss'):['No fault found','All readings within baseline','Keep watching; forecast below'];o.rca=[{k:'Symptom',label:l.util>=85?'Slow ERP sessions':'Latency '+Math.round(l.lat)+' ms',ev:'At shift hours'},{k:'Site',label:siteName(l.site),dd:'site:'+l.site},{k:'Link',label:l.id+' · '+l.label,ev:Math.round(l.util)+'% used'},{k:'Carrier',label:l.isp,ev:l.type},{k:'Root cause',label:c[0],ev:c[1],cause:1}];pred={data:o.trend.data,thr:95,unit:'%',what:'link use'}}
 else if(o.kind==='Site'){const s=SITES.find(x=>x.name===o.title);const inc=INCIDENTS.find(i=>i.site===s.id&&i.state!=='Closed');const hot=LINKS.filter(l=>l.site===s.id).sort((a,b)=>b.util-a.util)[0];c=causeOf(inc?inc.title:hot&&hot.util>=85?'capacity':'drift');o.rca=[{k:'Site',label:s.name,ev:s.kind},{k:inc?'Open incident':'Busiest link',label:inc?inc.no:hot?hot.id:'None',ev:inc?inc.title.split(',')[0]:hot?Math.round(hot.util)+'% used':'',dd:inc?inc.no:hot?hot.id:null},{k:'Configuration item',label:inc?inc.ci:hot?hot.isp+' circuit':'n/a'},{k:'Root cause',label:c[0],ev:c[1],cause:1}]}
 else if(o.kind==='Change'){const ch=CHANGES.find(x=>x.no===o.id);c=['Risk driver: '+(ch.risk==='High'?'production SAP during business hours':ch.risk==='Medium'?'database change with a data purge':'network change with a tested rollback'),'From 12 months of similar changes',ch.back];o.rca=[{k:'Change',label:ch.no,ev:ch.when},{k:'Affects',label:siteName(ch.site),dd:'site:'+ch.site},{k:'Plan',label:ch.plan.split(';')[0]},{k:'Main risk',label:c[0],ev:c[1],cause:1}];c=[c[0],c[1],'Gate the change on the pre-check and keep the back-out ready: '+ch.back]}
 else if(o.kind==='Business service'){const v=SERVICES.find(s=>s.name===o.title);c=causeOf(v.name==='SAP ERP'?'database volume':v.name.includes('Kuwait')?'capacity':'drift');o.rca=[{k:'Service',label:v.name,ev:'Tier '+v.tier},{k:'Depends on',label:v.deps.map(d=>(SERVICES.find(s=>s.id===d)||{name:d}).name).join(', ')||'Nothing'},{k:'Weakest CI',label:v.cis[0],ev:'Most incidents in 90 days'},{k:'Likely cause',label:c[0],ev:c[1],cause:1}]}
 else if(o.kind==='Network device'){c=causeOf(/3750|2960/.test(o.title)?'port flap':'cpu');o.rca=[{k:'Device',label:o.title},{k:'Site',label:(o.crumb||[])[1]||''},{k:'Signal',label:'CPU and port errors',ev:'Last 6 hours'},{k:'Likely cause',label:c[0],ev:c[1],cause:1}]}
 else if(o.kind==='Copilot Studio agent'||o.kind==='Copilot Studio action'||o.kind==='Runbook'){o.rca=null;c=['','',o.kind==='Runbook'?'Promote on a clean record; demote on a failed verification':'Add the missing topic and retest weekly']}
 else{const top=SITES[Math.floor(r()*SITES.length)];c=causeOf(String(o.title)+' '+(o.kv||[]).map(x=>x[1]).join(' '));o.rca=[{k:'Measure',label:String(o.title).slice(0,48)},{k:'Biggest contributor',label:top.name,ev:Math.round(30+r()*30)+'% of the total',dd:'site:'+top.id},{k:'Driver',label:c[1]},{k:'Root cause',label:c[0],ev:'Confidence '+(70+Math.floor(r()*22))+'%',cause:1}]}
 const base=pred||(o.trend?{data:o.trend.data,thr:o.trend.thr,unit:o.trend.unit,what:o.trend.name.split(',')[0]}:{data:ser('p'+o.id,30,50,10,.3),thr:80,unit:'',what:'this measure'});
 const h=base.data.slice(-24),last=h[h.length-1],slope=(h[h.length-1]-h[0])/h.length;const fc=Array.from({length:12},(_,i)=>+(last+slope*(i+1)*1.6+(r()-.4)*Math.abs(slope||1)).toFixed(1));const thr=base.thr!=null?base.thr:Math.round(Math.max(...h)*1.15);const k=fc.findIndex(v=>v>=thr);const conf=72+Math.floor(r()*22);
 o.pp={hist:h,fc,thr,unit:base.unit||'',what:base.what,cross:k>=0?k+1:null,conf,pred:k>=0?`${base.what} is forecast to cross ${thr}${base.unit||''} in about ${k+1} interval${k?'s':''} (confidence ${conf}%).`:`${base.what} stays below ${thr}${base.unit||''} over the forecast window (confidence ${conf}%).`,prev:c[2]};
 if(o.actions&&c[2])o.actions.push(A('Prevent: '+c[2].split(',')[0].split(' and ')[0],'Stage for approval',o.kind==='Security case'?'soc':o.kind==='Change'?'chg':o.kind.startsWith('Copilot')?'kb':'noc','ServiceNow change, '+(o.kind==='Security case'?'Defender':'OpsRamp'),['Draft a preventive change: '+c[2],'Attach the forecast and the evidence','Ask the owner to approve in Teams','Schedule it and add a watch to the Predictive Watchlist'],null,'Stops the next one before it starts'));
 return o}
const _build=build;build=(ref,ctx)=>deepen(_build(ref,ctx));
const ppHtml=o=>{if(!o.pp)return '';const p=o.pp,n=p.hist.length;const pi=o.actions?o.actions.length-1:-1;return `<h4>Predict and prevent</h4><div class="card" style="padding:8px">${kx.forecast(p.hist,p.fc,{h:150,thr:p.thr,tl:'limit',unit:p.unit,cross:p.cross?'+'+p.cross:'',xl:[[0,'history'],[n-1,'now'],[n+11,'+12']]})}</div><div class="kx-pp" style="margin-top:8px"><div><span class="k pr">Predictive</span><b>${esc(p.pred)}</b><span class="note" style="margin:0">Forecast from 90 days of readings, seasonality and month-end pattern.</span></div><div><span class="k pv">Preventive</span><b>${esc(p.prev)}</b>${pi>=0&&o.actions[pi].label.startsWith('Prevent')?`<button class="btn sm cps" style="width:max-content;margin-top:auto" onclick="kx.run(${pi})">Prepare preventive change</button>`:''}</div></div>`};
const rcaHtml=o=>o.rca&&o.rca.length?`<h4>Root cause path, click any step</h4>${kx.rcaPath(o.rca)}`:'';

/* ---------- drawer ---------- */
let STACK=[],CUR=null;
kx.open=(ref,ctx,keep)=>{const o=build(ref,ctx);if(!o)return;if(!keep)STACK=[];if(CUR&&keep)STACK.push(CUR);CUR={o,ref,ctx};draw()};
kx.back=()=>{CUR=STACK.pop();if(CUR)draw();else kx.close()};
kx.close=()=>{const d=document.getElementById('kxd');if(d)d.remove();const s=document.getElementById('kxsh');if(s)s.remove();CUR=null;STACK=[]};
kx.rel=ref=>kx.open(ref,null,true);
function draw(){const o=CUR.o;let d=document.getElementById('kxd');if(!d){const sh=document.createElement('div');sh.id='kxsh';sh.className='kxd-sh';sh.onclick=kx.close;document.body.appendChild(sh);d=document.createElement('aside');d.id='kxd';d.className='kxd';d.setAttribute('role','dialog');d.setAttribute('aria-label','Details');document.body.appendChild(d)}
 const ag=o.agent?agent(o.agent.id):null;
 d.innerHTML=tok(`<div class="dh"><div style="flex:1;min-width:0"><div class="crumb">${STACK.length?`<a onclick="kx.back()">← Back</a> ·`:''}${[...(o.crumb||[])].map(esc).join(' › ')}${o.crumb&&o.crumb.length?' › ':''}<b style="color:var(--ink2)">${esc(o.kind)}</b></div><h2>${esc(o.id&&o.id!==o.title?o.id+' · ':'')}${esc(o.title)}</h2><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">${(o.chips||[]).filter(c=>c[0]).map(c=>chip(c[0],c[1])).join('')}</div></div><button class="btn sm" onclick="kx.close()" aria-label="Close">× Close</button></div>
 <div class="db">
 ${o.kpis?`<div class="kpis">${o.kpis.map(k=>`<div><label>${esc(k[0])}</label><b>${esc(k[1])}</b></div>`).join('')}</div>`:''}
 ${o.agent?`<h4>Copilot Studio</h4><div class="kx-agent"><div class="h">${mk()}${esc(ag.name)}<span class="conf">Confidence ${o.agent.conf}%</span></div><p>${esc(o.agent.summary)}</p>${o.agent.bullets&&o.agent.bullets.length?`<ul>${o.agent.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</div>`:''}
 ${rcaHtml(o)}
 ${o.actions?`<h4>Next actions</h4><div class="kx-acts">${o.actions.map((a,i)=>`<button class="kx-act" onclick="kx.run(${i})"><span class="r">${tierChip(a.tier)}<span>${esc(agent(a.agent).name)}</span></span><b>${esc(a.label)}</b><span>${esc(a.desc||('Through '+a.connector))}</span></button>`).join('')}</div><div id="kxrun"></div>`:''}
 ${ppHtml(o)}
 ${o.trend?`<h4>${esc(o.trend.name)}</h4><div class="card" style="padding:8px">${lineChart([{name:o.trend.name,data:o.trend.data,color:'var(--s1)'}],{h:150,threshold:o.trend.thr,tlabel:'threshold',unit:o.trend.unit||'',xl:[[0,'-6h'],[Math.floor(o.trend.data.length/2),'-3h'],[o.trend.data.length-1,'now']]})}</div>`:''}
 ${o.kv&&o.kv.length?`<h4>Details</h4><dl class="kv">${o.kv.map(k=>`<dt>${esc(k[0])}</dt><dd>${esc(k[1])}</dd>`).join('')}</dl>`:''}
 ${o.chart?`<h4>${esc(o.chart.title)}</h4>${o.chart.html}`:''}
 ${o.chart2?`<h4>${esc(o.chart2.title)}</h4>${o.chart2.html}`:''}
 ${o.chat?`<h4>Conversation in Teams</h4><div class="kx-chat">${o.chat.map(c=>`<div class="${c[0]}">${esc(c[1])}</div>`).join('')}</div>`:''}
 ${o.related&&o.related.length?`<h4>Related, click to drill in</h4><div class="kx-rel">${[...new Set(o.related)].slice(0,12).map(r=>`<button onclick="kx.rel('${esc(r)}')">${esc(relLabel(r))}</button>`).join('')}</div>`:''}
 ${o.timeline?`<h4>Timeline</h4><div class="kx-tl">${o.timeline.map(t=>`<div class="${t[2]?'cp':''}"><time>${hhmm(t[0])}</time>${esc(t[1])}</div>`).join('')}</div>`:''}
 <p class="note" style="margin-top:18px">Sample data. Actions are simulated and change nothing outside this page.</p></div>`)}
const relLabel=r=>r.startsWith('site:')?siteName(r.slice(5)):r.startsWith('svc:')?((SERVICES.find(s=>s.id===r.slice(4))||{}).name||r):r;

/* run an action: show the agent's steps, pause at approval when the tier needs one */
kx.run=i=>{const o=CUR&&CUR.o;if(!o)return;const a=o.actions[i];const box=document.getElementById('kxrun');if(!box)return;const ag=agent(a.agent);
 const lines=[];const put=(cls,t)=>{lines.push(`<div><time>${nowT()}</time><span class="${cls}">${esc(t)}</span></div>`);box.innerHTML=`<div class="kx-log">${lines.join('')}</div>`+(a._wait?`<div class="kx-apr">⏸ Waiting for approval in Teams from the ${o.kind==='Security case'?'SOC L2 on shift':'resolver lead'}. <button class="btn sm p" onclick="kx.approve(${i},true)">Approve</button><button class="btn sm" onclick="kx.approve(${i},false)">Reject</button></div>`:'')};
 a._wait=false;a._put=put;
 put('ag',`${ag.name} · ${a.label}`);put('',`Tier: ${a.tier} · Connector: ${a.connector}`);
 let k=0;const pre=a.tier==='Stage for approval'?Math.max(1,a.steps.length-2):a.steps.length;
 const step=()=>{if(k<pre){put('ok','✓ '+a.steps[k]);k++;setTimeout(step,420)}else if(a.tier==='Stage for approval'){a._wait=true;a._k=k;put('wait','… Approval request posted in Teams')}else finish(a,o,k)};
 setTimeout(step,300)};
kx.approve=(i,ok)=>{const o=CUR.o,a=o.actions[i];a._wait=false;if(!ok){a._put('no','✗ Rejected. No change made. Reason recorded on the ticket.');audit('You (approver)','Rejected: '+a.label+' on '+o.id);return}a._put('ok','✓ Approved by you at '+nowT());let k=a._k;const step=()=>{if(k<a.steps.length){a._put('ok','✓ '+a.steps[k]);k++;setTimeout(step,420)}else finish(a,o,k)};setTimeout(step,300)};
function finish(a,o,k){if(a.tier==='Act and notify')a._put('ok','✓ Owner told in Teams');a._put('ok','✓ Done. Written to the ServiceNow work notes and the audit log.');audit('Copilot Studio · '+agent(a.agent).name,a.label+' on '+o.id);kx.stream.unshift({t:S.now,a:a.agent,act:a.label,obj:o.id,st:'ok',neu:1});try{toast(a.label,o.id+' · done by the Copilot Studio '+agent(a.agent).name)}catch(e){}if(a.effect){a.effect();setTimeout(()=>{try{render();if(CUR&&CUR.o===o){CUR.o=build(CUR.ref,CUR.ctx)||o}}catch(e){}},500)}}

/* ---------- click wiring on every screen ---------- */
document.addEventListener('click',e=>{const main=document.getElementById('main');if(!main||!main.contains(e.target))return;
 if(e.target.closest('button,a,select,input,textarea,label,.tabs'))return;
 const kxRow=e.target.closest('[data-kx]');if(kxRow){kx.open(kxRow.getAttribute('data-kx'));return}
 const mark=e.target.closest('svg [data-tip]');if(mark&&!mark.closest('[onclick]')){kx.open('chart:'+mark.getAttribute('data-tip'));return}
 const tr=e.target.closest('.tbl tbody tr');if(tr&&!tr.hasAttribute('onclick')&&!e.target.closest('[onclick]')){const tbl=tr.closest('table');const head=[...tbl.querySelectorAll('thead th')].map(th=>th.textContent.trim());const cells=[...tr.children].map(td=>td.innerText.replace(/\s+/g,' ').trim());const ref=kx.ref(cells.join(' '));const card=tbl.closest('.card');const title=card&&card.querySelector('h2')?card.querySelector('h2').textContent:'';
  if(ref&&build(ref)&&build(ref).kind!=='Record'){kx.open(ref);return}
  const site=SITES.find(s=>cells[0]===s.name);if(site){kx.open('site:'+site.id);return}
  const svc=SERVICES.find(s=>cells[0]===s.name);if(svc){kx.open('svc:'+svc.id);return}
  kx.open('row:x',{head,cells,table:title});return}
},true);

/* incidents open in the drawer instead of the old modal */
window.openInc=no=>kx.open(no);

/* ---------- Copilot Studio insight strip on every screen ---------- */
const INS={
 overview:['mi',[['Shuaiba MPLS will hit 95% at 08:30 shift start. Steering SAP first keeps ERP usable.','Stage for approval','L01'],['3 of 8 open incidents share a root cause on the AVS AV64 host.','Act','INC0048214'],['CHG30415 is waiting on the Network lead for 2 hours.','Act and notify','CHG30415']]],
 live:['noc',[['Alert rate is 24% above the 4-week norm for this hour.','Act','chart:Alerts per minute\nNow: above norm'],['VM Server23 disk will cross 90% in about 5 days.','Stage for approval','row:x'],['2 devices stopped reporting in the last 15 minutes.','Act and notify','NET-05']]],
 observability:['noc',[['SAP dialog response drifted up 18% since 09:00.','Act','svc:erp'],['Azure SQL DTU pattern matches last month-end.','Act','chart:Azure SQL DTU\nPattern: month-end'],['Backup window overruns on 2 save sets.','Act and notify','RB-104']]],
 correlation:['noc',[['96.5% of today\'s events never reached a person.','Act','chart:Noise removed\nToday: 96.5%'],['One new correlation rule would remove 41 more alerts a day.','Stage for approval','row:x'],['INC0048219 and INC0048211 look like the same carrier problem.','Act','INC0048219']]],
 site:['noc',[['This site is the busiest in its country during shift change.','Act','site:hyd'],['One switch here is past end of support.','Stage for approval','NET-05'],['Notify the site IT coordinator about tonight\'s change.','Act and notify','CHG30412']]],
 incidents:['noc',[['INC0048214 can be fixed with RB-103 after the backup check.','Stage for approval','INC0048214'],['INC0048211 is load, not a fault. Steering SAP first helps now.','Stage for approval','INC0048211'],['2 incidents are within 25% of their SLA.','Act and notify','INC0048217']]],
 watchlist:['noc',[['VM Server2 SAP BW DB volume will be full in 9 days.','Stage for approval','row:x'],['Link L09 crosses 90% on Mondays; a QoS change avoids it.','Stage for approval','L09'],['3 predictions came true last month; 2 were prevented.','Act','chart:Predictions\nPrevented: 2']]],
 netgraph:['noc',[['Shuaiba to SAP ERP crosses 2 congested hops.','Act','L01'],['Kuwait has no usable backup path today.','Act and notify','L02'],['Path latency to Azure is 14% above baseline.','Act','chart:Azure path\nLatency: +14%']]],
 network:['noc',[['L01 Shuaiba is at 92% of 60 Mbps.','Stage for approval','L01'],['L12 Jeddah loss is above 2%.','Act and notify','L12'],['4 switches are past end of support.','Stage for approval','NET-05']]],
 estate:['noc',[['VM Server4 disk at 92%; RB-103 is staged.','Stage for approval','INC0048214'],['6 SAP sandbox VMs are idle out of hours.','Act and notify','row:x'],['India Server 27 had 3 restarts this week.','Act','INC0048222']]],
 servicemap:['noc',[['SAP ERP has the most dependants: BW, Portal, Alfresco, SuccessFactors.','Act','svc:erp'],['5% of CIs have no owner in the CMDB.','Act and notify','row:x'],['Engineering Apps depends on one licence server.','Stage for approval','svc:eng']]],
 backup:['noc',[['No recovery test on file; book a drill.','Stage for approval','row:x'],['2 save sets failed last night; RB-104 can re-run them.','Act','RB-104'],['JetStream journal will fill at month-end.','Act and notify','row:x']]],
 soc:['soc',[['SEC-3187 can reach the MEA File Server. Isolate first.','Stage for approval','SEC-3187'],['SEC-3185: privileged role activated from a new country.','Stage for approval','SEC-3185'],['3 benign cases can be closed with the reasoning recorded.','Act','SEC-3174']]],
 identity:['soc',[['6 standing admin accounts could move to just-in-time.','Stage for approval','row:x'],['svc-weigh signs in outside its usual pattern.','Act','SEC-3180'],['MFA coverage in Vietnam is 3 points below target.','Act and notify','site:vnf']]],
 vuln:['soc',[['4 servers run Windows Server 2016; support ends in 74 days.','Stage for approval','row:x'],['Ring 1 patching finished; ring 2 is ready.','Stage for approval','row:x'],['17 findings past due; 9 are on one server.','Act and notify','row:x']]],
 cloudsec:['soc',[['1 S3 bucket is public; 12 objects inside.','Stage for approval','row:x'],['2 IAM roles have wildcard admin.','Act and notify','row:x'],['Secure score could rise 6 points with 4 fixes.','Act','chart:Secure score\nPotential: +6']]],
 desk:['sd',[['Password resets are 31% of tickets; the agent closes 94% of them.','Act','chart:Password resets\nShare: 31%'],['"VPN on a new laptop" is the top unanswered topic.','Stage for approval','agent:sd'],['CSAT dipped at Jeddah after the Teams update.','Act and notify','site:jed']]],
 changes:['chg',[['CHG30412 is low risk with the backup pre-check as a gate.','Stage for approval','CHG30412'],['CHG30415 has no conflicts; approver is on shift.','Act and notify','CHG30415'],['Patch ring 2 overlaps month-end at 2 plants.','Act','CHG30409']]],
 automation:['noc',[['RB-103 qualifies for promotion to Act and notify.','Stage for approval','RB-103'],['"Tekla licence server restart" repeats 14 times a month.','Stage for approval','row:x'],['Runbooks gave back 671 hours this quarter.','Act','chart:Hours given back\nQuarter: 671']]],
 copilot:['sd',[['The Service Desk agent resolved 62% without a person this week.','Act','agent:sd'],['2 approvals are waiting in Teams.','Act and notify','agent:chg'],['One topic would cover 7% more Service Desk sessions.','Stage for approval','agent:sd']]],
 knowledge:['kb',[['3 drafts from resolved incidents are waiting for review.','Act and notify','INC0048222'],['18 articles were not used in 90 days; retire or refresh.','Stage for approval','row:x'],['Top search with no article: "SAP role request".','Act','agent:kb']]],
 oncall:['mi',[['Network L2 was paged 9 times last night; above fair share.','Act and notify','row:x'],['Night shift handover has 2 open actions.','Act','row:x'],['Next week\'s rota has a gap on Sunday SOC L2.','Stage for approval','row:x']]],
 finops:['fin',[['Rightsizing VM Server4 and VM Server6 saves about $6.8K a month.','Stage for approval','row:x'],['SAP sandbox is idle 14 hours a day.','Act and notify','row:x'],['Reservations would cover 62% of steady AVS spend.','Stage for approval','chart:Commitments\nCoverage: 62%']]],
 sla:['noc',[['Plant network SLA is burning error budget 6x faster than allowed.','Act and notify','chart:Plant network up\nBudget left: 8%'],['First-level resolution is 1.8 points below target.','Act','agent:sd'],['P2 respond time is at 61% of its limit.','Act','INC0048211']]],
 separation:['mi',[['2 of 10 Day-1 gates are ready; Identity is the critical path.','Act','row:x'],['Licences not transferable: 3 vendors need a decision.','Act and notify','row:x'],['Knowledge transfer for SAP Basis is 40% done.','Act','row:x']]],
 reports:['mi',[['Weekly service review is ready to send.','Act and notify','row:x'],['Executive pack needs 2 numbers confirmed.','Act','row:x'],['ISO 27001 evidence for A.5.24 to A.5.26 is complete.','Act','row:x']]],
 demos:['mi',[['Start with D07: ransomware, the primary SOC demo.','Act','agent:soc'],['D10 shows NOC, SOC and ServiceNow working as one.','Act','agent:mi'],['Every demo shows Copilot Studio agents acting with approvals.','Act','agent:noc']]]
};
kx.INS=INS;
kx.quick=(r,j)=>{const ins=INS[r];if(!ins)return;const it=ins[1][j];let ref=it[2];const ctx=ref==='row:x'?{head:['Item','Detail'],cells:[it[0].split(/[.;:]/)[0],it[0]],table:'Copilot Studio insight'}:null;kx.open(ref,ctx);setTimeout(()=>{if(!CUR)return;const o=CUR.o;if(!o.actions)return;let idx=o.actions.findIndex(a=>a.tier===it[1]);if(idx<0)idx=0;kx.run(idx)},250)};
function strip(){const main=document.getElementById('main');if(!main)return;const ph=main.querySelector('.ph');if(!ph||main.querySelector('.kx-ins'))return;const ins=INS[S.route];if(!ins)return;const a=agent(ins[0]);
 ph.insertAdjacentHTML('afterend',`<div class="kx-ins" role="region" aria-label="Copilot Studio insights"><div class="kx-who"><b>${mk()}Copilot Studio</b><small>${esc(a.name)} · grounded on this screen</small><button class="btn sm" style="width:max-content" onclick="kx.open('agent:${a.id}')">Open agent</button></div>${ins[1].map((x,j)=>`<div class="it"><p>${esc(x[0])}</p><div class="ft">${tierChip(x[1])}<button class="btn sm cps" style="margin-left:auto" onclick="kx.quick('${S.route}',${j})">${x[1]==='Stage for approval'?'Prepare':'Do it'}</button><button class="btn sm" onclick="kx.open(${JSON.stringify(x[2]).replace(/"/g,'&quot;')},${x[2]==='row:x'?`{head:['Item','Detail'],cells:${JSON.stringify([x[0].split(/[.;:]/)[0],x[0]]).replace(/"/g,'&quot;')},table:'Copilot Studio insight'}`:'null'})">Details</button></div></div>`).join('')}</div>`)}
const _rar=refreshAfterRender;
window.refreshAfterRender=function(){_rar();try{strip()}catch(e){console.error(e)}};

/* ---------- Copilot Studio pane inside the live demos ---------- */
const DEMO_AGENT={NOC:'noc',SOC:'soc',Integrated:'mi'};
window.vCopilot=function(d){const a=agent(DEMO_AGENT[d.g]||'noc');const acts=logFor(['copilot']);const con=[...new Set(d.sys.filter(k=>!['movate','copilot','audit'].includes(k)).map(k=>T(k)))];
 return `<div class="vbar" style="background:#0f6cbd">${mk()}<span>Copilot Studio · ${esc(a.name)}</span><b>${acts.length?acts.length+' action'+(acts.length>1?'s':''):'Listening'}</b></div><div class="vbody kx-vc"><div class="ag">${mk(1)}<div><b>${esc(a.name)}</b><small>${esc(a.ch)} · grounded on ${esc(a.grounding)}</small></div></div><div class="nowa" style="background:var(--cps2);border-color:rgba(15,108,189,.35)"><b>✦ Agent summary</b><br>${esc(d.nowassist||'')}</div><h4>Actions taken in this run</h4>${acts.map(wn).join('')||'<p class="note">None yet. The agent acts when the flow reaches routing, enrichment or approval.</p>'}<h4>Control</h4><p>${esc(d.mode)}. Stage-for-approval actions wait for a named person in Teams.</p><h4>Connectors used</h4><div class="cn">${con.map(c=>chip(c)).join('')}</div></div>`};

/* live pulse for the action stream */
setInterval(()=>{if(Math.random()<.45)kx.pulse();try{if(S.route==='copilot'&&typeof refreshLive==='function')refreshLive()}catch(e){}},4000);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('kxd'))kx.close()});
})();
