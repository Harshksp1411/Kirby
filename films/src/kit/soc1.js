// SOC film 1: a reported phishing email, traced to a 23-mailbox campaign, purged and contained.
const L = require('./lib.js'); const { H } = L; const S = require('./soc_common.js');
const DOM = 'vendor-billing-portal.co', INCID = '4127', SIR = 'SIR0010231';
const mail = `<div style="padding:22px 30px;font-size:14px;line-height:1.6" id="olmail"><div style="font-size:20px;font-weight:600">Action required: updated bank details for invoice INV-88213</div><div style="display:flex;gap:12px;align-items:center;margin:14px 0"><span style="width:40px;height:40px;border-radius:50%;background:#8A8886;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700">AB</span><div><b>Accounts Billing</b> &lt;accounts@${DOM}&gt;<div style="color:#616161;font-size:12.5px">To: Anita Nair · Today 10:02</div></div></div><div style="background:#FFF4CE;border:1px solid #F2D58A;border-radius:4px;padding:8px 12px;font-size:13px;margin-bottom:14px">⚠ External sender. You don't often get email from accounts@${DOM}.</div>
  Dear customer,<br><br>Our banking details have changed. To avoid a late-payment penalty on invoice INV-88213 (₹4,86,200), please confirm the new details through our secure portal before 5 pm today.<br><br><span style="display:inline-block;background:#0F6CBD;color:#fff;border-radius:4px;padding:8px 16px;font-weight:600">View secure document</span><br><br>Regards,<br>Accounts Billing Team</div>`;
