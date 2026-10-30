// NOC film 1, Mova iO cut: designed screens, voiceover, generic for any client.
module.exports = {
  page: 'studio.html',
  vo: 'vo_noc1m',
  async setup({ wait }) { await wait(0.5); },
  async run({ D, wait, say }) {
    const t0 = () => Date.now() / 1000;
    const scene = async (id, min, fn) => { const d = id ? say(id) : 0, s = t0(); if (fn) await fn(); const left = Math.max(min || 0, d + 0.6) - (t0() - s); if (left > 0) await wait(left); };
    await wait(0.4);
    await scene('hook', 5.2, async () => {
      await D('line', 'Every fibre cut.', 'hook', 150, 330, 0);
      await D('line', 'Every flapping circuit.', 'hook', 150, 425, 1300);
      await D('line', 'Every alert at 2 a.m.', 'hook', 150, 520, 2700);
    });
    await scene('stat1', 6, () => D('stat', '$0K+', 300, '$', 'K+', 'the cost of one hour of downtime for more than 90% of mid-size and large enterprises', 'Source: ITIC 2024 Hourly Cost of Downtime Survey'));
    await scene('stat2', 5, () => D('stat', '0%', 30, '', '%', 'of end-to-end IT service outages start in the network', 'Source: Uptime Institute, Annual Outage Analysis 2025'));
    await scene('stat3', 6, () => D('stat', '0%', 34, '', '%', 'of major network outages are caused by a third-party network provider', 'Source: Uptime Institute, Annual Outage Analysis 2025'));
    await D('clear'); await wait(0.8);
    await scene('pivot', 8, async () => {
      await D('line', 'This is where', 'hook', 150, 300, 0);
      await D('line', 'Mova iO comes in.', 'kick y', 150, 395, 500);
      await D('line', 'A fleet of specialised agents across the tools you already run,<br>with people in control.', 'mid', 154, 560, 2400, 'width:1500px');
    });
    await D('clear'); await wait(0.8);
    await scene('arch', 25, () => D('arch', [0, 2600, 9200, 12600, 17800]));
    await D('clear'); await wait(0.9);

    await scene('s1', 11, async () => { await D('step', 1, 'Five offices slow down at once', ['OpsRamp', 'SD-WAN', 'Voice and chat']); await D('twin'); });
    await D('clear'); await wait(0.8);
    await scene('s2', 10, async () => { await D('step', 2, 'Fourteen signals, one incident', ['Mova iO', 'ServiceNow']); await D('correlate'); });
    await D('clear'); await wait(0.8);
    await scene('s3', 12, async () => { await D('step', 3, 'Root cause, with evidence', ['Mova iO', 'OpsRamp']); await D('rootcause'); });
    await D('clear'); await wait(0.8);
    await scene('s4', 19, async () => { await D('step', 4, 'Fixed, with a human in the loop', ['Mova iO', 'Key Vault', 'SD-WAN orchestrator']); await D('runbook'); });
    await D('clear'); await wait(0.8);
    await scene('s5', 9, async () => { await D('step', 5, 'One carrier case, one record', ['Carrier portals', 'ServiceNow']); await D('vendor'); });
    await D('clear'); await wait(0.8);
    await scene('s6', 7, async () => { await D('step', 6, 'Everyone told, in Teams', ['Microsoft Teams']); await D('comms'); });
    await D('clear'); await wait(0.8);
    await scene('s7', 10, async () => { await D('step', 7, 'Learn once, prevent next time', ['Mova iO', 'ServiceNow']); await D('learn'); });
    await D('stepOff'); await D('clear'); await wait(0.9);

    await scene('close', 9, async () => {
      await D('line', 'One incident instead of fourteen signals.', 'mid', 150, 290, 0);
      await D('line', 'Five offices back online in under a minute.', 'mid', 150, 360, 2700);
      await D('line', 'One carrier case, with the evidence attached.', 'mid', 150, 430, 5300);
    });
    await D('clear'); await wait(0.7);
    await scene('claims', 9, async () => {
      await D('line', '40%', 'big y', 150, 290, 0); await D('line', 'lower MTTR (up to)', 'mid', 154, 460, 300);
      await D('line', '80%+', 'big y', 980, 290, 1500); await D('line', 'triage accuracy', 'mid', 984, 460, 1800);
      await D('line', 'Source: Movate, Mova iO Operations', 'src', 156, 600, 2400);
    });
    await D('clear'); await wait(0.7);
    await scene('tag', 5.5, async () => {
      await D('line', 'Carrier outages, resolved by', 'hook', 150, 330, 0);
      await D('line', 'Mova iO agents.', 'kick y', 150, 430, 400);
      await D('line', 'With people in control.', 'mid', 154, 580, 2600);
    });
    await D('clear'); await D('logo', false);
    await D('end', true);
    await scene('end', 4.6);
  }
};
