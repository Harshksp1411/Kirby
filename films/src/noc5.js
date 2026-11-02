// NOC film 5: overnight backup failure (VSS writer) fixed, retried and test-restored before the shift starts.
const OK = (x = "Success") => `<span style="color:#1A7F37;font-weight:700">● ${x}</span>`, BAD = (x = "Failed") => `<span style="color:#C62828;font-weight:700">● ${x}</span>`, WARN = (x = "Warning") => `<span style="color:#B26A00;font-weight:700">● ${x}</span>`, RUN = (x = "Working") => `<span style="color:#0B63C4;font-weight:700">● ${x}</span>`;
const veeam = (st) => ({
  th: "veeam", topOn: "Home", search: "Type in an object name to search for", tenant: "vbr-01.corp.local",
  nav: ["#Home", "Jobs", ">Backup", ">Backup Copy", "Last 24 Hours", ">Running", ">Success", ">Warning", ">Failed", "#Backups", ">Disk", ">Object Storage", "#Inventory", "#Storage Infrastructure"], navOn: "Backup",
  actions: [["Start", "start"], ["Stop", "stop"], ["Retry", "retry"], ["Active Full", "full"], ["Statistics", "stats"], ["Report", "rep"], ["Edit", "edit"]],
  cols: "1fr", blocks: [
    { t: "table", id: "jobs", title: "Jobs › Backup", cols: ["Name", "Type", "Objects", "Status", "Last Result", "Next Run", "Target"], rows: [
      ["SQL-Plants-Daily", "VMware Backup", "6", st === "ok" ? "Stopped" : "Stopped", st === "ok" ? OK() : st === "retry" ? RUN("Retrying 2 of 6") : BAD(), "Tomorrow 02:00", "BK-REPO-02 (immutable)"],
      ["FS-Offices-Daily", "VMware Backup", "14", "Stopped", OK(), "Tomorrow 01:00", "BK-REPO-01"],
      ["Plant-MES-4h", "VMware Backup", "3", "Stopped", OK(), "Today 08:00", "BK-REPO-02 (immutable)"],
      ["DC-AD-Daily", "VMware Backup", "4", "Stopped", OK(), "Tomorrow 00:30", "BK-REPO-01"],
      ["M365-Mail-Daily", "Microsoft 365", "1,240 users", "Stopped", WARN("Warning"), "Tomorrow 03:00", "Object storage"]] },
    { t: "table", id: "sess", title: "SQL-Plants-Daily · session 02:00 · objects", w: 1, cols: ["Name", "Status", "Start time", "End time", "Size", "Read", "Transferred", "Details"], rows: [
      ["rak-plant-sql-01", st === "fail" ? BAD() : st === "retry" ? RUN("Retrying") : OK(), "02:00:41", "02:14:03", "1.1 TB", "0 B", "0 B", st === "fail" ? "Failed to create VM snapshot: VSS writer 'SqlServerWriter' failed" : st === "retry" ? "Retrying after RB-031 · 06:12" : "Retried · application-consistent"],
      ["hal-plant-sql-01", st === "fail" ? BAD() : st === "retry" ? RUN("Retrying") : OK(), "02:00:42", "02:13:51", "860 GB", "0 B", "0 B", st === "fail" ? "Failed to create VM snapshot: VSS writer 'SqlServerWriter' failed" : st === "retry" ? "Retrying after RB-031 · 06:12" : "Retried · application-consistent"],
      ["shu-plant-sql-01", OK(), "02:00:42", "02:31:10", "740 GB", "38 GB", "11 GB", "Incremental"],
      ["har-plant-sql-01", OK(), "02:00:43", "02:22:05", "520 GB", "22 GB", "6.8 GB", "Incremental"],
      ["vad-office-sql-01", OK(), "02:00:43", "02:18:44", "310 GB", "9 GB", "2.9 GB", "Incremental"],
      ["jed-office-sql-01", OK(), "02:00:44", "02:19:30", "280 GB", "7 GB", "2.1 GB", "Incremental"]] }]
});
module.exports = {
  page: "kit.html", vo: "vo_noc5",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["The nightly backup fails.", "Nobody reads the email.", "Until the day you need a restore."], stat: [58, "", "%", "of servers were recoverable within expectations in organisations' latest large-scale recovery test", "Source: Veeam Data Protection Trends Report 2024"], intro: ["How <span class=\"y\">Mova iO</span> makes sure", "last night's backup really happened."], tools: ["Veeam", "ServiceNow", "OpsRamp", "Copilot Studio", "Microsoft Teams"] });

    await scene("s1", 9, async () => {
      await D("step", 1, "Two servers fail the nightly backup", ["Veeam"]);
      await app("page", veeam("fail"));
      await D("rowSel", "jobs", 0); await D("focus", "#blk-jobs", { maxK: 1.5, fill: 0.92, pad: 0 }); await wait(3.4);
      await D("focus", "#blk-sess", { maxK: 1.5, fill: 0.95, pad: 0 });
    });
    await scene("s2", 11.4, async () => {
      await D("step", 2, "Recovery target already missed", ["ServiceNow", "Mova iO"]);
      await app("sn", { num: "INC0031755", title: "Backup failed: SQL-Plants-Daily (2 of 6 servers)", prio: "3 - Moderate", state: "In Progress", assigned: "Mova iO NOC Agent", sla: "7h 54m left",
        fields: [["Caller", "Mova iO Integration"], ["Channel", "Monitoring"], ["Category", "Backup"], ["Subcategory", "Job failure"], ["Service", "Plant databases"], ["Configuration item", "SQL-Plants-Daily"], ["Impact", "2 - Medium"], ["Urgency", "2 - Medium"], ["Assignment group", "Backup Operations"], ["Assigned to", "Mova iO NOC Agent"]],
        short: "SQL-Plants-Daily failed at 02:14 for rak-plant-sql-01 and hal-plant-sql-01; last good restore point 26 h old (RPO 24 h)" });
      await D("snNote", "Mova iO Event correlator", "#E15AA5", "Created from Veeam job session 02:00 (2 failed objects). <b>RPO breached:</b> last good restore point for both servers is 26 h old; target is 24 h.", "Work notes", 0);
      await D("focus", "#snhl", { maxK: 1.7, pad: 6 }); await wait(2.4); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene("s3", 13, async () => {
      await D("step", 3, "The cause: a stuck VSS writer", ["Copilot Studio", "Veeam", "OpsRamp"]);
      await app("cst", { agent: "Mova iO NOC Agent", run: "Automated · ServiceNow incident INC0031755", src: "ServiceNow", payload: `{ "number": "INC0031755",\n  "job": "SQL-Plants-Daily",\n  "failed": ["rak-plant-sql-01",\n             "hal-plant-sql-01"] }`,
        nodes: [["Trigger", "ServiceNow · incident created", "#2F5B4F", "0.1 s"], ["Get job session log", "Tool · Veeam REST API", "#00B336", "0.8 s"], ["List VSS writers", "Tool · OpsRamp script on agent", "#1F5BA8", "4.6 s"], ["Search runbooks", "Knowledge · backup runbooks", "#8764B8", "1.0 s"], ["Restart SQL Writer service", "Tool · OpsRamp script · RB-031", "#1F5BA8", "9.2 s"], ["Check writer state", "Tool · OpsRamp script", "#1F5BA8", "3.1 s"], ["Retry failed objects", "Tool · Veeam REST API", "#00B336", "21 min"], ["Test restore", "Tool · Veeam SureBackup", "#00B336", "6 min"], ["Update incident", "Tool · ServiceNow", "#2F5B4F", "0.5 s"], ["Notify backup team", "Tool · Microsoft Teams", "#5B5FC7", "0.7 s"]] });
      await D("focus", "#csmap", { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 0; i < 4; i++) { await D("csStep", i, "run"); await wait(i === 2 ? 1.1 : 0.55); await D("csStep", i, "ok"); }
      await D("csDet", 2, "List VSS writers", "Tool · OpsRamp script on agent · ✓ Complete · 4.6 s", `{ "hosts": ["rak-plant-sql-01", "hal-plant-sql-01"],\n  "command": "vssadmin list writers" }`, `{ "rak-plant-sql-01": {\n    "SqlServerWriter": "State: [8] Failed",\n    "Last error": "Non-retryable error" },\n  "hal-plant-sql-01": {\n    "SqlServerWriter": "State: [8] Failed",\n    "Last error": "Non-retryable error" },\n  "other writers": "Stable" }`);
      await wait(0.7); await D("focus", "#csdet", { maxK: 1.7, fill: 0.86, pad: 0 });
    });
    await scene("s4", 11.6, async () => {
      await D("step", 4, "Restart the writer, retry the job", ["OpsRamp", "Veeam"]);
      await D("focus", "#csmap", { maxK: 1.3, fill: 0.95, pad: 0 });
      for (let i = 4; i < 7; i++) { await D("csStep", i, "run"); await wait(i === 6 ? 1.6 : 0.9); await D("csStep", i, "ok"); }
      await D("csTranscript", `<div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">RB-031 · standard, low risk</div>SQL Writer restarted on 2 servers · writer state <b>[1] Stable</b>`);
      await wait(0.8);
      await app("page", veeam("retry"));
      await D("act", "retry", "hot"); await D("rowSel", "jobs", 0);
      await D("focus", "#blk-jobs", { maxK: 1.5, fill: 0.92, pad: 0 });
    });
    await scene("s5", 9.4, async () => {
      await D("step", 5, "Backed up, and test-restored", ["Veeam"]);
      await D("act", "retry", "done");
      await D("cell", "jobs", 0, 4, OK());
      for (const r of [0, 1]) { await D("cell", "sess", r, 1, OK()); await D("cell", "sess", r, 5, r ? "860 GB" : "1.1 TB"); await D("cell", "sess", r, 6, r ? "212 GB" : "301 GB"); await D("cell", "sess", r, 7, `Retried 06:12 · <b style="color:#1A7F37">test restore OK</b> (DB mounted, DBCC clean)`); await wait(0.4); }
      await D("focus", "#blk-sess", { maxK: 1.5, fill: 0.95, pad: 0 });
    });
    await scene("s6", 7.6, async () => {
      await D("step", 6, "Team told, incident closed", ["Microsoft Teams", "ServiceNow"]);
      await app("tms", { view: "channel", team: "IT Operations", channel: "Backup", channels: ["General", "Backup", "Major incidents", "NOC handover"] });
      await D("tmSay", `<div class="card" id="upd"><div class="hd">Overnight backup fixed · INC0031755</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What failed:</b> SQL-Plants-Daily on rak-plant-sql-01 and hal-plant-sql-01 (02:14).<br><b>Why:</b> SQL Server VSS writer stuck in a failed state.<br><b>Fix:</b> writer restarted (RB-031), objects retried 06:12, test restores passed.<br><b>Recovery point:</b> back within the 24 h target.</div></div>`, "Mova iO NOC Agent", 0);
      await wait(0.4); await D("focus", "#upd", { maxK: 1.7, pad: 10 }); await wait(2.6);
      await app("sn", { num: "INC0031755", title: "Backup failed: SQL-Plants-Daily (2 of 6 servers)", prio: "3 - Moderate", state: "In Progress", assigned: "Mova iO NOC Agent", sla: "7h 12m left", fields: [["Category", "Backup"], ["Configuration item", "SQL-Plants-Daily"], ["Assignment group", "Backup Operations"], ["Assigned to", "Mova iO NOC Agent"]], short: "SQL-Plants-Daily failed at 02:14 for 2 servers", notes: [["Mova iO Event correlator", "#E15AA5", "RPO breached: last good restore point 26 h old.", "Work notes", 0], ["Mova iO Guided resolution assistant", "#E15AA5", "RB-031 run: SQL Writer restarted on both servers, state Stable. Retry complete 06:12; test restores passed.", "Work notes", 1]] });
      await D("snRes", "Cause: SqlServerWriter in failed state on 2 servers, so no consistent snapshot. Fix: RB-031 restart of SQL Writer; failed objects retried; SureBackup test restore passed for both databases. RPO restored.");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["A failed backup caught overnight.", "Fixed and retried before the shift began.", "Every restore point tested."], tag: ["Backups you can trust, with", "Mova iO agents."] });
  }
};
