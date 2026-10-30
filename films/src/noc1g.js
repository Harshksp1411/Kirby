// NOC film 1 (generic, any client): carrier outage handled end to end, with voiceover.
module.exports = {
  hub: 'hub_generic.html',
  vo: 'vo_noc1',
  async setup({ D, H, wait }) {
    await H('ui', { tracker: false });
    await H('go', 'command');
    await H('pause', true);
    await D('blur', true);
    await wait(1.2);
  },
  async run(c) {
    const { D, H, wait, mark, ev, say } = c;
    const t0 = () => Date.now() / 1000;
    // run a scene: start the voice line, do the visuals, then hold until the line (plus a breath) has finished
    const scene = async (id, min, fn) => { const d = id ? say(id) : 0, s = t0(); if (fn) await fn(); const left = Math.max(min || 0, d + 0.55) - (t0() - s); if (left > 0) await wait(left); };
    const st = () => document.querySelector('#hub').contentWindow.KirbyHub.state();
    const focusSec = (title, o = {}) => ev(([t, o]) => { const el = D.find(t, { sel: '#kxd h4' }); return el ? D.focus(el.parentElement, o) : false; }, [title, o]);
    const focusUp = (t, w, h, o = {}) => ev(([t, w, h, o]) => D.focusUp(t, w, h, o), [t, w, h, o]);

    await D('logo', true); await D('bar', true);
    await wait(0.5);
    await scene('hook', 5.2, async () => {
      await D('line', 'Every fibre cut.', 'hook', 150, 330, 0);
      await D('line', 'Every flapping circuit.', 'hook', 150, 425, 1300);
      await D('line', 'Every alert at 2 a.m.', 'hook', 150, 520, 2700);
    });
    await scene('stat1', 6, () => D('stat', '$0K+', 300, '$', 'K+', 'the cost of one hour of downtime for more than 90% of mid-size and large enterprises', 'Source: ITIC 2024 Hourly Cost of Downtime Survey'));
    await scene('stat2', 5, () => D('stat', '0%', 30, '', '%', 'of end-to-end IT service outages start in the network', 'Source: Uptime Institute, Annual Outage Analysis 2025'));
    await scene('stat3', 6, () => D('stat', '0%', 34, '', '%', 'of major network outages are caused by a third-party network provider', 'Source: Uptime Institute, Annual Outage Analysis 2025'));
    await D('clearText'); await D('blur', false); await D('logo', false);
    await wait(0.8);
    await scene('pivot', 3.8, () => D('line', 'This is where the <span class="y">Intelligent Operations Hub</span> takes over.', 'cap', 0, 950, 0, 'width:1920px;text-align:center'));
    await D('clearText'); await D('blur', true); await D('logo', true);
    await wait(0.8);
    await scene('kick', 5, async () => {
      await D('line', 'NO WAR ROOM.', 'kick', 150, 300, 0);
      await D('line', 'NO ALERT STORM.', 'kick', 150, 405, 900);
      await D('line', 'JUST ONE INCIDENT.', 'kick y', 150, 510, 1900);
    });
    await D('clearText');
    await wait(0.5);
    await scene('tools', 15, async () => {
      await D('line', 'Works with the tools you <span class="y">already run</span>', 'hook', 150, 190, 0);
      await D('tools', [['OpsRamp', 'Monitoring and events'], ['ServiceNow', 'Incidents, changes, CMDB'], ['Copilot Studio', 'Correlation, decisions, runbooks'], ['Key Vault', 'A credential for every action'], ['Microsoft Teams', 'Updates and approvals'], ['SD-WAN', 'Path steering at every site']], 2000);
    });
    await D('toolsOff'); await D('clearText');
    await wait(0.6);
    await D('blur', false); await D('logo', false);
    await wait(0.7);

    // STEP 1
    await scene('s1', 8.4, async () => {
      await D('step', 1, 'Five offices slow down at once', ['OpsRamp']);
      await H('pause', false); await H('speed', 0.55); await H('scenario', 'S1'); await H('ui', { tracker: false });
      await wait(1.0);
      await focusUp('Healthy / Degraded / Down', 280, 90, { maxK: 2.1 });
      await wait(4.0);
      await focusUp('Latency to Hub', 280, 80, { maxK: 2.1 });
    });
    // STEP 2: hold here until the incident exists, then freeze the simulation
    await scene('s2', 6.6, async () => {
      await D('step', 2, 'Alerts and calls pour in', ['OpsRamp', 'SD-WAN', 'Voice agent']);
      await D('spotOff'); await D('zoomOut');
      await H('go', 'live');
      await wait(1.4);
      await focusUp('Live stream', 700, 200, { maxK: 1.7, fill: 0.86 });
    });
    for (let i = 0; i < 80; i++) { if (await ev(() => !!document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.info.incident)) break; await wait(0.2); }
    await H('pause', true); await H('speed', 1);
    const n = await ev(() => document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.info.incident);

    // STEP 3
    await scene('s3', 11.5, async () => {
      await D('step', 3, 'One incident, not ten alerts and four calls', ['Copilot Studio', 'ServiceNow']);
      await D('spotOff'); await D('zoomOut');
      await H('drill', { t: 'incident', n });
      await wait(1.0);
      await focusSec('Root cause', { maxK: 1.9 });
      await wait(3.2);
      await focusSec('How it was found', { maxK: 1.9 });
      await wait(3.4);
      await focusSec('Ruled out, with evidence', { maxK: 1.9 });
    });
    // STEP 4
    await scene('s4', 11, async () => {
      await D('step', 4, 'Root cause, down to the circuit', ['Copilot Studio', 'OpsRamp']);
      await focusSec('Sites affected', { maxK: 1.7 });
      await wait(1.6);
      await ev(() => { const row = document.querySelector('#hub').contentDocument.querySelector('#kxd .kxd-row'); D.cursorTo(row, true); });
      await wait(2.0);
      await D('cursorOff');
      await focusSec('Fault path, people to cloud', { maxK: 1.8 });
      await wait(4.4);
      await focusSec('Next best action', { maxK: 1.9 });
    });
    // STEP 5: real-time countdown at 1x, execution at 2x
    {
      const d = say('s5'), s = t0();
      await D('step', 5, 'Over the loop: five offices move to backup', ['Copilot Studio', 'Key Vault', 'SD-WAN']);
      await D('spotOff'); await D('zoomOut');
      await H('closeDrill'); await H('go', 'live'); await H('pause', false);
      let rid = null;
      for (let i = 0; i < 40 && !rid; i++) { await wait(0.25); rid = await ev(() => { const r = Object.values(document.querySelector('#hub').contentWindow.KirbyHub.state().runs).find((r) => r.status === 'countdown'); return r && r.id; }); }
      await H('open', { type: 'run', id: rid });
      await wait(0.9);
      await focusUp('Human-over-the-loop: executing', 420, 30, { maxK: 2.0, fill: 0.8, pad: 14 });
      await wait(4.2);
      await focusUp('Check-out credential', 420, 260, { maxK: 1.7, fill: 0.86 });
      await wait(Math.max(2.5, d - (t0() - s) + 0.4));
      mark('speed', 1); await D('speed', true);
      await focusUp('mode Human-over-the-loop', 420, 140, { maxK: 1.7, fill: 0.86 });
      await wait(8.0);
      await D('speed', false); mark('speed', 0);
      await H('ui', { drawer: null });
    }
    // STEP 6
    for (let i = 0; i < 20; i++) { if (await ev(() => !!document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.marks.vendor)) break; await wait(0.5); }
    await H('pause', true);
    await scene('s6', 7, async () => {
      await D('step', 6, 'One carrier case, evidence attached', ['Carrier portal', 'ServiceNow']);
      await D('spotOff'); await D('zoomOut');
      await H('tool', 'zayo');
      await wait(1.2);
      await focusUp('Carrier portals', 900, 300, { maxK: 1.4, fill: 0.92, pad: 0 });
    });
    // STEP 7
    await H('pause', false); await wait(2.0); await H('pause', true);
    await scene('s7', 7, async () => {
      await D('step', 7, 'Every office told, in Teams', ['Microsoft Teams']);
      await H('ui', { tool: null }); await H('tool', 'teams');
      await wait(1.3);
      await focusUp('Your site is back to normal speed', 420, 70, { maxK: 2.0 });
    });
    // STEP 8
    await scene('s8', 6, async () => {
      await D('step', 8, 'Every step on the ServiceNow record', ['ServiceNow']);
      await D('spotOff'); await D('zoomOut');
      await H('ui', { tool: null }); await H('go', 'incidents', n);
      await wait(1.4);
      await focusUp('Activity stream', 600, 120, { maxK: 1.8, fill: 0.86 });
    });
    // close
    await D('stepOff'); await D('spotOff'); await D('zoomOut');
    await D('blur', true); await D('logo', true);
    await wait(0.9);
    await scene('close', 9.5, async () => {
      await D('line', 'One incident instead of ten alerts and four calls.', 'mid', 150, 300, 0);
      await D('line', 'Five offices back online in under a minute.', 'mid', 150, 370, 2900);
      await D('line', 'One carrier case, with the evidence attached.', 'mid', 150, 440, 5600);
    });
    await scene('tag', 3.6, async () => {
      await D('line', 'Carrier outages,', 'kick y', 150, 560, 0);
      await D('line', 'handled end to end.', 'kick y', 150, 665, 300);
    });
    await D('clearText'); await D('logo', false);
    await D('end', true);
    await scene('end', 4.6);
  }
};
