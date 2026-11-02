// SOC film 5: a browser zero-day exploited in the wild. Prioritised, rolled out by ring through Intune, tracked to closure.
const L = require('./lib.js'); const { H } = L; const S = require('./soc_common.js');
const CVE = 'CVE-2026-24817', VUL = 'VUL0004512', CHG = 'CHG0031260', FIX = '142.0.7444.60';
const INAV = (on) => [['Home', ''], ['Dashboard', ''], ['All services', ''], ['Devices', ''], ['Apps', ''], ['Endpoint security', ''], ['Reports', ''], ['Users', ''], ['Groups', ''], ['Tenant administration', ''], ['Troubleshooting + support', '']].map(([l, k]) => [l, k, l === on]);
const DNAV = (on) => [['Home', ''], ['Exposure management', 'sec'], ['Vulnerability management', 'sub'], ['Weaknesses', 'sub'], ['Recommendations', 'sub'], ['Remediation', 'sub'], ['Investigation & response', 'sec'], ['Incidents & alerts', 'sub'], ['Hunting', 'sub'], ['Threat intelligence', ''], ['Assets', 'sec'], ['Devices', 'sub'], ['Microsoft Sentinel', ''], ['Reports', '']].map(([l, k]) => [l, k, l === on]);
const sevp = (s) => H.pl(s, s === 'Critical' ? 'r' : s === 'High' ? 'a' : 'n');
const weak = `<div style="padding:14px 26px 0"><div class="crumb" style="padding:0">Exposure management › Vulnerability management</div><h1>Weaknesses</h1><div class="cmd"><span>Export</span><span>Filters</span><span style="margin-left:auto">Search CVE</span></div></div>
  <div style="padding:0 26px">${H.table(['Name', 'Severity', 'CVSS', 'Threats', 'Exposed devices', 'Published on', 'Updated on'], [{ id: 'w0', cls: 'sel', c: ['<b>' + CVE + '</b> · Google Chrome V8 type confusion', sevp('Critical'), '8.8', '🐞 Exploit verified · in the wild', '<b id="wexp">1,412</b>', 'Today', 'Today'] }, ['CVE-2026-21933 · Windows Kernel EoP', sevp('High'), '7.8', 'Exploit available', '214', '14 Oct', '29 Oct'], ['CVE-2026-20977 · 7-Zip directory traversal', sevp('High'), '7.0', '-', '96', '9 Oct', '20 Oct'], ['CVE-2026-19210 · Zoom client info disclosure', sevp('Medium'), '6.5', '-', '41', '2 Oct', '2 Oct']], { cls: '' })}</div>
  <div class="pane on" id="wpane" style="width:620px"><div style="font-size:12px;color:#616161">Weakness details</div><div style="font-size:20px;font-weight:600;margin:4px 0 4px">${CVE}</div><div style="margin-bottom:12px">${sevp('Critical')} ${H.pl('Exploit verified', 'r')} ${H.pl('Known exploited', 'p')}</div>${H.kv([['Description', 'Type confusion in V8 lets a crafted web page run code in the browser.'], ['Affected', 'Google Chrome before ' + FIX + ' (Windows, macOS)'], ['Exposed devices', '<b>1,412</b> · 1,374 laptops, 38 servers'], ['Threat insights', 'Exploited in the wild; on CISA KEV list'], ['Fix', 'Update Google Chrome to ' + FIX], ['Recommendation', 'Update Google Chrome (Windows)']])}<div style="margin-top:14px"><span class="btn p">Request remediation</span> <span class="btn">Go hunt</span></div></div>`;
