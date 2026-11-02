// ServiceNow film 3: auto routing to the right group and person, with reasons; a hand-routed mis-assignment caught.
const why = (x) => `<div style="font-size:12.5px;color:#5A6872;margin-top:3px">${x}</div>`;
const Q = [["INC0032131", "Pune meeting rooms can't start Teams calls", "Hardware · Meeting room", "2 - High", "(empty)", "(empty)", "09:02"], ["INC0032130", "New starter laptop for Monday (Kiran Desai)", "Request · Hardware", "4 - Low", "(empty)", "(empty)", "09:01"], ["INC0032129", "Can't access 'Plant Quality' SharePoint site", "Access · SharePoint", "3 - Moderate", "Network Operations", "(empty)", "08:58"], ["INC0032127", "Excel add-in missing after update", "Software · Office", "3 - Moderate", "(empty)", "(empty)", "08:57"], ["INC0032126", "Badge printer offline · Halol gate", "Hardware · Printer", "3 - Moderate", "(empty)", "(empty)", "08:55"], ["INC0032125", "MES client slow on Line 2 terminals", "Software · MES", "2 - High", "(empty)", "(empty)", "08:52"], ["INC0032124", "Password reset loop on mobile Outlook", "Access · Identity", "3 - Moderate", "(empty)", "(empty)", "08:50"]];
const queue = { title: "Service desk · unassigned", sub: "Triaged by Mova iO · waiting for assignment", cols: ["Number", "Short description", "Category", "Priority", "Assignment group", "Assigned to", "Created"], rows: Q };
module.exports = {
  page: "kit.html", vo: "vo_sn3",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["Wrong team. Reassigned.", "Wrong team again.", "Meanwhile, someone is still waiting."], stat: [40, "~", " min", "of extra lost time for the employee each time a ticket is reassigned", "Source: HappySignals, IT experience benchmark data"], intro: ["How <span class=\"y\">Mova iO</span> routes every ticket", "to the right person, first time."], tools: ["ServiceNow", "Microsoft Teams", "Workforce calendar"] });

    await scene("s1", 6.6, async () => {
      await D("step", 1, "A full queue at nine", ["ServiceNow"]);
      await app("snList", queue);
      await D("focus", "#snlb", { maxK: 1.35, fill: 0.95, pad: 10 });
    });
    await scene("s2", 18, async () => {
      await D("step", 2, "The right team, not the keyword", ["ServiceNow", "Mova iO"]);
      await app("sn", { num: "INC0032131", title: "Pune meeting rooms can't start Teams calls", prio: "2 - High", state: "New", assigned: "(empty)", sla: "3h 58m left", assist: true,
        fields: [["Caller", "Facilities Pune"], ["Channel", "Email"], ["Category", "Hardware"], ["Subcategory", "Meeting room"], ["Configuration item", "PUN-MR-Board-03, PUN-MR-Board-04"], ["Impact", "2 - Medium"], ["Assignment group", ""], ["Assigned to", ""]],
        short: "Pune meeting rooms can't start Teams calls", desc: "Both board rooms on 3F show 'Can't connect' when starting a Teams meeting since 08:40. Laptops in the same room work." });
      await wait(0.6); await D("snPanel", `<div style="font-size:13px;color:#5A6872">Routing · INC0032131</div><div id="rt1" style="display:flex;flex-direction:column;gap:10px"></div>`); await wait(0.7);
      const S = [["Keyword rule says", "\"can't connect\" → Network Operations <span style='color:#B26A00'>(ignored)</span>"], ["CMDB support group", "PUN-MR-Board-03/04 → <b>Collaboration · Meeting rooms</b>"], ["Similar tickets · 30 days", "9 of 9 resolved by Collaboration (Teams Rooms device account expired twice)"], ["Laptops in the room work", "Network is fine at the site · rules out Network Operations"], ["Decision", "<b>Collaboration · Meeting rooms</b> · confidence 94%"]];
      for (const [a, b] of S) { await D("add", "#rt1", `<div style="border:1px solid #DEE2E6;border-radius:8px;padding:10px 12px"><b>${a}</b>${why(b)}</div>`); await wait(1.5); }
      await D("focus", "#rt1", { maxK: 1.9, fill: 0.9, pad: 8 }); await wait(3);
      await D("snField", "assignmentgroup", "Collaboration · Meeting rooms", "94%");
    });
    await scene("s3", 11, async () => {
      await D("step", 3, "The right person, with reasons", ["ServiceNow", "Workforce calendar", "Mova iO"]);
      await D("spotOff"); await D("snPanelOff"); await D("zoomOut"); await wait(0.7);
      await D("snPanel", `<div style="font-size:13px;color:#5A6872">Best person · Collaboration · Meeting rooms</div><table id="cand" style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>${["Engineer", "On shift", "Skill", "Location today", "Open", "Fit"].map((h) => `<th style="text-align:left;padding:7px 6px;border-bottom:1px solid #DEE2E6;color:#5A6872">${h}</th>`).join("")}</tr></thead><tbody>${[["Priya Kulkarni", "✓", "Teams Rooms (certified)", "Pune office", "3", "<b style='color:#1B7A43'>96</b>"], ["Aman Shah", "✓", "Teams Rooms", "Mumbai", "7", "71"], ["Joseph D'Souza", "Off at 10:00", "AV systems", "Pune (remote)", "2", "64"], ["Rina Paul", "✓", "Teams admin", "Hyderabad", "9", "58"]].map((r, i) => `<tr style="${i ? "" : "background:#EAF6EE"}">${r.map((c) => `<td style="padding:8px 6px;border-bottom:1px solid #EEF0F2">${c}</td>`).join("")}</tr>`).join("")}</tbody></table><div id="whyp" style="font-size:13px;line-height:1.5;background:#F7F8F9;border-radius:8px;padding:10px 12px"><b>Why Priya:</b> on shift until 18:00, certified on Teams Rooms, physically in Pune today (can walk to 3F), lightest queue of the qualified engineers.</div>`);
      await wait(0.7); await D("focus", "#cand", { maxK: 2, fill: 0.9, pad: 8 }); await wait(3); await D("focus", "#whyp", { maxK: 2, pad: 8 }); await wait(2.4);
      await D("spotOff"); await D("snPanelOff"); await D("zoomOut"); await wait(0.6);
      await D("snField", "assignedto", "Priya Kulkarni", "fit 96"); await D("snHl", 2, "Priya Kulkarni"); await D("snHl", 1, "Assigned");
      await D("snNote", "Mova iO Routing agent", "#E15AA5", "Routed to Collaboration · Meeting rooms (CMDB support group; 9/9 similar resolved there). Assigned to Priya Kulkarni: on shift, certified, on site in Pune, 3 open tickets.", "Work notes", 0);
      await D("focus", "#snform", { maxK: 1.45, fill: 0.92, pad: 0 });
    });
    await scene("s4", 5.6, async () => {
      await D("step", 4, "Accepted in one tap", ["Microsoft Teams"]);
      await app("tms", { agent: "Mova iO Service Desk", me: "PK", items: [["Mova iO Service Desk", "New ticket for you · INC0032131", 1], ["Pune office", "Lunch order", 0]] });
      await D("tmCard", "ac", "New ticket for you · INC0032131 · P2", "Both 3F board rooms in Pune can't start Teams calls since 08:40; laptops in the room work. Last 2 times this was the room device account password expiring.", [["Rooms", "PUN-MR-Board-03, 04 (3rd floor)"], ["Try first", "KB0012655 · reset Teams Rooms resource account"]], { buttons: ["Accept", "Hand back", "Open ticket"] });
      await wait(0.4); await D("focus", "#ac", { maxK: 1.75, pad: 10 }); await wait(1.4);
      await click("#apok", 0); await D("tmApproveG", "Priya Kulkarni", "Accepted 09:03 · on my way to 3F");
    });
    await scene("s5", 13.4, async () => {
      await D("step", 5, "A wrong route caught early", ["ServiceNow", "Microsoft Teams"]);
      await app("snList", queue);
      await D("cell", "snlb", 0, 4, "Collaboration · Meeting rooms"); await D("cell", "snlb", 0, 5, "Priya Kulkarni");
      await D("rowSel", "snlb", 2); await D("css", "#snlb tr:nth-child(3) td", "background:#FFF4D6");
      await D("focus", "#snlb tr:nth-child(3)", { maxK: 1.6, pad: 6 }); await wait(4.6);
      await app("tms", { agent: "Mova iO Service Desk", me: "MS", items: [["Mova iO Service Desk", "Route check · INC0032129", 1], ["Queue managers", "Weekly review", 0]] });
      await D("tmCard", "rc", "Route check · INC0032129", "Assigned by hand to Network Operations, but this looks like a permissions problem, not network.", [["Evidence", "User reaches other SharePoint sites; 'Access denied' page"], ["Site owner", "Removed 'Plant QA' group yesterday (audit log)"], ["Suggest", "M365 Access · SharePoint"]], { buttons: ["Move it", "Leave with Network", "Open ticket"] });
      await wait(0.4); await D("focus", "#rc", { maxK: 1.75, pad: 10 }); await wait(2.4);
      await click("#apok", 0); await D("tmApproveG", "Meera S. (Queue manager)", "Moved to M365 Access · 0 reassignments");
    });
    await scene("s6", 7, async () => {
      await D("step", 6, "Fewer bounces, faster fixes", ["ServiceNow"]);
      await app("page", { th: "snow", topnav: ["All", "Favorites", "History", "Workspaces"], title: "Routing · last 30 days", sub: "Service desk and resolver groups · before vs with Mova iO routing (sample)", cols: "1fr 1fr 1fr",
        blocks: [{ t: "html", id: "m1", title: "Tickets reassigned at least once", html: `<div style="font-size:50px;font-weight:800"><span style="color:#8A949E;font-size:30px;text-decoration:line-through">31%</span> <span style="color:#1B7A43">9%</span></div>` }, { t: "html", id: "m2", title: "Time to assign", html: `<div style="font-size:50px;font-weight:800"><span style="color:#8A949E;font-size:30px;text-decoration:line-through">47 min</span> <span style="color:#1B7A43">6 s</span></div>` }, { t: "html", id: "m3", title: "Routing accepted without change", html: `<div style="font-size:50px;font-weight:800;color:#1B7A43">92%</div>` },
          { t: "table", id: "rg", title: "Top corrections (where people changed the route)", w: 3, cols: ["From", "To", "Count", "What the agent learned"], rows: [["EUC L2", "Field Services", "14", "Docking stations at plants need a site visit"], ["Network Operations", "M365 Access", "9", "'Can't access' + SharePoint is usually permissions"], ["Service Desk", "Plant IT", "6", "MES terminals belong to Plant IT"]] }] });
      await D("focus", "#pgmain", { maxK: 1.3, fill: 0.95, pad: 0 });
    });
    await closing({ close: ["The right team, the right person, first time.", "Reasons recorded for every choice.", "Fewer bounces, faster fixes."], tag: ["Ticket routing, done by", "Mova iO agents."] });
  }
};
