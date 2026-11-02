// SOC film 4: critical exploited browser vulnerability found across the estate and patched in rings via Intune.
const { defNav, intuneNav } = require("./soc_common.js");
const CVE = "CVE-2026-0941";
const tvm = (after) => ({
  th: "defender", nav: defNav.concat(["#Vulnerability management", "Dashboard", "Recommendations", "Weaknesses", "Software inventory"]), navOn: "Weaknesses", crumb: "Vulnerability management › Weaknesses", title: CVE, sub: "Google Chrome · type confusion in V8 · remote code execution · sample record",
  pills: [["Critical", "#C50F1F"], ["CVSS 9.6", "#C50F1F"], ["Exploit verified · in the wild", "#BC4B09"]],
  actions: [["Open recommendation", "rec"], ["Request remediation", "rem"], ["Exception options", "exc"], ["Export", "exp"]], tabs: ["Overview", "Exposed devices", "Installed software", "Related CVEs"], tabOn: "Overview", cols: "1fr 1.4fr",
  blocks: [
    { t: "kv", id: "cv", title: "Vulnerability details", kw: 150, rows: [["Published", "Today 01:12"], ["Affected", "Chrome below 141.0.7390.122"], ["Fixed in", "141.0.7390.122 (vendor tested)"], ["Exposed devices", after ? `<b style="color:#107C10">37 · all offline</b>` : `<b style="color:#C50F1F">1,284</b> of 4,812 · 22 sites`], ["Threat insights", `<b style="color:#C50F1F">On CISA KEV list · active exploitation</b>`], ["Exposure score", after ? "31 → 18 (Low)" : "31 → 58 (High)"]] },
    { t: "chart", id: "exp", title: "Exposed devices", ch: 230, data: after ? [0, 1284, 1284, 1284, 1270, 1222] : [0, 1284, 1284], fc: after ? null : null, room: after ? 3 : 6, max: 1400, unit: "", col: "#C50F1F", xl: [[0, "00:00"], [2, "02:00"], [5, "08:00"], [8, "20:00"]] },
    { t: "table", id: "ed", title: "Exposed devices by site", w: 2, cols: ["Site", "Devices", "OS", "Chrome version", "Last seen", "Criticality"], rows: [["Hyderabad City Office", after ? "4" : "212", "Windows 11", "140.0.7339.207", "Now", "High"], ["Halol Plant", after ? "9" : "164", "Windows 10 / 11", "140.0.7339.185", "Now", "High"], ["Mumbai Sales Office", after ? "3" : "141", "Windows 11", "140.0.7339.207", "Now", "Medium"], ["Jeddah Office", after ? "6" : "96", "Windows 11", "140.0.7339.207", "Now", "Medium"], ["18 more sites", after ? "15" : "671", "Windows, macOS", "Various", "Today", "Mixed"]] }]
});
module.exports = {
  page: "kit.html", vo: "vo_soc4",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["A critical flaw is published at night.", "Attackers are already using it.", "How many of your devices have it?"], stat: [20, "", "%", "of breaches began with an exploited vulnerability, up 34% year on year", "Source: Verizon 2025 Data Breach Investigations Report"], intro: ["How <span class=\"y\">Mova iO</span> patches a critical flaw", "in a day, not a month."], tools: ["Defender Vulnerability Mgmt", "ServiceNow", "Microsoft Teams", "Intune"] });

    await scene("s1", 14.6, async () => {
      await D("step", 1, "1,284 devices exposed", ["Defender Vulnerability Mgmt", "Mova iO"]);
      await app("page", tvm(false));
      await D("focus", "#blk-cv", { maxK: 1.6, pad: 4 }); await wait(5);
      await D("focus", "#blk-ed", { maxK: 1.45, fill: 0.95, pad: 0 }); await wait(4.4);
      await D("focus", "#cv-4", { maxK: 2, pad: 14 });
    });
    await scene("s2", 13.4, async () => {
      await D("step", 2, "An expedited change, in rings", ["ServiceNow", "Mova iO"]);
      await app("sn", { kind: "Change Request", listTab: "Changes", num: "CHG0041220", title: `Expedited: update Google Chrome to 141.0.7390.122 (${CVE})`, hl: [["Type", "Expedited"], ["State", "Authorize"], ["Approval", "Requested"], ["Risk", "Moderate"], ["Planned", "Today 10:00 – 18:00"]],
        fields: [["Requested by", "Mova iO SOC Agent"], ["Category", "Software"], ["Configuration item", "Google Chrome (1,284 devices)"], ["Linked", "VIT0008812 · vulnerable item"], ["Assignment group", "Endpoint Engineering"], ["Assigned to", "Mova iO SOC Agent"]],
        short: "Ring 1 pilot (64 devices, IT and early adopters) at 10:00; Ring 2 broad (all) at 13:00 if pilot ≥ 95% success", desc: "Rollback: Intune supersedence reverted to 140.0.7339.207. Test plan: vendor release notes reviewed; pilot health checks (crash rate, sign-in to SaaS apps)." });
      await D("snNote", "Mova iO SOC Agent", "#E15AA5", `<b>Why expedited:</b> ${CVE} is on CISA KEV with active exploitation; 1,284 devices exposed across 22 sites. Fix is a vendor-tested browser update with no restart needed.`, "Work notes", 0);
      await D("focus", "#snform", { maxK: 1.5, fill: 0.9, pad: 0 }); await wait(5); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene("s3", 7.4, async () => {
      await D("step", 3, "The change manager approves", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO SOC Agent", me: "SM", items: [["Mova iO SOC Agent", "Approval needed · CHG0041220", 1], ["CAB", "Thursday agenda", 0]] });
      await D("tmCard", "apcard", "Approval needed · CHG0041220 (expedited)", `Critical browser flaw ${CVE}, exploited in the wild. 1,284 devices exposed.`, [["Fix", "Chrome 141.0.7390.122 · no restart"], ["Rings", "Pilot 64 devices at 10:00 · all at 13:00"], ["Gate", "Ring 2 only if pilot ≥ 95% success"], ["Rollback", "Revert supersedence in Intune"]], { buttons: ["Approve", "Reject", "Open change"] });
      await wait(0.4); await D("focus", "#apcard", { maxK: 1.75, pad: 10 }); await wait(2.4);
      await click("#apok", 0); await D("tmApproveG", "Suresh Menon (Change manager)", "Deploying Ring 1…");
    });
    await scene("s4", 12, async () => {
      await D("step", 4, "Pilot first, then everyone", ["Intune"]);
      await app("page", { th: "intune", nav: intuneNav, navOn: "Apps", crumb: "Apps › Windows › Google Chrome (x64) 141.0.7390.122", title: "Google Chrome (x64) 141.0.7390.122", sub: "Windows app (Win32) · supersedes 140.0.7339.207 · CHG0041220", pills: [["Assigned", "#0F6CBD"]],
        actions: [["Properties", "p"], ["Device install status", "d"], ["User install status", "u"], ["Monitor", "m"]], cols: "1fr 1fr",
        blocks: [{ t: "table", id: "ring", title: "Assignments", w: 2, cols: ["Group", "Intent", "Devices", "Installed", "Failed", "Pending", "Deadline"], rows: [["Ring 1 · Pilot (IT, early adopters)", "Required", "64", "0", "0", "64", "10:00"], ["Ring 2 · All Windows devices", "Required", "1,104", "0", "0", "-", "13:00 (gated)"], ["Ring 2 · All macOS devices", "Required", "116", "0", "0", "-", "13:00 (gated)"]] },
          { t: "kv", id: "pk", title: "Pilot health checks", rows: [["Crash rate", "—"], ["SaaS sign-in tests", "—"], ["Gate", "Waiting for pilot"]] }, { t: "tl", id: "itl", title: "Deployment log", items: [["10:00", "Ring 1 assigned · 64 devices"]] }] });
      await D("focus", "#blk-ring", { maxK: 1.5, fill: 0.95, pad: 0 });
      for (const [n, p] of [[18, 46], [41, 23], [62, 0]]) { await D("cell", "ring", 0, 3, `<b style="color:#107C10">${n}</b>`); await D("cell", "ring", 0, 5, String(p)); await wait(0.8); }
      await D("cell", "ring", 0, 4, `<span style="color:#C50F1F">2 · device off</span>`);
      await D("set", "#pk-0", "0.1% (baseline 0.1%)"); await D("set", "#pk-1", "12 of 12 passed"); await D("set", "#pk-2", `<b style="color:#107C10">Passed · 96.9% · Ring 2 released</b>`);
      await D("tl", "itl", "12:41", "Pilot gate passed (62 / 64). Ring 2 released by Mova iO per CHG0041220.");
      await D("cell", "ring", 1, 5, "1,104"); await D("cell", "ring", 2, 5, "116");
      await D("focus", "#pgmain", { maxK: 1.3, fill: 0.95, pad: 0 });
    });
    await scene("s5", 14, async () => {
      await D("step", 5, "From 1,284 to 37", ["Defender Vulnerability Mgmt", "Intune"]);
      await app("page", tvm(true));
      await D("chartAfter", "exp", [640, 120, 37], "#107C10");
      await D("pill", 0, "Critical · remediated 97%", "#107C10");
      await D("focus", "#blk-exp", { maxK: 1.6, pad: 4 }); await wait(4.6);
      await D("focus", "#blk-cv", { maxK: 1.6, pad: 4 }); await wait(3.4);
      await D("set", "#cv-3", `<b style="color:#107C10">37 · all offline</b> · each blocked by Conditional Access until updated; ServiceNow tasks raised`);
      await D("focus", "#cv-3", { maxK: 2, pad: 14 });
    });
    await scene("s6", 6.8, async () => {
      await D("step", 6, "Closed with evidence", ["ServiceNow", "Microsoft Teams"]);
      await app("sn", { kind: "Change Request", listTab: "Changes", num: "CHG0041220", title: `Expedited: update Google Chrome to 141.0.7390.122 (${CVE})`, hl: [["Type", "Expedited"], ["State", "Implement"], ["Approval", "Approved"], ["Risk", "Moderate"], ["Planned", "Today 10:00 – 18:00"]],
        fields: [["Requested by", "Mova iO SOC Agent"], ["Category", "Software"], ["Configuration item", "Google Chrome (1,284 devices)"], ["Linked", "VIT0008812 · vulnerable item"]], short: "Ring 1 pilot then Ring 2 broad",
        notes: [["Suresh Menon", "#3E8E7E", "Approved in Teams.", "Work notes", 0], ["Mova iO SOC Agent", "#E15AA5", "Ring 1: 62/64 (2 offline). Gate passed 12:41. Ring 2: 1,185/1,220 by 19:30.", "Work notes", 9]] });
      await D("snRes", "1,247 of 1,284 devices updated (97.1%) in under 10 hours. 37 offline devices blocked from company apps by Conditional Access until updated; follow-up tasks raised. No pilot issues.", "Closed · successful");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["A critical flaw found in minutes.", "97% patched in one day.", "The rest blocked until they update."], tag: ["Vulnerabilities, closed by", "Mova iO agents."] });
  }
};