const vit = H.snInc({ kicker: 'Vulnerability', num: VUL, title: `${CVE} · Google Chrome V8 type confusion (exploited)`, buttons: ['Create change', 'Save', '⋯'], hl: [['Risk score', '96 · Critical', '#B42318'], ['State', 'In Review', '', 'snstate'], ['Vulnerable items', '1,412', '', 'snvi'], ['Remediation target', '72 hours', '', 'snsla'], ['Assignment', 'Endpoint Engineering']], fields: [['Source', 'Defender Vulnerability Management'], ['Solution', 'Update Google Chrome to ' + FIX], ['Business services', 'All employee laptops; 38 jump servers'], ['Exceptions', '9 kiosk devices (vendor-locked)'], ['Remediation plan', 'Ring 0 · IT (60) now → Ring 1 · Pilot (240) at +2 h → Ring 2 · Broad (1,074) tonight; 24 h forced relaunch. Jump servers in tonight\'s window.', '', 1], ['Change request', '', 'snchg']], ltabs: ['Details', 'Vulnerable items (1,412)', 'Remediation tasks', 'Exceptions'], notes: [H.note('Mova iO Vulnerability agent', H.MV, `Prioritised as critical: exploited in the wild and on CISA KEV; 1,412 of our devices exposed, including 38 jump servers with admin sessions. Fix tested on Ring 0 build: no app issues found in 12 critical web apps.`, '10:20')] });
const rings = (p) => H.table(['Assignment', 'Devices', 'Installed', 'Pending', 'Failed', 'Deadline'], [{ id: 'r0', c: ['Ring 0 · IT', '60', p[0][0], p[0][1], p[0][2], 'Now'] }, { id: 'r1', c: ['Ring 1 · Pilot', '240', p[1][0], p[1][1], p[1][2], '+2 h'] }, { id: 'r2', c: ['Ring 2 · Broad', '1,074', p[2][0], p[2][1], p[2][2], 'Tonight, relaunch within 24 h'] }, { id: 'r3', c: ['Jump servers', '38', p[3][0], p[3][1], p[3][2], '22:00 window'] }], { cls: '' });
const intune = (p) => `<div style="padding:14px 26px 0"><div class="crumb" style="padding:0">Apps › Windows › Google Chrome (x64)</div><h1>Google Chrome (x64) · Device install status</h1><div class="cmd"><span>Properties</span><span>Assignments</span><span>Refresh</span><span>Export</span></div></div>
  <div style="padding:6px 26px;display:flex;gap:16px"><div class="fl" style="flex:1"><h4>Installed</h4><div style="font-size:34px;font-weight:600;color:#107C10" id="iins">${p.ins}</div></div><div class="fl" style="flex:1"><h4>Pending</h4><div style="font-size:34px;font-weight:600;color:#DA7B00" id="ipen">${p.pen}</div></div><div class="fl" style="flex:1"><h4>Failed or offline</h4><div style="font-size:34px;font-weight:600;color:#C50F1F" id="ifail">${p.fail}</div></div><div class="fl" style="flex:1"><h4>Version</h4><div style="font-size:22px;font-weight:600;margin-top:8px">${FIX}</div></div></div>
  <div style="padding:6px 26px"><div class="fl" id="rings"><h4>Assignments by ring</h4>${rings(p.rings)}</div></div>`;

