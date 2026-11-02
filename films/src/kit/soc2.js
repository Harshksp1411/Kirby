// SOC film 2: an impossible-travel sign-in with a sneaky inbox rule. User confirms in Teams; account contained.
const L = require('./lib.js'); const { H } = L; const S = require('./soc_common.js');
const U = 'Vikram Iyer', UPN = 'vikram.iyer@corp.example', INCID = '4133', SIR = 'SIR0010236', IP = '45.137.x.x';
const ENAV = (on) => [['Home', ''], ['Favorites', ''], ['Identity', 'sec'], ['Overview', 'sub'], ['Users', 'sub'], ['Groups', 'sub'], ['Devices', 'sub'], ['Applications', 'sub'], ['Protection', 'sec'], ['Identity Protection', 'sub'], ['Conditional Access', 'sub'], ['Authentication methods', 'sub'], ['Identity governance', ''], ['Monitoring & health', '']].map(([l, k]) => [l, k, l === on]);
const rs = (lvl) => H.pl(lvl, lvl === 'High' ? 'r' : lvl === 'Medium' ? 'a' : 'n');
const signins = `<div style="padding:14px 26px 0"><div class="crumb" style="padding:0">Protection › Identity Protection</div><h1>Risky sign-ins</h1><div class="cmd"><span>Download</span><span>Columns</span><span>Confirm sign-in compromised</span><span>Confirm sign-in safe</span><span style="margin-left:auto">Date: Last 1 day</span><span>Risk state: At risk</span></div></div>
  <div style="padding:0 26px">${H.table(['Date', 'User', 'IP address', 'Location', 'Risk state', 'Risk level (aggregate)', 'Risk detail', 'Application'], [{ id: 'rs0', cls: 'sel', c: ['Today 11:22', '<b>' + U + '</b>', IP, 'Amsterdam, NL', 'At risk', rs('High'), '-', 'Office 365 Exchange Online'] }, ['Today 10:41', U, '103.21.x.x', 'Pune, IN', 'None', rs('None'), '-', 'Microsoft Teams'], ['Today 09:58', 'Joel D\'Souza', '49.36.x.x', 'Mumbai, IN', 'Dismissed', rs('Low'), 'Admin dismissed', 'SharePoint Online'], ['Yesterday', 'Asha Menon', '152.58.x.x', 'Dubai, AE', 'Remediated', rs('Medium'), 'User passed MFA', 'Outlook Mobile']], { cls: '' })}</div>
  <div class="pane on" id="sipane" style="width:600px"><div style="font-size:12px;color:#616161">Risky sign-in details</div><div style="font-size:20px;font-weight:600;margin:4px 0 12px">${U} · Today 11:22</div><div class="tabs" style="margin-bottom:14px"><span class="on">Basic info</span><span>Device info</span><span>Risk info</span><span>MFA info</span></div>${H.kv([['User', U + ' · ' + UPN], ['Location', 'Amsterdam, Netherlands'], ['IP address', IP + ' · anonymizing VPN'], ['Application', 'Office 365 Exchange Online'], ['Previous sign-in', '10:41 · Pune, India · 6,600 km away'], ['MFA', '<b style="color:#C50F1F">Approved (push) · from his phone</b>'], ['Risk detections', 'Atypical travel · Anonymous IP address · Suspicious MFA authentication approval'], ['Risk level', rs('High')], ['Risk state', '<span id="sistate">At risk</span>']])}</div>`;
const details = [['Assigned to', 'Mova iO SOC Agent'], ['Incident ID', INCID], ['Classification', 'Not set', 'dcls'], ['Categories', 'Initial access, Collection'], ['First activity', 'Today 11:22'], ['Last activity', 'Today 11:26'], ['Impacted assets', '1 user · 1 mailbox']];
const alerts = (done) => H.table(['Alert', 'Severity', 'Status', 'Detection source', 'Time'], [{ id: 'a1', c: ['Atypical travel', S.sv('Medium'), done ? H.pl('Resolved', 'g') : H.pl('New', 'b'), 'Entra ID Protection', '11:22'] }, { id: 'a2', c: ['Anonymous IP address', S.sv('Medium'), done ? H.pl('Resolved', 'g') : H.pl('New', 'b'), 'Entra ID Protection', '11:22'] }, { id: 'a3', c: ['Suspicious inbox manipulation rule', S.sv('High'), done ? H.pl('Resolved', 'g') : H.pl('New', 'b'), 'Defender for Cloud Apps', '11:25'] }, { id: 'a4', c: ['Mail items accessed from risky session (12)', S.sv('Medium'), done ? H.pl('Resolved', 'g') : H.pl('New', 'b'), 'Defender XDR', '11:26'] }], { cls: '' });
const rule = `<div class="fl" id="rule"><h4>Inbox rule created 11:25 from ${IP}</h4>${H.kv([['Name', '“.”'], ['Condition', 'Subject or body contains “invoice”, “payment”, “bank”'], ['Action', 'Forward to <b>v.iyer.accounts@ext-mail.example</b>, mark as read, move to RSS Subscriptions'], ['Status', '<span id="rulest" style="color:#C50F1F;font-weight:600">Enabled</span>']])}</div>`;