const menu = `<div style="width:230px;background:#fff;border:1px solid #D1D1D1;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:13.5px"><div style="padding:9px 14px">Report junk</div><div style="padding:9px 14px;background:#EBF3FC;font-weight:600" id="olphish">Report phishing</div><div style="padding:9px 14px">Report not junk</div></div>`;
const reported = `<div style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:520px;background:#fff;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.3);padding:22px 24px;font-size:14px;line-height:1.55" id="olthanks"><div style="font-size:18px;font-weight:600;margin-bottom:8px">Thanks for reporting</div>The message was sent to your security team and moved to Deleted Items. You'll hear back when it has been reviewed.<div style="text-align:right;margin-top:16px"><span class="btn p" style="display:inline-block;background:#0F6CBD;color:#fff;border-radius:4px;padding:6px 16px;font-weight:600">OK</span></div></div>`;
const g = { nodes: [{ id: 's', x: 110, y: 230, label: DOM, sub: 'Sender domain', c: '#C50F1F', ic: '@', bad: 1 }, { id: 'u', x: 340, y: 90, label: 'URL · /secure-doc', sub: 'Credential page', c: '#C50F1F', ic: '⛓', bad: 1 }, { id: 'm', x: 360, y: 330, label: '23 mailboxes', sub: 'Email cluster', c: '#DA7B00', ic: '✉', r: 30 }, { id: 'a', x: 620, y: 360, label: 'Anita Nair', sub: 'Reported it', c: '#107C10', ic: 'AN' }, { id: 'r', x: 620, y: 220, label: 'Rahul Mehta', sub: 'Clicked, closed page', c: '#DA7B00', ic: 'RM' }, { id: 'k', x: 620, y: 80, label: 'Sneha Kulkarni', sub: 'Clicked, typed password', c: '#C50F1F', ic: 'SK', bad: 1 }, { id: 'ip', x: 850, y: 80, label: '185.199.x.x', sub: 'Sign-in · MFA denied', c: '#C50F1F', ic: 'IP' }], edges: [['s', 'm', 'sent'], ['s', 'u', 'hosts'], ['m', 'a'], ['m', 'r'], ['m', 'k'], ['u', 'r', 'clicked'], ['u', 'k', 'clicked'], ['k', 'ip', 'password used']] };
const details = [['Assigned to', 'Mova iO SOC Agent', 'dass'], ['Incident ID', INCID], ['Classification', 'Not set', 'dcls'], ['Categories', 'Initial access, Credential access'], ['First activity', 'Today 10:02'], ['Last activity', 'Today 10:09'], ['Impacted assets', '23 mailboxes · 2 users']];
const ev = (done) => { const st = done ? H.pl('Remediated', 'g') : H.pl('Pending approval', 'a'); return H.table(['Entity', 'Verdict', 'Remediation status', 'Action'], [{ id: 'e1', c: ['Email cluster · 23 messages', H.pl('Malicious', 'r'), st, 'Soft delete email cluster'] }, { id: 'e2', c: ['URL · ' + DOM + '/secure-doc', H.pl('Malicious', 'r'), st, 'Block URL'] }, { id: 'e3', c: ['Sender domain · ' + DOM, H.pl('Malicious', 'r'), st, 'Block sender domain'] }, { id: 'e4', c: ['User · Sneha Kulkarni', H.pl('Compromised', 'r'), st, 'Revoke sessions, reset password'] }, { id: 'e5', c: ['User · Rahul Mehta', H.pl('Suspicious', 'a'), H.pl('No action needed', 'n'), 'Clicked; no password entered'] }], { cls: '' }); };
const ms = (on, body) => ({ product: 'Microsoft Defender', nav: S.NAV(on), body });
const qRows = (mine) => [{ id: 'q0', cls: mine ? 'sel' : '', c: [mine ? '<b>Phishing campaign involving 23 mailboxes</b>' : '<b>Email reported by user as malware or phish involving one user</b>', INCID, S.sv(mine ? 'High' : 'Informational'), mine ? 'Pending action' : 'Running', 'Initial access', mine ? '23 mailboxes, 2 users' : '1 mailbox', mine ? '5' : '1', 'Defender for Office 365', '10:09', 'Mova iO SOC Agent'] }, ['Multi-stage incident on one endpoint', '4119', S.sv('Medium'), 'Remediated', 'Execution', 'lap-pun-0213', '0', 'Defender for Endpoint', '08:52', 'Kiran S.'], ['Unfamiliar sign-in properties', '4116', S.sv('Low'), 'No threats found', 'Initial access', 'j.dsouza', '0', 'Entra ID Protection', '07:30', 'Mova iO SOC Agent'], ['Suspicious inbox forwarding rule', '4102', S.sv('Medium'), 'Remediated', 'Exfiltration', 'v.iyer', '0', 'Defender for Office 365', 'Yesterday', 'Kiran S.']];

