// ServiceNow film 2: auto triage with confidence and reasons; low-confidence field confirmed by a person; pattern grouped.
const thin = { num: "INC0032114", title: "Outlook not working", prio: "(empty)", state: "New", assigned: "(empty)", sla: "Not started", assist: true,
  fields: [["Caller", "Sana Khan · Sales · Mumbai"], ["Channel", "Self-service portal"], ["Category", ""], ["Subcategory", ""], ["Service", ""], ["Configuration item", ""], ["Impact", ""], ["Urgency", ""], ["Assignment group", ""], ["Parent incident", ""]],
  short: "Outlook not working", desc: "outlook not working since morning, cant send quotes to customer. please help urgent" };
const why = (x) => `<div style="font-size:12.5px;color:#5A6872;margin-top:3px">${x}</div>`;
module.exports = {
  page: "kit.html", vo: "vo_sn2",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["“Outlook not working.”", "That's the whole ticket.", "Now someone has to work out the rest."], stat: [80, "", "%+", "triage accuracy with Mova iO in live operations", "Source: Movate, Mova iO Operations"], intro: ["How <span class=\"y\">Mova iO</span> triages every ticket,", "and shows its reasons."], tools: ["ServiceNow", "Intune", "Microsoft Teams"] });

    await scene("s1", 9.8, async () => {
      await D("step", 1, "Three words, nothing else", ["ServiceNow"]);
      await app("sn", thin);
      await D("focus", "#snform", { maxK: 1.45, fill: 0.92, pad: 0 });
    });
    await scene("s2", 14.4, async () => {
      await D("step", 2, "The agent reads, checks, compares", ["ServiceNow", "Intune", "Mova iO"]);
      await D("zoomOut"); await D("snPanel", `<div style="font-size:13px;color:#5A6872">Triage · INC0032114 · started 09:52:03</div><div id="tr1" style="display:flex;flex-direction:column;gap:10px"></div>`);
      const S = [["Read ticket", "Outlook, cannot send, customer impact, \"urgent\""], ["Checked device in Intune", "LT-SAL-0211 · Microsoft 365 Apps updated 02:14 to Current Channel 2410 (Build 18129.20116)"], ["Searched similar tickets · 2 h", "<b>17 matches</b> · Mumbai 11, Pune 6 · all \"Outlook crashes on start\" · all on build 18129.20116"], ["Checked service health", "Exchange Online healthy · no Microsoft advisory yet"], ["Knowledge", "KB0013370 · Outlook crash after update: start with /safe, or roll back build"]];
      await wait(0.6);
      await D("snPanelAdd", `<div id="trs" style="display:flex;flex-direction:column;gap:10px"></div>`);
      for (const [a, b] of S) { await D("add", "#trs", `<div style="border:1px solid #DEE2E6;border-radius:8px;padding:10px 12px"><b>✓ ${a}</b>${why(b)}</div>`); await wait(1.2); }
      await D("focus", "#trs", { maxK: 1.9, fill: 0.9, pad: 8 });
    });
    await scene("s3", 8.6, async () => {
      await D("step", 3, "Fields filled, with reasons", ["ServiceNow", "Mova iO"]);
      await D("spotOff"); await D("snPanelOff"); await D("zoomOut"); await wait(0.6);
      for (const [k, v, c] of [["category", "Software", "96%"], ["subcategory", "Email client", "94%"], ["service", "Microsoft 365 email", "95%"], ["configurationitem", "Microsoft 365 Apps · LT-SAL-0211", "92%"], ["urgency", "1 - High · customer quotes blocked", "88%"], ["assignmentgroup", "EUC L2 · Microsoft 365", "93%"]]) { await D("snField", k, v, c); await wait(0.35); }
      await D("snField", "impact", `<span style="color:#B26A00">2 - Medium?</span>`, "71% · needs review");
      await D("snHl", 0, "Pending review"); await D("focus", "#snform", { maxK: 1.45, fill: 0.92, pad: 0 });
    });
    await scene("s4", 11, async () => {
      await D("step", 4, "Not sure? A person decides", ["ServiceNow"]);
      await D("zoomOut"); await D("snPanel", `<div style="font-size:13px;color:#5A6872">Needs your review · 1 field</div><div id="rvbox" style="border:2px solid #E0A800;border-radius:8px;padding:12px 14px;background:#FFFBEA"><b>Impact: 2 - Medium?</b> (71%)${why("This user alone is 3 - Low, but 17 similar tickets from 2 sites in 2 hours point to one cause affecting about 18 users. Suggest 2 - Medium and grouping under a parent.")}<div style="display:flex;gap:8px;margin-top:12px"><span class="btn p" id="rvok" style="background:#1B2B37;color:#fff;border-radius:6px;padding:7px 14px;font-weight:700">Confirm 2 - Medium</span><span class="btn">Keep 3 - Low</span></div></div>`);
      await wait(0.7); await D("focus", "#rvbox", { maxK: 1.9, pad: 10 }); await wait(3.6);
      await click("#rvok", 0.3); await D("snPanelAdd", `<div style="color:#1B7A43;font-weight:700">✓ Confirmed by Ravi Kumar (Service Desk) · 09:53</div>`);
      await wait(0.8); await D("spotOff"); await D("snPanelOff"); await D("zoomOut"); await wait(0.5);
      await D("snField", "impact", "2 - Medium", "confirmed by Ravi"); await D("snHl", 0, "2 - High", "#C2410C"); await D("snHl", 1, "In Progress"); await D("snHl", 4, "7h 58m left");
      await D("focus", "#snhl", { maxK: 1.7, pad: 6 });
    });
    await scene("s5", 11.6, async () => {
      await D("step", 5, "Eighteen tickets, one parent", ["ServiceNow", "Microsoft Teams"]);
      await D("snField", "parentincident", "INC0032115 · Outlook crashes on start after M365 Apps 2410 update (18 users)", "grouped");
      await D("snNote", "Mova iO Triage agent", "#E15AA5", "Grouped with 17 similar tickets under INC0032115. Workaround KB0013370 sent to caller (start Outlook with /safe). Suggested: pause Intune update ring 'Current Channel · Broad'.", "Work notes", 1);
      await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 }); await wait(3.4);
      await app("tms", { agent: "Mova iO Triage", me: "AM", items: [["Mova iO Triage", "Pattern: Outlook crash after update", 1], ["EUC team", "Patch Tuesday prep", 0]] });
      await D("tmCard", "pat", "Pattern found · 18 users · Outlook crashes on start", "All on Microsoft 365 Apps build 18129.20116 (installed overnight). Mumbai 11, Pune 6, plus 1 new.", [["Parent", "INC0032115"], ["Workaround", "KB0013370 sent to all 18 callers"], ["Suggest", "Pause ring 'Current Channel · Broad' in Intune"]], { buttons: ["Pause ring", "Not now", "Open parent"] });
      await wait(0.4); await D("focus", "#pat", { maxK: 1.75, pad: 10 });
    });
    await scene("s6", 9.7, async () => {
      await D("step", 6, "How triage is going today", ["ServiceNow"]);
      await app("page", { th: "snow", topnav: ["All", "Favorites", "History", "Workspaces"], title: "Mova iO triage · today", sub: "Service desk · all channels · 00:00 – 10:00", cols: "1fr 1fr 1fr",
        blocks: [{ t: "html", id: "k1", title: "Tickets triaged", html: `<div style="font-size:54px;font-weight:800">142</div>${why("avg 6 s from arrival")}` }, { t: "html", id: "k2", title: "Accepted as triaged", html: `<div style="font-size:54px;font-weight:800;color:#1B7A43">93%</div>${why("132 of 142, no field changed")}` }, { t: "html", id: "k3", title: "Sent for review", html: `<div style="font-size:54px;font-weight:800;color:#B26A00">10</div>${why("low-confidence fields, all checked by an analyst")}` },
          { t: "table", id: "tf", title: "Field accuracy (accepted without change)", w: 3, cols: ["Field", "Accuracy", "Most common correction"], rows: [["Category / subcategory", "95%", "Software → Hardware (docking stations)"], ["Configuration item", "92%", "Laptop → peripheral"], ["Impact", "84%", "Low → Medium when a pattern emerges later"], ["Urgency", "90%", "—"], ["Assignment group", "94%", "EUC L1 → EUC L2"]] }] });
      await D("focus", "#pgmain", { maxK: 1.3, fill: 0.95, pad: 0 });
    });
    await closing({ close: ["Every ticket triaged on arrival.", "Reasons shown for every field.", "People decide when it's not clear."], tag: ["Ticket triage, done by", "Mova iO agents."] });
  }
};
