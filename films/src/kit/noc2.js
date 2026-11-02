// NOC film 2: a hung plant application server, recovered through OpsRamp, vCenter, ServiceNow, Teams and Copilot Studio.
const L = require('./lib.js'); const { H } = L;
const VM = 'har-plant-vm-app', HOST = 'esx-har-01.corp.local', INC = 'INC0024903';
const oldRows = [["Ok", "Disk usage back below threshold", "hyd-city-fs-02", "disk.used.pct", "Agent", "06:52", "Resolved"], ["Ok", "Interface flap cleared", "shu-plant-sw-01", "net.if.status", "SNMP", "06:41", "Resolved"], ["Warning", "CPU above 85% for 10 min", "jed-office-esx-01", "cpu.util", "vCenter", "06:37", "Acknowledged"], ["Ok", "Backup job completed after retry", "rak-plant-nas-01", "backup.status", "Veeam", "06:20", "Resolved"], ["Ok", "Certificate renewed", "vpn-gw-hub-02", "cert.days", "Agent", "05:58", "Resolved"], ["Ok", "Ping restored", "vnf-factory-edge-01", "ping.loss", "SD-WAN", "05:44", "Resolved"], ["Ok", "Service restarted by policy", "pun-office-vm-print", "svc.status", "Agent", "05:12", "Resolved"]];
const orRow = (r, cls = "old") => `<tr class="${cls}"><td><input type="checkbox"></td><td>${H.sev(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}:00</td><td style="color:#5a6577">${r[6]}</td></tr>`;
const ALERTS = [["Critical", "Application check failed · HTTP 503 on :8080 (MES)", VM, "http.status", "Synthetic", "07:38:10"], ["Critical", "Agent heartbeat lost", VM, "agent.status", "Agent", "07:38:24"], ["Critical", "Ping loss 100%", VM, "ping.loss", "Gateway", "07:38:41"], ["Warning", "Virtual machine CPU usage above 95% for 10 min", VM, "cpu.util", "vCenter", "07:38:52"], ["Warning", "Virtual machine memory usage 98%", VM, "mem.util", "vCenter", "07:39:05"]];
const tree = [["vcsa-hub-01.corp.local", 0, "#49606D"], ["India North DC", 1, "#7D8C93"], ["HAR-Plant-Cluster", 2, "#3E86A8"], [HOST, 3, "#5B7F2B"], [VM, 4, "#3E86A8", 1], ["har-plant-vm-db", 4, "#3E86A8"], ["har-plant-vm-hmi", 4, "#3E86A8"], ["har-plant-vm-print", 4, "#3E86A8"], ["esx-har-02.corp.local", 3, "#5B7F2B"], ["har-plant-vm-dc", 4, "#3E86A8"], ["har-plant-vm-file", 4, "#3E86A8"], ["SHU-Plant-Cluster", 2, "#3E86A8"], ["RAK-Plant-Cluster", 2, "#3E86A8"]];
const cap = (id, label, amt, pct, used, col) => `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><b>${label}</b><span id="${id}t">${used}</span></div><div class="bar" style="margin-top:6px"><i id="${id}" style="width:${pct}%;background:${col}"></i></div><div style="font-size:12px;color:#6B7B84;margin-top:3px">${amt}</div></div>`;
const vcBody = `<div class="alarm r" id="vcalarm">⚠ <b>Alarm:</b> Virtual machine CPU usage · Virtual machine memory usage · Triggered 07:38 on ${VM}</div>
  <div class="cards" style="grid-template-columns:1.15fr 1fr 1fr">
   <div class="card" id="vcguest"><h5>Guest OS</h5><div style="display:flex;gap:14px"><div style="width:190px;height:118px;background:#0B0F12;border-radius:3px;flex:none;display:flex;align-items:flex-end;padding:6px;color:#7D8C93;font-size:11px" id="vccon">Console · no response</div><div style="font-size:13px;line-height:1.7">Windows Server 2022 (64-bit)<br>VM version 21 · ESXi 8.0 U2<br>VMware Tools: <b id="vctools" style="color:#C21D00">Not running</b><br>DNS: ${VM}.corp.local<br>IP: 10.42.18.21</div></div><div style="margin-top:10px;color:#0072A3;font-size:12px;font-weight:700;letter-spacing:.06em">LAUNCH REMOTE CONSOLE</div></div>
   <div class="card"><h5>Virtual Machine Details</h5><div class="kv" style="grid-template-columns:120px 1fr;font-size:13px;gap:7px 10px"><span>Power status</span><span id="vcpower">Powered On</span><span>Host</span><span>${HOST}</span><span>Cluster</span><span>HAR-Plant-Cluster</span><span>vSphere HA</span><span>Protected</span><span>Uptime</span><span id="vcup">41 days</span></div></div>
   <div class="card"><h5>Related Objects</h5><div class="kv" style="grid-template-columns:90px 1fr;font-size:13px;gap:7px 10px"><span>Cluster</span><span>HAR-Plant-Cluster</span><span>Host</span><span>${HOST}</span><span>Networks</span><span>VLAN-18-MES</span><span>Storage</span><span>HAR-DS-01 (61% free)</span></div></div>
   <div class="card" style="grid-column:1/3" id="vccap"><h5>Capacity and Usage <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#6B7B84">· last updated <span id="vcupd">07:39</span></span></h5>${cap("vcpu", "CPU", "4 vCPUs allocated", 100, "4.0 GHz used · 100%", "#E62700")}${cap("vmem", "Memory", "16 GB allocated", 98, "15.7 GB used · 98%", "#E62700")}${cap("vsto", "Storage", "120 GB provisioned", 68, "82 GB used", "#0072A3")}</div>
   <div class="card"><h5>Notes</h5><div style="font-size:13px;line-height:1.6;color:#49606D">MES application server, Haridwar plant line 2. Owner: Plant IT. Change window: Sun 02:00 to 04:00.</div></div>
  </div>`;
