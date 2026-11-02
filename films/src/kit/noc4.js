// NOC film 4: a failed overnight backup, root-caused, retried and verified before the morning.
const L = require('./lib.js'); const { H } = L;
const JOB = 'FS-Plant-Daily', VM = 'rak-plant-fs-01', INC = 'INC0025112';
const ok = '<span style="color:#1E7E34">● Success</span>', bad = '<span style="color:#C62828;font-weight:700">● Failed</span>', warn = '<span style="color:#B26A00">● Warning</span>';
const jobs = (r) => H.table(['Name', 'Type', 'Objects', 'Status', 'Last Result', 'Next Run', 'Target'], [
  { id: 'jfs', cls: r === 'bad' ? 'sel' : 'sel', c: [JOB, 'VMware Backup', '4', r === 'ok' ? 'Stopped' : 'Stopped', r === 'ok' ? ok : r === 'run' ? '<span style="color:#175CD3">● Working (retry)</span>' : bad, 'Today 23:00', 'Repo-RAK-01'] },
  ['SQL-HQ-Daily', 'VMware Backup', '6', 'Stopped', ok, 'Today 22:00', 'Repo-HQ-01'], ['ERP-App-Nightly', 'VMware Backup', '3', 'Stopped', ok, 'Today 01:00', 'Repo-HQ-02'], ['Plant-HMI-Weekly', 'VMware Backup', '12', 'Stopped', ok, 'Sun 02:00', 'Repo-RAK-01'], ['Office-FS-Daily', 'VMware Backup', '5', 'Stopped', ok, 'Today 23:30', 'Repo-HYD-01'], ['VDI-Gold-Images', 'VMware Backup', '2', 'Stopped', warn, 'Sat 03:00', 'Repo-HQ-02'], ['M365-Mail-Daily', 'Microsoft 365 Backup', '1', 'Stopped', ok, 'Today 04:00', 'Object-Storage-01']]);
const tree = (on) => [['Home', 0], ['Jobs', 1], ['Backup', 2, on === 'jobs'], ['Backup Copy', 2], ['Backups', 1], ['Disk', 2], ['Object Storage', 2], ['Last 24 Hours', 1], ['Success', 2], ['Warning', 2], ['Failed (1)', 2, on === 'failed'], ['SureBackup', 1], ['Application Groups', 2], ['Virtual Labs', 2]];
const sess = (o) => `<div class="sess" id="sess"><div class="wt">${o.title}<span style="margin-left:auto;color:#888">✕</span></div><div class="sg"><div><b>Summary</b><div><span>Duration:</span><span>${o.dur}</span></div><div><span>Processing rate:</span><span>${o.rate}</span></div><div><span>Bottleneck:</span><span>${o.bn}</span></div></div><div><b>Data</b><div><span>Processed:</span><span>${o.proc}</span></div><div><span>Read:</span><span>${o.read}</span></div><div><span>Transferred:</span><span>${o.tx}</span></div></div><div><b>Status</b><div><span>Success:</span><span>${o.s[0]}</span></div><div><span>Warning:</span><span>${o.s[1]}</span></div><div><span>Error:</span><span style="${o.s[2] ? 'color:#C62828;font-weight:700' : ''}">${o.s[2]}</span></div></div></div><div style="display:flex;gap:18px;padding:8px 18px;border-bottom:1px solid #E3E3E3;font-weight:600"><span style="width:200px">Name</span><span style="width:110px">Status</span><span>Action</span></div><div style="display:flex"><div style="width:230px;border-right:1px solid #EEE;font-size:13px">${o.objs.map(([n, s]) => `<div style="padding:5px 18px">${n}</div>`).join('')}</div><div style="width:120px;border-right:1px solid #EEE;font-size:13px">${o.objs.map(([n, s]) => `<div style="padding:5px 10px">${s}</div>`).join('')}</div><div class="log" id="slog" style="flex:1">${o.log.map(([ic, t, d]) => `<div><span>${ic}</span><span>${t}</span><span>${d}</span></div>`).join('')}</div></div></div>`;
const failSess = sess({ title: `Backup Job: ${JOB} · 02:31:07 · Failed`, dur: '0:16:24', rate: '0 KB/s', bn: 'Source', proc: '0 B (0%)', read: '0 B', tx: '0 B', s: [3, 0, 1], objs: [[VM, bad], ['rak-plant-vm-db', ok], ['rak-plant-vm-app', ok], ['rak-plant-vm-hmi', ok]],
  log: [['✔', 'Queued for processing at 02:14:42', '0:00:00'], ['✔', 'Required backup infrastructure resources have been assigned', '0:00:03'], ['✔', `VM processing started at 02:14:51`, ''], ['⚠', 'Preparing guest for hot backup', '0:15:02'], ['✖', '<b style="color:#C62828">Failed to prepare guest for hot backup. Error: VSSControl: Failed to prepare guest for freeze, wait timeout 900 sec</b>', ''], ['✖', 'Retrying failed item processing (1/3), (2/3), (3/3): failed', '0:01:19'], ['✖', `<b style="color:#C62828">Error: Job finished with error. 1 of 4 VMs failed: ${VM}</b>`, '']] });
