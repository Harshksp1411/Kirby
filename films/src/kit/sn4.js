// ServiceNow film 4: a long, noisy incident condensed into a handoff summary, a caller update, resolution notes and a KB draft.
const L = require('./lib.js'); const { H } = L;
const INC = 'INC0031877', KB = 'KB0013054';
const P = ['#3E8E7E', '#6264A7', '#B26A00', '#2B579A', '#8764B8'];
const noisy = [['Arjun Rao', 'Still seeing drops on 3F. Asked user for a Teams call log. No reply yet.', 'Wed 17:40'], ['Kavya Sharma', 'Reassigned to Network Operations: not a Teams client issue per EUC.', 'Wed 15:12'], ['Ravi Patil', 'Collected PCAP on 2 laptops. Jitter spikes at 38 to 60 ms when Wi-Fi roams. Attached.', 'Wed 11:05'], ['Sana Khan', 'Pune Wi-Fi controller upgraded to 10.4 Sunday night (CHG0031101). Could be related?', 'Tue 18:22'], ['Arjun Rao', 'Teams client reinstalled on user laptop. No change.', 'Tue 16:47'], ['Kavya Sharma', 'Reassigned to EUC L2.', 'Tue 12:30'], ['Neha Gupta', 'Same issue for 11 more people on 3F and 4F. Linking their tickets.', 'Tue 10:02'], ['Ravi Patil', 'DSCP 46 markings missing on packets leaving the AP. QoS profile reset by the upgrade?', 'Thu 09:41']];
const notes = noisy.map(([w, t, ti], i) => H.note(w, P[i % 5], t, ti)).reverse();
const body = (st) => H.snInc({ num: INC, title: 'Teams calls dropping for Pune office, floors 3 and 4', hl: [['Priority', '2 - High', '#C2410C'], ['State', st, '', 'snstate'], ['Assigned to', '<span id="snass">Meera Patel</span>'], ['Open for', '3 days'], ['Activity', '46 work notes · 3 reassignments']], fields: [['Caller', 'Neha Gupta (+11 linked)'], ['Category', 'Network'], ['Subcategory', 'Wireless'], ['Configuration item', 'pun-wlc-01'], ['Assignment group', 'Network Operations'], ['Related', 'CHG0031101 · 12 child incidents']], ltabs: ['Overview', 'Related records (13)', 'Investigate'],
  top: `<div id="mvsum" style="margin-bottom:14px;border:1px solid #F3C6DF;background:#FFF7FB;border-radius:8px;padding:12px 14px;font-size:13.5px;line-height:1.55"><div style="display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:6px"><span style="width:20px;height:20px;border-radius:5px;background:linear-gradient(135deg,#EE3B33,#F7A541 55%,#E15AA5)"></span>Mova iO · Summary<span style="margin-left:auto;font-weight:600;color:#C2185B;border:1px solid #E15AA5;border-radius:6px;padding:3px 10px;font-size:12.5px" id="sumbtn">Summarize</span></div><div id="sumtxt" style="color:#5A6872">46 work notes across 3 teams. Summarize to catch up.</div></div>`, notes });

