// NOC film 4: utility power cut at a sales office; load shed after approval, engineer dispatched, staff told.
const SEV = (s) => `<span class="sev"><i style="background:${{ Critical: "#D32F2F", Warning: "#F59E0B", Ok: "#2E7D32" }[s]}"></i>${s}</span>`;
const UPS = "vad-office-ups-01";
const seed = [[SEV("Ok"), "Disk usage back below threshold", "hyd-city-fs-02", "disk.used.pct", "Agent", "08:52:10", "Resolved"], [SEV("Warning"), "CPU above 85% for 10 min", "jed-office-esx-01", "cpu.util", "vCenter", "08:37:44", "Acknowledged"], [SEV("Ok"), "Backup job completed after retry", "rak-plant-nas-01", "backup.status", "Veeam", "08:20:03", "Resolved"], [SEV("Ok"), "Ping restored", "vnf-factory-edge-01", "ping.loss", "SD-WAN", "07:44:51", "Resolved"], [SEV("Ok"), "Service restarted by policy", "shu-plant-vm-mes", "svc.status", "Agent", "07:12:09", "Resolved"]];
const ops = { th: "opsramp", topOn: "Command Center", crumb: "Command Center › Alerts", title: "Alerts", tenant: "Client: Global Operations", pills: [["Critical 0", "#C62828"], ["Warning 0", "#B26A00"], ["Inferences 0", "#5A6577"]], right: `<span class="pbtn">Last 1 hour</span><span class="pbtn">Columns</span>`, cols: "1fr", blocks: [{ t: "table", id: "al", cols: ["Severity", "Subject", "Resource", "Metric", "Source", "Created", "Status"], rows: seed }] };
const upsPage = (st) => ({
  th: "opsramp", topOn: "Infrastructure", crumb: "Infrastructure › Resources › Power", title: UPS, sub: "UPS 6 kVA · SNMP · Vadodara Sales Office · feeds core switch, edge router, Wi-Fi, CCTV", tenant: "Client: Global Operations",
  pills: [st === "ok" ? ["Online · on mains", "#2E7D32"] : ["On battery", "#C62828"]], tabs: ["Overview", "Metrics", "Alerts", "Monitors", "Topology", "Activity"], tabOn: "Metrics", cols: "2.2fr 1fr",
  blocks: [
    { t: "chart", id: "rt", title: "Battery runtime remaining (minutes)", ch: 290, data: [120, 120, 120, 120, 120, 120, 38, 37.5, 37, 36.4], fc: st === "bat" ? [26, 13, 0] : null, room: st === "bat" ? 0 : 3, max: 130, unit: "", thr: 15, thrL: "Shutdown at 15 min", col: "#2B6CB0", xl: [[0, "08:30"], [5, "08:55"], [9, "now"]] },
    { t: "kv", id: "uk", title: "Live readings", kw: 150, rows: [["Input voltage", st === "ok" ? "232 V" : `<b style="color:#C62828">0 V · utility lost 09:01</b>`], ["Output load", "46% · 2.6 kW"], ["Battery charge", "82%"], ["Runtime remaining", st === "ok" ? "Charging" : `<b style="color:#C62828">38 min · empty ≈ 09:39</b>`], ["Generator", "None at this site"], ["Utility notice", st === "ok" ? "Restored 10:12" : "MGVCL feeder 11 kV fault · ETR 11:00"]] },
    { t: "table", id: "ports", title: "Load on UPS · by port group", w: 2, cols: ["Port group", "Devices", "Power draw", "Priority", "State"], rows: [["Core", "Core switch, edge router, firewall", "0.9 kW", "Critical", "On"], ["Wi-Fi · open floor", "6 access points", "0.2 kW", "High", "On"], ["Wi-Fi · meeting rooms", "4 access points", "0.15 kW", "Low", "On"], ["CCTV and door panels", "14 cameras (PoE)", "0.4 kW", "Low · recorder keeps 72 h", "On"], ["Lab bench", "Test rack, displays", "0.9 kW", "Low", "On"]] }]
});
const inc = { num: "INC0031702", title: "Utility power loss at Vadodara Sales Office (on UPS)", prio: "2 - High", state: "In Progress", assigned: "Mova iO NOC Agent", sla: "3h 56m left",
  fields: [["Caller", "Mova iO Integration"], ["Channel", "Monitoring"], ["Category", "Facilities"], ["Subcategory", "Power"], ["Service", "Site connectivity"], ["Configuration item", UPS], ["Impact", "2 - Medium"], ["Urgency", "1 - High"], ["Assignment group", "Network Operations"], ["Assigned to", "Mova iO NOC Agent"]],
  short: "Utility power loss at Vadodara Sales Office: UPS on battery, 38 min runtime, utility ETR 11:00" };
