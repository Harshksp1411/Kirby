// SOC film 3: ransomware behaviour on a laptop. Isolated in seconds, spread checked, files restored, device rebuilt.
const L = require('./lib.js'); const { H } = L; const S = require('./soc_common.js');
const DEV = 'lap-pun-0417', U = 'Rohan Deshpande', INCID = '4140', SIR = 'SIR0010241', HASH = '7f3c…a91e';
const resp = ['Manage tags', 'Initiate automated investigation', 'Initiate live response session', 'Collect investigation package', 'Run antivirus scan', 'Restrict app execution', 'Isolate device', 'Action center'];
const devPage = `<div style="padding:14px 26px 0;display:flex;flex-direction:column;height:100%"><div class="crumb" style="padding:0">Assets › Devices › ${DEV}</div><div style="display:flex;align-items:center;gap:12px"><h1>${DEV}</h1><span class="pl r" id="devrisk">Risk level: High</span><span class="pl n" id="deviso">Not isolated</span></div>
  <div class="cmd" id="respbar">${resp.map((r) => `<span ${r === 'Isolate device' ? 'id="isobtn"' : ''}>${r}</span>`).join('')}</div>
  <div class="tabs"><span class="on">Overview</span><span>Incidents and alerts</span><span>Timeline</span><span>Security recommendations</span><span>Inventories</span><span>Discovered vulnerabilities</span></div>
  <div style="flex:1;display:flex;gap:16px;padding:14px 0 16px;min-height:0"><div style="width:360px;display:flex;flex-direction:column;gap:12px"><div class="fl"><h4>Device details</h4>${H.kv([['OS', 'Windows 11 Enterprise 23H2'], ['User', U + ' · Engineering'], ['Site', 'Pune office · Wi-Fi'], ['Health state', '<span id="devhealth">Active</span>'], ['Onboarding', 'Onboarded · Defender for Endpoint P2'], ['Managed by', 'Intune']])}</div></div>
  <div style="flex:1;display:flex;flex-direction:column;gap:12px;min-width:0"><div class="fl" id="devalerts"><h4>Active alerts</h4>${H.table(['Alert', 'Severity', 'Status', 'Time'], [['Ransomware behavior detected in the file system', S.sv('High'), H.pl('New', 'b'), '09:12:17'], ['File backups were deleted', S.sv('High'), H.pl('New', 'b'), '09:12:09'], ['Suspicious PowerShell command line', S.sv('Medium'), H.pl('New', 'b'), '09:11:52'], ['Suspicious process launched by Office application', S.sv('Medium'), H.pl('New', 'b'), '09:11:48']].map((r, i) => ({ id: 'da' + i, c: r })), { cls: '' })}</div>
  <div class="fl" style="flex:1;overflow:hidden" id="devtl"><h4>Timeline</h4><div id="tlrows" style="font-size:13px;line-height:1.9" class="mono"><div>09:11:46 · WINWORD.EXE opened <b>PO_Revision_Nov.docm</b> (from email)</div><div>09:11:48 · WINWORD.EXE → powershell.exe -enc JABjAD0A…</div><div>09:11:55 · powershell.exe downloaded <b>svcupd.exe</b> (${HASH})</div><div>09:12:09 · vssadmin.exe delete shadows /all /quiet</div><div style="color:#C50F1F">09:12:12 · svcupd.exe renamed 214 files on \\\\pun-fs-01\\Projects → *.lockd</div></div></div></div></div></div>`;