module.exports = {
  page: 'kit.html', vo: 'vo_soc1',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['One email.', 'One click.', 'One password typed into the wrong page.'],
      stats: [['stat1', 60, '', '%', 'of breaches involved the human element', 'Source: Verizon, 2025 Data Breach Investigations Report']],
      intro: ['How <span class="y">Mova iO</span> turns one reported email', 'into a contained campaign.', 'Outlook · Microsoft Defender · Entra ID · ServiceNow · Microsoft Teams · Copilot Studio'] });
    await scene('s1', 10, async () => {
      await D('step', 1, 'An employee reports a suspicious email', ['Outlook']);
      await app('outlook', { me: 'AN', list: [['Accounts Billing', 'Action required: updated bank details…', 'Our banking details have changed. To avoid…', 1], ['Priya Rao', 'Q3 close: final numbers', 'Attached are the final figures for…', 0], ['IT Service Desk', 'Your request RITM0088120 is complete', 'Hello Anita, your request…', 0], ['Vendor Payments', 'Weekly payment run', 'Payment run scheduled for Friday…', 0]], body: mail });
      await D('focus', '#olmail', { maxK: 1.5, pad: 6 }); await wait(4);
      await D('zoomOut'); await wait(1.3); await D('cursor', '#olreport', true); await wait(1.1);
      await D('popBelow', '#olreport', menu, 'olmenu'); await wait(0.5); await D('cursor', '#olphish', true); await wait(1.2);
      await D('rm', '#olmenu'); await D('add', '#olbody', reported); await D('cursorOff');
    });
    await scene('s2', 11, async () => {
      await D('step', 2, 'One report becomes a campaign', ['Microsoft Defender', 'Mova iO']);
      await app('ms', ms('Incidents', S.queue(qRows(false))));
      await D('focus', '#iq', { maxK: 1.45, pad: 10 }); await wait(3.4);
      await D('html', '#q0', qRows(true)[0].c.map((c, j) => `<td class="c${j}">${c}</td>`).join('')); await D('cls', '#q0', 'sel'); await D('flash', '#q0');
      await wait(1); await D('focus', '#q0', { maxK: 1.6, pad: 6 });
    });
    await scene('s3', 14, async () => {
      await D('step', 3, 'The attack story: who got it, who clicked', ['Microsoft Defender', 'Entra ID', 'Mova iO']);
      await app('ms', ms('Incidents', S.incPage({ id: INCID, title: 'Phishing campaign involving 23 mailboxes', sev: 'High', tabs: ['Attack story', 'Alerts (5)', 'Assets (25)', 'Investigations (1)', 'Evidence and Response (27)', 'Summary'], main: `<div class="fl" style="flex:1" id="story"><h4>Incident graph</h4>${H.graph(g.nodes, g.edges, { w: 940, h: 440 })}</div>`, details })));
      await D('focus', '#story', { maxK: 1.35, pad: 4 }); await wait(5);
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '10:09', '<b>Campaign:</b> 23 messages from ' + DOM + ' (registered 2 days ago), same subject and URL. URL detonated: fake Microsoft 365 sign-in page.<br><b>Clicks:</b> 2 users. Sneha Kulkarni entered her password; a sign-in from 185.199.x.x followed 3 min later and was stopped by MFA.<br><b>Recommend:</b> soft delete all 23, block URL and domain, revoke Sneha\'s sessions and reset her password.'));
      await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await scene('s4', 11, async () => {
      await D('step', 4, 'The SOC analyst approves in Teams', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO SOC Agent', items: [['Mova iO SOC Agent', 'Approval needed · Incident ' + INCID, 1], ['SOC L2', 'Kiran: shift handover at 14:00', 0], ['Neha Gupta', 'Can you look at 4119?', 0]], me: 'KS' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Approval needed · Defender incident ' + INCID, intro: 'A phishing campaign reached 23 mailboxes. One user typed her password; MFA stopped the attacker\'s sign-in.', facts: [['Soft delete', '23 messages from ' + DOM], ['Block', 'URL and sender domain (Tenant Allow/Block List)'], ['User', 'Sneha Kulkarni · revoke sessions, force password reset'], ['Evidence', 'Detonation report, 2 click events, 1 sign-in attempt'], ['Ticket', SIR + ' · ServiceNow Security Incident Response']], buttons: ['Approve all', 'Review in Defender', 'Reject'] }), 'Mova iO SOC Agent', '10:10'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.4);
      await D('cursor', '#apok', true); await wait(1.05); await D('tmApprove', 'Kiran Shah (SOC L2)', 'Running remediation…'); await wait(1); await D('cursorOff');
    });
    const nodes = [['Trigger', 'Defender · user-reported phish', '#0F6CBD', '0.1 s'], ['Get email cluster', 'Tool · Defender for Office 365', '#0F6CBD', '2.4 s'], ['Detonate URL', 'Tool · Defender sandbox', '#0F6CBD', '38 s'], ['Find clicks', 'Tool · Advanced hunting', '#0F6CBD', '3.1 s'], ['Check sign-ins', 'Tool · Entra ID', '#0078D4', '1.6 s'], ['Request approval', 'Tool · Microsoft Teams', '#5B5FC7', '52 s'], ['Soft delete 23 messages', 'Tool · Defender for Office 365', '#0F6CBD', '41 s'], ['Block URL and domain', 'Tool · Tenant Allow/Block List', '#0F6CBD', '2.0 s'], ['Revoke sessions', 'Tool · Entra ID', '#0078D4', '1.2 s'], ['Force password reset', 'Tool · Entra ID', '#0078D4', '0.9 s'], ['Update security incident', 'Tool · ServiceNow SIR', '#2F5B4F', '0.5 s'], ['Tell the reporter', 'Tool · Microsoft Teams', '#5B5FC7', '0.4 s']];
    await scene('s5', 16, async () => {
      await D('step', 5, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Microsoft Defender', 'Entra ID']);
      await app('copilot', { agent: 'Mova iO SOC Agent', run: 'Automated · Defender incident ' + INCID, payload: `{ "incidentId": ${INCID},\n  "alert": "Email reported by user as\n            malware or phish",\n  "reporter": "anita.nair" }`, payloadFrom: 'Trigger payload · Microsoft Defender', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 2 || i === 6 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 3) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Advanced hunting · UrlClickEvents</div>2 clicks: Rahul Mehta 10:04, Sneha Kulkarni 10:05'); if (i === 5) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Microsoft Teams · approval</div>Approved by <b>Kiran Shah</b> (SOC L2) at 10:11'); }
      await D('csDone'); await D('csDetail', 6, { title: 'Soft delete 23 messages', sub: 'Tool · Defender for Office 365 · ✓ Complete · 41 s', inp: `{ "cluster": "sender:${DOM}\n    AND subject:INV-88213",\n  "action": "SoftDelete",\n  "incident": ${INCID} }`, out: `{ "matched": 23, "removed": 23,\n  "alreadyDeleted": 1,\n  "failed": 0 }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'Purged, blocked, and the account secured', ['Microsoft Defender', 'Entra ID']);
      await app('ms', ms('Incidents', S.incPage({ id: INCID, title: 'Phishing campaign involving 23 mailboxes', sev: 'High', tab: 'Evidence and Response', tabs: ['Attack story', 'Alerts (5)', 'Assets (25)', 'Investigations (1)', 'Evidence and Response (27)', 'Summary'], main: `<div class="fl" id="evtb">${ev(false)}</div>`, details })));
      await D('focus', '#evtb', { maxK: 1.5, pad: 6 }); await wait(2);
      for (let i = 1; i <= 4; i++) { await D('set', `#e${i} .c2`, H.pl('Remediated', 'g')); await wait(0.5); }
      await D('set', '#incst', 'Resolved'); await D('cls', '#incst', 'g', 'n'); await D('set', '#dcls', 'True positive · Phishing');
      await D('add', '#comments', S.comment('Mova iO SOC Agent', '10:12', '23 of 23 removed (1 already deleted by the reporter). URL and domain blocked. Sneha\'s sessions revoked; password reset required at next sign-in. ' + SIR + ' updated.'));
      await wait(0.6); await D('focus', '#incside', { maxK: 1.6, pad: 4 });
    });
    await scene('s7', 10, async () => {
      await D('step', 7, 'The reporter hears back, in minutes', ['Microsoft Teams']);
      await app('teams', { title: 'Mova iO Security Assistant', items: [['Mova iO Security Assistant', 'You were right, thank you', 1], ['Priya Rao', 'Q3 close: final numbers', 0]], me: 'AN' });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd"><div class="hd">You were right · thank you, Anita</div><div style="padding:14px 18px;font-size:14px;line-height:1.55">The email you reported at 10:06 was phishing. It had gone to 23 people; we've removed every copy and blocked the sender.<br><br>Because you reported it, we stopped it within 6 minutes. Nothing else for you to do.</div></div>`, 'Mova iO Security Assistant', '10:12'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.7, pad: 10 });
    });
    await closing({ close: ['Reported at 10:06. Contained by 10:12.', '23 copies removed before anyone else clicked.', 'One password reset, and the attacker locked out.'], tag: ['Phishing, contained by', 'Mova iO agents.', 'With people in control.'] });
  },
};
