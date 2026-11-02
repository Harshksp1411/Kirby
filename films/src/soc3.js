// SOC film 3: ransomware behaviour on a laptop; isolated first by playbook, cleaned, hunted, reimaged.
const { defNav, intuneNav, sevPill } = require("./soc_common.js");
const DEV = "LT-FIN-0423";
const tree = `<div style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.9">
<div>▾ <b>explorer.exe</b> <span style="color:#605E5C">· 4120</span></div>
<div style="padding-left:20px">▾ <b>WINWORD.EXE</b> "INV-88213.docm" <span style="color:#605E5C">· 09:12:04</span></div>
<div style="padding-left:40px">▾ <b style="color:#C50F1F">powershell.exe</b> -enc JABzAD0A… <span style="color:#605E5C">· 09:12:09</span></div>
<div style="padding-left:60px">▾ <b style="color:#C50F1F">rundll32.exe</b> C:\\Users\\neha.k\\AppData\\Local\\Temp\\upd.dll,Start</div>
<div style="padding-left:80px">• renamed 37 files to <b>*.lockd</b> in Documents</div>
<div style="padding-left:80px">• connect 10.20.1.5:445 (\\\\hyd-city-fs-02\\finance) · <b style="color:#BC4B09">blocked by Controlled folder access</b></div>
<div style="padding-left:80px">• vssadmin delete shadows /all · <b style="color:#BC4B09">blocked</b></div></div>`;
const devPage = (st) => ({
  th: "defender", nav: defNav, navOn: "Devices", crumb: "Assets › Devices", title: DEV, sub: "Windows 11 Enterprise 23H2 · Finance · neha.k@corp.com · Hyderabad City Office",
  pills: [["Risk: High", "#C50F1F"], st === "iso" || st === "clean" ? ["Isolated", "#BC4B09"] : ["Active", "#107C10"], ["Exposure: Medium", "#BC4B09"]],
  actions: [["Isolate device", "iso"], ["Restrict app execution", "rae"], ["Run antivirus scan", "scan"], ["Collect investigation package", "pkg"], ["Initiate Live Response Session", "lr"], ["Initiate automated investigation", "air"], ["Action center", "ac"]],
  tabs: ["Overview", "Incidents and alerts", "Timeline", "Security recommendations", "Inventories", "Discovered vulnerabilities"], tabOn: st ? "Overview" : "Timeline", cols: "0.8fr 1.6fr",
  blocks: [
    { t: "kv", id: "dd", title: "Device details", kw: 120, rows: [["Domain", "CORP"], ["IP addresses", "10.20.6.77"], ["Health state", st === "iso" || st === "clean" ? `<b style="color:#BC4B09">Isolated · Teams and Outlook allowed</b>` : "Active"], ["Onboarding", "Onboarded"], ["Antivirus", st === "clean" ? `<b style="color:#107C10">Full scan · clean</b>` : "Up to date"], ["Last seen", "Just now"]] },
    { t: "html", id: "pt", title: "Alert story · Ransomware behavior detected in the file system", html: tree },
    { t: "table", id: "ac", title: "Action center · this device", w: 2, cols: ["Action", "Status", "Submitted by", "Time", "Details"], rows: st ? [] : [] }]
});
const hunting = {
  th: "defender", nav: defNav, navOn: "Hunting", crumb: "Investigation & response › Hunting › Advanced hunting", title: "Advanced hunting", sub: "Query run by Mova iO SOC agent · all 4,812 onboarded devices · last 30 days", actions: [["Run query", "run"], ["Save", "save"], ["Share link", "share"], ["Create detection rule", "rule"]], cols: "1fr",
  blocks: [{ t: "html", id: "kql", title: "Query", html: `<pre style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.6;background:#FAFAFA;border:1px solid #E0E0E0;border-radius:6px;padding:12px 14px">union DeviceFileEvents, DeviceProcessEvents, EmailAttachmentInfo
| where Timestamp > ago(30d)
| where SHA256 in ("9f2c…e71a", "b04d…19c3")   // upd.dll, INV-88213.docm
   or ProcessCommandLine has "upd.dll,Start"
| summarize Devices = dcount(DeviceId), Mailboxes = dcount(RecipientEmailAddress) by SHA256</pre>` },
    { t: "table", id: "hr", title: "Results", cols: ["SHA256", "File", "Devices", "Mailboxes", "Status"], rows: [] }]
};
module.exports = {
  page: "kit.html", vo: "vo_soc3",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["A macro in an invoice.", "A laptop starts encrypting files.", "Every second counts."], stat: [44, "", "%", "of breaches involved ransomware", "Source: Verizon 2025 Data Breach Investigations Report"], intro: ["How <span class=\"y\">Mova iO</span> stops ransomware on one laptop,", "before it reaches the file shares."], tools: ["Defender for Endpoint", "Microsoft Teams", "Intune", "ServiceNow"] });

    await scene("s1", 13, async () => {
      await D("step", 1, "Ransomware behaviour on a laptop", ["Defender for Endpoint"]);
      await app("page", devPage(null));
      await D("focus", "#blk-pt", { maxK: 1.5, fill: 0.9, pad: 0 });
    });
    await scene("s2", 12.6, async () => {
      await D("step", 2, "Verdict: ransomware, 98%", ["Microsoft Defender", "Mova iO"]);
      await D("add", "#pt", `<div style="background:#FBE7F3;border-radius:6px;padding:10px 12px;margin-top:10px;font-size:13.5px;line-height:1.5;font-family:Inter,sans-serif"><b>✦ Mova iO SOC Triage agent</b> · verdict <b>ransomware</b> (98%)<br>Macro → encoded PowerShell → DLL loaded with rundll32 → mass rename + shadow-copy delete attempt. Matches playbook PB-RANSOM-01: <b>isolate first, then notify</b>.</div>`);
      await D("focus", "#blk-pt", { maxK: 1.5, fill: 0.9, pad: 0 });
    });
    await scene("s3", 11.2, async () => {
      await D("step", 3, "Isolated first, people told", ["Defender for Endpoint", "Microsoft Teams"]);
      await D("zoomOut"); await D("act", "iso", "hot");
      await D("fly", "Isolate device · " + DEV, `<div style="display:grid;gap:10px"><div>Isolation type: <b>Full</b></div><div>✔ Allow Outlook, Teams and Skype for Business while isolated</div><div style="color:#605E5C;font-size:13px">Comment: PB-RANSOM-01 · auto-isolate on ransomware verdict ≥ 95% · Mova iO SOC agent</div></div>`, "Confirm");
      await D("focus", "#fly", { maxK: 1.5, fill: 0.85, pad: 0 }); await wait(2); await click("#flyok", 0); await D("flyOff"); await D("act", "iso", "done"); await D("zoomOut");
      await D("pill", 1, "Isolated", "#BC4B09"); await D("set", "#dd-2", `<b style="color:#BC4B09">Isolated · Teams and Outlook allowed</b>`);
      await D("row", "ac", ["Isolate device", `<b style="color:#107C10">Completed</b>`, "Mova iO SOC agent (PB-RANSOM-01)", "09:12:51", "42 s after first alert"]);
      await D("toast", "<b>Device isolated.</b> LT-FIN-0423 can only reach Defender, Teams and Outlook.", "#BC4B09");
      await D("focus", "#blk-dd", { maxK: 1.6, pad: 4 }); await wait(2.2);
      await app("tms", { agent: "Mova iO SOC Agent", me: "FR", items: [["Mova iO SOC Agent", "Device isolated · LT-FIN-0423", 1], ["SOC shift", "Handover at 14:00", 0]] });
      await D("tmCard", "apcard", "Device isolated by playbook · LT-FIN-0423", "Ransomware behaviour on Neha K.'s laptop (finance). Isolated at 09:12:51, 42 seconds after the first alert. File share writes were already blocked.", [["Playbook", "PB-RANSOM-01 · isolate first, then notify"], ["Verdict", "Ransomware · 98%"], ["User", "Neha K. · told by Teams on her phone"]], { buttons: ["OK", "Release from isolation", "Open in Defender"] });
      await wait(0.4); await D("focus", "#apcard", { maxK: 1.75, pad: 10 });
    });
    await scene("s4", 8.8, async () => {
      await D("step", 4, "Scanned, quarantined, collected", ["Defender for Endpoint"]);
      await app("page", devPage("iso"));
      await D("row", "ac", ["Isolate device", `<b style="color:#107C10">Completed</b>`, "Mova iO SOC agent (PB-RANSOM-01)", "09:12:51", "42 s after first alert"]);
      await D("focus", "#blk-ac", { maxK: 1.5, fill: 0.95, pad: 20 });
      for (const [a, d] of [["Run antivirus scan (Full)", "3 threats found · quarantined: upd.dll, INV-88213.docm, task 'OneDriveUpd'"], ["Collect investigation package", "Package ready · 214 MB"], ["Stop and quarantine file", "upd.dll · SHA256 9f2c…e71a"]]) { await D("row", "ac", [a, `<b style="color:#107C10">Completed</b>`, "Mova iO SOC agent", "09:1" + (4 + Math.floor(Math.random() * 5)) + ":0" + Math.floor(Math.random() * 9), d]); await wait(0.9); }
      await D("set", "#dd-4", `<b style="color:#107C10">Full scan · clean</b>`); await D("focus", "#blk-ac", { maxK: 1.5, fill: 0.95, pad: 10 });
    });
    await scene("s5", 7.2, async () => {
      await D("step", 5, "Hunted across every device", ["Microsoft Defender"]);
      await app("page", hunting);
      await D("focus", "#blk-kql", { maxK: 1.5, fill: 0.9, pad: 0 }); await wait(2.2);
      await D("row", "hr", ["9f2c…e71a", "upd.dll", "<b>1</b> (LT-FIN-0423)", "0", `<b style="color:#107C10">Contained</b>`], false);
      await D("row", "hr", ["b04d…19c3", "INV-88213.docm", "<b>1</b> (LT-FIN-0423)", "4 · removed by ZAP", `<b style="color:#107C10">Contained</b>`], false);
      await D("focus", "#pgmain", { maxK: 1.3, fill: 0.95, pad: 0 });
    });
    await scene("s6", 9.4, async () => {
      await D("step", 6, "Reimaged, replaced, closed", ["Intune", "ServiceNow"]);
      await app("page", { th: "intune", nav: intuneNav, navOn: "All devices", crumb: "Devices › All devices", title: DEV, sub: "Windows · Corporate · neha.k@corp.com · Compliance: Not compliant (Defender risk High)", pills: [["Not compliant", "#C50F1F"]],
        actions: [["Retire", "retire"], ["Wipe", "wipe"], ["Delete", "del"], ["Autopilot Reset", "apr"], ["Fresh Start", "fresh"], ["Sync", "sync"], ["Collect diagnostics", "diag"]], cols: "1fr 1fr",
        blocks: [{ t: "kv", id: "ik", title: "Essentials", rows: [["Device name", DEV], ["Primary user", "Neha K."], ["Ownership", "Corporate"], ["OS", "Windows 11 Enterprise 23H2"], ["Defender risk", `<b style="color:#C50F1F">High</b>`], ["Conditional Access", "Blocked from company apps until compliant"]] }, { t: "table", id: "ia", title: "Device action status", cols: ["Action", "Status", "Date/Time"], rows: [] }] });
      await D("act", "fresh", "hot"); await wait(0.6); await D("act", "fresh", "done");
      await D("row", "ia", ["Fresh Start (remove apps, keep nothing)", "<b style='color:#0F6CBD'>Pending · after evidence hold</b>", "09:21"]);
      await D("focus", "#pgmain", { maxK: 1.3, fill: 0.95, pad: 0 }); await wait(2);
      await app("sn", { ws: "Security Operations Workspace", kind: "Security incident", listTab: "Security incidents", num: "SIR0010472", title: "Ransomware behaviour on LT-FIN-0423 (Defender 51931)", hl: [["Priority", "1 - Critical"], ["State", "Recover"], ["Assigned to", "Mova iO SOC Agent"], ["Devices", "1 · isolated"], ["MITRE", "T1486 · T1059.001"]],
        fields: [["Category", "Malware"], ["Source", "Defender for Endpoint"], ["Configuration item", DEV], ["Assignment group", "SOC L2"]], short: "Macro-enabled invoice launched ransomware loader; isolated 42 s after first alert",
        notes: [["Mova iO SOC Triage agent", "#E15AA5", "Verdict ransomware 98%. Isolated by PB-RANSOM-01; SOC lead notified.", "Work notes", 0], ["Mova iO SOC agent", "#E15AA5", "Fleet hunt: 1 device, 4 mailboxes (removed). Loaner laptop REQ0094410 raised for Neha K.", "Work notes", 7]] });
      await D("snRes", "Contained on one device. Isolated in 42 s; 3 threats quarantined; investigation package retained; fleet hunt clean; 37 local files restored from OneDrive; Fresh Start queued; loaner issued.", "Closed");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["Ransomware stopped on one laptop.", "Isolated in under a minute.", "The rest of the estate checked and clean."], tag: ["Endpoint threats, stopped by", "Mova iO agents."] });
  }
};