module.exports = {
  page: 'kit.html', vo: 'vo_soc2',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['Right password.', 'Approved MFA.', 'Wrong person.'],
      stats: [['stat1', 22, '', '%', 'of breaches started with stolen or abused credentials, the most common way in', 'Source: Verizon, 2025 Data Breach Investigations Report']],
      intro: ['How <span class="y">Mova iO</span> catches a stolen session', 'and asks the person who would know.', 'Entra ID Protection · Microsoft Defender · Microsoft Teams · Exchange Online · ServiceNow · Copilot Studio'] });
    await scene('s1', 11, async () => {
      await D('step', 1, 'A sign-in from 6,600 km away, 41 minutes later', ['Entra ID']);
      await app('ms', { product: 'Microsoft Entra admin center', nav: ENAV('Identity Protection'), body: signins });
      await D('focus', '#rs0', { maxK: 1.5, pad: 8, spot: true }); await wait(3.6);
      await D('focus', '#sipane', { maxK: 1.6, pad: 0 });
    });
    await scene('s2', 12, async () => {
      await D('step', 2, 'Then an inbox rule appears', ['Microsoft Defender', 'Mova iO']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Incidents'), body: S.incPage({ id: INCID, title: `Account takeover attempt involving ${U}`, sev: 'High', tab: 'Alerts', tabs: ['Attack story', 'Alerts (4)', 'Assets (2)', 'Investigations (1)', 'Evidence and Response (6)', 'Summary'], main: `<div class="fl" id="altb">${alerts(false)}</div>${rule}`, details }) });
      await D('focus', '#altb', { maxK: 1.5, pad: 6 }); await wait(3.4);
      await D('focus', '#rule', { maxK: 1.7, pad: 6 }); await wait(3);
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '11:26', `Sign-in from Amsterdam (anonymizing VPN) 41 min after Pune; MFA push approved. 4 min later a hidden rule started forwarding payment emails out. 12 mail items read in that session.<br><b>Next:</b> ask ${U.split(' ')[0]} if it was him. If not: revoke sessions, remove the rule, require a password reset.`));
      await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await scene('s3', 11, async () => {
      await D('step', 3, 'Mova iO asks the user directly', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO Security Assistant', items: [['Mova iO Security Assistant', 'Was this you?', 1], ['Sales leadership', 'Pipeline review moved to 3 pm', 0], ['Asha Menon', 'Flight lands 6:40', 0]], me: 'VI' });
      await D('add', '#tmmsgs', H.msg(H.card({ id: 'askcard', title: 'Was this you? · Sign-in at 11:22', intro: `Hi ${U.split(' ')[0]}, someone signed in to your mailbox from <b>Amsterdam, Netherlands</b> a few minutes ago, and an MFA request was approved on your phone.`, facts: [['Where', 'Amsterdam, NL · VPN service'], ['When', 'Today 11:22 IST'], ['App', 'Outlook (Exchange Online)'], ['Your last sign-in', '10:41 · Pune']], buttons: ['No, it wasn\'t me', 'Yes, that was me'] }), 'Mova iO Security Assistant', '11:26'));
      await wait(0.6); await D('focus', '#askcard', { maxK: 1.75, pad: 10 }); await wait(4);
      await D('cursor', '#apok', true); await wait(1.1);
      await D('html', '#apbtns', '<span style="font-size:13.5px;color:#C50F1F;font-weight:600">You answered: No, it wasn\'t me. Securing your account now; you\'ll get a password reset prompt.</span>'); await wait(0.6);
      await D('add', '#tmmsgs', H.msg('I did get a random MFA ping in a meeting and tapped approve 😬', '', '11:27', true)); await D('cursorOff');
    });
    await scene('s4', 10, async () => {
      await D('step', 4, 'The SOC is told, with ten seconds to stop it', ['Microsoft Teams']);
      await app('teams', { title: 'Mova iO SOC Agent', items: [['Mova iO SOC Agent', 'Containing · Incident ' + INCID, 1], ['SOC L2', 'Kiran: shift handover at 14:00', 0]], me: 'KS' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Containing account takeover · ' + U, intro: `${U.split(' ')[0]} confirmed the Amsterdam sign-in was not him. This is pre-approved for user-confirmed takeovers.`, facts: [['Revoke', 'All sessions and refresh tokens'], ['Remove', 'Inbox rule “.” forwarding to an external address'], ['Block', IP + ' in Conditional Access named locations'], ['Require', 'Password reset and MFA re-registration'], ['Ticket', SIR]], countdown: 'Runs in', secs: 10, buttons: ['Run now', 'Stop', 'Open incident'] }), 'Mova iO SOC Agent', '11:27'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await D('tmCountdown', 10); await wait(5.5);
    });
    const nodes = [['Trigger', 'Entra ID Protection · high-risk sign-in', '#0078D4', '0.1 s'], ['Get sign-in details', 'Tool · Entra ID', '#0078D4', '0.8 s'], ['Get mailbox activity', 'Tool · Exchange Online audit', '#0F6CBD', '2.9 s'], ['Ask the user', 'Tool · Microsoft Teams', '#5B5FC7', '61 s'], ['Notify SOC', 'Tool · Microsoft Teams', '#5B5FC7', '10 s'], ['Revoke sessions', 'Tool · Entra ID', '#0078D4', '1.1 s'], ['Remove inbox rule', 'Tool · Exchange Online', '#0F6CBD', '2.2 s'], ['Block IP', 'Tool · Conditional Access', '#0078D4', '0.9 s'], ['Confirm user compromised', 'Tool · Entra ID Protection', '#0078D4', '0.7 s'], ['Update security incident', 'Tool · ServiceNow SIR', '#2F5B4F', '0.5 s'], ['Resolve Defender incident', 'Tool · Microsoft Defender', '#0F6CBD', '0.6 s']];
    await scene('s5', 15, async () => {
      await D('step', 5, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Entra ID', 'Exchange Online']);
      await app('copilot', { agent: 'Mova iO SOC Agent', run: 'Automated · risky sign-in for ' + UPN, payload: `{ "user": "${UPN}",\n  "riskLevel": "high",\n  "detections": ["atypicalTravel",\n    "anonymizedIPAddress"],\n  "incidentId": ${INCID} }`, payloadFrom: 'Trigger payload · Entra ID Protection', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 3 || i === 6 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 3) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Microsoft Teams · user answer</div><b>No, it wasn\'t me</b> · 11:27'); }
      await D('csDone'); await D('csDetail', 6, { title: 'Remove inbox rule', sub: 'Tool · Exchange Online · ✓ Complete · 2.2 s', inp: `{ "mailbox": "${UPN}",\n  "rule": ".",\n  "forwardTo": "v.iyer.accounts@ext-mail.example",\n  "action": "Remove-InboxRule" }`, out: `{ "removed": true,\n  "itemsForwarded": 3,\n  "recallRequested": true }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s6', 12, async () => {
      await D('step', 6, 'Sessions revoked, rule gone, attacker out', ['Entra ID', 'Microsoft Defender']);
      await app('ms', { product: 'Microsoft Defender', nav: S.NAV('Incidents'), body: S.incPage({ id: INCID, title: `Account takeover attempt involving ${U}`, sev: 'High', tab: 'Alerts', tabs: ['Attack story', 'Alerts (4)', 'Assets (2)', 'Investigations (1)', 'Evidence and Response (6)', 'Summary'], main: `<div class="fl" id="altb">${alerts(false)}</div>${rule}`, details }) });
      await D('focus', '#incmain', { maxK: 1.45, pad: 6 });
      await D('set', '#rulest', '<span style="color:#107C10">Removed by Mova iO · 11:28</span>'); await wait(0.8);
      for (let i = 1; i <= 4; i++) { await D('set', `#a${i} .c2`, H.pl('Resolved', 'g')); await wait(0.4); }
      await D('set', '#incst', 'Resolved'); await D('cls', '#incst', 'g', 'n'); await D('set', '#dcls', 'True positive · Compromised account');
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '11:28', `Sessions revoked; next sign-in attempt from ${IP} at 11:29 blocked. Rule removed; 3 forwarded emails listed in ${SIR} for Finance to check. ${U.split(' ')[0]} reset his password at 11:34 and re-registered MFA with number matching.`));
      await wait(0.6); await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await closing({ close: ['Detected at 11:22. Contained by 11:28.', 'Confirmed by the person who would know.', 'Attacker locked out, and Finance told what to check.'], tag: ['Account takeovers, stopped by', 'Mova iO agents.', 'With people in control.'] });
  },
};