const g = { nodes: [{ id: 'e', x: 90, y: 220, label: 'Email', sub: 'PO_Revision_Nov.docm', c: '#DA7B00', ic: '✉' }, { id: 'w', x: 260, y: 220, label: 'WINWORD.EXE', sub: 'macro', c: '#DA7B00', ic: 'W' }, { id: 'p', x: 430, y: 220, label: 'powershell.exe', sub: 'encoded command', c: '#C50F1F', ic: '>', bad: 1 }, { id: 'x', x: 600, y: 220, label: 'svcupd.exe', sub: HASH, c: '#C50F1F', ic: '☣', bad: 1 }, { id: 'v', x: 600, y: 400, label: 'vssadmin.exe', sub: 'shadow copies deleted', c: '#C50F1F', ic: 'V' }, { id: 'f', x: 800, y: 220, label: '\\\\pun-fs-01\\Projects', sub: '214 files renamed', c: '#C50F1F', ic: '🗎', bad: 1, r: 30 }, { id: 'd', x: 430, y: 60, label: DEV, sub: U, c: '#0F6CBD', ic: '💻' }], edges: [['e', 'w', 'opened'], ['w', 'p', 'launched'], ['p', 'x', 'downloaded'], ['x', 'v', 'ran'], ['x', 'f', 'encrypting'], ['d', 'p']] };
const details = [['Assigned to', 'Mova iO SOC Agent'], ['Incident ID', INCID], ['Classification', 'Not set', 'dcls'], ['Categories', 'Execution, Impact'], ['First activity', 'Today 09:11'], ['Last activity', 'Today 09:12'], ['Impacted assets', '1 device · 1 user · 1 file share']];
const acRow = (t, a, asset, st) => [t, '4140-1', '-', a, asset, 'Mova iO SOC Agent', st];
const restore = `<div class="sess on" id="sess" style="top:90px"><div class="wt">File Level Restore · pun-fs-01 · restore point Today 08:00 (snapshot)<span style="margin-left:auto;color:#888">✕</span></div><div class="sg"><div><b>Summary</b><div><span>Restore type:</span><span>Overwrite</span></div><div><span>Initiated by:</span><span>svc-mova-soc</span></div><div><span>Approved by:</span><span>Kiran Shah</span></div></div><div><b>Data</b><div><span>Files:</span><span id="rsf">0 of 214</span></div><div><span>Size:</span><span>3.1 GB</span></div><div><span>Source:</span><span>Repo-PUN-01</span></div></div><div><b>Status</b><div><span>Success:</span><span id="rss">0</span></div><div><span>Warning:</span><span>0</span></div><div><span>Error:</span><span>0</span></div></div></div><div class="log" id="slog"><div><span>✔</span><span>Mounted restore point Today 08:00 from Repo-PUN-01</span><span>0:00:06</span></div><div><span>✔</span><span>Scanned restore point with antivirus: clean</span><span>0:00:41</span></div></div></div>`;