const task = (n, t, st, det, ini, q, s, c, id) => `<tr ${id ? `id="${id}"` : ""}><td>${n}</td><td style="color:#0072A3">${t}</td><td id="${id || ""}s">${st}</td><td>${det}</td><td>${ini}</td><td>${q}</td><td>${s}</td><td id="${id || ""}c">${c}</td></tr>`;
const oldTasks = task("Reconfigure virtual machine", "har-plant-vm-print", "✔ Completed", "", "VSPHERE.LOCAL\\svc-backup", "4 ms", "07:02:11", "07:02:13") + task("Remove snapshot", "har-plant-vm-db", "✔ Completed", "", "VSPHERE.LOCAL\\svc-backup", "6 ms", "06:58:40", "06:58:52");

module.exports = {
  page: 'kit.html', vo: 'vo_noc2',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({
      hook: ['A plant line stops.', 'A server stops answering.', 'Every minute, production waits.'],
      stats: [['stat1', 57, '', '%', 'of operators said their most recent major outage cost more than $100,000', 'Source: Uptime Institute, Annual Outage Analysis 2026']],
      statText: [['stat2', '1 in 5', 'said it cost more than $1 million', 'Source: Uptime Institute, Annual Outage Analysis 2026']],
      intro: ['How <span class="y">Mova iO</span> brings a hung server back,', 'before the shift notices.', 'OpsRamp · vCenter · ServiceNow · Microsoft Teams · Copilot Studio · Key Vault'],
    });
    // 1 OpsRamp
    await scene('s1', 10, async () => {
      await D('step', 1, 'The plant\'s MES server stops responding', ['OpsRamp']);
      await app('opsramp', { sub: `<b style="font-size:16px">Alerts</b><span style="color:#8a94a6">Command Center › Alerts</span><span class="chip" style="color:#C62828;border-color:#F3B4B4">Critical <b id="nC">0</b></span><span class="chip" style="color:#B26A00;border-color:#F6D49A">Warning <b id="nW">0</b></span><span class="chip">Inferences <b id="nI">0</b></span><span style="margin-left:auto" class="chip">Last 1 hour</span><span class="chip">Columns</span>`, body: `<table><thead><tr><th style="width:28px"></th><th>Severity</th><th>Subject</th><th>Resource</th><th>Metric</th><th>Source</th><th>Created</th><th>Status</th></tr></thead><tbody id="orb">${oldRows.map((r) => orRow(r)).join('')}</tbody></table>`, drawer: true });
      let c = 0, w = 0;
      for (const a of ALERTS) { await D('add', '#orb', `<tr class="al"><td><input type="checkbox"></td><td>${H.sev(a[0])}</td><td>${a[1]}</td><td>${a[2]}</td><td>${a[3]}</td><td>${a[4]}</td><td>${a[5]}</td><td>Open</td></tr>`, true); if (a[0] === 'Critical') await D('html', '#nC', String(++c)); else await D('html', '#nW', String(++w)); await wait(0.75); }
      await D('focus', '#orb', { maxK: 1.45, fill: 0.9, pad: 6 });
    });
    await scene('s2', 11, async () => {
      await D('step', 2, 'Five alerts and two calls, one inference', ['OpsRamp', 'Mova iO', 'ServiceNow']);
      await D('cls', '#orb tr.al', 'child'); await D('html', '#orb tr.al td:first-child', '');
      await D('add', '#orb', `<tr class="inf" id="infrow"><td>▾</td><td>${H.sev('Critical')}</td><td><b>Inference #48377 · ${VM} unresponsive (guest OS hang)</b> <span class="chip" style="margin-left:8px;font-size:12px">5 correlated alerts</span></td><td>${VM}</td><td>correlation</td><td>OpsQ · Mova iO</td><td>07:39:12</td><td><b style="color:#2E7D32">Ticketed</b></td></tr>`, true);
      await D('html', '#nI', '1');
      await D('focus', '#infrow', { maxK: 1.9, pad: 6 }); await wait(3.4);
      await D('html', '#ordr', `<div style="font-size:12px;color:#8a94a6">Inference #48377</div><div style="font-size:20px;font-weight:700;margin:4px 0 12px">${VM} unresponsive (guest OS hang)</div><div style="display:flex;gap:18px;border-bottom:1px solid #DDE3EA;font-size:14px;margin-bottom:14px"><span style="padding:8px 0;border-bottom:3px solid #2BA4E0;font-weight:700">Details</span><span style="padding:8px 0;color:#5a6577">Correlated Alerts (5)</span><span style="padding:8px 0;color:#5a6577">Incidents (1)</span></div>${H.kv([['Root cause alert', '<b style="color:#B26A00">⚑ RCA</b> Agent heartbeat lost · ' + VM], ['Correlation', 'Same VM, topology parent ' + HOST + ', 2-minute window'], ['Also grouped', '2 service desk calls: “MES screens frozen on line 2”'], ['Impact', 'MES for Haridwar line 2 · 38 operators'], ['Incident', '<b style="color:#0B63C4">' + INC + '</b> · ServiceNow · P2 · Plant IT'], ['Volume optimized', '<b>7 signals → 1 incident</b>']])}`);
      await D('cls', '#ordr', 'on'); await wait(0.8);
      await D('focus', '#ordr', { maxK: 1.55, fill: 0.85, pad: 0 });
    });
    // 3 vCenter diagnosis
    await scene('s3', 12, async () => {
      await D('step', 3, 'Mova iO checks the VM, the host and the storage', ['vCenter', 'Mova iO']);
      await app('vsphere', { tree, name: VM, body: vcBody, tasks: oldTasks });
      await D('focus', '#vccap', { maxK: 1.7, pad: 8 }); await wait(4.2);
      await D('focus', '#vcguest', { maxK: 1.8, pad: 8 }); await wait(3.4);
      await D('focus', '#vcalarm', { maxK: 1.5, pad: 6 });
    });
    // 4 ServiceNow incident with findings
    await scene('s4', 12, async () => {
      await D('step', 4, 'The incident opens with the diagnosis written', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: INC, body: H.snInc({ num: INC, title: 'Plant MES application server not responding · Haridwar line 2', hl: [['Priority', '2 - High', '#C2410C'], ['State', 'In Progress', '', 'snstate'], ['Assigned to', 'Mova iO NOC Agent'], ['Updated', 'just now'], ['Resolution SLA', '3h 58m left', '', 'snsla']], fields: [['Caller', 'Mova iO Integration'], ['Channel', 'Monitoring'], ['Category', 'Infrastructure'], ['Subcategory', 'Virtual machine'], ['Service', 'Plant MES'], ['Configuration item', VM], ['Impact', '2 - Medium'], ['Urgency', '1 - High'], ['Assignment group', 'Plant IT'], ['Assigned to', 'Mova iO NOC Agent'], ['Short description', 'MES application server not responding: guest OS hang on ' + VM, '', 1]] }) });
      await D('add', '#snnotes', H.note('Mova iO Event correlator', H.MV, 'Created from OpsRamp inference #48377. Grouped 5 alerts and 2 service desk calls from Haridwar line 2.', '07:39'), true);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(3);
      await D('add', '#snnotes', H.note('Mova iO Triage orchestrator', H.MV, `<b>Root cause: guest OS hang</b> on ${VM}, 92% confidence. VMware Tools heartbeat lost at 07:37; CPU pegged at 100% and memory at 98% for 14 minutes before the hang.<br>Ruled out: host ${HOST} (healthy, 3 other VMs responding) · storage HAR-DS-01 (latency 2 ms, 61% free) · network VLAN-18-MES (gateway reachable).<br>Recommended: <b>RB-011 Reset VM</b>, memory snapshot first for root cause. Production system: needs Plant IT approval.`, '07:40'), true);
      await wait(0.6); await D('focus', '#snact', { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    // 5 Teams approval
    await scene('s5', 11, async () => {
      await D('step', 5, 'Plant IT approves in Teams', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO NOC Agent', items: [['Mova iO NOC Agent', 'Approval needed · ' + INC, 1], ['Plant IT · Haridwar', 'Ravi: line 2 HMIs frozen', 0], ['Neha Gupta', 'Shift handover notes', 0], ['Infra on-call', 'Rota for November', 0]], me: 'AR' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Approval needed · ' + INC, intro: `The MES server for Haridwar line 2 is hung. I recommend a VM reset, with a memory snapshot first so we keep the evidence.`, facts: [['Server', VM], ['Root cause', 'Guest OS hang · 92% confidence'], ['Runbook', 'RB-011 · Snapshot with memory, then reset'], ['Expected downtime', 'About 2 minutes (already down)'], ['Credential', 'Key Vault · vcenter-noc-svc'], ['Rollback', 'Revert to snapshot']], buttons: ['Approve', 'Reject', 'Open incident'] }), 'Mova iO NOC Agent', '07:40'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.6);
      await D('cursor', '#apok', true); await wait(1.05);
      await D('tmApprove', 'Arjun Rao (Plant IT lead)', 'Running RB-011 on ' + VM + '…'); await wait(1.2); await D('cursorOff');
    });
    // 6 Copilot Studio
    const nodes = [['Trigger', 'ServiceNow · incident created', '#2F5B4F', '0.1 s'], ['Get incident', 'Tool · ServiceNow', '#2F5B4F', '0.5 s'], ['Get VM health', 'Tool · vCenter', '#0072A3', '1.2 s'], ['Get correlated alerts', 'Tool · OpsRamp', '#1F5BA8', '0.8 s'], ['Search runbooks', 'Knowledge · NOC runbooks', '#8764B8', '1.3 s'], ['Request approval', 'Tool · Microsoft Teams', '#5B5FC7', '41 s'], ['Get secret', 'Tool · Azure Key Vault', '#0078D4', '0.3 s'], ['Snapshot with memory', 'Tool · vCenter', '#0072A3', '22 s'], ['Reset VM', 'Tool · vCenter', '#0072A3', '74 s'], ['Verify application', 'Tool · OpsRamp', '#1F5BA8', '30 s'], ['Update incident', 'Tool · ServiceNow', '#2F5B4F', '0.4 s']];
    await scene('s6', 17, async () => {
      await D('step', 6, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Key Vault', 'vCenter']);
      await app('copilot', { agent: 'Mova iO NOC Agent', run: 'Automated · ServiceNow incident ' + INC, payload: `{ "number": "${INC}",\n  "cmdb_ci": "${VM}",\n  "priority": 2,\n  "source": "OpsRamp inference #48377" }`, payloadFrom: 'Trigger payload · ServiceNow', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) {
        await D('csStep', i, 'run'); await wait(i === 5 || i === 8 ? 1.0 : 0.5); await D('csStep', i, 'ok');
        if (i === 5) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Microsoft Teams · approval</div>Approved by <b>Arjun Rao</b> (Plant IT lead) at 07:41');
        if (i === 7) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">vCenter</div>Snapshot <b>pre-reset-INC0024903</b> with memory, 22 s');
      }
      await D('csDone'); await D('csDetail', 8, { title: 'Reset VM', sub: 'Tool · vCenter (REST) · ✓ Complete · 74 s', inp: `{ "vm": "${VM}",\n  "action": "reset",\n  "snapshotFirst": true,\n  "reason": "${INC}" }`, out: `{ "task": "task-88412", "status": "success",\n  "toolsStatus": "toolsOk",\n  "bootSeconds": 74 }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    // 7 vCenter recovery
    await scene('s7', 12, async () => {
      await D('step', 7, 'Snapshot, reset, and the server is back', ['vCenter', 'OpsRamp']);
      await app('vsphere', { tree, name: VM, body: vcBody, tasks: oldTasks });
      await D('focus', '#vctasks', { maxK: 1.5, fill: 0.95, pad: 30 });
      await D('add', '#vctasks', task('Create virtual machine snapshot', VM, '⟳ Running', 'Memory 16 GB', 'CORP\\svc-mova-noc', '3 ms', '07:41:22', '', 'tk1'), true); await wait(1.6);
      await D('html', '#tk1s', '✔ Completed'); await D('html', '#tk1c', '07:41:44');
      await D('add', '#vctasks', task('Reset virtual machine', VM, '⟳ Running', '', 'CORP\\svc-mova-noc', '2 ms', '07:41:46', '', 'tk2'), true); await wait(1.6);
      await D('html', '#tk2s', '✔ Completed'); await D('html', '#tk2c', '07:41:47');
      await D('zoomOut'); await wait(0.6);
      await D('set', '#vctools', '<span style="color:#2D7A0C">Running, version 12.4.0</span>'); await D('set', '#vccon', 'Console · Windows Server 2022 · signed in');
      await D('css', '#vccon', 'background:#0E4D7A;color:#CFE6F5'); await D('html', '#vcup', '1 minute');
      await D('bar', '#vcpu', 18, '#0072A3'); await D('html', '#vcput', '0.7 GHz used · 18%'); await D('bar', '#vmem', 41, '#0072A3'); await D('html', '#vmemt', '6.6 GB used · 41%'); await D('html', '#vcupd', '07:43');
      await D('html', '#vcalarm', '✔ All alarms cleared on ' + VM + ' · MES application check: HTTP 200 (210 ms)'); await D('cls', '#vcalarm', 'g', 'r');
      await wait(1.2); await D('focus', '#vccap', { maxK: 1.6, pad: 8 });
    });
    // 8 Teams + ServiceNow close
    await scene('s8', 12, async () => {
      await D('step', 8, 'Plant told; incident resolved, problem raised', ['Microsoft Teams', 'ServiceNow']);
      await app('teams', { view: 'channel', team: 'Plant IT', channel: 'Haridwar', channels: ['General', 'Haridwar', 'Halol', 'Shift handover'] });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd"><div class="hd">MES is back for line 2 · ${INC}</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What happened:</b> the MES server stopped responding at 07:37.<br><b>What we did:</b> saved a memory snapshot and restarted it. Screens were back at 07:43.<br><b>What to do:</b> refresh any HMI still showing the old screen.</div><div style="padding:0 18px 14px;font-size:12.5px;color:#616161">Posted to Plant IT › Haridwar · shift lead tagged</div></div>`, 'Mova iO NOC Agent', '07:43'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.7, pad: 10 }); await wait(4.2);
      await app('snow', { tab: INC, body: H.snInc({ num: INC, title: 'Plant MES application server not responding · Haridwar line 2', hl: [['Priority', '2 - High', '#C2410C'], ['State', 'In Progress', '', 'snstate'], ['Assigned to', 'Mova iO NOC Agent'], ['Updated', 'just now'], ['Resolution SLA', '3h 58m left', '', 'snsla']], fields: [['Caller', 'Mova iO Integration'], ['Channel', 'Monitoring'], ['Category', 'Infrastructure'], ['Subcategory', 'Virtual machine'], ['Service', 'Plant MES'], ['Configuration item', VM], ['Impact', '2 - Medium'], ['Urgency', '1 - High'], ['Assignment group', 'Plant IT'], ['Problem', '', 'snprb']], notes: [H.note('Mova iO Triage orchestrator', H.MV, 'Root cause: guest OS hang, 92% confidence.', '07:40'), H.note('Mova iO Event correlator', H.MV, 'Created from OpsRamp inference #48377.', '07:39')] }) });
      await D('add', '#snnotes', H.note('Arjun Rao', '#3E8E7E', 'Approved RB-011 in Teams.', '07:41'), true);
      await D('add', '#snnotes', H.note('Mova iO Guided resolution assistant', H.MV, 'RB-011 complete: memory snapshot saved, VM reset, VMware Tools running, MES check HTTP 200. Verified for 60 s.', '07:43'), true);
      await D('add', '#snnotes', H.note('Mova iO Problem agent', H.MV, 'Third hang in 30 days, each after memory reached 98%. Raised PRB0004417 for the MES service memory leak; dump attached for the vendor.', '07:44'), true);
      await D('set', '#snprb', '<b style="color:#0B63C4">PRB0004417</b> · MES service memory leak');
      await D('set', '#snstate', '<span style="color:#1B7A43">Resolved</span>'); await D('html', '#snsla', 'Met');
      await D('set', '#snresbox', `<label style="font-size:12.5px;color:#5A6872">Resolution notes</label><div class="v" style="border:1px solid #CDD3DA;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff">Guest OS hang on ${VM}. Memory snapshot taken, VM reset by RB-011 with Plant IT approval; MES restored at 07:43. Root cause tracked in PRB0004417.</div>`);
      await D('focus', '#snright', { maxK: 1.5, pad: 6 });
    });
    await closing({ close: ['Hang diagnosed in under two minutes.', 'Line 2 back six minutes after the first alert.', 'Evidence kept, problem raised, so it doesn’t come back.'], tag: ['Hung servers, recovered by', 'Mova iO agents.', 'With people in control.'] });
  },
};
