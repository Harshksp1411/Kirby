// NOC film 3: a full disk predicted nine hours ahead; fixed through a pre-approved standard change.
const SRV = "rak-plant-sql-01";
const hist = [61, 61.5, 62, 62.4, 63, 63.3, 63.9, 64.2, 64.8, 65.1, 65.7, 66, 66.6, 67, 67.5, 68.2, 69, 70, 71.4, 73, 75, 77.3, 79.6, 82, 84.5, 86.8, 89, 91];
const metric = (after) => ({
  th: "opsramp", topOn: "Infrastructure", crumb: "Infrastructure › Resources › Servers", title: SRV, sub: "Windows Server 2022 · SQL Server 2019 · Rakhial Plant · MES database", tenant: "Client: Global Operations",
  pills: [after ? ["Healthy", "#2E7D32"] : ["Warning · forecast", "#B26A00"]],
  tabs: ["Overview", "Metrics", "Alerts", "Monitors", "Patches", "Scripts", "Activity"], tabOn: "Metrics", cols: "2.3fr 1fr",
  blocks: [
    { t: "chart", id: "dsk", title: "Volume D: · used % · last 7 days and forecast", ch: 420, data: hist, fc: after ? null : [94, 97.2, 100], room: after ? 3 : 0, max: 100, unit: "%", thr: 95, thrL: "Critical 95%", col: "#2B6CB0", fcol: "#E0A800", xl: [[0, "Thu"], [4, "Fri"], [8, "Sat"], [12, "Sun"], [16, "Mon"], [20, "Tue"], [24, "Wed"], [27, "now"]] },
    { t: "kv", id: "vol", title: "Volume D: · SQL data and logs", kw: 130, rows: [["Size", "2.0 TB"], ["Used", after ? "1.07 TB · 54%" : "1.82 TB · 91%"], ["Free", after ? "0.93 TB" : "180 GB"], ["Growth, last 12 h", after ? "0.2 GB/h" : `<b style="color:#B26A00">+20 GB/h</b>`], ["Forecast full", after ? "Not in the next 90 days" : `<b style="color:#C62828">≈ 9 h · 23:40 tonight</b>`], ["Night batch", "22:00 – 03:00 · MES posting"]] },
    { t: "table", id: "dal", title: "Alerts on this resource", w: 2, cols: ["Severity", "Subject", "Metric", "Source", "Created", "Status"], rows: [[`<span class="sev"><i style="background:${after ? "#2E7D32" : "#F59E0B"}"></i>${after ? "Ok" : "Warning"}</span>`, after ? "Forecast cleared: volume D: has 90+ days of headroom" : "Forecast: volume D: full in ≈ 9 h (23:40)", "disk.used.pct.forecast", "Mova iO forecast", "14:38:05", after ? `<b style="color:#2E7D32">Resolved</b>` : "Open"], [`<span class="sev"><i style="background:#2E7D32"></i>Ok</span>`, "CPU below threshold", "cpu.util", "Agent", "09:12:40", "Resolved"]] }]
});
const chg = {
  kind: "Change Request", listTab: "Changes", num: "CHG0041188", title: `Standard: restore SQL log backups and reclaim log space on ${SRV}`,
  hl: [["Type", "Standard"], ["State", "Assess"], ["Approval", "Requested"], ["Risk", "Low"], ["Planned", "Now · 20 min"]],
  fields: [["Requested by", "Mova iO NOC Agent"], ["Template", "STD-DB-007 SQL log space recovery"], ["Category", "Database"], ["Configuration item", SRV], ["Assignment group", "DB Operations"], ["Assigned to", "Mova iO NOC Agent"], ["Linked incident", "INC0031618 · P3 · proactive"], ["Backout plan", "Nothing removed until backup verified"]],
  short: "Repoint LOG backup job to \\\\rak-bk-02\\sql, run log backup, shrink log, clear backups past 14-day retention"
};
module.exports = {
  page: "kit.html", vo: "vo_noc3",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["The disk fills at midnight.", "The night batch fails.", "Nobody saw it coming."], stat: [300, "$", "K+", "the cost of one hour of downtime for more than 90% of mid-size and large enterprises", "Source: ITIC 2024 Hourly Cost of Downtime Survey"], intro: ["How <span class=\"y\">Mova iO</span> stops an outage", "before it starts."], tools: ["OpsRamp", "Copilot Studio", "ServiceNow", "Microsoft Teams"] });

    await scene("s1", 12.6, async () => {
      await D("step", 1, "A full disk, nine hours away", ["OpsRamp", "Mova iO"]);
      await app("page", metric(false));
      await D("focus", "#blk-dsk", { maxK: 1.35, fill: 0.92, pad: 0 }); await wait(2.2);
      await D("chartFc", "dsk"); await wait(1.4); await D("chartMark", "dsk", hist.length + 2, "Full at 23:40"); await wait(3.2);
      await D("focus", "#blk-vol", { maxK: 1.8, pad: 6 });
    });
    await scene("s2", 14.8, async () => {
      await D("step", 2, "Why it is growing", ["Copilot Studio", "OpsRamp", "ServiceNow"]);
      await app("cst", { agent: "Mova iO NOC Agent", run: "Automated · OpsRamp forecast alert · " + SRV, src: "OpsRamp", payload: `{ "resource": "${SRV}",\n  "metric": "disk.used.pct",\n  "volume": "D:",\n  "forecastFull": "23:40",\n  "incident": "INC0031618" }`,
        nodes: [["Trigger", "OpsRamp · forecast alert", "#1F5BA8", "0.1 s"], ["Get metric history", "Tool · OpsRamp", "#1F5BA8", "0.7 s"], ["Run disk analysis", "Tool · OpsRamp script on agent", "#1F5BA8", "21.4 s"], ["Check backup jobs", "Tool · SQL Server Agent via OpsRamp", "#1F5BA8", "3.2 s"], ["Search runbooks", "Knowledge · NOC runbooks", "#8764B8", "1.1 s"], ["Raise standard change", "Tool · ServiceNow", "#2F5B4F", "0.9 s"], ["Fix log backup path", "Tool · OpsRamp script", "#1F5BA8", "4.0 s"], ["Run log backup and shrink", "Tool · OpsRamp script", "#1F5BA8", "6 min 12 s"], ["Verify free space", "Tool · OpsRamp", "#1F5BA8", "0.6 s"], ["Notify DB team", "Tool · Microsoft Teams", "#5B5FC7", "0.8 s"]] });
      await D("focus", "#csmap", { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < 5; i++) { await D("csStep", i, "run"); await wait(i === 2 ? 1.2 : 0.55); await D("csStep", i, "ok"); }
      await D("csDet", 2, "Run disk analysis", "Tool · OpsRamp script on agent · ✓ Complete · 21.4 s", `{ "host": "${SRV}", "volume": "D:",\n  "script": "Get-TopFolders -Depth 3" }`, `{ "D:\\\\SQLLogs\\\\MES_log.ldf": "214 GB (+61 GB since Tue)",\n  "D:\\\\Backup\\\\Log (older than 14 d)": "38 GB",\n  "logBackupJob": "FAILED since Tue 02:00",\n  "error": "path \\\\\\\\rak-bk-01\\\\sql not found" }`);
      await wait(0.7); await D("focus", "#csdet", { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene("s3", 12.8, async () => {
      await D("step", 3, "A pre-approved standard change", ["ServiceNow", "Mova iO"]);
      await app("sn", chg);
      await D("snNote", "Mova iO Change agent", "#E15AA5", "Matched standard template STD-DB-007 (CAB pre-approved). Raised from INC0031618.", "Work notes", 0);
      await D("focus", "#snhl", { maxK: 1.7, pad: 6 }); await wait(2.2);
      await D("snHl", 2, "Approved · standard", "#1B7A43"); await D("snHl", 1, "Implement"); await wait(1.6);
      await D("snNote", "Mova iO Change agent", "#E15AA5", "<b>Pre-checks passed.</b> Last full backup 01:00 verified (restore test OK). Share \\\\rak-bk-02\\sql reachable, 6.1 TB free. No active MES posting jobs.", "Work notes", 1);
      await wait(0.4); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene("s4", 10.4, async () => {
      await D("step", 4, "Space reclaimed, forecast gone", ["OpsRamp", "Copilot Studio"]);
      await app("page", metric(false));
      await D("chartFc", "dsk"); await D("focus", "#blk-dsk", { maxK: 1.35, fill: 0.92, pad: 0 }); await wait(1.4);
      await D("chartAfter", "dsk", [72, 54]); await wait(0.6);
      await D("pill", 0, "Healthy", "#2E7D32");
      await D("set", "#vol-1", "1.07 TB · 54%"); await D("set", "#vol-2", "0.93 TB"); await D("set", "#vol-3", "0.2 GB/h"); await D("set", "#vol-4", `<b style="color:#2E7D32">Not in the next 90 days</b>`);
      await D("cell", "dal", 0, 0, `<span class="sev"><i style="background:#2E7D32"></i>Ok</span>`); await D("cell", "dal", 0, 5, `<b style="color:#2E7D32">Resolved</b>`);
      await wait(2.2); await D("focus", "#blk-vol", { maxK: 1.8, pad: 6 });
    });
    await scene("s5", 6.6, async () => {
      await D("step", 5, "The database team is told", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO NOC Agent", me: "AN", items: [["Mova iO NOC Agent", "FYI · disk space on rak-plant-sql-01", 1], ["DB Operations", "Patch window Saturday", 0]] });
      await D("tmCard", "fyi", "Fixed before it hurt · rak-plant-sql-01", "Volume D: was going to fill at 23:40 tonight, during the MES night batch.", [["Cause", "LOG backup job failing since Tue: share \\\\rak-bk-01 retired"], ["Fix", "Job pointed to \\\\rak-bk-02, log backed up and shrunk"], ["Space back", "180 GB · now 54% used"], ["Change", "CHG0041188 · standard, pre-approved"]], { buttons: ["Looks good", "Ask a question"] });
      await wait(0.5); await D("focus", "#fyi", { maxK: 1.75, pad: 10 }); await wait(2.6);
      await D("tmApproveG", "Anita Nair (DBA)", "Confirmed");
    });
    await scene("s6", 6.4, async () => {
      await D("step", 6, "Closed together, with notes", ["ServiceNow"]);
      await app("sn", Object.assign({}, chg, { hl: [["Type", "Standard"], ["State", "Implement"], ["Approval", "Approved · standard"], ["Risk", "Low"], ["Planned", "Now · 20 min"]] }));
      await D("snNote", "Anita Nair", "#3E8E7E", "Confirmed in Teams. Thanks.", "Work notes", 9);
      await D("snRes", "Implemented. LOG backup job repointed and run; log shrunk from 214 GB to 34 GB; 38 GB of expired log backups removed. INC0031618 closed: outage avoided.", "Closed · successful");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["A full disk predicted nine hours early.", "Fixed through a pre-approved change.", "No outage, and no one woken up."], tag: ["Outages prevented by", "Mova iO agents."] });
  }
};