module.exports = {
  page: 'kit.html', vo: 'vo_soc5',
  async setup({ D, wait }) { await D('demo', false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx; const { scene, app, opening, closing } = L(ctx);
    await opening({ hook: ['A zero-day is announced.', 'Attackers already have it.', 'You have 1,412 devices exposed.'],
      stats: [['stat1', 20, '', '%', 'of breaches began with an exploited vulnerability, up 34% in a year', 'Source: Verizon, 2025 Data Breach Investigations Report']],
      statText: [['stat2', '32 days', 'median time to fully fix vulnerable edge devices', 'Source: Verizon, 2025 Data Breach Investigations Report']],
      intro: ['How <span class="y">Mova iO</span> closes an exploited vulnerability', 'in hours, not weeks.', 'Defender Vulnerability Management · ServiceNow · Microsoft Teams · Intune · Copilot Studio'] });
    await scene('s1', 11, async () => {
      await D('step', 1, 'A browser zero-day, exploited in the wild', ['Microsoft Defender']);
      await app('ms', { product: 'Microsoft Defender', nav: DNAV('Weaknesses'), body: weak });
      await D('focus', '#w0', { maxK: 1.5, pad: 8 }); await wait(3.6);
      await D('focus', '#wpane', { maxK: 1.6, pad: 0 });
    });
    await scene('s2', 13, async () => {
      await D('step', 2, 'Prioritised, planned and tested before anyone asks', ['ServiceNow', 'Mova iO']);
      await app('snow', { tab: VUL, tabs: ['Home', 'Vulnerabilities'], ws: 'Vulnerability Response', body: vit });
      await D('focus', '#snhl', { maxK: 1.7, pad: 6 }); await wait(3.6);
      await D('focus', '#snleft', { maxK: 1.5, pad: 4 }); await wait(4);
      await D('focus', '#snact', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s3', 11, async () => {
      await D('step', 3, 'The change manager approves the rollout', ['Microsoft Teams', 'Mova iO']);
      await app('teams', { title: 'Mova iO SOC Agent', items: [['Mova iO SOC Agent', 'Approval needed · ' + CHG, 1], ['Change Advisory Board', 'CAB notes · 30 Oct', 0], ['Endpoint Engineering', 'Rohit: Ring 0 looks clean', 0]], me: 'PM' });
      await D('add', '#tmmsgs', H.msg(H.card({ title: 'Approval needed · ' + CHG + ' (expedited)', intro: `${CVE} is being exploited and 1,412 of our devices have it. I'd like to push Chrome ${FIX} by ring today.`, facts: [['Ring 0 · IT', '60 devices · now (already tested)'], ['Ring 1 · Pilot', '240 devices · in 2 hours if no issues'], ['Ring 2 · Broad', '1,074 devices · tonight, relaunch within 24 h'], ['Jump servers', '38 · tonight 22:00 window'], ['Rollback', 'Pin previous version via Intune policy'], ['Exceptions', '9 vendor-locked kiosks: isolate from web']], buttons: ['Approve', 'Pilot only', 'Discuss'] }), 'Mova iO SOC Agent', '10:24'));
      await wait(0.6); await D('focus', '#apcard', { maxK: 1.75, pad: 10 }); await wait(4.4);
      await D('cursor', '#apok', true); await wait(1.05); await D('tmApprove', 'Pooja Menon (Change manager)', 'Starting Ring 0…'); await wait(1); await D('cursorOff');
    });
    const nodes = [['Trigger', 'Defender · new exploited CVE', '#0F6CBD', '0.1 s'], ['Get exposed devices', 'Tool · Defender Vulnerability Mgmt', '#0F6CBD', '2.1 s'], ['Check threat intel', 'Tool · CISA KEV feed', '#8A8886', '0.6 s'], ['Create vulnerability', 'Tool · ServiceNow VR', '#2F5B4F', '1.0 s'], ['Test on Ring 0 build', 'Tool · App test suite', '#8764B8', '14 min'], ['Raise expedited change', 'Tool · ServiceNow', '#2F5B4F', '0.8 s'], ['Request approval', 'Tool · Microsoft Teams', '#5B5FC7', '3 min'], ['Assign update by ring', 'Tool · Intune', '#0F6CBD', '1.9 s'], ['Watch install status', 'Tool · Intune', '#0F6CBD', 'ongoing'], ['Retry failed devices', 'Tool · Intune', '#0F6CBD', '12 s'], ['Verify exposure', 'Tool · Defender Vulnerability Mgmt', '#0F6CBD', '1.4 s'], ['Close vulnerable items', 'Tool · ServiceNow VR', '#2F5B4F', '0.6 s']];
    await scene('s4', 15, async () => {
      await D('step', 4, 'Every step is a tool call you can inspect', ['Copilot Studio', 'Intune', 'ServiceNow']);
      await app('copilot', { agent: 'Mova iO SOC Agent', run: 'Automated · ' + CVE, payload: `{ "cve": "${CVE}",\n  "cvss": 8.8,\n  "exploited": true,\n  "exposedDevices": 1412 }`, payloadFrom: 'Trigger payload · Defender Vulnerability Management', nodes });
      await D('focus', '#csmap', { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < nodes.length; i++) { await D('csStep', i, 'run'); await wait(i === 4 || i === 7 ? 0.9 : 0.45); await D('csStep', i, 'ok'); if (i === 4) await D('csTranscript', '<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">App test suite · Ring 0</div>12 of 12 critical web apps passed on ' + FIX); }
      await D('csDone'); await D('csDetail', 7, { title: 'Assign update by ring', sub: 'Tool · Intune (Graph) · ✓ Complete · 1.9 s', inp: `{ "app": "Google Chrome (x64)",\n  "version": "${FIX}",\n  "rings": ["Ring0-IT", "Ring1-Pilot",\n            "Ring2-Broad", "JumpServers"],\n  "relaunchDeadlineHours": 24,\n  "change": "${CHG}" }`, out: `{ "assignments": 4,\n  "devicesTargeted": 1412 }` });
      await wait(0.6); await D('focus', '#csdet', { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene('s5', 13, async () => {
      await D('step', 5, 'Rolled out ring by ring, stragglers chased', ['Intune']);
      await app('ms', { product: 'Microsoft Intune admin center', nav: INAV('Apps'), body: intune({ ins: '60', pen: '1,352', fail: '0', rings: [['60', '0', '0'], ['0', '240', '0'], ['0', '1,074', '0'], ['0', '38', '0']] }) });
      await D('focus', '#rings', { maxK: 1.5, pad: 6 }); await wait(1.4);
      await D('html', '#r1', H.tr({ c: ['Ring 1 · Pilot', '240', '238', '0', '2', '+2 h · done'] }).replace(/^<tr[^>]*>|<\/tr>$/g, '')); await D('flash', '#r1'); await D('num', '#iins', 60, 298, '', 900); await wait(1.4);
      await D('html', '#r2', H.tr({ c: ['Ring 2 · Broad', '1,074', '1,029', '0', '45', 'Tonight · done'] }).replace(/^<tr[^>]*>|<\/tr>$/g, '')); await D('flash', '#r2'); await D('num', '#iins', 298, 1327, '', 1200); await wait(1.4);
      await D('html', '#r3', H.tr({ c: ['Jump servers', '38', '38', '0', '0', '22:00 · done'] }).replace(/^<tr[^>]*>|<\/tr>$/g, '')); await D('flash', '#r3'); await D('num', '#iins', 1327, 1365, '', 600); await D('html', '#ipen', '0'); await D('html', '#ifail', '47'); await wait(1.6);
      await D('add', '#msbody', `<div class="fl" id="strag" style="margin:6px 26px;font-size:13.5px;line-height:1.7"><b>47 not updated:</b> 31 offline more than 7 days (owners emailed; update forced at next check-in) · 16 retried after a pending reboot: <b style="color:#107C10">16 of 16 updated</b></div>`);
      await D('num', '#iins', 1365, 1381, '', 600); await D('html', '#ifail', '31'); await D('focus', '#strag', { maxK: 1.6, pad: 6 });
    });
    await scene('s6', 11, async () => {
      await D('step', 6, 'Exposure down from 1,412 to 31, all tracked', ['Microsoft Defender', 'ServiceNow']);
      await app('ms', { product: 'Microsoft Defender', nav: DNAV('Weaknesses'), body: weak });
      await D('focus', '#w0', { maxK: 1.5, pad: 8 }); await D('num', '#wexp', 1412, 31, '', 2400); await wait(3);
      await D('rm', '#wpane'); await D('add', '#msbody', `<div class="fl" id="expchart" style="margin:10px 26px"><h4>Exposed devices · ${CVE}</h4>${H.chart({ w: 1100, h: 230, data: [1412, 1412, 1352, 1114, 380, 47, 31], max: 1500, labels: [[0, '10:00'], [2, '11:00'], [3, '13:00'], [4, '20:00'], [5, '23:00'], [6, 'Next day 09:00']], marks: [[6, 31, '31 offline, tracked', '#107C10']], color: '#0F6CBD' })}</div>`);
      await wait(0.5); await D('focus', '#expchart', { maxK: 1.5, pad: 6 });
    });
    await closing({ close: ['Prioritised, tested and approved in 25 minutes.', '1,381 devices patched in under 24 hours.', 'The last 31 tracked to an owner, not forgotten.'], tag: ['Exploited vulnerabilities, closed by', 'Mova iO agents.', 'With people in control.'] });
  },
};
