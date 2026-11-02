// SOC film 5: possible data theft by a departing user; DLP blocked uploads; HR and security approve restriction and case.
const { purviewNav, sevPill } = require("./soc_common.js");
const U = "vikas.p@corp.com";
const alertPage = {
  th: "purview", nav: purviewNav, navOn: "Alerts", crumb: "Data loss prevention › Alerts", title: "Confidential engineering files: mass download and blocked upload to personal cloud", sub: "DLP alert · policy 'Protect plant engineering IP' · user " + U,
  pills: [["High", "#C50F1F"], ["Active", "#0F6CBD"]], actions: [["Manage alert", "m"], ["Investigate in Insider risk", "irm"], ["View in Activity explorer", "ae"]], tabs: ["Details", "Events (5)", "Sensitive info types", "User activity summary"], tabOn: "Details", cols: "1fr 1.2fr",
  blocks: [
    { t: "kv", id: "ad", title: "Alert details", kw: 150, rows: [["User", "Vikas P. · Senior Engineer, Halol Plant"], ["Location", "SharePoint · Plant Engineering · Endpoint"], ["Files", "1,240 downloaded · 86 labelled Confidential"], ["Destination", "drive.google.com (personal) · USB E:\\"], ["Policy action", `<b style="color:#107C10">Blocked</b> · 3 uploads, 1 USB copy`], ["Assigned to", "Mova iO SOC Triage agent"]] },
    { t: "table", id: "ev", title: "Events", cols: ["Time", "Activity", "Item", "Label", "Enforcement"], rows: [["14:02 – 14:27", "Downloaded 1,240 files", "Plant Engineering / Line 4 retrofit", "Mixed", "Audit"], ["14:31", "Upload to cloud", "L4-press-tooling-rev7.dwg", "Confidential", `<b style="color:#C50F1F">Blocked</b>`], ["14:31", "Upload to cloud", "L4-retrofit-BOM.xlsx", "Confidential", `<b style="color:#C50F1F">Blocked</b>`], ["14:33", "Upload to cloud", "supplier-pricing-2026.xlsx", "Confidential", `<b style="color:#C50F1F">Blocked</b>`], ["14:36", "Copy to USB", "Line4.zip (412 MB)", "Contains Confidential", `<b style="color:#C50F1F">Blocked</b>`]] }]
};
const irm = (st) => ({
  th: "purview", nav: purviewNav, navOn: st ? "Cases" : "Activity explorer", crumb: st ? "Insider risk management › Cases" : "Insider risk management › Users › Vikas P.", title: st ? "Case 1042 · Vikas P. · possible data theft" : "Vikas P. · user activity", sub: st ? "Opened by Mova iO SOC agent · approved by HR and Security · pseudonymised view for analysts" : "Policy: Data theft by departing users · risk score over 30 days",
  pills: [st ? ["Case active", "#0F6CBD"] : ["Risk: High", "#C50F1F"]], actions: st ? [["Case actions", "ca"], ["Escalate for investigation", "esc"], ["Send notice", "nt"], ["Resolve case", "rs"]] : [["Open case", "open"], ["Send email notice", "n"]], cols: "1.4fr 1fr",
  blocks: [
    { t: "chart", id: "rs", title: "Risk score · last 30 days", ch: 200, data: [8, 9, 8, 10, 9, 9, 11, 10, 9, 12, 10, 11, 18, 22, 21, 24, 96], max: 100, unit: "", col: "#038387", thr: 75, thrL: "High", xl: [[0, "Oct 3"], [12, "Oct 29 · resignation"], [16, "today"]] },
    { t: "kv", id: "ck", title: st ? "Case evidence" : "Key signals", kw: 140, rows: st ? [["Evidence", "Activity export, DLP events, file list (86 labelled)"], ["Legal hold", `<b style="color:#107C10">Mailbox and OneDrive · on</b>`], ["Downloads", `<b style="color:#107C10">Restricted · SharePoint read-only in browser</b>`], ["Access", "HR business partner, Security lead, Legal"], ["Status", "Handed to HR and Legal"]] : [["HR connector", "Resignation recorded Oct 29 · last day Nov 28"], ["Exfiltration", "1,240 downloads in 25 min (normal: 14 per day)"], ["Sequence", "Download → archive → cloud / USB attempts"], ["Prior alerts", "None in 4 years"]] },
    { t: "tl", id: "tlx", title: "Activity timeline", w: 2, items: [["Oct 29", "Resignation recorded (HR connector)"], ["14:02", "Mass download starts: Plant Engineering / Line 4 retrofit"], ["14:29", "Line4.zip created (412 MB) on endpoint"], ["14:31", "3 uploads to personal Google Drive blocked by Endpoint DLP"], ["14:36", "USB copy blocked"]] }]
});
module.exports = {
  page: "kit.html", vo: "vo_soc5",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["1,240 files in 25 minutes.", "A personal cloud drive.", "A resignation three days old."], stat: [4.44, "$", "M", "the global average cost of a data breach", "Source: IBM Cost of a Data Breach Report 2025"], intro: ["How <span class=\"y\">Mova iO</span> handles a possible data theft,", "quickly and fairly."], tools: ["Purview", "Microsoft Teams", "Entra ID", "ServiceNow"] });

    await scene("s1", 19.5, async () => {
      await D("step", 1, "Mass download, uploads blocked", ["Purview"]);
      await app("page", alertPage);
      await D("focus", "#blk-ad", { maxK: 1.6, pad: 4 }); await wait(7);
      await D("focus", "#blk-ev", { maxK: 1.5, fill: 0.95, pad: 0 }); await wait(5);
      for (const r of [1, 2, 3, 4]) { await D("rowSel", "ev", r); await wait(0.3); }
    });
    await scene("s2", 14.9, async () => {
      await D("step", 2, "The timeline, and the context", ["Purview", "Mova iO"]);
      await app("page", irm(false));
      await D("focus", "#blk-tlx", { maxK: 1.5, fill: 0.95, pad: 0 }); await wait(5);
      await D("focus", "#blk-rs", { maxK: 1.5, pad: 4 }); await wait(4);
      await D("focus", "#blk-ck", { maxK: 1.6, pad: 4 });
    });
    await scene("s3", 12.8, async () => {
      await D("step", 3, "People decide: HR and Security", ["Microsoft Teams", "Mova iO"]);
      await app("tms", { agent: "Mova iO SOC Agent", me: "LA", items: [["Mova iO SOC Agent", "Approval needed · DLP alert (insider risk)", 1], ["HR business partners", "Exit interviews this week", 0]] });
      await D("tmCard", "apcard", "Approval needed · possible data theft (2 approvers)", "A departing engineer downloaded 1,240 files and tried to upload 3 confidential files to a personal drive. All uploads were blocked. This involves a person, so I need HR and Security to agree.", [["Recommend", "Restrict SharePoint downloads for this user"], ["Open", "Insider risk case 1042 with evidence"], ["Preserve", "Legal hold on mailbox and OneDrive"], ["Not doing", "Disabling the account or contacting the user"], ["Approvers", "HR business partner · Security lead"]], { buttons: ["Approve", "Reject", "Discuss"], w: 680 });
      await wait(0.4); await D("focus", "#apcard", { maxK: 1.65, pad: 10 }); await wait(5);
      await click("#apok", 0); await D("tmApproveG", "Lata Arora (HR) and Farah Rahman (Security)", "Applying restrictions…");
    });
    await scene("s4", 12.2, async () => {
      await D("step", 4, "Restricted, case opened, evidence kept", ["Entra ID", "Purview"]);
      await app("page", irm(true));
      await D("focus", "#blk-ck", { maxK: 1.6, pad: 4 }); await wait(4.2);
      await D("tl", "tlx", "14:44", "<b>Case 1042 opened</b> · downloads restricted (Conditional Access app control) · legal hold applied · approved by HR and Security");
      await D("focus", "#blk-tlx", { maxK: 1.5, fill: 0.95, pad: 0 });
    });
    await scene("s5", 10.6, async () => {
      await D("step", 5, "Handed to HR and Legal", ["ServiceNow"]);
      await app("sn", { ws: "Security Operations Workspace", kind: "Security incident", listTab: "Security incidents", num: "SIR0010480", title: "Possible data theft by departing user (Purview DLP and IRM case 1042)", hl: [["Priority", "2 - High"], ["State", "Analysis"], ["Assigned to", "HR and Legal (restricted)"], ["Data at risk", "86 Confidential files"], ["Exfiltrated", "None found"]],
        fields: [["Category", "Data loss"], ["Source", "Microsoft Purview"], ["Configuration item", "SharePoint · Plant Engineering"], ["Assignment group", "Insider Risk (restricted)"]], short: "1,240 downloads in 25 min; 3 uploads and 1 USB copy blocked; resignation recorded Oct 29",
        notes: [["Mova iO SOC Triage agent", "#E15AA5", "Likely data-theft attempt (high). No data left the company: all uploads and USB copy blocked. Evidence in IRM case 1042.", "Work notes", 0], ["Lata Arora", "#3E8E7E", "Approved. HR will meet the manager today.", "Work notes", 2]] });
      await D("snNote", "Mova iO SOC agent", "#E15AA5", "Manager briefing sent (facts only, no accusation). Next review: HR and Legal decision by Nov 4.", "Work notes", 3);
      await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 }); await wait(3.6); await D("focus", "#snhl", { maxK: 1.7, pad: 6 });
    });
    await closing({ close: ["A possible data theft spotted in minutes.", "Uploads blocked, evidence preserved.", "People decide what happens next."], tag: ["Data protection, powered by", "Mova iO agents."] });
  }
};
