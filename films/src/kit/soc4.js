// SOC film 4: a privileged role granted outside PIM at 01:47 on a Sunday. Checked against change, HR and sign-in data; reversed with approval.
const L = require('./lib.js'); const { H } = L; const S = require('./soc_common.js');
const ADM = 'adm-sunil.r', EXT = 'ext-ravi.k', ROLE = 'Privileged Role Administrator', INCID = '4152', SIR = 'SIR0010250', IP = '91.92.x.x';
const ENAV = (on) => [['Home', ''], ['Favorites', ''], ['Identity', 'sec'], ['Overview', 'sub'], ['Users', 'sub'], ['Groups', 'sub'], ['Roles & admins', 'sub'], ['Protection', 'sec'], ['Identity Protection', 'sub'], ['Conditional Access', 'sub'], ['Identity governance', 'sec'], ['Privileged Identity Management', 'sub'], ['Access reviews', 'sub'], ['Monitoring & health', 'sec'], ['Audit logs', 'sub'], ['Sign-in logs', 'sub']].map(([l, k]) => [l, k, l === on]);
const qRows = [{ id: 'q0', cls: 'sel', c: ['<b>Privileged role assigned outside PIM</b>', INCID, S.sv('High'), 'Pending action', 'Privilege escalation', '2 users', '2', 'Microsoft Sentinel', '01:48', 'Mova iO SOC Agent'] }, ['Anomalous token', '4151', S.sv('Medium'), 'Merged into ' + INCID, 'Credential access', ADM, '0', 'Entra ID Protection', '01:45', 'Mova iO SOC Agent'], ['Unfamiliar sign-in properties', '4146', S.sv('Low'), 'No threats found', 'Initial access', 'j.dsouza', '0', 'Entra ID Protection', 'Sat 18:30', 'Mova iO SOC Agent'], ['Multi-stage incident on one endpoint', '4140', S.sv('High'), 'Remediated', 'Impact', 'lap-pun-0417', '0', 'Defender for Endpoint', 'Fri 09:19', 'Kiran S.']];
const audit = `<div style="padding:14px 26px 0"><div class="crumb" style="padding:0">Monitoring & health › Audit logs</div><h1>Audit logs</h1><div class="cmd"><span>Download</span><span>Export data settings</span><span>Columns</span><span style="margin-left:auto">Date: Last 24 hours</span><span>Service: Core Directory</span><span>Category: RoleManagement</span></div></div>
  <div style="padding:0 26px">${H.table(['Date', 'Service', 'Category', 'Activity', 'Status', 'Target(s)', 'Initiated by (actor)'], [{ id: 'au0', cls: 'sel', c: ['Sun 01:47:22', 'Core Directory', 'RoleManagement', '<b>Add member to role</b>', 'Success', EXT, ADM] }, ['Sun 01:47:20', 'Core Directory', 'UserManagement', 'Update user', 'Success', EXT, ADM], ['Fri 16:02:11', 'PIM', 'RoleManagement', 'Add member to role completed (PIM activation)', 'Success', 'j.dsouza', 'MS-PIM'], ['Fri 11:20:47', 'PIM', 'RoleManagement', 'Add eligible member to role in PIM completed', 'Success', 'k.shah', 'a.nair']], { cls: '' })}</div>
  <div class="pane on" id="aupane" style="width:600px"><div style="font-size:12px;color:#616161">Audit log details</div><div style="font-size:20px;font-weight:600;margin:4px 0 12px">Add member to role</div><div class="tabs" style="margin-bottom:14px"><span class="on">Activity</span><span>Target(s)</span><span>Modified properties</span></div>${H.kv([['Date', 'Sunday 01:47:22 IST'], ['Activity type', 'Add member to role'], ['Category', 'RoleManagement'], ['Status', 'Success'], ['Initiated by', ADM + ' · IP ' + IP], ['Target', EXT + ' (member, contractor)'], ['Role', '<b style="color:#C50F1F">' + ROLE + '</b>'], ['Assignment', '<b style="color:#C50F1F">Active, permanent · not through PIM</b>']])}</div>`;
