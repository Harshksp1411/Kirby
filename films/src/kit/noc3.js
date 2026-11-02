// NOC film 3: a file server disk filling up, caught by forecast and fixed in a standard change before anyone notices.
const L = require('./lib.js'); const { H } = L;
const SRV = 'hyd-city-fs-02', CHG = 'CHG0031207';
const hist = Array.from({ length: 30 }, (_, i) => +(62 + i * 0.72 + Math.sin(i * 1.7) * 0.9 + (i > 20 ? (i - 20) * 0.35 : 0)).toFixed(1));
const fc = [hist[29], 88.2, 90.6, 93.1, 95.4, 97.8, 100];
const after = [...hist.slice(0, 29), 84.6, 68.1];
const days = [[0, '8 Oct'], [7, '15 Oct'], [14, '22 Oct'], [21, '29 Oct'], [29, 'Today'], [35, '7 Nov']];
const chartBefore = H.chart({ w: 980, h: 330, data: hist, forecast: fc, threshold: 95, tlabel: 'Critical 95%', unit: '%', labels: days, marks: [[34, 95.4, 'Forecast: 95% on Wed 4 Nov', '#D32F2F']], id: 'dchart' });
const chartAfter = H.chart({ w: 980, h: 330, data: after, forecast: [68.1, 68.8, 69.5, 70.2, 70.9, 71.6, 72.3], threshold: 95, tlabel: 'Critical 95%', unit: '%', labels: [[0, '8 Oct'], [7, '15 Oct'], [14, '22 Oct'], [21, '29 Oct'], [30, 'Today'], [36, '7 Nov']], marks: [[30, 68.1, 'After extend: 68%', '#2E7D32']], id: 'dchart' });
const opsBody = (chart) => `<div style="display:flex;gap:16px;height:100%"><div style="flex:1.65;display:flex;flex-direction:column;gap:14px;min-width:0">
   <div class="crd" id="chartcard"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><b style="font-size:15px">disk.used.pct · Volume D: (Shares)</b><span class="pl n">Last 30 days</span><span class="pl p">Forecast on</span><span style="margin-left:auto;font-size:13px;color:#5a6577">Current <b id="dcur" style="color:#B26A00;font-size:18px">84.6%</b> of 1.00 TB</span></div><div id="chartwrap">${chart}</div></div>
   <div style="display:flex;gap:14px"><div class="crd" style="flex:1"><h4>Volumes</h4>${H.table(['Volume', 'Size', 'Used', 'Free', 'Growth / day'], [['C: (System)', '120 GB', '61%', '47 GB', '0.1 GB'], ['D: (Shares)', '<span id="vsz">1.00 TB</span>', '<b id="vused" style="color:#B26A00">84.6%</b>', '<span id="vfree">158 GB</span>', '<b>11.4 GB</b>']], { tb: 'voltb' })}</div>
   <div class="crd" style="flex:.8"><h4>Resource</h4>${H.kv([['OS', 'Windows Server 2022'], ['Site', 'Hyderabad City Office'], ['Role', 'File server · 1,240 users'], ['Host', 'VM on HYD-Cluster-01']])}</div></div></div>
  <div style="flex:1;display:flex;flex-direction:column;gap:14px;min-width:0"><div class="crd" id="fcalert"><h4>Alerts</h4><div style="border-left:4px solid #F59E0B;padding:8px 12px;background:#FFF8E6;font-size:13.5px;line-height:1.5"><b>${H.sev('Warning')} Forecast: D: reaches 95% in 5 days</b><br>Trend over 30 days · full on Sat 7 Nov · created 09:12<br><span style="color:#5a6577">Source: OpsRamp forecast · Mova iO</span></div></div>
  <div class="crd" id="capai"><h4>Mova iO capacity analysis</h4><div id="capbody" style="font-size:13.5px;line-height:1.6;color:#5a6577">Waiting for analysis…</div></div></div></div>`;
