// ServiceNow film 1: tickets created automatically from Teams chat, email and voicemail, complete and de-duplicated.
const CH = (c) => `<span style="display:inline-flex;align-items:center;gap:6px"><i style="width:9px;height:9px;border-radius:2px;background:${{ Teams: "#5B5FC7", Email: "#0F6CBD", Voice: "#C2410C", Monitoring: "#1F5BA8", Portal: "#2F5B4F" }[c]}"></i>${c}</span>`;
const seed = [["INC0032101", CH("Portal"), "Rohan Iyer", "Request access to Line 4 drawings folder", "Access", "4 - Low", "In Progress", "Service Desk", "08:51"], ["INC0032098", CH("Monitoring"), "Mova iO Integration", "Disk usage above 85% on hyd-city-fs-02", "Storage", "3 - Moderate", "Resolved", "Infra / Storage", "08:40"], ["INC0032094", CH("Email"), "Sana Khan", "Excel crashes when opening macro workbook", "Software", "3 - Moderate", "In Progress", "EUC L2", "08:22"], ["INC0032090", CH("Email"), "Facilities Pune", "Printer PUN-3F-02 jammed", "Hardware", "4 - Low", "In Progress", "Field Services", "08:05"]];
const list = { title: "Incidents · created today", sub: "Mova iO channel intake: Teams, email, voice, monitoring", cols: ["Number", "Channel", "Caller", "Short description", "Category", "Priority", "State", "Assignment group", "Created"], rows: seed };
module.exports = {
  page: "kit.html", vo: "vo_sn1",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["Who are you? Which device?", "When did it start?", "The same questions, on every call."], intro: ["How <span class=\"y\">Mova iO</span> creates complete tickets,", "from any channel."], tools: ["Microsoft Teams", "Entra ID", "Intune", "ServiceNow", "Outlook"] });

    await scene("s1", 8.4, async () => {
      await D("step", 1, "She asks in her own words", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO IT Help", me: "NK", items: [["Mova iO IT Help", "How can I help?", 1], ["Finance team", "Payment run at 15:00", 0]] });
      await wait(0.4);
      await D("tmUser", "hey, my VPN keeps dropping every few minutes since this morning. Teams calls cut out too and I'm working from home today", "Neha K.");
      await wait(0.6); await D("focus", "#tmmsgs", { maxK: 1.6, fill: 0.85, pad: 0 });
    });
    await scene("s2", 12, async () => {
      await D("step", 2, "One question, not twenty", ["Entra ID", "Intune", "Mova iO"]);
      await D("tmSay", `<div style="background:#fff;border:1px solid #E0E0E0;border-radius:8px;padding:12px 16px;font-size:14px;line-height:1.5;max-width:620px">Sorry about that, Neha. I can see you're on <b>LT-FIN-0398</b> (Windows 11) and connected through <b>GlobalProtect</b>. One question: does it drop on other networks too, like a phone hotspot?</div>`, "Mova iO IT Help", 0);
      await wait(2.4);
      await D("tmUser", "haven't tried hotspot, only home wifi", "Neha K.");
      await wait(1);
      await D("tmSay", `<div style="background:#fff;border:1px solid #E0E0E0;border-radius:8px;padding:10px 14px;font-size:13.5px;color:#616161;max-width:620px" id="bg1">⟳ Collecting VPN and network logs from LT-FIN-0398 (Intune diagnostics)…</div>`, "Mova iO IT Help", 0);
      await wait(2.4); await D("set", "#bg1", "✓ Logs collected: 14 tunnel drops since 09:05, all on home Wi-Fi (5 GHz), MTU errors in GlobalProtect log.", false);
      await D("focus", "#tmmsgs", { maxK: 1.5, fill: 0.88, pad: 0 });
    });
    await scene("s3", 12, async () => {
      await D("step", 3, "A complete incident, in seconds", ["ServiceNow", "Mova iO"]);
      await app("sn", { num: "INC0032107", title: "VPN disconnects every few minutes on home Wi-Fi (GlobalProtect)", prio: "3 - Moderate", state: "New", assigned: "(empty)", sla: "7h 59m left",
        fields: [["Caller", "Neha K. · Finance · Hyderabad"], ["Channel", "Microsoft Teams (Mova iO IT Help)"], ["Category", "Network"], ["Subcategory", "VPN"], ["Service", "Remote access"], ["Configuration item", "LT-FIN-0398"], ["Impact", "3 - Low (1 user)"], ["Urgency", "2 - Medium (calls dropping)"]],
        short: "VPN disconnects every few minutes on home Wi-Fi (GlobalProtect), Teams calls drop",
        desc: "User reports VPN dropping since 09:05 while working from home. Only tested on home Wi-Fi. Device logs: 14 tunnel drops, all on 5 GHz home Wi-Fi; MTU errors in GlobalProtect log. No VPN outage reported for other users. Attached: gp-logs.zip, wlan-report.html" });
      for (const [k, v] of [["caller", "Neha K. · Finance · Hyderabad"], ["category", "Network"], ["subcategory", "VPN"], ["configurationitem", "LT-FIN-0398"], ["impact", "3 - Low (1 user)"], ["urgency", "2 - Medium (calls dropping)"]]) { await D("snField", k, v, "auto"); await wait(0.25); }
      await D("snNote", "Mova iO IT Help", "#E15AA5", "Created from Teams chat (3 messages). Chat transcript, gp-logs.zip and wlan-report.html attached. Checked: no open VPN outage.", "Work notes", 0);
      await D("focus", "#snform", { maxK: 1.45, fill: 0.92, pad: 0 }); await wait(4.2); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    await scene("s4", 12, async () => {
      await D("step", 4, "Email in, duplicate linked", ["Outlook", "ServiceNow"]);
      await app("outlook", { me: "SD", unread: 23, list: [["Facilities Pune", "Printer on 3rd floor jammed AGAIN", "The big printer near the pantry is showing paper jam…", "09:41", 1], ["Arjun Rao", "New starter laptop for Monday", "Hi team, Kiran joins Monday…", "09:30"], ["Sana Khan", "Re: Excel crash", "Thanks, that worked…", "09:12"]],
        open: { subject: "Printer on 3rd floor jammed AGAIN", from: "Facilities Pune &lt;facilities.pune@corp.com&gt;", to: "IT Service Desk", init: "FP", col: "#038387", time: "09:41", body: "Hi,<br><br>The big printer near the pantry on the 3rd floor is showing paper jam again and people can't print. Can someone come and look?<br><br>Thanks,<br>Facilities, Pune office" } });
      await D("focus", "#olrd", { maxK: 1.4, fill: 0.85, pad: 0 }); await wait(3);
      await app("snList", list);
      await D("snlRow", ["<b>INC0032108</b>", CH("Email"), "Facilities Pune", "Printer PUN-3F-02 jammed (repeat)", "Hardware", "4 - Low", `<b style="color:#5A6872">Linked → INC0032090</b>`, "Field Services", "09:41"]);
      await D("focus", "#snlb tr:first-child", { maxK: 1.6, pad: 6 }); await wait(3);
      await D("focus", "#snlb", { maxK: 1.35, fill: 0.95, pad: 10 });
    });
    await scene("s5", 8.8, async () => {
      await D("step", 5, "Voice too, all complete", ["ServiceNow", "Mova iO"]);
      await D("snlRow", ["<b>INC0032109</b>", CH("Voice"), "Kiran Desai", "Can't sign in to SuccessFactors after password change", "Access", "3 - Moderate", "New", "Service Desk", "09:44"]);
      await D("snlRow", ["<b>INC0032107</b>", CH("Teams"), "Neha K.", "VPN disconnects every few minutes on home Wi-Fi", "Network", "3 - Moderate", "New", "Network Operations", "09:38"], false);
      await D("focus", "#snlb", { maxK: 1.35, fill: 0.95, pad: 10 });
    });
    await scene("s6", 6, async () => {
      await D("step", 6, "Ticket number, and a fix to try", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO IT Help", me: "NK", items: [["Mova iO IT Help", "INC0032107 created", 1]] });
      await D("tmUser", "hey, my VPN keeps dropping every few minutes since this morning. Teams calls cut out too and I'm working from home today", "Neha K.");
      await D("tmSay", `<div class="card" id="tk" style="width:620px"><div class="hd">Ticket INC0032107 created</div><div style="padding:12px 18px 16px;font-size:14px;line-height:1.55">Your logs show the drops only happen on 5 GHz home Wi-Fi. <b>Try this now:</b> switch your laptop to the 2.4 GHz network or a phone hotspot. If it still drops, Network Operations will call you within 2 hours.</div></div>`, "Mova iO IT Help", 0);
      await wait(0.4); await D("focus", "#tk", { maxK: 1.75, pad: 10 });
    });
    await closing({ close: ["Tickets created in seconds, from chat, email and voice.", "Every field filled in.", "Duplicates linked, not logged twice."], tag: ["Ticket creation, handled by", "Mova iO agents."] });
  }
};