const details = [['Assigned to', 'Mova iO SOC Agent'], ['Incident ID', INCID], ['Classification', 'Not set', 'dcls'], ['Categories', 'Privilege escalation, Credential access'], ['First activity', 'Sun 01:44'], ['Last activity', 'Sun 01:47'], ['Impacted assets', '2 users']];
const checks = `<div class="fl" id="chk"><h4>Checks by Mova iO</h4>${H.table(['Check', 'Source', 'Result'], [['Approved change for this role?', 'ServiceNow · Change', H.pl('None found', 'r')], ['Is ' + EXT + ' still contracted?', 'ServiceNow · Vendor contracts', H.pl('Ended 16 Oct', 'r')], ['Is Sunil working tonight?', 'Outlook calendar · on-call rota', H.pl('On leave until Tue', 'a')], ['How did ' + ADM + ' sign in?', 'Entra ID · sign-in logs', H.pl('Anomalous token · VPS IP', 'r')], ['Anything done with the new role?', 'Entra ID · audit logs', H.pl('Not yet', 'g')]].map((r, i) => ({ id: 'ck' + i, c: r })), { cls: '' })}</div>`;
const pim = (done) => `<div style="padding:14px 26px 0"><div class="crumb" style="padding:0">Privileged Identity Management › Microsoft Entra roles › ${ROLE}</div><h1>${ROLE} · Assignments</h1><div class="cmd"><span>Add assignments</span><span>Settings</span><span>Refresh</span><span>Export</span></div><div class="tabs"><span>Eligible assignments</span><span class="on">Active assignments</span><span>Expired assignments</span></div></div>
  <div style="padding:12px 26px">${H.table(['Name', 'Principal name', 'Type', 'State', 'Start time', 'End time', 'Action'], [{ id: 'pa0', cls: done ? '' : 'hot', c: [done ? '<s>Ravi K. (contractor)</s>' : 'Ravi K. (contractor)', EXT + '@corp.example', 'User', done ? H.pl('Removed', 'g') : H.pl('Assigned (permanent)', 'r'), 'Sun 01:47', done ? 'Sun 01:53' : 'Permanent', done ? '-' : 'Remove · Update'] }, ['Asha Nair', 'a.nair@corp.example', 'User', H.pl('Activated', 'b'), 'Fri 16:02', 'Fri 20:02', 'Expired'], ['Break-glass 01', 'bg-01@corp.example', 'User', H.pl('Assigned (permanent)', 'n'), '2024-03-01', 'Permanent', 'Excluded']], { cls: '' })}</div>`;