const okSess = sess({ title: `Backup Job: ${JOB} (Retry) · 03:06:40 · Success`, dur: '0:14:22', rate: '412 MB/s', bn: 'Target', proc: '1.2 TB (100%)', read: '61.4 GB', tx: '38.2 GB (1.6x)', s: [1, 0, 0], objs: [[VM, ok]],
  log: [['✔', 'Queued for processing at 02:52:18', '0:00:00'], ['✔', 'Guest processing: application-aware processing completed (VSS)', '0:00:41'], ['✔', 'Using backup proxy rak-proxy-01 for disk Hard disk 1 [hotadd]', '0:00:02'], ['✔', 'Hard disk 2 (1.0 TB) 59.8 GB read at 418 MB/s [CBT]', '0:02:27'], ['✔', 'Restore point created: incremental, 03:06:40', ''], ['✔', 'SureBackup verification: heartbeat, ping and SMB 445 tests passed', '0:06:12']] });
const tl = (t) => `<div style="padding:14px 18px;font-size:13.5px">${t}</div>`;
const snBody = (state, notes) => H.snInc({ num: INC, title: `Backup failed: ${JOB} · ${VM} (VSS freeze timeout)`, hl: [['Priority', '3 - Moderate', '#B26A00'], ['State', state, '', 'snstate'], ['Assigned to', 'Mova iO NOC Agent'], ['Updated', 'just now'], ['Resolution SLA', '7h 52m left', '', 'snsla']], fields: [['Caller', 'Mova iO Integration'], ['Channel', 'Monitoring'], ['Category', 'Infrastructure'], ['Subcategory', 'Backup'], ['Service', 'Backup and recovery'], ['Configuration item', VM], ['Impact', '3 - Low'], ['Urgency', '2 - Medium'], ['Assignment group', 'Backup Operations'], ['Assigned to', 'Mova iO NOC Agent'], ['Short description', `Veeam job ${JOB} failed for ${VM}: VSSControl freeze timeout (900 s)`, '', 1]], notes });

