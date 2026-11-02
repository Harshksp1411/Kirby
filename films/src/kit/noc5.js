// NOC film 5: a site power cut. UPS on battery, runtime stretched, generator started, engineer dispatched.
const L = require('./lib.js'); const { H } = L;
const SITE = 'Vadodara Office', UPS = 'vdr-office-ups-01', INC = 'INC0025230', WO = 'WO0010472';
const orRow = (r) => `<tr class="old"><td><input type="checkbox"></td><td>${H.sev(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td style="color:#5a6577">${r[6]}</td></tr>`;
const oldRows = [["Ok", "Disk usage back below threshold", "hyd-city-fs-02", "disk.used.pct", "Agent", "09:12", "Resolved"], ["Ok", "Interface flap cleared", "shu-plant-sw-01", "net.if.status", "SNMP", "08:41", "Resolved"], ["Warning", "CPU above 85% for 10 min", "jed-office-esx-01", "cpu.util", "vCenter", "08:37", "Acknowledged"], ["Ok", "Certificate renewed", "vpn-gw-hub-02", "cert.days", "Agent", "07:58", "Resolved"], ["Ok", "Ping restored", "vnf-factory-edge-01", "ping.loss", "SD-WAN", "07:44", "Resolved"]];
const ALERTS = [["Critical", "UPS on battery · input voltage 0 V", UPS, "ups.input.status", "SNMP trap", "09:41:06"], ["Critical", "Utility power lost", "vdr-office-pdu-01", "pdu.input", "SNMP", "09:41:09"], ["Warning", "Running on UPS · estimated runtime 38 min", UPS, "ups.runtime", "SNMP", "09:41:30"], ["Warning", "Generator did not start (ATS no transfer)", "vdr-office-ats-01", "ats.state", "Modbus", "09:42:10"]];
const opsSub = `<b style="font-size:16px">Alerts</b><span style="color:#8a94a6">Command Center › Alerts</span><span class="chip" style="color:#C62828;border-color:#F3B4B4">Critical <b id="nC">0</b></span><span class="chip" style="color:#B26A00;border-color:#F6D49A">Warning <b id="nW">0</b></span><span class="chip">Inferences <b id="nI">0</b></span><span style="margin-left:auto" class="chip">Last 1 hour</span>`;
const upsBody = (st) => `<div style="display:flex;height:100%"><div style="width:230px;background:#fff;border-right:1px solid #E1E4E8;padding:14px 0;font-size:14px">${['Home', 'Status', 'Control', 'Configuration', 'Tests', 'Logs', 'About'].map((n) => `<div style="padding:9px 22px;${n === 'Status' ? 'background:#FFF1E8;color:#C2410C;font-weight:700;border-left:4px solid #C2410C' : 'color:#444'}">${n}</div>`).join('')}</div>
  <div style="flex:1;padding:22px 26px;display:flex;flex-direction:column;gap:16px">
   <div style="display:flex;align-items:center;gap:16px"><div><div style="font-size:13px;color:#6B7280">Status › UPS</div><div style="font-size:22px;font-weight:700">${UPS} · ${SITE} server room</div></div><span id="upsst" class="pl ${st.c}" style="font-size:15px;padding:6px 14px;margin-left:auto">${st.t}</span></div>
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px" id="upsgrid">
    <div class="crd"><h4>Input voltage</h4><div style="font-size:34px;font-weight:700" id="uin">${st.vin}</div><div style="color:#6B7280;font-size:13px" id="uinsrc">${st.src}</div></div>
    <div class="crd"><h4>Battery capacity</h4><div style="font-size:34px;font-weight:700" id="ubat">${st.bat}</div><div class="bar" style="margin-top:8px"><i id="ubatbar" style="width:${parseInt(st.bat)}%;background:#2E7D32"></i></div></div>
    <div class="crd" id="urtcard"><h4>Runtime remaining</h4><div style="font-size:34px;font-weight:700;color:${st.rc}" id="urt">${st.rt}</div><div style="color:#6B7280;font-size:13px">at current load</div></div>
    <div class="crd"><h4>Output load</h4><div style="font-size:34px;font-weight:700" id="uload">${st.load}</div><div style="color:#6B7280;font-size:13px" id="uw">${st.w}</div></div></div>
   <div class="crd" style="flex:1"><h4>Event log</h4><div id="ulog" style="font-size:13.5px;line-height:2">${st.log.map((l) => `<div>${l}</div>`).join('')}</div></div></div></div>`;