const opsSub = `<b style="font-size:16px">${SRV}</b><span style="color:#8a94a6">Infrastructure › Resources › ${SRV}</span><span class="chip" style="color:#B26A00;border-color:#F6D49A">Warning 1</span><span style="margin-left:24px;display:flex;gap:18px">${['Overview', 'Metrics', 'Alerts', 'Monitors', 'Patches', 'Attributes'].map((t) => `<span style="${t === 'Metrics' ? 'font-weight:700;border-bottom:3px solid #2BA4E0;padding:14px 0 12px' : 'color:#5a6577'}">${t}</span>`).join('')}</span>`;
const tree = [["vcsa-hub-01.corp.local", 0, "#49606D"], ["India South DC", 1, "#7D8C93"], ["HYD-Cluster-01", 2, "#3E86A8"], ["esx-hyd-01.corp.local", 3, "#5B7F2B"], [SRV, 4, "#3E86A8", 1], ["hyd-city-vm-print", 4, "#3E86A8"], ["hyd-city-vm-dc", 4, "#3E86A8"], ["esx-hyd-02.corp.local", 3, "#5B7F2B"], ["hyd-city-vm-app", 4, "#3E86A8"], ["BLR-Cluster-01", 2, "#3E86A8"]];
const vcBody = `<div class="cards" style="grid-template-columns:1.2fr 1fr">
  <div class="card" id="vmhw"><h5>VM Hardware</h5><div class="kv" style="grid-template-columns:150px 1fr;font-size:13.5px;gap:8px 12px"><span>CPU</span><span>4 CPU(s)</span><span>Memory</span><span>16 GB</span><span>Hard disk 1</span><span>120 GB · Thin provision</span><span>Hard disk 2</span><span><b id="hd2">1.00 TB</b> · Thick provision lazy zeroed · HYD-DS-02</span><span>Network adapter 1</span><span>VLAN-31-USERS (connected)</span><span>Compatibility</span><span>ESXi 8.0 U2 and later (VM version 21)</span></div></div>
  <div class="card" id="dscard"><h5>Datastore · HYD-DS-02</h5>${['Capacity', 'Free'].map((x) => '').join('')}<div class="kv" style="grid-template-columns:110px 1fr;font-size:13.5px;gap:8px 12px"><span>Capacity</span><span>6.00 TB</span><span>Free</span><span><b id="dsfree">1.40 TB</b></span><span>Type</span><span>VMFS 6 · vSAN-ready</span><span>Hosts</span><span>2</span></div><div class="bar" style="margin-top:12px"><i id="dsbar" style="width:77%;background:#0072A3"></i></div></div>
  <div class="card" style="grid-column:1/3"><h5>Capacity and Usage</h5><div style="display:flex;gap:30px;font-size:13.5px"><div style="flex:1"><b>CPU</b> · 12% · 0.5 GHz<div class="bar" style="margin-top:6px"><i style="width:12%;background:#0072A3"></i></div></div><div style="flex:1"><b>Memory</b> · 44% · 7.0 GB<div class="bar" style="margin-top:6px"><i style="width:44%;background:#0072A3"></i></div></div><div style="flex:1"><b>Storage</b> · <span id="stot">1.12 TB provisioned</span><div class="bar" style="margin-top:6px"><i id="stbar" style="width:70%;background:#0072A3"></i></div></div></div></div></div>`;
const task = (n, t, st, det, s, c, id) => `<tr ${id ? `id="${id}"` : ""}><td>${n}</td><td style="color:#0072A3">${t}</td><td id="${id}s">${st}</td><td>${det}</td><td>CORP\\svc-mova-noc</td><td>3 ms</td><td>${s}</td><td id="${id}c">${c}</td></tr>`;
const snChange = (state, extra) => H.snInc({ kicker: 'Change request', num: CHG, title: `Standard change · Extend D: on ${SRV} by 250 GB`, buttons: ['Implement', 'Save', '⋯'], hl: [['Type', 'Standard'], ['State', state, '', 'snstate'], ['Risk', 'Low', '#1B7A43'], ['Approval', 'Pre-approved (template)', '', 'snappr'], ['Planned start', 'Today 13:00', '', 'snstart']],
  fields: [['Template', 'STD-VM-DISK-EXTEND v3'], ['Requested by', 'Mova iO Capacity Agent'], ['Configuration item', SRV], ['Service', 'File services · Hyderabad'], ['Assignment group', 'Infrastructure Operations'], ['Implementer', 'Mova iO NOC Agent'], ['Planned window', 'Today 13:00 to 13:30 (lowest I/O of the day)'], ['Conflict check', 'No conflicts · no freeze'], ['Implementation plan', 'Snapshot-free online extend of Hard disk 2 (1.00 → 1.25 TB) in vCenter; extend D: in Windows; verify free space and share access.', '', 1], ['Backout plan', 'Not required for an online grow; restore point from the 02:00 backup.', '', 1]], ltabs: ['Details', 'Approvals', 'Change tasks (3)', 'Affected CIs'], notes: extra || [] });

