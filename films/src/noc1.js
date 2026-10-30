// NOC film 1: the NOC Network Agent handles an Airtel MPLS degradation across five India sales offices.
const secRect = (title) => ({ title });
module.exports = {
  async setup({ D, H, wait }) {
    await H('ui', { tracker: false });
    await H('go', 'command');
    await H('pause', true);
    await D('blur', true);
    await wait(1.2);
  },
  async run({ D, H, wait, mark, ev, E }) {
    const focusSec = (title, o = {}) => ev(([t, o]) => { const el = D.find(t, { sel: '#kxd h4' }); const sec = el && el.parentElement; return sec ? D.focus(sec, o) : false; }, [title, o]);
    const focusText = (t, up, o = {}) => ev(([t, up, o]) => { const el = D.find(t); let e = el; for (let i = 0; i < up && e && e.parentElement; i++) e = e.parentElement; return e ? D.focus(e, o) : false; }, [t, up, o]);
    const focusUp = (t, w, h, o = {}) => ev(([t, w, h, o]) => D.focusUp(t, w, h, o), [t, w, h, o]);

    // hook
    await D('logo', true); await D('bar', true);
    await wait(0.6);
    await D('line', 'Every fibre cut.', 'hook', 150, 330, 0);
    await D('line', 'Every flapping circuit.', 'hook', 150, 425, 900);
    await D('line', 'Every alert at 2 a.m.', 'hook', 150, 520, 1800);
    await wait(5.4);
    // stats
    await D('stat', '$0K+', 300, '$', 'K+', 'the cost of one hour of downtime for more than 90% of mid-size and large enterprises', 'Source: ITIC 2024 Hourly Cost of Downtime Survey');
    await wait(6.2);
    await D('stat', '0%', 30, '', '%', 'of end-to-end IT service outages start in the network', 'Source: Uptime Institute, Annual Outage Analysis 2025');
    await wait(5.6);
    await D('stat', '0%', 34, '', '%', 'of major network outages are caused by a third-party network provider', 'Source: Uptime Institute, Annual Outage Analysis 2025');
    await wait(5.8);
    // pivot
    await D('clearText'); await D('blur', false); await D('logo', false);
    await wait(0.9);
    await D('line', 'This is where the <span class="y">NOC Network Agent</span> changes the model.', 'cap', 0, 950, 0, 'width:1920px;text-align:center');
    await wait(4.2);
    await D('clearText'); await D('blur', true); await D('logo', true);
    await wait(0.8);
    await D('line', 'NO WAR ROOM.', 'kick', 150, 280, 0);
    await D('line', 'NO ALERT STORM.', 'kick', 150, 385, 500);
    await D('line', 'JUST ONE INCIDENT.', 'kick y', 150, 490, 1000);
    await D('line', 'Inside the Kirby Operations Hub, built on Copilot Studio.', 'mid', 154, 650, 1700);
    await wait(5.2);
    await D('clearText'); await D('blur', false); await D('logo', false);
    await wait(0.6);

    // STEP 1
    await D('step', 1, 'Five sales offices slow down at once');
    await H('pause', false);
    await H('speed', 0.55);
    await H('scenario', 'S1');
    await H('ui', { tracker: false });
    await wait(1.0);
    await focusUp('Healthy / Degraded / Down', 280, 90, { maxK: 2.1 });
    await wait(4.2);
    await focusUp('Latency to Hub', 280, 80, { maxK: 2.1 });
    await wait(3.4);

    // STEP 2
    await D('step', 2, 'Alerts and calls pour in');
    await D('spotOff'); await D('zoomOut');
    await H('go', 'live');
    await wait(1.4);
    await focusUp('Live stream', 700, 200, { maxK: 1.7, fill: 0.86 });
    for (let i = 0; i < 60; i++) { const n = await ev(() => document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.info.incident); if (n) break; await wait(0.2); }
    await H('pause', true); await H('speed', 1);
    await wait(1.2);

    // STEP 3
    const n = await ev(() => document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.info.incident);
    await D('step', 3, 'One incident, not ten alerts and four calls');
    await D('spotOff'); await D('zoomOut');
    await H('drill', { t: 'incident', n });
    await wait(1.0);
    await focusSec('Root cause', { maxK: 1.9 });
    await wait(3.4);
    await focusSec('How it was found', { maxK: 1.9 });
    await wait(3.6);
    await focusSec('Ruled out, with evidence', { maxK: 1.9 });
    await wait(3.6);

    // STEP 4
    await D('step', 4, 'Root cause, down to the circuit');
    await focusSec('Sites affected', { maxK: 1.7 });
    await wait(1.4);
    await ev(() => { const row = document.querySelector('#hub').contentDocument.querySelector('#kxd .kxd-row'); D.cursorTo(row, true); });
    await wait(2.2);
    await D('cursorOff');
    await focusSec('Fault path, people to cloud', { maxK: 1.8 });
    await wait(4.6);
    await focusSec('Next best action', { maxK: 1.9 });
    await wait(3.0);

    // STEP 5
    await D('step', 5, 'Over the loop: five offices move to 4G');
    await D('spotOff'); await D('zoomOut');
    await H('closeDrill');
    await H('go', 'live');
    await H('pause', false);
    let rid = null;
    for (let i = 0; i < 40 && !rid; i++) { await wait(0.25); rid = await ev(() => { const r = Object.values(document.querySelector('#hub').contentWindow.KirbyHub.state().runs).find((r) => r.status === 'countdown'); return r && r.id; }); }
    await H('open', { type: 'run', id: rid });
    await wait(0.9);
    await focusUp('Human-over-the-loop: executing', 420, 30, { maxK: 2.0, fill: 0.8, pad: 14 });
    await wait(3.2);
    await focusUp('Check-out credential', 420, 260, { maxK: 1.7, fill: 0.86 });
    mark('speed', 1); await D('speed', true);
    await wait(5.0);
    await focusUp('mode Human-over-the-loop', 420, 140, { maxK: 1.7, fill: 0.86 });
    await wait(6.5);
    await D('speed', false); mark('speed', 0);
    await H('ui', { drawer: null });

    // STEP 6
    await D('step', 6, 'One carrier case, evidence attached');
    await D('spotOff'); await D('zoomOut');
    for (let i = 0; i < 16; i++) { const v = await ev(() => !!document.querySelector('#hub').contentWindow.KirbyHub.state().scenarios.S1.marks.vendor); if (v) break; await wait(0.5); }
    await H('pause', true);
    await H('tool', 'zayo');
    await wait(1.2);
    await focusUp('Carrier portals', 900, 300, { maxK: 1.4, fill: 0.92, pad: 0 });
    await wait(4.4);

    // STEP 7
    await D('step', 7, 'Every office told, in Teams');
    await H('pause', false);
    await wait(2.0);
    await H('ui', { tool: null });
    await H('tool', 'teams');
    await wait(1.3);
    await focusUp('Your site is back to normal speed', 420, 70, { maxK: 2.0 });
    await wait(4.6);

    // STEP 8
    await D('step', 8, 'Back to work on 4G, case with Airtel');
    await D('spotOff'); await D('zoomOut');
    await H('ui', { tool: null });
    await H('go', 'incidents', n);
    await wait(1.4);
    await focusUp('Activity stream', 600, 120, { maxK: 1.8, fill: 0.86 });
    await wait(4.6);

    // close
    await D('stepOff'); await D('spotOff'); await D('zoomOut');
    await D('blur', true); await D('logo', true);
    await wait(0.9);
    await D('line', 'One incident instead of ten alerts and four calls.', 'mid', 150, 300, 0);
    await D('line', 'Five offices on 4G in under a minute.', 'mid', 150, 370, 900);
    await D('line', 'One carrier case, with the evidence attached.', 'mid', 150, 440, 1800);
    await wait(3.6);
    await D('line', 'Carrier outages,', 'kick y', 150, 560, 0);
    await D('line', 'the agentic way.', 'kick y', 150, 665, 400);
    await wait(4.6);
    await D('clearText'); await D('logo', false);
    await D('end', true);
    await wait(4.8);
  }
};