const upsA = { t: 'On Battery', c: 'r', vin: '0 V', src: 'Utility: lost at 09:41:04', bat: '92%', rt: '38 min', rc: '#C62828', load: '61%', w: '3.7 kW of 6.0 kW', log: ['09:42:10 · Generator start signal sent; no transfer from ATS', '09:41:04 · On battery: utility input out of range (0 V)', '06:00:00 · Self-test passed'] };
const tree = [["vcsa-hub-01.corp.local", 0, "#49606D"], ["India West DC", 1, "#7D8C93"], ["VDR-Office-Cluster", 2, "#3E86A8"], ["esx-vdr-01.corp.local", 3, "#5B7F2B", 1], ["vdr-office-vm-dc", 4, "#3E86A8"], ["vdr-office-vm-file", 4, "#3E86A8"], ["vdr-office-vm-print", 4, "#3E86A8"], ["vdr-office-vm-test", 4, "#3E86A8"], ["vdr-office-vdi-01", 4, "#3E86A8"], ["vdr-office-vdi-02", 4, "#3E86A8"], ["vdr-office-vm-wsus", 4, "#3E86A8"], ["vdr-office-vm-cctv", 4, "#3E86A8"]];
const VMS = [['vdr-office-vm-dc', 'Critical', 'Keep running'], ['vdr-office-vm-file', 'Critical', 'Keep running'], ['vdr-office-vm-cctv', 'Critical', 'Keep running'], ['vdr-office-vm-print', 'Non-critical', 'Shut down'], ['vdr-office-vm-test', 'Non-critical', 'Shut down'], ['vdr-office-vdi-01', 'Non-critical', 'Shut down'], ['vdr-office-vdi-02', 'Non-critical', 'Shut down'], ['vdr-office-vm-wsus', 'Non-critical', 'Shut down']];
const vcBody = `<div style="padding:14px 20px"><div class="card" style="font-size:13.5px"><h5>Virtual Machines on esx-vdr-01 · power plan</h5>${H.table(['Name', 'State', 'Tier', 'Plan', 'Power draw'], VMS.map(([n, t, p], i) => ({ id: 'vm' + i, c: [n, '<span style="color:#2D7A0C">● Powered On</span>', t === 'Critical' ? H.pl('Critical', 'r') : H.pl('Non-critical', 'n'), p, (t === 'Critical' ? 0.42 : 0.31).toFixed(2) + ' kW'] })))}</div></div>`;
const task = (n, t, st, s, c, id) => `<tr ${id ? `id="${id}"` : ""}><td>${n}</td><td style="color:#0072A3">${t}</td><td id="${id}s">${st}</td><td></td><td>CORP\\svc-mova-noc</td><td>3 ms</td><td>${s}</td><td id="${id}c">${c}</td></tr>`;
const snBody = (state, notes, top) => H.snInc({ num: INC, title: `Site power loss · ${SITE} (on UPS, generator did not start)`, hl: [['Priority', '1 - Critical', '#B42318'], ['State', state, '', 'snstate'], ['Assigned to', 'Mova iO NOC Agent'], ['Updated', 'just now'], ['Resolution SLA', '1h 56m left', '', 'snsla']], fields: [['Caller', 'Mova iO Integration'], ['Channel', 'Monitoring'], ['Category', 'Facilities'], ['Subcategory', 'Power'], ['Service', 'Site infrastructure'], ['Configuration item', UPS], ['Impact', '1 - High'], ['Urgency', '1 - High'], ['Assignment group', 'Site Operations West'], ['Work order', '', 'snwo'], ['Short description', `Utility power lost at ${SITE} 09:41; UPS runtime 38 min; ATS did not start the generator`, '', 1]], notes });

