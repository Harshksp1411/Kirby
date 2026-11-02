// SOC film 1: a reported phishing email; every copy found and removed after approval; clickers protected.
const { defNav, graph, sevPill } = require("./soc_common.js");
const DOM = "vendor-payrnents.com";
const inc = (state) => ({
  th: "defender", nav: defNav, navOn: "Incidents", search: "Search", crumb: "Incidents & alerts › Incidents", title: "Phishing campaign: invoice lure from lookalike domain", sub: "Incident ID 51882 · Multi-stage · Email, Identity", user: "SA",
  pills: [["High", "#C50F1F"], [state === "done" ? "Resolved" : "Active", state === "done" ? "#107C10" : "#0F6CBD"]],
  actions: [["Manage incident", "manage"], ["Copilot summary", "sum"], ["Comments and history", "com"], ["Classify", "cls"]],
  tabs: ["Attack story", "Alerts (4)", "Assets (25)", "Investigations (1)", "Evidence and Response (27)", "Summary"], tabOn: "Attack story", cols: "0.9fr 1.6fr 1fr",
  blocks: [
    { t: "html", id: "als", title: "Alerts", html: [["08:41", "Email reported by user as malware or phish", "Informational"], ["08:42", "Email messages containing malicious URL removed after delivery", "Medium"], ["08:44", "A potentially malicious URL click was detected", "High"], ["08:44", "User clicked through to a credential phishing page", "High"]].map(([t, x, s]) => `<div style="padding:8px 0;border-bottom:1px solid #EDEBE9"><div style="font-size:12px;color:#605E5C">${t} · ${sevPill(s)}</div><div style="margin-top:3px">${x}</div></div>`).join("") },
    { t: "html", id: "grph", title: "Incident graph", html: graph([["dom", 80, 60, DOM, "Sender domain · 2 days old", "#C50F1F", "@"], ["mail", 300, 60, "23 mailboxes", "Finance, procurement", "#0F6CBD", "✉"], ["url", 520, 60, "login-vendorpay[.]co", "Cloned sign-in page", "#C50F1F", "⚑"], ["u1", 420, 240, "r.iyer@", "Clicked 08:44", "#BC4B09", "👤"], ["u2", 570, 240, "s.khan@", "Clicked 08:46", "#BC4B09", "👤"], ["k", 190, 240, "k.sharma@", "Reported 08:41", "#107C10", "👤"]], [["dom", "mail", "sent to"], ["mail", "url", "contains"], ["url", "u1", "clicked"], ["url", "u2", "clicked"], ["mail", "k", "reported"]], 640, 320), style: "overflow:hidden" },
    { t: "kv", id: "idet", title: "Incident details", kw: 110, rows: [["Assigned to", "Mova iO SOC Triage agent"], ["Classification", state === "new" ? "Not set" : `<b style="color:#C50F1F">True positive · Phishing</b>`], ["Categories", "Initial access"], ["First activity", "08:39"], ["Impacted", "23 mailboxes · 2 users clicked"], ["Status", state === "done" ? "Resolved" : "In progress"]] }]
});
const explorer = (done) => ({
  th: "defender", nav: defNav, navOn: "Explorer", search: "Search", crumb: "Email & collaboration › Explorer", title: "Explorer", sub: `All email · Sender domain equal ${DOM} · last 7 days`,
  actions: [["Take action", "take"], ["Message actions", "msg"], ["Export", "exp"], ["Add filter", "flt"]], tabs: ["Email", "Malware", "URL clicks", "Top URLs", "Top clicks", "Campaigns"], tabOn: "Email", cols: "1fr",
  blocks: [{ t: "table", id: "ex", title: "23 results", cols: ["", "Date (UTC+05:30)", "Subject", "Recipient", "Sender", "Delivery action", "Latest delivery location", "URL clicks"],
    rows: [["k.sharma@", "r.iyer@", "s.khan@", "a.menon@", "p.das@", "v.rao@", "m.gupta@", "n.bose@", "t.pillai@", "h.joshi@"].map((r, i) => [`<input type="checkbox">`, `08:3${9 - Math.min(i, 9)}:${10 + i * 3}`, "Action required: updated bank details for invoice INV-88213", r + "corp.com", "accounts@" + DOM, done ? "Delivered" : "Delivered", done ? `<b style="color:#107C10">Deleted items · removed</b>` : i === 0 ? "Inbox · reported" : "Inbox", i === 1 || i === 2 ? `<b style="color:#C50F1F">1 · allowed</b>` : "0"])][0] }]
});
module.exports = {
  page: "kit.html", vo: "vo_soc1",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["One convincing email.", "Twenty-three inboxes.", "It only takes one click."], stat: [60, "~", "%", "of confirmed breaches involve a human action, such as clicking a link", "Source: Verizon 2025 Data Breach Investigations Report"], intro: ["How <span class=\"y\">Mova iO</span> handles a phishing report,", "from first click to clean inboxes."], tools: ["Outlook", "Microsoft Defender", "Microsoft Teams", "Entra ID", "ServiceNow"] });

    await scene("s1", 9.2, async () => {
      await D("step", 1, "An employee reports it", ["Outlook"]);
      await app("outlook", { me: "KS", list: [["Accounts Payable", "Action required: updated bank details for invoice INV-88213", "Please update the beneficiary details before today's payment run…", "08:39", 1], ["Rohan Iyer", "Q3 accruals", "Sharing the final numbers for…", "08:12"], ["IT Service Desk", "Your request REQ0091 is complete", "Your laptop dock has been…", "Yesterday"], ["Payroll", "Payslip for October", "Your payslip is available…", "Yesterday"]],
        warn: "⚠ You don't often get email from accounts@" + DOM + ". Learn why this is important", open: { subject: "Action required: updated bank details for invoice INV-88213", from: "Accounts Payable &lt;accounts@" + DOM + "&gt;", to: "Kavya Sharma", init: "AP", col: "#8764B8", time: "Mon 08:39",
          body: `Dear Kavya,<br><br>Our bank details changed this month. To avoid a delay on invoice INV-88213 (₹ 18,42,600), please confirm the new beneficiary account before today's payment run.<br><br><span style="color:#0F6CBD;text-decoration:underline">Review and confirm payment details</span><br><br>Regards,<br>Accounts Payable` } });
      await D("focus", "#olrd", { maxK: 1.5, fill: 0.9, pad: 0 }); await wait(3.4);
      await D("zoomOut"); await wait(0.6); await D("cls", "#rb-report", "hot"); await click("#rb-report", 0.2);
      await D("set", "#olrd", `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;text-align:center"><div style="font-size:20px;font-weight:600">Thanks for reporting</div><div style="color:#616161;max-width:420px">This message was reported as phishing and moved to Deleted Items. Your security team will review it.</div></div>`);
      await D("focus", "#olrd", { maxK: 1.3, fill: 0.8, pad: 0 });
    });
    await scene("s2", 15.4, async () => {
      await D("step", 2, "Triaged in Defender: malicious", ["Microsoft Defender", "Mova iO"]);
      await app("page", inc("new"));
      await D("focus", "#blk-grph", { maxK: 1.5, fill: 0.9, pad: 0 }); await wait(5);
      await D("set", "#idet-1", `<b style="color:#C50F1F">True positive · Phishing</b><span class="ai">✦ Mova iO</span>`);
      await D("add", "#als", `<div style="background:#FBE7F3;border-radius:6px;padding:10px 12px;margin-top:8px;font-size:13px;line-height:1.45"><b>✦ Mova iO SOC Triage agent</b><br>Verdict: <b>malicious</b> (97%). Domain registered 2 days ago; SPF and DMARC fail; URL hosts a cloned sign-in page; same message in 23 mailboxes.</div>`);
      await D("focus", "#blk-als", { maxK: 1.6, fill: 0.9, pad: 0 }); await wait(4); await D("focus", "#blk-idet", { maxK: 1.7, pad: 4 });
    });
    await scene("s3", 6.4, async () => {
      await D("step", 3, "Every copy found", ["Defender for Office 365"]);
      await app("page", explorer(false));
      await D("focus", "#blk-ex", { maxK: 1.35, fill: 0.95, pad: 0 }); await wait(2.2);
      await D("rowSel", "ex", 1); await D("rowSel", "ex", 2);
    });
    await scene("s4", 7.6, async () => {
      await D("step", 4, "The SOC lead approves", ["Microsoft Teams", "Mova iO"]);
      await app("tms", { agent: "Mova iO SOC Agent", me: "FR", items: [["Mova iO SOC Agent", "Approval needed · incident 51882", 1], ["SOC shift", "Handover at 14:00", 0]] });
      await D("tmCard", "apcard", "Approval needed · Defender incident 51882", "Phishing campaign from a lookalike domain reached 23 mailboxes. 2 people clicked.", [["Action", "Soft delete 23 messages"], ["Also", "Block sender domain and URL (Tenant Allow/Block List)"], ["Users who clicked", "Reset sessions · check sign-ins"], ["Verdict", "Malicious · 97% · evidence in Defender"]], { buttons: ["Approve", "Reject", "Open in Defender"] });
      await wait(0.4); await D("focus", "#apcard", { maxK: 1.75, pad: 10 }); await wait(2.2);
      await click("#apok", 0); await D("tmApproveG", "Farah Rahman (SOC lead)", "Remediating…");
    });
    await scene("s5", 12.8, async () => {
      await D("step", 5, "Removed, blocked, protected", ["Microsoft Defender", "Entra ID"]);
      await app("page", explorer(false));
      await D("act", "take", "hot");
      await D("fly", "Take action · 23 messages", `<div style="display:grid;gap:10px"><div>✔ <b>Soft delete</b> all 23 messages</div><div>✔ Block sender domain <b>${DOM}</b></div><div>✔ Block URL <b>login-vendorpay[.]co</b></div><div>✔ Submit to Microsoft for analysis</div><div style="color:#605E5C;font-size:13px">Approved by Farah Rahman in Teams · Incident 51882</div></div>`, "Submit");
      await D("focus", "#fly", { maxK: 1.5, fill: 0.85, pad: 0 }); await wait(2.6); await click("#flyok", 0); await D("flyOff"); await D("act", "take", "done"); await D("zoomOut");
      for (let i = 0; i < 10; i++) { await D("cell", "ex", i, 6, `<b style="color:#107C10">Deleted items · removed</b>`); await wait(0.12); }
      await D("toast", "<b>Action submitted.</b> 23 of 23 messages soft-deleted. Sender and URL blocked.");
      await D("focus", "#blk-ex", { maxK: 1.35, fill: 0.95, pad: 0 }); await wait(2.4);
      await app("page", { th: "entra", nav: require("./soc_common.js").entraNav, navOn: "Sign-in logs", crumb: "Monitoring & health › Sign-in logs", title: "Sign-in logs", sub: "Users: r.iyer@corp.com, s.khan@corp.com · last 24 hours", actions: [["Download", "dl"], ["Revoke sessions", "rev"], ["Columns", "col"]], cols: "1fr",
        blocks: [{ t: "table", id: "si", title: "User sign-ins (interactive)", cols: ["Date", "User", "Application", "Status", "IP address", "Location", "Conditional Access", "Risk"], rows: [["08:47", "Rohan Iyer", "Office 365 Exchange Online", "Success", "10.20.4.18", "Mumbai, IN (office)", "Success", "None"], ["08:46", "Sana Khan", "Microsoft Teams", "Success", "10.20.6.42", "Mumbai, IN (office)", "Success", "None"], ["07:58", "Rohan Iyer", "Windows Sign In", "Success", "10.20.4.18", "Mumbai, IN (office)", "Not applied", "None"], ["07:31", "Sana Khan", "Windows Sign In", "Success", "10.20.6.42", "Mumbai, IN (office)", "Not applied", "None"]] }] });
      await D("focus", "#blk-si", { maxK: 1.45, fill: 0.95, pad: 0 }); await wait(1.4); await D("act", "rev", "done");
      await D("toast", "Sessions revoked for 2 users. No sign-ins from new locations or devices."); await wait(2);
    });
    await scene("s6", 8, async () => {
      await D("step", 6, "Thanks sent, case closed", ["Microsoft Teams", "ServiceNow"]);
      await app("tms", { agent: "Mova iO Security", me: "KS", items: [["Mova iO Security", "Thanks for reporting that email", 1], ["Finance team", "Payment run at 15:00", 0]] });
      await D("tmSay", `<div style="background:#fff;border:1px solid #E0E0E0;border-radius:8px;padding:14px 18px;font-size:14px;line-height:1.55;max-width:640px" id="thx">Hi Kavya, thank you for reporting the "updated bank details" email. <b>It was phishing.</b> It reached 23 people; we've removed every copy and blocked the sender. Nothing else for you to do. 🙏</div>`, "Mova iO Security", 0);
      await wait(0.4); await D("focus", "#thx", { maxK: 1.8, pad: 10 }); await wait(2.6);
      await app("sn", { ws: "Security Operations Workspace", kind: "Security incident", listTab: "Security incidents", num: "SIR0010455", title: "Phishing campaign: invoice lure from lookalike domain (Defender 51882)", hl: [["Priority", "2 - High"], ["State", "Contain"], ["Assigned to", "Mova iO SOC Agent"], ["Affected users", "23 · 2 clicked"], ["MITRE", "T1566.002"]],
        fields: [["Category", "Phishing"], ["Source", "User report · Microsoft Defender"], ["Configuration item", "Exchange Online"], ["Assignment group", "SOC L1"]], short: "Lookalike domain " + DOM + " sent credential-phishing email to 23 mailboxes",
        notes: [["Mova iO SOC Triage agent", "#E15AA5", "Verdict malicious, 97%. Evidence linked from Defender incident 51882.", "Work notes", 0], ["Farah Rahman", "#3E8E7E", "Approved remediation in Teams.", "Work notes", 3]] });
      await D("snRes", "Contained. 23 of 23 messages soft-deleted; sender domain and URL blocked; sessions revoked for 2 users who clicked; no risky sign-ins found. Reporter thanked.", "Closed");
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["One report from one person.", "Every copy gone in minutes.", "The two people who clicked, protected."], tag: ["Phishing, contained by", "Mova iO agents."] });
  }
};
