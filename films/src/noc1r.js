// NOC film 1, real-workflow cut: the carrier outage worked end to end through OpsRamp, ServiceNow, Teams, Copilot Studio, SD-WAN and the carrier portal.
module.exports = {
  page: 'apps.html',
  vo: 'vo_noc1r',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run({ D, wait, say }) {
    const t0 = () => Date.now() / 1000;
    const scene = async (id, min, fn) => { const d = id ? say(id) : 0, s = t0(); if (fn) await fn(); const left = Math.max(min || 0, d + 0.6) - (t0() - s); if (left > 0) await wait(left); };
    const app = async (fn, ...a) => { await D('spotOff'); await wait(0.25); await D('win', false); await D('zoomOut'); await wait(0.55); await D(fn, ...a); await D('win', true); await wait(1.0); };

    // ---- opening
    await D('logo', true);
    await scene('hook', 5.2, async () => {
      await D('line', 'Every fibre cut.', 'hook', 150, 330, 0);
      await D('line', 'Every flapping circuit.', 'hook', 150, 425, 1300);
      await D('line', 'Every alert at 2 a.m.', 'hook', 150, 520, 2700);
    });
    await scene('stat1', 6, () => D('stat', 300, '$', 'K+', 'the cost of one hour of downtime for more than 90% of mid-size and large enterprises', 'Source: ITIC 2024 Hourly Cost of Downtime Survey'));
    await scene('stat2', 4.6, () => D('stat', 30, '', '%', 'of end-to-end IT service outages start in the network', 'Source: Uptime Institute, Annual Outage Analysis 2025'));
    await D('clearText'); await wait(0.8);
    await scene('intro', 6.6, async () => {
      await D('line', 'How <span class="y">Mova iO</span> handles a carrier outage,', 'hook', 150, 360, 0, 'font-size:64px');
      await D('line', 'inside the tools you already run.', 'hook', 150, 450, 900, 'font-size:64px');
      await D('line', 'OpsRamp · ServiceNow · Microsoft Teams · Copilot Studio · SD-WAN · Key Vault', 'src', 156, 600, 2200, 'font-size:20px;letter-spacing:.06em;text-transform:none');
    });
    await D('clearText'); await D('logo', false); await wait(0.6); await D('demo', true);

    // ---- 1 OpsRamp alerts
    await scene('s1', 9.6, async () => {
      await D('step', 1, 'Alerts arrive from five offices', ['OpsRamp']);
      await app('opsramp');
      await D('opsAlerts', 10, 650);
      await wait(1.2);
      await D('focus', '#orb', { maxK: 1.45, fill: 0.9, pad: 6 });
      await wait(4.6);
      await D('focus', '.sub', { maxK: 1.9, pad: 4 });
    });
    // ---- 2 correlation to one inference and one incident
    await scene('s2', 11.6, async () => {
      await D('step', 2, 'Fourteen signals, one inference, one incident', ['OpsRamp', 'Mova iO', 'ServiceNow']);
      await D('opsInfer');
      await D('focus', '#infrow', { maxK: 1.9, pad: 6 });
      await wait(3.6);
      await D('opsDetails');
      await wait(0.8);
      await D('focus', '#ordr', { maxK: 1.55, fill: 0.85, pad: 0 });
    });
    // ---- 3 ServiceNow incident with the triage notes
    await scene('s3', 12.6, async () => {
      await D('step', 3, 'The incident arrives already diagnosed', ['ServiceNow', 'Mova iO']);
      await app('snow');
      await D('snNote', 'Mova iO Event correlator', '#E15AA5', 'Created from OpsRamp inference #48213. Grouped 10 alerts and 4 service desk calls from 5 sales offices on MPLS-SEG-WEST-02.', 'Work notes', 0);
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 });
      await wait(3.2);
      await D('snNote', 'Mova iO Triage orchestrator', '#E15AA5', '<b>Root cause: carrier circuit</b> on MPLS-SEG-WEST-02, 95% confidence. Loss 3.6 to 4.4%, jitter 38 ms after the carrier hand-off.<br>Ruled out: site LANs (switches and Wi-Fi healthy at all 5) · edges (routers up, CPU normal) · hub (other carriers into the same hub are fine).<br>Recommended: RB-003 Steer to backup (pre-approved for regional carrier events).', 'Work notes', 1);
      await wait(0.6);
      await D('focus', '#snact', { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    // ---- 4 Teams approval, human in the loop
    await scene('s4', 11.6, async () => {
      await D('step', 4, 'A human in the loop, in Teams', ['Microsoft Teams', 'Mova iO']);
      await app('teams', 'chat');
      await D('tmApproval');
      await wait(0.6);
      await D('focus', '#apcard', { maxK: 1.75, pad: 10 });
      await D('tmCountdown');
      await wait(5.2);
      await D('cursor', '#apok', true);
      await wait(1.05);
      await D('tmApprove');
      await wait(1.2);
      await D('cursorOff');
    });
    // ---- 5 Copilot Studio activity: every tool call
    await scene('s5', 18.6, async () => {
      await D('step', 5, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Key Vault']);
      await app('copilot');
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < 10; i++) {
        await D('csStep', i, 'run'); await wait(i === 4 || i === 6 ? 1.1 : 0.6); await D('csStep', i, 'ok');
        if (i === 4) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Microsoft Teams · approval</div>Approved by <b>Priya Rao</b> (NOC lead) at 07:41');
        if (i === 6) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">SD-WAN Orchestrator</div>prefer-backup-wan applied to <b>5 of 5</b> edges');
      }
      await D('csDone');
      await D('csDetail', 6);
      await wait(0.6);
      await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    // ---- 6 SD-WAN orchestrator: path moves to backup
    await scene('s6', 11.2, async () => {
      await D('step', 6, 'Five offices move to their 4G backup', ['SD-WAN Orchestrator']);
      await app('sdwan');
      await D('focus', '#sdlinks', { maxK: 1.6, pad: 6 });
      await wait(1.2);
      await D('sdSwitch');
      await wait(3.4);
      await D('focus', '#qoe', { maxK: 1.6, pad: 60 });
    });
    // ---- 7 carrier ticket
    await scene('s7', 10.7, async () => {
      await D('step', 7, 'One carrier ticket, evidence attached', ['Carrier portal', 'Mova iO']);
      await app('carrier');
      await D('focus', '#cpf', { maxK: 1.55, pad: 14 });
      await wait(5.2);
      await D('cpAck');
      await D('focus', '#cptl', { maxK: 1.6, pad: 10 });
    });
    // ---- 8 site contacts told, incident resolved
    await scene('s8', 10.5, async () => {
      await D('step', 8, 'Everyone told; the incident closed with notes', ['Microsoft Teams', 'ServiceNow']);
      await app('teams', 'channel');
      await D('tmMsg', '<div class="card" id="upd"><div class="hd">Your office is back to normal speed · INC0024817</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What happened:</b> the carrier\'s network was dropping data, which slowed Teams and file access.<br><b>Who is on it:</b> NOC, with the carrier (ticket CQ-55103).<br><b>What to do:</b> nothing. We will move you back to the main line when it is stable.</div><div style="padding:0 18px 14px;font-size:12.5px;color:#616161">Sent to 5 site contacts · Mumbai, Pune, Delhi, Indore, Kolkata</div></div>', 'Mova iO NOC Agent', 4);
      await wait(0.5);
      await D('focus', '#upd', { maxK: 1.7, pad: 10 });
      await wait(4.4);
      await app('snow');
      await D('snNote', 'Mova iO Event correlator', '#E15AA5', 'Created from OpsRamp inference #48213.', 'Work notes', 0);
      await D('snNote', 'Mova iO Triage orchestrator', '#E15AA5', 'Root cause: carrier circuit, 95% confidence.', 'Work notes', 1);
      await D('snNote', 'Priya Rao', '#3E8E7E', 'Approved RB-003 in Teams.', 'Work notes', 3);
      await D('snNote', 'Mova iO Guided resolution assistant', '#E15AA5', 'RB-003 complete: 5 of 5 edges on 4G backup. Latency 410 → 42 ms. Verified for 30 s.', 'Work notes', 3);
      await D('snNote', 'Mova iO Vendor agent', '#E15AA5', 'Carrier ticket CQ-55103 raised with evidence; acknowledged.', 'Work notes', 5);
      await D('snResolve');
      await D('focus', '#snresbox', { maxK: 1.8, pad: 10 });
    });

    // ---- close
    await D('stepOff'); await D('spotOff'); await D('win', false); await D('zoomOut'); await D('demo', false); await D('logo', true);
    await wait(0.8);
    await scene('close', 9, async () => {
      await D('line', 'One incident instead of fourteen signals.', 'mid', 150, 300, 0);
      await D('line', 'Five offices back online in under a minute.', 'mid', 150, 370, 2900);
      await D('line', 'One carrier ticket, with the evidence attached.', 'mid', 150, 440, 5500);
    });
    await D('clearText'); await wait(0.6);
    await scene('tag', 5.6, async () => {
      await D('line', 'Carrier outages, resolved by', 'hook', 150, 330, 0);
      await D('line', 'Mova iO agents.', 'kick y', 150, 430, 400);
      await D('line', 'With people in control.', 'mid', 154, 580, 2600);
    });
    await D('clearText'); await D('logo', false);
    await D('end', true);
    await scene('end', 4.6);
  }
};