module.exports = {
  page: 'kit.html', vo: 'vo_noc3',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['Disks don\'t fail loudly.', 'They fill up quietly.', 'Until nobody can save a file.'], stats: [], intro: ['How <span class="y">Mova iO</span> fixes a full disk', 'days before it fills.', 'OpsRamp · vCenter · ServiceNow · Microsoft Teams · Copilot Studio · Key Vault'] });
    await scene('s1', 11, async () => {
      await D('step', 1, 'A forecast, not an outage', ['OpsRamp']);
      await app('opsramp', { nav: 'Infrastructure', sub: opsSub, body: opsBody(chartBefore) });
      await D('focus', '#chartcard', { maxK: 1.5, pad: 6 }); await wait(5);
      await D('focus', '#fcalert', { maxK: 1.8, pad: 6 });
    });
    await scene('s2', 13, async () => {
      await D('step', 2, 'Mova iO finds what is growing, and where there is room', ['Mova iO', 'OpsRamp', 'vCenter']);
      await D('focus', '#capai', { maxK: 1.6, pad: 6 });
      await D('typeHtml', '#capbody', `<div style="color:#1d2433"><b>Growth source:</b> <span class="mono">D:\\Shares\\Finance\\MonthEnd\\Exports</span> grew <b>310 GB in 3 weeks</b> (new ERP export job, 2.1 GB per run, 5 runs a day).<br><b>Room to grow:</b> datastore HYD-DS-02 has <b>1.40 TB free</b>; host and VM healthy.<br><b>Recommendation:</b> extend D: by <b>250 GB</b> with standard change <b>STD-VM-DISK-EXTEND</b> at 13:00 (lowest I/O of the day), and ask Finance to set a retention period on the exports.<br><b>Confidence:</b> 94%</div>`, 12);
    });
    await scene('s3', 12, async () => {
      await D('step', 3, 'A pre-approved standard change, raised for you', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: CHG, tabs: ['Home', 'Changes'], body: snChange('Scheduled') });
      await D('add', '#snnotes', H.note('Mova iO Capacity Agent', H.MV, `Raised from OpsRamp forecast on ${SRV}: D: at 84.6%, growing 11.4 GB a day, 95% expected Wed 4 Nov. Datastore HYD-DS-02 has 1.40 TB free.`, '09:14'), true);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(4.4);
      await D('focus', '#snleft', { maxK: 1.5, pad: 4 });
    });
    await scene('s4', 11, async () => {
      await D('step', 4, 'The owner is told, and can stop it', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO NOC Agent', items: [['Mova iO NOC Agent', 'Scheduled · ' + CHG, 1], ['Infrastructure Ops', 'Kiran: patching done for HYD', 0], ['Finance IT', 'Month-end close starts Fri', 0]], me: 'SK' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Scheduled for 13:00 · ' + CHG, intro: `D: on ${SRV} will be full by Saturday. I've scheduled a standard change to add 250 GB at lunchtime. Nothing goes offline.`, facts: [['Server', SRV + ' · Hyderabad file shares'], ['Change', 'Extend D: 1.00 → 1.25 TB (online)'], ['Window', 'Today 13:00 to 13:30'], ['Approval', 'Pre-approved standard change'], ['Also', 'Finance asked to set retention on MonthEnd exports']], countdown: 'Runs at 13:00 ·', secs: 8, buttons: ['Run now', 'Stop', 'Open change'] }), 'Mova iO NOC Agent', '09:15'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await D('tmCountdown', 8); await wait(4.5);
      await D('add', '#tmmsgs', H.msg('Looks good, go ahead at 13:00 👍', 'Sana Khan', '09:17'));
    });
    const nodes = [['Trigger', 'OpsRamp · forecast alert', '#1F5BA8', '0.1 s'], ['Get metric history', 'Tool · OpsRamp', '#1F5BA8', '0.7 s'], ['Find top growth', 'Tool · Windows (PowerShell)', '#2B579A', '9.4 s'], ['Check datastore', 'Tool · vCenter', '#0072A3', '0.9 s'], ['Create standard change', 'Tool · ServiceNow', '#2F5B4F', '1.1 s'], ['Notify owner', 'Tool · Microsoft Teams', '#5B5FC7', '0.6 s'], ['Wait for window', 'Schedule · 13:00', '#8A8886', '3h 45m'], ['Get secret', 'Tool · Azure Key Vault', '#0078D4', '0.3 s'], ['Extend virtual disk', 'Tool · vCenter', '#0072A3', '6.2 s'], ['Extend volume D:', 'Tool · Windows (PowerShell)', '#2B579A', '3.8 s'], ['Verify free space', 'Tool · OpsRamp', '#1F5BA8', '60 s'], ['Close change', 'Tool · ServiceNow', '#2F5B4F', '0.5 s']];
    await scene('s5', 16, async () => {
      await D('step', 5, 'At 13:00, every step is a tool call you can inspect', ['Copilot Studio', 'Key Vault', 'vCenter']);
      await app('copilot', { agent: 'Mova iO NOC Agent', run: 'Scheduled · ServiceNow change ' + CHG, payload: `{ "change": "${CHG}",\n  "cmdb_ci": "${SRV}",\n  "template": "STD-VM-DISK-EXTEND",\n  "growGB": 250 }`, payloadFrom: 'Trigger payload · ServiceNow', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 8 || i === 9 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 2) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Windows · top growth</div><span class="mono">Finance\\MonthEnd\\Exports</span> +310 GB in 21 days'); if (i === 9) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Windows · Resize-Partition</div>D: now <b>1.25 TB</b>, 408 GB free'); }
      await D('csDone'); await D('csDetail', 8, { title: 'Extend virtual disk', sub: 'Tool · vCenter (REST) · ✓ Complete · 6.2 s', inp: `{ "vm": "${SRV}",\n  "disk": "Hard disk 2",\n  "newCapacityGB": 1280,\n  "change": "${CHG}" }`, out: `{ "task": "task-90311", "status": "success",\n  "capacityGB": 1280, "online": true }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'Disk grown online, nobody disconnected', ['vCenter']);
      await app('vsphere', { tree, name: SRV, body: vcBody, tasks: task('Remove snapshot', 'hyd-city-vm-app', '✔ Completed', '', '06:58:40', '06:58:52', 'o1') });
      await D('focus', '#vmhw', { maxK: 1.6, pad: 8 }); await wait(1.4);
      await D('add', '#vctasks', task('Reconfigure virtual machine', SRV, '⟳ Running', 'Hard disk 2 → 1.25 TB', '13:00:04', '', 'tk1'), true); await wait(1.4);
      await D('html', '#tk1s', '✔ Completed'); await D('html', '#tk1c', '13:00:10'); await D('set', '#hd2', '1.25 TB'); await D('set', '#dsfree', '1.15 TB'); await D('bar', '#dsbar', 81); await D('html', '#stot', '1.37 TB provisioned');
    });
    await scene('s7', 11, async () => {
      await D('step', 7, 'The forecast moves out to February', ['OpsRamp']);
      await app('opsramp', { nav: 'Infrastructure', sub: opsSub, body: opsBody(chartAfter) });
      await D('html', '#dcur', '<span style="color:#2E7D32">68.1%</span> of 1.25 TB'); await D('html', '#vsz', '1.25 TB'); await D('html', '#vused', '<span style="color:#2E7D32">68.1%</span>'); await D('html', '#vfree', '408 GB');
      await D('html', '#fcalert', `<h4>Alerts</h4><div style="border-left:4px solid #2E7D32;padding:8px 12px;background:#EEF8EF;font-size:13.5px;line-height:1.5"><b>${H.sev('Ok')} Forecast cleared</b><br>D: now reaches 95% around <b>Sat 6 Feb</b> (95 days)<br><span style="color:#5a6577">Closed by Mova iO · ${CHG}</span></div>`);
      await D('html', '#capbody', '<div style="color:#1d2433">Change <b>' + CHG + '</b> completed 13:00:10. D: grown online to 1.25 TB; 408 GB free; no share disconnects in the window.<br>Finance has a retention review open for <span class="mono">MonthEnd\\Exports</span>.</div>');
      await D('focus', '#chartcard', { maxK: 1.5, pad: 6 }); await wait(4.6); await D('focus', '#fcalert', { maxK: 1.8, pad: 6 });
    });
    await scene('s8', 10, async () => {
      await D('step', 8, 'The change closes itself, with evidence', ['ServiceNow']);
      await app('snow', { tab: CHG, tabs: ['Home', 'Changes'], body: snChange('Implement', [H.note('Sana Khan', '#3E8E7E', 'Go ahead at 13:00.', '09:17'), H.note('Mova iO Capacity Agent', H.MV, 'Raised from OpsRamp forecast on ' + SRV + '.', '09:14')]) });
      await D('add', '#snnotes', H.note('Mova iO NOC Agent', H.MV, 'Hard disk 2 extended 1.00 → 1.25 TB (task-90311); D: extended in Windows; 408 GB free; share checks passed from 3 sites. OpsRamp forecast cleared.', '13:01'), true);
      await D('set', '#snstate', '<span style="color:#1B7A43">Closed · Successful</span>');
      await D('set', '#snresbox', `<label style="font-size:12.5px;color:#5A6872">Close notes</label><div class="v" style="border:1px solid #CDD3DA;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff">Implemented in window with no impact. Capacity now good to Feb. Retention review raised with Finance (RITM0088120).</div>`);
      await D('focus', '#snright', { maxK: 1.5, pad: 6 });
    });
    await closing({ close: ['Caught five days before it filled.', 'Fixed online, in a pre-approved window.', 'Nobody lost a file, and nobody was paged.'], tag: ['Capacity problems, prevented by', 'Mova iO agents.', 'With people in control.'] });
  },
};