module.exports = {
  page: 'kit.html', vo: 'vo_sn4',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['46 work notes.', 'Three teams. Three days.', 'Nobody wants to read it all.'], stats: [], intro: ['How <span class="y">Mova iO</span> summarizes a ticket,', 'so the next person starts where the last one stopped.', 'ServiceNow · Microsoft Teams · Mova iO'] });
    await scene('s1', 10, async () => {
      await D('step', 1, 'A new owner picks up a noisy ticket', ['ServiceNow']);
      await app('snow', { tab: INC, me: 'MP', body: body('In Progress') });
      await D('focus', '#snact', { maxK: 1.6, fill: 0.88, pad: 0 }); await wait(4.2);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 });
    });
    await scene('s2', 15, async () => {
      await D('step', 2, 'One click: the whole story, in five lines', ['Mova iO', 'ServiceNow']);
      await D('focus', '#mvsum', { maxK: 1.7, pad: 8 }); await wait(0.6);
      await D('cursor', '#sumbtn', true); await wait(1.2); await D('cursorOff');
      await D('typeHtml', '#sumtxt', `<div style="color:#1F2933"><b>Issue:</b> Teams calls drop for 12 people on floors 3 and 4 in Pune since Monday morning.<br><b>Tried:</b> client reinstall (no change); PCAP shows jitter of 38 to 60 ms when laptops roam between access points.<br><b>Likely cause:</b> Sunday's Wi-Fi controller upgrade (CHG0031101) reset the voice QoS profile; DSCP 46 markings are missing.<br><b>Next step:</b> re-apply the voice QoS profile on pun-wlc-01, then test with 2 users.<br><b>Waiting on you:</b> 12 callers; last update to them was 2 days ago.</div>`, 10);
      await wait(5.5); await D('focus', '#mvsum', { maxK: 1.6, pad: 8 });
    });
    await scene('s3', 12, async () => {
      await D('step', 3, 'Shared to work notes, and a plain update for the callers', ['ServiceNow', 'Mova iO']);
      await D('zoomOut'); await wait(1);
      await D('add', '#snnotes', H.note('Meera Patel', '#3E8E7E', '<b>Summary (Mova iO, reviewed):</b> drops since Monday on 3F/4F, jitter on AP roam, QoS profile reset by CHG0031101. Next: re-apply voice QoS on pun-wlc-01.', 'Thu 10:12'), true);
      await D('add', '#snnotes', H.note('Meera Patel', '#3E8E7E', 'Hi all, we\'ve found the likely cause: a Wi-Fi update on Sunday changed a setting that keeps calls smooth. We\'re fixing it this morning and will confirm by 12:00. Sorry for the wait.', 'Thu 10:13', 'Additional comments'), true);
      await D('focus', '#snact', { maxK: 1.6, fill: 0.88, pad: 0 });
    });
    await scene('s4', 13, async () => {
      await D('step', 4, 'Fixed, and the resolution notes write themselves', ['ServiceNow', 'Mova iO']);
      await D('add', '#snnotes', H.note('Ravi Patil', P[3], 'Voice QoS profile re-applied on pun-wlc-01. DSCP 46 back on egress. Tested with 2 users across 3 APs: no drops, jitter 6 ms.', 'Thu 11:02'), true);
      await D('set', '#snstate', '<span style="color:#1B7A43">Resolved</span>');
      await D('set', '#snresbox', `<label style="font-size:12.5px;color:#5A6872">Resolution notes · drafted by Mova iO from the activity, edited by Meera</label><div class="v" style="border:1px solid #CDD3DA;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;line-height:1.5"><b>Cause:</b> Wi-Fi controller upgrade CHG0031101 reset the voice QoS profile, removing DSCP 46 markings; calls dropped when laptops roamed between access points.<br><b>Fix:</b> voice QoS profile re-applied on pun-wlc-01; verified with 2 users on 3 APs (jitter 6 ms).<br><b>Close code:</b> Solved (permanently) · 12 child incidents closed with this note.<br><b>Follow-up:</b> add a QoS check to the controller upgrade runbook.</div>`);
      await D('focus', '#snleft', { maxK: 1.45, pad: 4 });
    });
    await scene('s5', 12, async () => {
      await D('step', 5, 'A knowledge article, drafted for review', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: KB, tabs: ['Home', 'Knowledge'], ws: 'Knowledge Management', me: 'MP', body: `<div style="display:flex;align-items:center;gap:14px"><div><div style="font-size:12.5px;color:#5A6872">Knowledge article · ${KB} · IT Knowledge base</div><div style="font-size:21px;font-weight:700">Teams calls drop after a Wi-Fi controller upgrade (voice QoS reset)</div></div><div style="margin-left:auto;display:flex;gap:8px"><span class="btn">Submit for review</span><span class="btn p">Save</span></div></div>
        <div class="hl"><div>Workflow<b style="color:#B26A00">Draft</b></div><div>Author<b>Mova iO Knowledge agent</b></div><div>Reviewer<b>Network Operations</b></div><div>Source<b>${INC} (+12)</b></div></div>
        <div style="background:#fff;border:1px solid #DEE2E6;border-radius:8px;padding:18px 22px;font-size:14.5px;line-height:1.65;flex:1" id="kbbody"><b>Symptoms</b><br>Teams and other calls drop or turn robotic when users move around the office on Wi-Fi, after a wireless controller upgrade.<br><br><b>Cause</b><br>The upgrade resets the voice QoS profile, so voice packets lose their DSCP 46 marking and are treated as normal traffic when laptops roam between access points.<br><br><b>Resolution</b><br>1. On the controller, re-apply the <span class="mono">voice-qos</span> profile to the corporate SSID.<br>2. Confirm DSCP 46 on egress with a packet capture.<br>3. Test a call while walking between two access points.<br><br><b>Prevention</b><br>Add a QoS check to the controller upgrade runbook (task raised).</div>` });
      await D('focus', '#kbbody', { maxK: 1.5, pad: 6 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'The shift handover, already written', ['Microsoft Teams']);
      await app('teams', { view: 'channel', team: 'IT Operations', channel: 'NOC handover' });
      await D('add', '#tmmsgs', H.msg(`<div class="card" id="upd" style="width:760px"><div class="hd">Handover · Thu 14:00 · 3 open P1/P2</div><div style="padding:12px 18px;font-size:14px;line-height:1.7"><b>${INC}</b> · Pune Teams drops · <span style="color:#1B7A43;font-weight:700">Resolved 11:02</span>: QoS reset by Wi-Fi upgrade; KB draft with Network for review.<br><b>INC0031902</b> · Halol plant label printers offline · waiting on vendor part, ETA 16:00; site using backup printer.<br><b>INC0031915</b> · Finance share slow from Dubai · traced to WAN optimizer; change CHG0031270 tonight 22:00.<br><b>Watch:</b> Hyderabad file server forecast cleared; no other risks.</div></div>`, 'Mova iO NOC Agent', '13:58'));
      await wait(0.5); await D('focus', '#upd', { maxK: 1.6, pad: 10 });
    });
    await closing({ close: ['Three days of notes, caught up in one click.', 'Callers updated in plain language.', 'Resolution notes, a KB draft and the handover, written for you.'], tag: ['Ticket summaries, written by', 'Mova iO agents.', 'With people in control.'] });
  },
};