module.exports = { upsPage,
  page: "kit.html", vo: "vo_noc4",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["The lights go out at a sales office.", "The network runs on battery.", "The clock starts."], quote: ["Power is still the leading cause of impactful outages.", "Source: Uptime Institute, Annual Outage Analysis 2025"], intro: ["How <span class=\"y\">Mova iO</span> keeps a site running", "through a power cut."], tools: ["OpsRamp", "ServiceNow", "ServiceNow Field Service", "Microsoft Teams"] });

    await scene("s1", 10.4, async () => {
      await D("step", 1, "A site switches to battery", ["OpsRamp"]);
      await app("page", ops);
      const A = [["Critical", "UPS on battery · input 0 V", UPS, "ups.input.voltage", "SNMP"], ["Warning", "Power supply 1 lost", "vad-office-sw-01", "env.psu.status", "SNMP"], ["Warning", "Running on redundant power", "vad-office-edge-01", "env.power", "SD-WAN"], ["Critical", "UPS runtime below 40 min", UPS, "ups.battery.runtime", "SNMP"], ["Warning", "Door controller on battery", "vad-office-acs-01", "env.power", "Agent"]];
      let c = 0, w = 0;
      for (let i = 0; i < A.length; i++) { const [s, sub, r, m, src] = A[i]; await D("row", "al", [SEV(s), sub, r, m, src, `09:01:${String(4 + i * 6).padStart(2, "0")}`, "Open"]); s === "Critical" ? c++ : w++; await D("pill", 0, "Critical " + c, "#C62828"); await D("pill", 1, "Warning " + w, "#B26A00"); await wait(0.7); }
      await D("row", "al", [`<b>▾</b> ${SEV("Critical")}`, `<b>Inference #48412 · Utility power loss at Vadodara Sales Office</b>`, "VAD Vadodara Office", "correlation", "OpsQ · Mova iO", "09:01:44", `<b style="color:#2E7D32">Ticketed</b>`]); await D("pill", 2, "Inferences 1", "#5A6577");
      await D("focus", "#blk-al", { maxK: 1.5, fill: 0.92, pad: 0 });
    });
    await scene("s2", 12.8, async () => {
      await D("step", 2, "Thirty-eight minutes of battery", ["OpsRamp", "Mova iO"]);
      await app("page", upsPage("bat"));
      await D("focus", "#blk-uk", { maxK: 1.8, pad: 6 }); await wait(3.6);
      await D("focus", "#blk-rt", { maxK: 1.4, fill: 0.92, pad: 0 }); await D("chartFc", "rt"); await wait(1.2); await D("chartMark", "rt", 12, "Empty ≈ 09:39"); await wait(3);
      await D("focus", "#uk-5", { maxK: 2, pad: 14 });
    });
    await scene("s3", 8.8, async () => {
      await D("step", 3, "A plan in the incident", ["ServiceNow", "Mova iO"]);
      await app("sn", inc);
      await D("snNote", "Mova iO Triage orchestrator", "#E15AA5", "<b>Utility power loss</b> at Vadodara Sales Office, confirmed by MGVCL notice (feeder fault, ETR 11:00). UPS runtime 38 min is shorter than the outage.<br><b>Plan:</b> 1) Shed low-priority load (meeting-room Wi-Fi, CCTV, lab bench): runtime ≈ 71 min. 2) Dispatch field engineer for controlled shutdown if needed. 3) Tell site staff.", "Work notes", 1);
      await wait(0.4); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene("s4", 10.8, async () => {
      await D("step", 4, "Shed load, with approval", ["Microsoft Teams", "OpsRamp"]);
      await app("tms", { agent: "Mova iO NOC Agent", me: "NJ", items: [["Mova iO NOC Agent", "Approval needed · INC0031702", 1], ["Vadodara office", "Power is out here", 0]] });
      await D("tmCard", "apcard", "Approval needed · INC0031702", "Vadodara office is on UPS with 38 minutes left; power is due back at 11:00. I recommend switching off load that can wait.", [["Switch off", "Meeting-room Wi-Fi (4 APs), CCTV (14 cameras), lab bench"], ["Keeps running", "Core network, open-floor Wi-Fi, door panels"], ["Runtime", "38 min → about 71 min"], ["CCTV", "Recorder keeps the last 72 h; resumes on power"], ["Undo", "Ports return automatically when mains is back"]], { buttons: ["Approve", "Reject", "Open incident"] });
      await wait(0.5); await D("focus", "#apcard", { maxK: 1.75, pad: 10 }); await wait(2.6);
      await click("#apok", 0); await D("tmApproveG", "Neha Joshi (Site lead)", "Switching off 3 port groups…"); await wait(1.2);
      await app("page", upsPage("bat"));
      await D("focus", "#blk-ports", { maxK: 1.5, fill: 0.92, pad: 0 });
      for (const i of [2, 3, 4]) { await D("cell", "ports", i, 4, `<b style="color:#B26A00">Off · shed by Mova iO</b>`); await wait(0.3); }
      await D("chartAfter", "rt", [71, 70.5]); await D("set", "#uk-3", `<b style="color:#B26A00">71 min · empty ≈ 10:13</b>`); await D("set", "#uk-1", "24% · 1.4 kW");
      await D("focus", "#blk-uk", { maxK: 1.8, pad: 6 });
    });
    await scene("s5", 9, async () => {
      await D("step", 5, "An engineer on the way", ["ServiceNow Field Service"]);
      await app("sn", { ws: "Field Service · Dispatcher Workspace", kind: "Work Order", listTab: "Work orders", num: "WO0010932", title: "Power cut at Vadodara Sales Office: UPS watch and controlled shutdown", hl: [["Priority", "2 - High"], ["State", "Dispatched"], ["Assigned to", "Rahul Mehta · Field engineer"], ["ETA", "35 min · 09:41"], ["Territory", "Gujarat West"]],
        fields: [["Location", "Vadodara Sales Office, Alkapuri"], ["Initiated from", "INC0031702"], ["Work type", "Power / UPS"], ["Skills", "UPS, electrical safety"], ["Configuration item", UPS], ["Access", "Site lead Neha Joshi · badge on arrival"]],
        short: "If mains is not back by 10:00, shut down the core gracefully using RB-021 before the UPS empties", desc: "Attached: UPS readings, port plan, shutdown runbook RB-021, site floor plan." });
      await D("snNote", "Mova iO Dispatch agent", "#E15AA5", "Picked Rahul Mehta: nearest qualified engineer (6.4 km), free until 12:00. Work order sent to his mobile app.", "Work notes", 2);
      await D("focus", "#snhl", { maxK: 1.7, pad: 6 }); await wait(3); await D("focus", "#snform", { maxK: 1.5, fill: 0.9, pad: 0 });
    });
    await scene("s6", 6.8, async () => {
      await D("step", 6, "The office is told", ["Microsoft Teams"]);
      await app("tms", { view: "channel", team: "Vadodara Sales Office", channel: "General", channels: ["General", "Facilities", "Sales West"] });
      await D("tmSay", `<div class="card" id="upd"><div class="hd">Power cut in the office · network on battery</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What happened:</b> mains power is out across the area (utility fault).<br><b>Network:</b> working on battery until about 10:10. Meeting-room Wi-Fi is off to save power.<br><b>What to do:</b> save your work; use open-floor Wi-Fi. An engineer arrives at 09:41.</div></div>`, "Mova iO NOC Agent", 3);
      await wait(0.4); await D("focus", "#upd", { maxK: 1.7, pad: 10 });
    });
    await scene("s7", 8.8, async () => {
      await D("step", 7, "Power back, closed with the timeline", ["OpsRamp", "ServiceNow"]);
      await app("page", upsPage("ok"));
      await D("chartAfter", "rt", [35, 60, 120]);
      await D("focus", "#blk-ports", { maxK: 1.5, fill: 0.92, pad: 0 });
      for (const i of [2, 3, 4]) { await D("cell", "ports", i, 4, `<b style="color:#2E7D32">On · restored 10:12</b>`); await wait(0.3); }
      await wait(1.4);
      await app("sn", Object.assign({}, inc, { notes: [["Mova iO Triage orchestrator", "#E15AA5", "Utility power loss confirmed; plan posted.", "Work notes", 1], ["Neha Joshi", "#3E8E7E", "Approved load shedding in Teams.", "Work notes", 3], ["Rahul Mehta", "#3E8E7E", "On site 09:39. Shutdown not needed.", "Work notes", 38]] }));
      await D("snRes", "Utility feeder fault (MGVCL). Site ran on UPS 09:01–10:12 (71 min). Low-priority load shed after approval; ports restored automatically. Engineer on site from 09:39; no shutdown needed. No data or service loss.");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["A power cut handled in minutes.", "Runtime almost doubled.", "Staff told before they had to ask."], tag: ["Site outages, handled by", "Mova iO agents."] });
  }
};