module.exports = {
  page: 'kit.html', vo: 'vo_soc4',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['01:47, Sunday.', 'Someone becomes an admin.', 'Nobody asked for it.'],
      stats: [['stat1', 241, '', ' days', 'on average to identify and contain a breach', 'Source: IBM, Cost of a Data Breach Report 2025']],
      statText: [['stat2', '$4.44M', 'the global average cost of a breach', 'Source: IBM, Cost of a Data Breach Report 2025']],
      intro: ['How <span class="y">Mova iO</span> reverses an unapproved admin grant', 'in six minutes, at two in the morning.', 'Microsoft Sentinel · Entra ID · PIM · ServiceNow · Microsoft Teams · Copilot Studio'] });
    await scene('s1', 10, async () => {
      await D('step', 1, 'A Sentinel rule fires on a role change', ['Microsoft Sentinel', 'Microsoft Defender']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Incidents'), body: S.queue(qRows) });
      await D('focus', '#q0', { maxK: 1.6, pad: 6 });
    });
    await scene('s2', 11, async () => {
      await D('step', 2, 'Permanent admin rights, outside PIM', ['Entra ID']);
      await app('ms', { product: 'Microsoft Entra admin center', nav: ENAV('Audit logs'), body: audit });
      await D('focus', '#au0', { maxK: 1.5, pad: 8 }); await wait(3.4);
      await D('focus', '#aupane', { maxK: 1.6, pad: 0 });
    });
    await scene('s3', 15, async () => {
      await D('step', 3, 'Checked against change, HR, calendar and sign-ins', ['ServiceNow', 'Entra ID', 'Mova iO']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Incidents'), body: S.incPage({ id: INCID, title: 'Privileged role assigned outside PIM', sev: 'High', tab: 'Summary', main: checks, details }) });
      await D('focus', '#chk', { maxK: 1.6, pad: 6 });
      for (let i = 0; i < 5; i++) { await D('flash', '#ck' + i); await wait(1.1); }
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '01:49', `<b>Likely compromised admin.</b> ${ADM} signed in at 01:44 with an anomalous token from a VPS (${IP}) while Sunil is on leave, then gave a contractor whose contract ended on 16 Oct permanent ${ROLE}. No change request. Role not used yet.<br><b>Recommend:</b> remove the assignment, disable ${EXT}, revoke both accounts' sessions, block the IP, reset Sunil's credentials.`));
      await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await scene('s4', 11, async () => {
      await D('step', 4, 'The identity on-call approves from their phone', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO SOC Agent', items: [['Mova iO SOC Agent', 'Urgent approval · Incident ' + INCID, 1], ['Identity & Access', 'PIM review due Friday', 0]], me: 'AN' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: '⚠ Urgent approval · Incident ' + INCID, intro: `At 01:47, ${ADM} made contractor ${EXT} a permanent ${ROLE}, outside PIM and without a change. Sunil is on leave and his sign-in came from a VPS. The role hasn't been used yet.`, facts: [['Remove', ROLE + ' from ' + EXT], ['Disable', EXT + ' (contract ended 16 Oct)'], ['Revoke', 'All sessions for both accounts'], ['Block', IP + ' (Conditional Access)'], ['Reset', 'Sunil\'s password and passkey; he\'s called at 08:00']], buttons: ['Approve all', 'Remove role only', 'Call me'] }), 'Mova iO SOC Agent', '01:50'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.4);
      await D('cursor', '#apok', true); await wait(1.05); await D('tmApprove', 'Asha Nair (Identity on-call)', 'Containing now…'); await wait(1); await D('cursorOff');
    });
    const nodes = [['Trigger', 'Sentinel · analytics rule', '#0078D4', '0.1 s'], ['Get audit event', 'Tool · Entra ID', '#0078D4', '0.6 s'], ['Find approved change', 'Tool · ServiceNow', '#2F5B4F', '0.9 s'], ['Check contract status', 'Tool · ServiceNow', '#2F5B4F', '0.7 s'], ['Check calendar', 'Tool · Microsoft Graph', '#0F6CBD', '0.5 s'], ['Get sign-in risk', 'Tool · Entra ID Protection', '#0078D4', '1.0 s'], ['Request approval', 'Tool · Microsoft Teams', '#5B5FC7', '2 min'], ['Remove role assignment', 'Tool · Entra ID (PIM)', '#0078D4', '1.3 s'], ['Disable account', 'Tool · Entra ID', '#0078D4', '0.6 s'], ['Revoke sessions (2)', 'Tool · Entra ID', '#0078D4', '1.1 s'], ['Block IP', 'Tool · Conditional Access', '#0078D4', '0.8 s'], ['Update security incident', 'Tool · ServiceNow SIR', '#2F5B4F', '0.5 s']];
    await scene('s5', 15, async () => {
      await D('step', 5, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Entra ID', 'ServiceNow']);
      await app('copilot', { agent: 'Mova iO SOC Agent', run: 'Automated · Sentinel incident ' + INCID, payload: `{ "incidentId": ${INCID},\n  "rule": "Privileged role assigned\n           outside PIM",\n  "actor": "${ADM}",\n  "target": "${EXT}" }`, payloadFrom: 'Trigger payload · Microsoft Sentinel', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 2 || i === 7 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 2) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">ServiceNow · change search</div>No change for <b>' + ROLE + '</b> in the last 30 days'); }
      await D('csDone'); await D('csDetail', 7, { title: 'Remove role assignment', sub: 'Tool · Entra ID (PIM) · ✓ Complete · 1.3 s', inp: `{ "principal": "${EXT}",\n  "role": "${ROLE}",\n  "assignmentType": "Active",\n  "action": "AdminRemove",\n  "justification": "SIR ${SIR}" }`, out: `{ "status": "Revoked",\n  "completed": "01:53:04" }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'Role removed, accounts locked down', ['PIM', 'Entra ID']);
      await app('ms', { product: 'Microsoft Entra admin center', nav: ENAV('Privileged Identity Management'), body: pim(false) });
      await D('focus', '#pa0', { maxK: 1.5, pad: 8 }); await wait(2.2);
      await D('html', '#pa0', H.tr({ c: ['<s>Ravi K. (contractor)</s>', EXT + '@corp.example', 'User', H.pl('Removed', 'g'), 'Sun 01:47', 'Sun 01:53', '-'] }).replace(/^<tr[^>]*>|<\/tr>$/g, '')); await D('cls', '#pa0', '', 'hot'); await D('flash', '#pa0');
      await wait(1.6); await D('add', '#msbody', `<div class="fl" id="after" style="margin:0 26px;font-size:13.5px;line-height:1.7"><b>Also done at 01:53:</b> ${EXT} sign-in blocked · sessions revoked for ${EXT} and ${ADM} · ${IP} blocked · ${ADM} password reset required and passkey re-registration pending · next sign-in attempt from ${IP} at 01:58 <b style="color:#107C10">blocked</b></div>`);
      await D('focus', '#after', { maxK: 1.6, pad: 6 });
    });
    await scene('s7', 10, async () => {
      await D('step', 7, 'Closed, with a Monday follow-up', ['ServiceNow', 'Microsoft Defender']);
      await app('snow', { tab: SIR, tabs: ['Home', 'Security incidents'], ws: 'Security Incident Response', body: H.snInc({ kicker: 'Security incident', num: SIR, title: 'Privileged role assigned outside PIM (compromised admin token)', buttons: ['Close', 'Save', '⋯'], hl: [['Priority', '1 - Critical', '#B42318'], ['State', 'Contain', '', 'snstate'], ['Assigned to', 'Mova iO SOC Agent'], ['Business impact', 'None: role unused'], ['Time to contain', '6 min', '#1B7A43']], fields: [['Category', 'Privilege escalation'], ['MITRE ATT&CK', 'T1098.003 · Account manipulation'], ['Affected users', ADM + ', ' + EXT], ['Defender incident', INCID], ['Post-incident tasks', '1. Access review of all permanent Entra roles (owner: Identity team, due Wed)<br>2. Remove leftover contractor accounts (14 found)<br>3. Interview Sunil about the token theft', '', 1]], ltabs: ['Details', 'Tasks (3)', 'Response', 'Timeline'], notes: [H.note('Asha Nair', '#3E8E7E', 'Approved containment from Teams at 01:52.', '01:52'), H.note('Mova iO SOC Agent', H.MV, 'Role removed, account disabled, sessions revoked, IP blocked. Attacker retry at 01:58 blocked.', '01:53')] }) });
      await D('set', '#snstate', '<span style="color:#1B7A43">Review</span>');
      await D('focus', '#snleft', { maxK: 1.5, pad: 4 });
    });
    await closing({ close: ['Granted at 01:47. Reversed at 01:53.', 'Checked against change, HR, calendar and sign-ins.', 'A human decided, from their phone, in two minutes.'], tag: ['Privilege escalation, reversed by', 'Mova iO agents.', 'With people in control.'] });
  },
};