module.exports = {
  page: 'kit.html', vo: 'vo_noc4',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['Backups fail quietly.', 'Nobody notices.', 'Until the day you need to restore.'],
      stats: [['stat1', 96, '', '%', 'of ransomware attacks targeted backup repositories', 'Source: Veeam, 2024 Ransomware Trends Report']],
      statText: [['stat2', '43%', 'of affected data was not recovered', 'Source: Veeam, 2024 Ransomware Trends Report']],
      intro: ['How <span class="y">Mova iO</span> fixes a failed backup', 'before anyone is awake.', 'Veeam Backup & Replication · ServiceNow · Copilot Studio · Microsoft Teams · Key Vault'] });
    await scene('s1', 11, async () => {
      await D('step', 1, '02:31, a nightly backup fails', ['Veeam']);
      await app('veeam', { tree: tree('jobs'), body: jobs('bad'), status: '1 job selected · Last 24 hours: 6 success, 1 warning, 1 failed' });
      await D('focus', '#jfs', { maxK: 1.6, pad: 8 }); await wait(3.4);
      await D('add', '#vbbody', failSess); await wait(0.1); await D('cls', '#sess', 'on'); await wait(1.4);
      await D('focus', '#slog', { maxK: 1.55, pad: 8 });
    });
    await scene('s2', 13, async () => {
      await D('step', 2, 'An incident, with the real cause', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: INC, body: snBody('In Progress', []) });
      await D('add', '#snnotes', H.note('Mova iO Event correlator', H.MV, `Created from Veeam session ${JOB} 02:31:07 (1 of 4 VMs failed). No other job failures tonight.`, '02:32'), true);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(3);
      await D('add', '#snnotes', H.note('Mova iO Triage orchestrator', H.MV, `<b>Root cause: VSS writer SqlServerWriter stuck in a failed state</b> on ${VM}, 93% confidence. It failed at 01:12, right after a Windows update restarted SQL Server.<br>Ruled out: repository Repo-RAK-01 (41% free) · proxy rak-proxy-01 (healthy) · network to the plant (no loss) · the other 3 VMs in the job (backed up fine).<br>Recommended: <b>RB-021</b> reset the VSS writer, retry the VM, and verify the restore point. Pre-approved for backup failures.`, '02:33'), true);
      await wait(0.6); await D('focus', '#snact', { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    const nodes = [['Trigger', 'Veeam · job finished with error', '#00B336', '0.1 s'], ['Get session log', 'Tool · Veeam', '#00B336', '0.6 s'], ['Check repository and proxy', 'Tool · Veeam', '#00B336', '1.1 s'], ['Check VSS writers', 'Tool · Windows (PowerShell)', '#2B579A', '2.8 s'], ['Search runbooks', 'Knowledge · Backup runbooks', '#8764B8', '1.2 s'], ['Get secret', 'Tool · Azure Key Vault', '#0078D4', '0.3 s'], ['Reset VSS writer', 'Tool · Windows (PowerShell)', '#2B579A', '19 s'], ['Retry VM in job', 'Tool · Veeam', '#00B336', '14 min'], ['Verify restore point', 'Tool · Veeam SureBackup', '#00B336', '6 min'], ['Update incident', 'Tool · ServiceNow', '#2F5B4F', '0.4 s'], ['Morning summary', 'Tool · Microsoft Teams', '#5B5FC7', '0.6 s']];
    await scene('s3', 17, async () => {
      await D('step', 3, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Key Vault', 'Veeam']);
      await app('copilot', { agent: 'Mova iO NOC Agent', run: 'Automated · Veeam session ' + JOB + ' 02:31', payload: `{ "job": "${JOB}",\n  "result": "Failed",\n  "failedVMs": ["${VM}"],\n  "incident": "${INC}" }`, payloadFrom: 'Trigger payload · Veeam', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 3 || i === 7 ? 1.0 : 0.5); await D('csStep', i, 'ok'); if (i === 3) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Windows · vssadmin list writers</div><span class="mono">SqlServerWriter · State [8] Failed · Retryable error</span>'); if (i === 8) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Veeam SureBackup</div>Restore point <b>03:06</b> booted and verified'); }
      await D('csDone'); await D('csDetail', 6, { title: 'Reset VSS writer', sub: 'Tool · Windows (PowerShell remoting) · ✓ Complete · 19 s', inp: `{ "host": "${VM}",\n  "writer": "SqlServerWriter",\n  "action": "Restart-Service SQLWriter",\n  "check": "vssadmin list writers" }`, out: `{ "service": "Running",\n  "writerState": "[1] Stable",\n  "lastError": "No error" }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s4', 12, async () => {
      await D('step', 4, 'Retried, and the restore point is verified', ['Veeam']);
      await app('veeam', { tree: tree('jobs'), body: jobs('run'), status: '1 job selected · retry in progress' });
      await D('focus', '#jfs', { maxK: 1.6, pad: 8 }); await wait(2.2);
      await D('html', '#jfs .c4', ok); await D('flash', '#jfs');
      await D('add', '#vbbody', okSess); await wait(0.1); await D('cls', '#sess', 'on'); await wait(1.2);
      await D('focus', '#sess', { maxK: 1.5, pad: 4 });
    });
    await scene('s5', 11, async () => {
      await D('step', 5, 'Resolved before the shift starts', ['ServiceNow', 'Microsoft Teams']);
      await app('snow', { tab: INC, body: snBody('In Progress', [H.note('Mova iO Triage orchestrator', H.MV, 'Root cause: VSS writer SqlServerWriter in a failed state, 93% confidence.', '02:33'), H.note('Mova iO Event correlator', H.MV, `Created from Veeam session ${JOB} 02:31:07.`, '02:32')]) });
      await D('add', '#snnotes', H.note('Mova iO Guided resolution assistant', H.MV, `RB-021 complete: SQLWriter restarted, writer stable; ${VM} retried at 02:52 and succeeded (38.2 GB transferred). SureBackup booted the 03:06 restore point: heartbeat, ping and SMB tests passed.`, '03:13'), true);
      await D('set', '#snstate', '<span style="color:#1B7A43">Resolved</span>'); await D('html', '#snsla', 'Met');
      await D('set', '#snresbox', `<label style="font-size:12.5px;color:#5A6872">Resolution notes</label><div class="v" style="border:1px solid #CDD3DA;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff">VSS writer left failed by a Windows update restart. Writer reset, VM re-backed up, restore point verified by SureBackup. Change raised to add a VSS writer check to the patch runbook.</div>`);
      await D('focus', '#snright', { maxK: 1.5, pad: 6 }); await wait(4.6);
      await app('teams', { title: 'Mova iO NOC Agent', items: [['Mova iO NOC Agent', 'Overnight backup summary', 1], ['Backup Operations', 'Deepa: Repo-HQ-02 at 78%', 0]], me: 'DM' });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd"><div class="hd">Overnight backups · 06:00 summary</div><div class="fact"><span>Jobs run</span><b>8 · 1,046 VMs and workloads</b><span>Failed, then fixed</span><b>1 · ${JOB} (${VM}) · ${INC}</b><span>Cause</span><b>VSS writer stuck after a Windows update</b><span>Verified</span><b>Restore point 03:06 booted in SureBackup</b><span>For you</span><b>Approve CHG0031244: add a VSS check to patching</b></div><div style="height:8px"></div></div>`, 'Mova iO NOC Agent', '06:00'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.7, pad: 10 });
    });
    await closing({ close: ['Failed at 02:31. Fixed and verified by 03:13.', 'The restore point proven, not assumed.', 'One line in the morning summary, not a missing backup.'], tag: ['Failed backups, fixed by', 'Mova iO agents.', 'With people in control.'] });
  },
};
