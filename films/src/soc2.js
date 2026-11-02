// SOC film 2: impossible travel / stolen session token; sessions revoked, password reset, inbox rule removed.
const { defNav, entraNav, graph, sevPill } = require("./soc_common.js");
const RISK = (l) => `<b style="color:${{ High: "#C50F1F", Medium: "#BC4B09", Low: "#8A8886", None: "#107C10" }[l]}">${l}</b>`;
const risky = (done) => ({
  th: "entra", nav: entraNav, navOn: "Risky users", crumb: "Protection › Identity Protection › Risky users", title: "Risky users", sub: "Risk level: High, Medium · Risk state: At risk", tenant: "corp.com",
  actions: [["Reset password", "reset"], ["Confirm user(s) compromised", "conf"], ["Confirm user(s) safe", "safe"], ["Dismiss user(s) risk", "dismiss"], ["Block user", "block"], ["Revoke sessions", "rev"], ["Investigate with Microsoft Defender", "inv"]], cols: "1fr 1.3fr",
  blocks: [
    { t: "table", id: "ru", title: "Users", cols: ["User", "Risk state", "Risk level", "Risk last updated"], rows: [["Arjun Rao", done ? "Confirmed compromised · remediating" : "At risk", RISK(done ? "High" : "High"), "09:21"], ["Meera Nair", "At risk", RISK("Medium"), "Yesterday"], ["Deepak Verma", "Remediated", RISK("None"), "2 days ago"]] },
    { t: "kv", id: "ud", title: "Risky user details · Arjun Rao", kw: 160, rows: [["User", "arjun.rao@corp.com · Plant Manager, Halol"], ["Risk level", RISK("High")], ["Risk state", done ? "Confirmed compromised" : "At risk"], ["Risk detail", done ? "Admin confirmed user compromised" : "-"], ["Sessions", done ? `<b style="color:#107C10">All revoked 09:27</b>` : "4 active (2 new)"], ["Password", done ? `<b style="color:#107C10">Secure reset required at next sign-in</b>` : "Last changed 61 days ago"]] },
    { t: "table", id: "rd", title: "Risk detections", w: 2, cols: ["Detection time", "Detection type", "Risk level", "IP address", "Location", "Detail"], rows: [
      ["09:20", "Impossible travel", RISK("High"), "185.220.101.47", "Amsterdam, NL", "Mumbai → Amsterdam in 18 min"],
      ["09:20", "Anomalous token", RISK("High"), "185.220.101.47", "Amsterdam, NL", "Token lifetime and claims unusual · possible replay"],
      ["09:20", "Anonymous IP address", RISK("Medium"), "185.220.101.47", "Amsterdam, NL", "Known anonymizing proxy"],
      ["09:02", "Unfamiliar sign-in properties", RISK("Low"), "10.31.2.14", "Mumbai, IN", "New browser after clicking an emailed link"]] }]
});
const defInc = (done) => ({
  th: "defender", nav: defNav, navOn: "Incidents", crumb: "Incidents & alerts › Incidents", title: "Possible AiTM session theft and BEC preparation", sub: "Incident ID 51907 · Identity, Email · user arjun.rao", pills: [["High", "#C50F1F"], [done ? "Resolved" : "Active", done ? "#107C10" : "#0F6CBD"]],
  actions: [["Manage incident", "m"], ["Copilot summary", "s"], ["Comments and history", "c"]], tabs: ["Attack story", "Alerts (5)", "Assets (3)", "Investigations (1)", "Evidence and Response (6)", "Summary"], tabOn: "Attack story", cols: "0.9fr 1.6fr 1fr",
  blocks: [
    { t: "html", id: "als", title: "Alerts", html: [["09:02", "User clicked a link to a credential phishing page", "Medium"], ["09:20", "Impossible travel activity", "High"], ["09:20", "Stolen session cookie was used", "High"], ["09:23", "Suspicious inbox manipulation rule", "High"], ["09:24", "Mailbox search for 'invoice' and 'payment'", "Medium"]].map(([t, x, s]) => `<div style="padding:8px 0;border-bottom:1px solid #EDEBE9"><div style="font-size:12px;color:#605E5C">${t} · ${sevPill(s)}</div><div style="margin-top:3px">${x}</div></div>`).join("") },
    { t: "html", id: "grph", title: "Incident graph", html: graph([["url", 70, 60, "login-corp-sso[.]info", "Phishing page (AiTM)", "#C50F1F", "⚑"], ["user", 300, 60, "arjun.rao@", "Token stolen 09:02", "#BC4B09", "👤"], ["ip", 530, 60, "185.220.101.47", "Anonymous proxy · NL", "#C50F1F", "⌖"], ["mbx", 300, 240, "Mailbox", "Rule: 'invoice' → RSS Feeds", "#C50F1F", "✉"], ["sp", 530, 240, "SharePoint", "3 files viewed", "#BC4B09", "▤"]], [["url", "user", "captured"], ["user", "ip", "replayed from"], ["ip", "mbx", "created rule"], ["ip", "sp", "accessed"]], 620, 320) },
    { t: "kv", id: "idet", title: "Incident details", kw: 110, rows: [["Assigned to", "Mova iO SOC Triage agent"], ["Classification", "Not set"], ["Categories", "Credential access, Collection"], ["First activity", "09:02"], ["Data sent out", "None found"], ["Status", done ? "Resolved" : "In progress"]] }]
});
module.exports = {
  page: "kit.html", vo: "vo_soc2",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["Same user.", "Two countries.", "Eighteen minutes apart."], stat: [32, "", "%", "rise in identity-based attacks in the first half of 2025", "Source: Microsoft Digital Defense Report 2025"], intro: ["How <span class=\"y\">Mova iO</span> handles a stolen sign-in,", "before the attacker gets far."], tools: ["Entra ID", "Microsoft Defender", "Microsoft Teams", "Exchange Online", "ServiceNow"] });

    await scene("s1", 14.2, async () => {
      await D("step", 1, "One user, two countries", ["Entra ID"]);
      await app("page", risky(false));
      await D("rowSel", "ru", 0); await D("focus", "#blk-ru", { maxK: 1.7, pad: 4 }); await wait(3);
      await D("focus", "#blk-rd", { maxK: 1.45, fill: 0.95, pad: 0 }); await wait(4); await D("rowSel", "rd", 0); await D("rowSel", "rd", 1); await wait(3);
      await D("focus", "#blk-ud", { maxK: 1.6, pad: 4 });
    });
    await scene("s2", 15.8, async () => {
      await D("step", 2, "The story: a stolen session", ["Microsoft Defender", "Mova iO"]);
      await app("page", defInc(false));
      await D("focus", "#blk-grph", { maxK: 1.5, fill: 0.9, pad: 0 }); await wait(6);
      await D("add", "#als", `<div style="background:#FBE7F3;border-radius:6px;padding:10px 12px;margin-top:8px;font-size:13px;line-height:1.45"><b>✦ Mova iO SOC Triage agent</b><br><b>Compromised</b> (95%). Session token captured by an AiTM page at 09:02 and replayed from a proxy. Inbox rule hides replies about invoices. No mail sent externally; 3 SharePoint files viewed.</div>`);
      await D("set", "#idet-1", `<b style="color:#C50F1F">True positive · Compromised account</b>`);
      await D("focus", "#blk-als", { maxK: 1.6, fill: 0.9, pad: 0 });
    });
    await scene("s3", 13, async () => {
      await D("step", 3, "Contain, keep him working", ["Microsoft Teams", "Mova iO"]);
      await app("tms", { agent: "Mova iO SOC Agent", me: "FR", items: [["Mova iO SOC Agent", "Approval needed · incident 51907", 1], ["SOC shift", "Handover at 14:00", 0]] });
      await D("tmCard", "apcard", "Approval needed · Defender incident 51907", "Arjun Rao's session was stolen and replayed from Amsterdam. The attacker set an inbox rule to hide invoice replies. Nothing has been sent out yet.", [["Revoke", "All sessions and refresh tokens"], ["Reset", "Confirm compromised → secure password reset"], ["Remove", "Inbox rule 'invoice' → RSS Feeds"], ["Block", "185.220.101.47 and login-corp-sso[.]info"], ["Account", "Stays enabled, so Arjun can keep working"]], { buttons: ["Approve all", "Disable account instead", "Open in Defender"] });
      await wait(0.4); await D("focus", "#apcard", { maxK: 1.7, pad: 10 }); await wait(5.4);
      await click("#apok", 0); await D("tmApproveG", "Farah Rahman (SOC lead)", "Containing…");
    });
    await scene("s4", 13.8, async () => {
      await D("step", 4, "Locked out, cleaned up", ["Entra ID", "Exchange Online", "Microsoft Defender"]);
      await app("page", risky(false));
      await D("rowSel", "ru", 0); await D("zoomOut");
      await D("act", "rev", "hot"); await wait(0.8); await D("act", "rev", "done"); await D("set", "#ud-4", `<b style="color:#107C10">All revoked 09:27</b>`);
      await D("act", "conf", "hot"); await wait(0.8); await D("act", "conf", "done"); await D("set", "#ud-2", "Confirmed compromised"); await D("set", "#ud-5", `<b style="color:#107C10">Secure reset required at next sign-in</b>`); await D("cell", "ru", 0, 1, "Confirmed compromised · remediating");
      await D("toast", "Sessions revoked and user confirmed compromised. Conditional Access will require a secure password change.");
      await D("focus", "#blk-ud", { maxK: 1.6, pad: 4 }); await wait(3.2);
      await app("page", defInc(false));
      await D("set", "#idet-1", `<b style="color:#C50F1F">True positive · Compromised account</b>`);
      await D("add", "#als", `<div style="background:#E9F5E9;border-radius:6px;padding:10px 12px;margin-top:8px;font-size:13px;line-height:1.45"><b>Actions completed</b><br>✓ Inbox rule removed (Exchange Online)<br>✓ IP 185.220.101.47 blocked<br>✓ URL login-corp-sso[.]info blocked</div>`);
      await D("focus", "#blk-als", { maxK: 1.6, fill: 0.9, pad: 0 });
    });
    await scene("s5", 6.4, async () => {
      await D("step", 5, "The user is told", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO Security", me: "AR", items: [["Mova iO Security", "Your account was secured", 1], ["Halol Plant", "Shift report", 0]] });
      await D("tmSay", `<div style="background:#fff;border:1px solid #E0E0E0;border-radius:8px;padding:14px 18px;font-size:14px;line-height:1.55;max-width:660px" id="msg">Hi Arjun, at 09:02 a fake sign-in page captured your session, and someone used it from abroad. <b>We have signed them out and secured your account.</b><br>Next time you sign in you'll be asked to set a new password. Please don't reuse the old one. Questions? Reply here.</div>`, "Mova iO Security", 0);
      await wait(0.4); await D("focus", "#msg", { maxK: 1.8, pad: 10 });
    });
    await scene("s6", 8.2, async () => {
      await D("step", 6, "Closed with the timeline", ["ServiceNow"]);
      await app("sn", { ws: "Security Operations Workspace", kind: "Security incident", listTab: "Security incidents", num: "SIR0010461", title: "Compromised account: AiTM session theft, arjun.rao (Defender 51907)", hl: [["Priority", "1 - Critical"], ["State", "Contain"], ["Assigned to", "Mova iO SOC Agent"], ["Affected users", "1"], ["MITRE", "T1557 · T1564.008"]],
        fields: [["Category", "Account compromise"], ["Source", "Entra ID Protection · Defender"], ["Configuration item", "arjun.rao@corp.com"], ["Assignment group", "SOC L2"]], short: "Session token stolen via AiTM page and replayed from anonymous proxy; inbox rule created",
        notes: [["Mova iO SOC Triage agent", "#E15AA5", "Compromised, 95%. Timeline: 09:02 phishing click → 09:20 token replay (NL) → 09:23 inbox rule → 09:27 contained.", "Work notes", 0], ["Farah Rahman", "#3E8E7E", "Approved containment in Teams.", "Work notes", 3]] });
      await D("snRes", "Contained in 7 minutes from detection. Sessions revoked; secure password reset enforced; inbox rule removed; IP and phishing URL blocked; no data sent externally. Phishing page reported for takedown.", "Closed");
      await D("focus", "#snnotes", { maxK: 1.7, fill: 0.86, pad: 6 }); await wait(2.6); await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["A stolen session caught in minutes.", "The attacker locked out.", "The user back at work the same morning."], tag: ["Identity threats, contained by", "Mova iO agents."] });
  }
};