module.exports = {
  page: 'kit.html', vo: 'vo_noc5',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['The lights go out.', 'The UPS takes over.', 'The clock starts ticking.'],
      statText: [['stat1', 'No. 1', 'Power remains the leading cause of impactful outages', 'Source: Uptime Institute, Annual Outage Analysis 2026']],
      intro: ['How <span class="y">Mova iO</span> keeps a site running', 'through a power cut.', 'OpsRamp · UPS management · vCenter · ServiceNow Field Service · Microsoft Teams'] });
    await scene('s1', 10, async () => {
      await D('step', 1, '09:41, utility power is lost', ['OpsRamp']);
      await app('opsramp', { sub: opsSub, body: `<table><thead><tr><th style="width:28px"></th><th>Severity</th><th>Subject</th><th>Resource</th><th>Metric</th><th>Source</th><th>Created</th><th>Status</th></tr></thead><tbody id="orb">${oldRows.map(orRow).join('')}</tbody></table>`, drawer: true });
      let c = 0, w = 0;
      for (const a of ALERTS) { await D('add', '#orb', `<tr class="al"><td><input type="checkbox"></td><td>${H.sev(a[0])}</td><td>${a[1]}</td><td>${a[2]}</td><td>${a[3]}</td><td>${a[4]}</td><td>${a[5]}</td><td>Open</td></tr>`, true); if (a[0] === 'Critical') await D('html', '#nC', String(++c)); else await D('html', '#nW', String(++w)); await wait(0.8); }
      await D('cls', '#orb tr.al', 'child');
      await D('add', '#orb', `<tr class="inf" id="infrow"><td>▾</td><td>${H.sev('Critical')}</td><td><b>Inference #48502 · Site power loss at ${SITE}</b> <span class="chip" style="margin-left:8px;font-size:12px">4 correlated alerts</span></td><td>${SITE}</td><td>correlation</td><td>OpsQ · Mova iO</td><td>09:42:14</td><td><b style="color:#2E7D32">Ticketed</b></td></tr>`, true);
      await D('html', '#nI', '1'); await D('focus', '#orb', { maxK: 1.45, fill: 0.9, pad: 6 });
    });
    await scene('s2', 10, async () => {
      await D('step', 2, '38 minutes of battery left', ['UPS management']);
      await app('web', { brand: 'UPS Network Management Card', color: '#3A3F47', links: ['Home', 'Status', 'Control', 'Logs'], right: UPS + ' · SNMP v3', body: upsBody(upsA) });
      await D('focus', '#upsgrid', { maxK: 1.5, pad: 8 }); await wait(4.5);
      await D('focus', '#urtcard', { maxK: 2, pad: 8 });
    });
    await scene('s3', 11, async () => {
      await D('step', 3, 'The utility expects two hours', ['Utility portal', 'Mova iO']);
      await app('web', { brand: 'State Electricity Board · Outage notices', color: '#4F5D2F', links: ['Outages', 'Planned shutdowns', 'Report a fault'], right: 'Account: Global Operations · Business', body: `<div style="padding:24px 28px;display:flex;gap:20px;height:100%"><div class="crd" style="flex:1.2" id="util"><div style="font-size:13px;color:#6B7280">Outages › Unplanned</div><div style="font-size:22px;font-weight:700;margin:4px 0 16px">Feeder trip · Makarpura industrial area</div>${H.kv([['Status', H.pl('Ongoing', 'r')], ['Started', '09:39'], ['Cause', 'Cable fault on 11 kV feeder; crew on site'], ['Areas', 'Makarpura GIDC, Atladra (part)'], ['Estimated restoration', '<b style="font-size:18px">11:30 (about 2 hours)</b>'], ['Your connection', 'Consumer 4471-0921 · ' + SITE]])}</div><div class="crd" style="flex:.8;font-size:13.5px;line-height:1.6"><h4>Read by Mova iO at 09:42</h4>Runtime <b>38 min</b> vs restoration <b>~110 min</b>: the UPS will not last.<br>The generator did not start on its own (ATS no transfer).<br><b>Plan:</b> ask Facilities to start the generator by hand, shed non-critical load to buy time, and dispatch an engineer to fix the ATS.</div></div>` });
      await D('focus', '#util', { maxK: 1.6, pad: 6 });
    });
    await scene('s4', 12, async () => {
      await D('step', 4, 'A P1 incident, with the plan in it', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: INC, body: snBody('In Progress', []) });
      await D('add', '#snnotes', H.note('Mova iO Triage orchestrator', H.MV, `<b>Utility feeder fault</b>, restoration about 11:30. UPS runtime 38 min at 3.7 kW. ATS sent no start to the generator.<br><b>To stay up:</b> shut down 5 non-critical VMs (−1.6 kW, runtime to about 70 min), Facilities to start the generator manually, engineer to repair the ATS.<br>Load shedding needs Site IT approval.`, '09:43'), true);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(3); await D('focus', '#snact', { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene('s5', 11, async () => {
      await D('step', 5, 'Site IT approves; Facilities is called', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO NOC Agent', items: [['Mova iO NOC Agent', 'Approval needed · ' + INC, 1], ['Vadodara Facilities', 'Generator room key with security', 0], ['Site IT · West', 'Power cut at Vadodara?', 0]], me: 'MP' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Approval needed · ' + INC, intro: `${SITE} is on UPS with 38 minutes left, and power is due back around 11:30. I recommend shutting down 5 non-critical VMs to stretch the battery while Facilities starts the generator.`, facts: [['Shut down', 'print, test, 2 VDI hosts, WSUS'], ['Keep running', 'Domain controller, file server, CCTV'], ['Runtime', '38 → about 70 minutes'], ['Already done', 'Facilities called on +91 ••••• 4410; engineer WO raised']], buttons: ['Approve', 'Reject', 'Open incident'] }), 'Mova iO NOC Agent', '09:43'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.4);
      await D('cursor', '#apok', true); await wait(1.05); await D('tmApprove', 'Meera Patel (Site IT lead)', 'Shutting down 5 VMs on esx-vdr-01…'); await wait(1); await D('cursorOff');
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'Non-critical load shed, cleanly', ['vCenter']);
      await app('vsphere', { tree, name: 'esx-vdr-01.corp.local', icon: '#5B7F2B', tabs: ['Summary', 'Monitor', 'Configure', 'Permissions', 'VMs', 'Datastores', 'Networks', 'Updates'], tab: 'VMs', body: vcBody, tasks: '' });
      await D('focus', '#vcbody', { maxK: 1.4, pad: 0 });
      for (let i = 3; i < 8; i++) { await D('add', '#vctasks', task('Initiate guest OS shutdown', VMS[i][0], '✔ Completed', '09:44:' + (10 + i * 3), '09:44:' + (11 + i * 3), 't' + i), true); await D('html', `#vm${i} .c1`, '<span style="color:#6B7B84">○ Powered Off</span>'); await D('flash', '#vm' + i); await wait(0.7); }
      await D('focus', '#vctasks', { maxK: 1.5, fill: 0.95, pad: 20 });
    });
    await scene('s7', 12, async () => {
      await D('step', 7, 'Runtime doubled, then the generator takes over', ['UPS management']);
      await app('web', { brand: 'UPS Network Management Card', color: '#3A3F47', links: ['Home', 'Status', 'Control', 'Logs'], right: UPS + ' · SNMP v3', body: upsBody(upsA) });
      await D('focus', '#upsgrid', { maxK: 1.5, pad: 8 });
      await D('set', '#uload', '34%'); await D('html', '#uw', '2.1 kW of 6.0 kW'); await D('set', '#urt', '71 min'); await D('css', '#urt', 'color:#B26A00'); await D('add', '#ulog', '<div>09:45:02 · Load reduced to 34%; runtime 71 min</div>', true); await wait(3.6);
      await D('set', '#upsst', 'On Line'); await D('cls', '#upsst', 'g', 'r'); await D('set', '#uin', '231 V'); await D('html', '#uinsrc', 'Source: generator (manual start 10:02)'); await D('set', '#urt', 'On line'); await D('css', '#urt', 'color:#1E7E34'); await D('set', '#ubat', '64%'); await D('bar', '#ubatbar', 64);
      await D('add', '#ulog', '<div><b>10:02:41 · On line: input restored (generator)</b>; battery recharging</div>', true);
    });
    await scene('s8', 13, async () => {
      await D('step', 8, 'Engineer dispatched; everyone kept informed', ['Field Service', 'Microsoft Teams', 'ServiceNow']);
      await app('snow', { tab: WO, tabs: ['Home', 'Work orders'], ws: 'Field Service Management', body: H.snInc({ kicker: 'Work order', num: WO, title: `Repair ATS: generator did not auto-start · ${SITE}`, buttons: ['Dispatch', 'Save', '⋯'], hl: [['Priority', '1 - Critical', '#B42318'], ['State', 'Assigned', '', 'wostate'], ['Agent', 'Vikram Desai'], ['ETA', '10:40', '', 'woeta'], ['Parent', INC]], fields: [['Location', SITE + ' · generator room'], ['Skills', 'Electrical · ATS · DG sets'], ['Parts', 'ATS controller board (on van)'], ['Access', 'Key with site security'], ['Work notes for engineer', 'ATS showed no transfer at 09:42. Generator started manually at 10:02 and is carrying 2.1 kW. Do not switch back to mains until utility confirms restoration.', '', 1]], ltabs: ['Details', 'Tasks (2)', 'Parts', 'Map'], notes: [H.note('Mova iO Dispatch agent', H.MV, 'Nearest engineer with ATS skills: Vikram Desai, 26 min away. Assigned and parts confirmed on van.', '09:46')] }) });
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(4.4);
      await app('teams', { view: 'channel', team: 'IT Operations', channel: 'Site updates' });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd"><div class="hd">${SITE}: running on generator · ${INC}</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What happened:</b> a utility cable fault cut power at 09:41.<br><b>Where we are:</b> on generator since 10:02. Print, test and VDI are off until mains returns; everything else is up.<br><b>Next:</b> engineer on site 10:40 to fix the generator switch. Utility expects power back around 11:30.</div></div>`, 'Mova iO NOC Agent', '10:03'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.7, pad: 10 });
    });
    await closing({ close: ['Battery stretched from 38 to 71 minutes.', 'Generator running 21 minutes after the cut.', 'No servers dropped, and the engineer already on the way.'], tag: ['Power cuts, handled by', 'Mova iO agents.', 'With people in control.'] });
  },
};