module.exports = {
  page: 'kit.html', vo: 'vo_soc3',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['A macro runs.', 'Shadow copies vanish.', 'Files start changing names.'],
      stats: [['stat1', 44, '', '%', 'of breaches involved ransomware, up from 32% a year earlier', 'Source: Verizon, 2025 Data Breach Investigations Report']],
      intro: ['How <span class="y">Mova iO</span> stops ransomware on one laptop', 'before it reaches the next.', 'Defender for Endpoint · Microsoft Defender · Veeam · Intune · ServiceNow · Microsoft Teams · Copilot Studio'] });
    await scene('s1', 12, async () => {
      await D('step', 1, '09:12, ransomware behaviour on a laptop', ['Defender for Endpoint']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Devices'), body: devPage });
      await D('focus', '#devalerts', { maxK: 1.55, pad: 6 }); await wait(4.4);
      await D('focus', '#devtl', { maxK: 1.6, pad: 6 });
    });
    await scene('s2', 11, async () => {
      await D('step', 2, 'Isolated 24 seconds after the first alert', ['Defender for Endpoint', 'Mova iO']);
      await D('focus', '#respbar', { maxK: 1.6, pad: 8 }); await wait(0.8);
      await D('cursor', '#isobtn', true); await wait(1.2);
      await D('set', '#deviso', 'Isolated (selective: Teams allowed)'); await D('cls', '#deviso', 'r', 'n'); await D('html', '#isobtn', 'Release from isolation'); await D('set', '#devhealth', 'Isolated · 09:12:41'); await D('cursorOff');
      await D('add', '#tlrows', '<div style="color:#107C10;font-weight:600">09:12:41 · Device isolated by Mova iO SOC Agent (policy: ransomware, pre-approved)</div><div style="color:#107C10;font-weight:600">09:12:44 · svcupd.exe stopped and quarantined on device</div><div style="color:#107C10;font-weight:600">09:12:47 · SMB session from ' + DEV + ' closed on pun-fs-01</div>');
      await wait(0.4); await D('focus', '#devtl', { maxK: 1.6, pad: 6 });
    });
    await scene('s3', 13, async () => {
      await D('step', 3, 'The attack story, and a hunt for spread', ['Microsoft Defender', 'Mova iO']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Incidents'), body: S.incPage({ id: INCID, title: `Ransomware activity on one endpoint (${DEV})`, sev: 'High', tabs: ['Attack story', 'Alerts (4)', 'Assets (3)', 'Investigations (1)', 'Evidence and Response (9)', 'Summary'], main: `<div class="fl" style="flex:1" id="story"><h4>Incident graph</h4>${H.graph(g.nodes, g.edges, { w: 940, h: 460 })}</div>`, details }) });
      await D('focus', '#story', { maxK: 1.35, pad: 4 }); await wait(4.8);
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '09:14', `<b>Contained:</b> device isolated 24 s after the first alert; payload quarantined; file share session closed.<br><b>Spread hunt:</b> hash ${HASH} on 0 other devices; same email delivered to 3 mailboxes, unopened, now purged. Payload hash blocked tenant-wide.<br><b>Damage:</b> 214 files on \\\\pun-fs-01\\Projects. Clean restore point at 08:00.<br><b>Needs approval:</b> restore the 214 files; wipe and rebuild the laptop.`));
      await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await scene('s4', 11, async () => {
      await D('step', 4, 'The SOC approves the recovery', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO SOC Agent', items: [['Mova iO SOC Agent', 'Approval needed · Incident ' + INCID, 1], ['SOC L2', 'Kiran: shift handover at 14:00', 0], ['Pune Engineering', 'Projects share is read-only?', 0]], me: 'KS' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Approval needed · Defender incident ' + INCID, intro: `Ransomware on ${DEV} was contained at 09:12:41. No spread found. Two recovery steps need your approval.`, facts: [['Restore', '214 files on pun-fs-01\\Projects from 08:00 (scanned clean)'], ['Lost work', 'Up to 72 minutes on those files; owners will be told'], ['Laptop', 'Wipe and rebuild with Autopilot; loaner issued in Pune'], ['User', U + ' told in Teams; password reset as a precaution'], ['Ticket', SIR]], buttons: ['Approve both', 'Restore only', 'Open incident'] }), 'Mova iO SOC Agent', '09:15'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.4);
      await D('cursor', '#apok', true); await wait(1.05); await D('tmApprove', 'Kiran Shah (SOC L2)', 'Restoring files and rebuilding the laptop…'); await wait(1); await D('cursorOff');
    });
    const nodes = [['Trigger', 'Defender · ransomware behaviour', '#0F6CBD', '0.1 s'], ['Isolate device', 'Tool · Defender for Endpoint', '#0F6CBD', '23 s'], ['Stop and quarantine file', 'Tool · Defender for Endpoint', '#0F6CBD', '3.0 s'], ['Close SMB sessions', 'Tool · Windows (PowerShell)', '#2B579A', '2.4 s'], ['Hunt for the hash', 'Tool · Advanced hunting', '#0F6CBD', '4.2 s'], ['Purge related email', 'Tool · Defender for Office 365', '#0F6CBD', '12 s'], ['Block hash', 'Tool · Defender indicators', '#0F6CBD', '1.1 s'], ['Request approval', 'Tool · Microsoft Teams', '#5B5FC7', '48 s'], ['Restore files', 'Tool · Veeam', '#00B336', '2 min'], ['Wipe and rebuild', 'Tool · Intune (Autopilot)', '#0F6CBD', '0.8 s'], ['Update security incident', 'Tool · ServiceNow SIR', '#2F5B4F', '0.5 s'], ['Tell file owners', 'Tool · Microsoft Teams', '#5B5FC7', '0.6 s']];
    await scene('s5', 15, async () => {
      await D('step', 5, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Defender for Endpoint', 'Veeam']);
      await app('copilot', { agent: 'Mova iO SOC Agent', run: 'Automated · Defender incident ' + INCID, payload: `{ "incidentId": ${INCID},\n  "device": "${DEV}",\n  "alert": "Ransomware behavior\n     detected in the file system" }`, payloadFrom: 'Trigger payload · Microsoft Defender', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 1 || i === 8 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 4) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Advanced hunting · DeviceFileEvents</div>Hash seen on <b>0</b> other devices'); }
      await D('csDone'); await D('csDetail', 1, { title: 'Isolate device', sub: 'Tool · Defender for Endpoint · ✓ Complete · 23 s', inp: `{ "deviceId": "${DEV}",\n  "isolationType": "Selective",\n  "comment": "Ransomware behaviour,\n    incident ${INCID}" }`, out: `{ "status": "Succeeded",\n  "requestor": "svc-mova-soc",\n  "completed": "09:12:41" }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, '214 files restored from a clean point', ['Veeam']);
      await app('veeam', { tree: [['Home', 0], ['Backups', 1], ['Disk', 2, true], ['pun-fs-01', 3], ['Last 24 Hours', 1], ['Running (1)', 2]], ctx: 'File Level Restore', body: restore, status: 'Restore session running' });
      await D('focus', '#sess', { maxK: 1.5, pad: 4 }); await wait(1);
      await D('num', '#rsf', 0, 214, ' of 214', 3200); await D('num', '#rss', 0, 214, '', 3200); await wait(3.4);
      await D('add', '#slog', '<div><span>✔</span><span>Restored 214 files to \\\\pun-fs-01\\Projects (overwrite *.lockd)</span><span>0:01:58</span></div><div><span>✔</span><span>Removed 214 encrypted copies; ransom note README_LOCKD.txt deleted</span><span>0:00:04</span></div>');
    });
    await scene('s7', 11, async () => {
      await D('step', 7, 'Closed, with owners told what changed', ['Microsoft Defender', 'Microsoft Teams']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Action center'), body: S.actionCenter([['09:17:30', '4140-1', 'A-2291', 'Wipe and rebuild (Autopilot reset)', DEV, 'Kiran Shah', H.pl('Pending device check-in', 'a')], ['09:17:12', '4140-1', 'A-2290', 'Restore files (Veeam)', 'pun-fs-01', 'Kiran Shah', H.pl('Completed', 'g')], ['09:13:20', '4140-1', '-', 'Add indicator: block file ' + HASH, 'Tenant', 'Mova iO SOC Agent', H.pl('Completed', 'g')], ['09:13:02', '4140-1', '-', 'Soft delete email (3)', '3 mailboxes', 'Mova iO SOC Agent', H.pl('Completed', 'g')], ['09:12:44', '4140-1', '-', 'Stop and quarantine file', DEV, 'Mova iO SOC Agent', H.pl('Completed', 'g')], ['09:12:41', '4140-1', '-', 'Isolate device', DEV, 'Mova iO SOC Agent', H.pl('Completed', 'g')]].map((r) => r)) });
      await D('focus', '#actb', { maxK: 1.5, pad: 10 }); await wait(4.6);
      await app('teams', { view: 'channel', team: 'Pune Engineering', channel: 'General', channels: ['General', 'Projects', 'Site updates'] });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd"><div class="hd">Projects share restored · ${SIR}</div><div style="padding:14px 18px;font-size:14px;line-height:1.55">A malicious attachment encrypted 214 files on <b>\\\\pun-fs-01\\Projects</b> at 09:12. It was stopped within seconds and nothing else was affected.<br><b>What we did:</b> restored every file from the 08:00 copy.<br><b>What to do:</b> if you edited a project file between 08:00 and 09:12, please redo those changes. The list is pinned in this channel.</div></div>`, 'Mova iO Security Assistant', '09:19'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.7, pad: 10 });
    });
    await closing({ close: ['Isolated 24 seconds after the first alert.', 'No spread, and the payload blocked everywhere.', '214 files back from a clean copy in minutes.'], tag: ['Ransomware, stopped by', 'Mova iO agents.', 'With people in control.'] });
  },
};
