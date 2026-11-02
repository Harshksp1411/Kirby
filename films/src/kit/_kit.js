  // ---------- generic DOM operations inside the app window
  all(sel) { return typeof sel === "string" ? $$(sel, W()) : [sel]; },
  show(kind, o) { W().innerHTML = SH[kind](o || {}); return true; },
  html(sel, h) { const e = D.el(sel); if (!e) return false; e.innerHTML = h; return true; },
  set(sel, h) { const e = D.el(sel); if (!e) return false; e.innerHTML = h; e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); return true; },
  add(sel, h, first) { const e = D.el(sel); if (!e) return false; const t = document.createElement("template"); t.innerHTML = h.trim(); const ns = [...t.content.children]; ns.forEach((n) => n.classList.add("new")); if (first) e.prepend(...ns); else e.append(...ns); return true; },
  cls(sel, add, rem) { D.all(sel).forEach((e) => { if (rem) e.classList.remove(...rem.split(" ")); if (add) e.classList.add(...add.split(" ")); }); return true; },
  css(sel, css) { D.all(sel).forEach((e) => (e.style.cssText += css)); return true; },
  flash(sel) { D.all(sel).forEach((e) => { e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); }); return true; },
  rm(sel) { D.all(sel).forEach((e) => e.remove()); return true; },
  type(sel, text, ms = 26) { const e = D.el(sel); if (!e) return false; e.textContent = ""; e.classList.add("typing"); let i = 0; const t = setInterval(() => { e.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); e.classList.remove("typing"); } }, ms); return true; },
  typeHtml(sel, html, ms = 14) { const e = D.el(sel); if (!e) return false; const tmp = document.createElement("div"); tmp.innerHTML = html; const full = tmp.innerHTML; let i = 0; e.classList.add("typing"); const t = setInterval(() => { i += 3; let s = full.slice(0, i); const lt = s.lastIndexOf("<"), gt = s.lastIndexOf(">"); if (lt > gt) { i = full.indexOf(">", i) + 1; s = full.slice(0, i); } e.innerHTML = s; if (i >= full.length) { clearInterval(t); e.classList.remove("typing"); } }, ms); return true; },
  num(sel, from, to, suf = "", ms = 1600, dec = 0) { const e = D.el(sel); if (!e) return false; const t0 = performance.now(); const f = (t) => { const p = Math.min(1, (t - t0) / ms), q = 1 - Math.pow(1 - p, 3); e.textContent = (from + (to - from) * q).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); return true; },
  bar(sel, pct, col) { const e = D.el(sel); if (!e) return false; e.style.width = pct + "%"; if (col) e.style.background = col; return true; },
  seq(steps) { steps.forEach(([ms, fn, ...a]) => setTimeout(() => D[fn](...a), ms)); return true; },
  popBelow(sel, html, id = "pop") { const a = D.el(sel); if (!a) return false; const rw = W().getBoundingClientRect(), ra = a.getBoundingClientRect(), k = cam.k; const d = document.createElement("div"); d.id = id; d.className = "new"; d.style.cssText = `position:absolute;z-index:20;left:${(ra.x - rw.x) / k}px;top:${(ra.bottom - rw.y) / k + 4}px`; d.innerHTML = html; W().firstElementChild.appendChild(d); return true; },
  // Copilot Studio activity map helpers (work with SH.copilot)
  csStep(i, state) { const n = $(`.node[data-i="${i}"]`, W()); if (!n) return false; n.classList.remove("run", "ok"); if (state === "run") { n.classList.add("run"); $(".st", n).textContent = "Running"; } else { n.classList.add("ok"); $(".st", n).textContent = "✓ " + n.dataset.d; } return true; },
  csDone() { const s = $("#csst", W()); s.textContent = "Complete"; s.style.background = "#DFF6DD"; s.style.color = "#107C10"; return true; },
  csTranscript(html) { const d = document.createElement("div"); d.className = "new"; d.style.cssText = "background:#EBF3FC;border-radius:6px;padding:10px 12px;margin-bottom:10px"; d.innerHTML = html; $("#cstr", W()).appendChild(d); return true; },
  csDetail(i, o) {
    const det = $("#csdet", W()); $$(".node", W()).forEach((x) => (x.style.outline = "")); const n = $(`.node[data-i="${i}"]`, W()); if (n) n.style.outline = "2px solid #0F6CBD";
    det.innerHTML = `<div style="width:440px;padding:16px 18px;font-size:13.5px"><div style="font-weight:700;font-size:15px">${o.title}</div><div style="color:#605E5C;margin:2px 0 12px">${o.sub}</div><div style="font-weight:600;margin-bottom:6px">Inputs</div><pre class="code" style="margin-bottom:12px">${o.inp}</pre><div style="font-weight:600;margin-bottom:6px">Outputs</div><pre class="code">${o.out}</pre><div style="margin-top:12px;color:#0F6CBD;font-weight:600">Show rationale</div></div>`;
    det.style.width = "440px"; return true;
  },
  // Teams approval countdown
  tmCountdown(n = 10) { const b = $("#apbar", W()); if (b) { b.style.transition = `width ${n}s linear`; b.style.width = "0%"; } const t = setInterval(() => { n--; const c = $("#apcd b", W()); if (c) c.textContent = n + " s"; if (n <= 0) clearInterval(t); }, 1000); window.__apT = t; return true; },
  tmApprove(who, after) { clearInterval(window.__apT); const b = $("#apbar", W()); if (b) { b.style.transition = "none"; b.style.width = "0%"; } const cd = $("#apcd", W()); if (cd) cd.innerHTML = `<b style='color:#107C10'>✓ Approved by ${who}</b>`; else { const d = document.createElement("div"); d.className = "new"; d.style.cssText = "margin:4px 18px 0;padding:10px 12px;background:#DFF6DD;border-radius:6px;font-size:13.5px"; d.innerHTML = `<b style='color:#107C10'>✓ Approved by ${who}</b>`; $("#apbtns", W()).before(d); } $("#apbtns", W()).innerHTML = `<span style="font-size:13.5px;color:#616161">${after}</span>`; return true; },
};

const AV = (n) => n.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
const SH = {
  // OpsRamp: o.nav, o.sub (html), o.body (html), o.drawer
  opsramp(o) {
    return `<div class="app or"><div class="top"><b>OpsRamp</b>${["Dashboards", "Infrastructure", "Command Center", "Automation", "Setup"].map((n) => `<span class="nav ${n === (o.nav || "Command Center") ? "on" : ""}">${n}</span>`).join("")}<span style="margin-left:auto;opacity:.85">Client: Global Operations</span><span style="width:30px;height:30px;border-radius:50%;background:#2BA4E0;display:inline-flex;align-items:center;justify-content:center;font-weight:700">PR</span></div>
      ${o.sub ? `<div class="sub">${o.sub}</div>` : ""}<div class="obody" style="padding:14px 18px">${o.body || ""}</div>${o.drawer ? `<div class="drawer" id="ordr"></div>` : ""}</div>`;
  },
  // ServiceNow: o.tab, o.ws, o.body
  snow(o) {
    return `<div class="app sn"><div class="un"><b style="font-size:17px">servicenow</b><span>All</span><span>Favorites</span><span>History</span><span>Workspaces</span><span class="pill" style="margin-left:40px">${o.ws || "Service Operations Workspace"}</span><span style="margin-left:auto;background:rgba(255,255,255,.12);border-radius:16px;padding:5px 160px 5px 14px;opacity:.8">Search</span><span style="width:30px;height:30px;border-radius:50%;background:#3E8E7E;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${o.me || "PR"}</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="rail"><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0"><div class="tabs">${(o.tabs || ["Home", "Incidents"]).map((t) => `<span>${t}</span>`).join("")}${o.tab ? `<span class="on" id="sntab">${o.tab}</span>` : ""}</div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;min-height:0;flex:1;position:relative">${o.body || ""}</div></div></div></div>`;
  },
  // Teams: o.view chat|channel, o.items [[name, preview, on]], o.title, o.agent (bool: title is an agent), o.tab, o.channel
  teams(o) {
    const isA = (n) => /^Mova/.test(n);
    const av = (n, s = "") => `<span class="av ${isA(n) ? "mv" : ""}" style="${isA(n) ? "" : "background:" + (o.colors && o.colors[n] || "#6264A7")};${s}">${isA(n) ? "M" : AV(n)}</span>`;
    const chat = (o.view || "chat") === "chat";
    return `<div class="app tm"><div class="tb"><span style="position:absolute;left:18px;font-weight:600;color:#424242">Microsoft Teams</span><span class="s">Search</span><span class="av" style="position:absolute;right:16px;width:28px;height:28px;background:#C4314B;font-size:11px">${o.me || "PR"}</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="ab">${["Activity", "Chat", "Teams", "Calendar", "Calls", "OneDrive", "Apps"].map((a) => `<div class="${(chat && a === "Chat") || (!chat && a === "Teams") ? "on" : ""}"><i></i>${a}</div>`).join("")}</div>
      <div class="list"><div style="font-weight:700;font-size:16px;padding:4px 8px 12px">${chat ? "Chat" : "Teams"}</div>${chat ? (o.items || []).map(([n, p, on]) => `<div class="it ${on ? "on" : ""}">${av(n)}<div style="min-width:0"><div style="font-weight:${on ? 700 : 600}">${n}</div><div style="color:#616161;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p}</div></div></div>`).join("") : `<div class="it"><span class="av" style="background:#4E3047;border-radius:6px">${AV(o.team || "IT Operations")}</span><b>${o.team || "IT Operations"}</b></div><div style="padding:2px 0 0 52px;line-height:2;color:#424242">${(o.channels || ["General", "Major incidents", "Site updates", "NOC handover"]).map((c) => c === o.channel ? `<b style="color:#5B5FC7">${c}</b>` : c).join("<br>")}</div>`}</div>
      <div style="flex:1;display:flex;flex-direction:column;background:#fff;min-width:0"><div style="height:58px;border-bottom:1px solid #E0E0E0;display:flex;align-items:center;gap:12px;padding:0 20px">${chat ? av(o.title) : `<span class="av" style="background:#4E3047;border-radius:6px">${AV(o.team || "IT Operations")}</span>`}<b style="font-size:16px">${chat ? o.title : (o.team || "IT Operations") + " › " + o.channel}</b><span style="margin-left:18px;font-weight:600;border-bottom:3px solid #5B5FC7;padding:18px 0 15px">${chat ? "Chat" : "Posts"}</span><span style="color:#616161">${chat ? "About" : "Files"}</span></div>
      <div id="tmmsgs" style="flex:1;padding:22px 30px;display:flex;flex-direction:column;gap:18px;overflow:hidden;background:#F5F5F5"></div>
      <div style="margin:0 30px 18px;border:1px solid #E0E0E0;border-radius:6px;padding:12px 14px;color:#8A8886;background:#fff;font-size:14px" id="tmcompose">Type a message</div></div></div></div>`;
  },
  // Copilot Studio activity: o.agent, o.run, o.payload, o.nodes [[title, kind, color, dur]]
  copilot(o) {
    const N = o.nodes, pos = (i) => [40 + (i % 2) * 340, 24 + i * (N.length > 10 ? 58 : 66)];
    let svg = `<svg style="position:absolute;inset:0" width="900" height="800">`; for (let i = 1; i < N.length; i++) { const [x1, y1] = pos(i - 1), [x2, y2] = pos(i); svg += `<path d="M${x1 + 150} ${y1 + 52} C ${x1 + 150} ${y1 + 62}, ${x2 + 150} ${y2 - 10}, ${x2 + 150} ${y2}" stroke="#C8C6C4" stroke-width="2" fill="none"/>`; } svg += `</svg>`;
    return `<div class="app cs"><div class="hd"><b>Copilot Studio</b><span style="color:#605E5C">›</span><span>${o.agent}</span><span style="margin-left:auto;border:1px solid #D1D1D1;border-radius:4px;padding:5px 12px;color:#605E5C">Environment: Movate Demo (default)</span><span style="background:#0F6CBD;color:#fff;border-radius:4px;padding:6px 14px;font-weight:600">Publish</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="nav"><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0"><div class="tabs">${["Overview", "Knowledge", "Tools", "Agents", "Topics", "Activity", "Analytics", "Channels"].map((t) => `<span class="${t === "Activity" ? "on" : ""}">${t}</span>`).join("")}</div>
      <div style="padding:12px 24px;display:flex;align-items:center;gap:14px;font-size:14px;border-bottom:1px solid #EDEBE9;background:#fff"><span style="color:#605E5C">← Back</span><b>${o.run}</b><span id="csst" style="border-radius:12px;padding:2px 10px;font-size:12.5px;font-weight:600;background:#EFF6FC;color:#0F6CBD">In progress</span><span style="margin-left:auto;color:#605E5C">View: Transcript + Map view</span></div>
      <div style="flex:1;display:flex;min-height:0"><div style="width:400px;border-right:1px solid #E1DFDD;padding:16px 18px;background:#fff;font-size:13.5px;overflow:hidden" id="cstr"><div style="font-weight:600;margin-bottom:10px">Transcript</div><div style="background:#F3F2F1;border-radius:6px;padding:10px 12px;margin-bottom:10px"><div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">${o.payloadFrom || "Trigger payload"}</div><code style="font-size:12px;white-space:pre">${o.payload}</code></div></div>
      <div style="flex:1;position:relative;background:#FAF9F8;background-image:radial-gradient(#E1DFDD 1px,transparent 1px);background-size:18px 18px;overflow:hidden" id="csmap">${svg}${N.map(([t, k, c, d], i) => { const [x, y] = pos(i); return `<div class="node" data-i="${i}" data-d="${d}" style="left:${x}px;top:${y}px"><div class="t"><span class="ti" style="background:${c}">${t[0]}</span>${t}<span class="st">Pending</span></div><div class="k">${k}</div></div>`; }).join("")}</div><div id="csdet" style="width:0;transition:width .5s;overflow:hidden;background:#fff;border-left:1px solid #E1DFDD"></div></div></div></div></div>`;
  },
  // vSphere Client: o.tree [[label, depth, color, on]], o.name, o.icon, o.tabs, o.tab, o.body, o.tasks (rows html)
  vsphere(o) {
    return `<div class="app vc"><div class="hd"><span style="font-size:18px">≡</span><b style="font-weight:600">vSphere Client</b><span class="srch">Search in all environments</span><span style="margin-left:auto;opacity:.85">Administrator@VSPHERE.LOCAL ▾</span><span style="opacity:.7">?</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="tree"><div class="ti"><i class="on"></i><i></i><i></i><i></i></div>${o.tree.map(([l, d, c, on]) => `<div class="n ${on ? "on" : ""}" style="padding-left:${12 + d * 18}px"><span style="color:#8DA2AE;font-size:10px">${d < 3 ? "▾" : ""}</span><span class="ico" style="background:${c}"></span>${l}</div>`).join("")}</div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0"><div class="obj"><div class="nm"><span class="ico" style="width:22px;height:18px;background:${o.icon || "#3E86A8"}"></span><span id="vcname">${o.name}</span><span class="acts"><span>▶</span><span>■</span><span>⟳</span><span>⧉</span></span><span class="btn">ACTIONS ▾</span></div><div class="tabs">${(o.tabs || ["Summary", "Monitor", "Configure", "Permissions", "Datastores", "Networks", "Snapshots", "Updates"]).map((t) => `<span class="${t === (o.tab || "Summary") ? "on" : ""}">${t}</span>`).join("")}</div></div>
      <div style="flex:1;min-height:0;overflow:hidden;position:relative" id="vcbody">${o.body || ""}</div>
      <div class="rt"><div class="tb"><span class="on">Recent Tasks</span><span>Alarms</span></div><div style="overflow:hidden;flex:1"><table><thead><tr><th>Task Name</th><th>Target</th><th>Status</th><th>Details</th><th>Initiator</th><th>Queued For</th><th>Start Time</th><th>Completion Time</th></tr></thead><tbody id="vctasks">${o.tasks || ""}</tbody></table></div></div></div></div></div>`;
  },
  // Veeam B&R console: o.tree [[label, depth, on]], o.nav, o.body
  veeam(o) {
    return `<div class="app vb"><div class="tt"><span style="width:16px;height:16px;background:#00B336;border-radius:3px"></span><span>≡</span><span style="margin:0 auto;color:#444">Veeam Backup and Replication</span><span style="color:#888">— ☐ ✕</span></div>
      <div class="rtabs"><span>≡</span><span class="on">Home</span><span>View</span>${o.ctx ? `<span style="background:#E6F6EA;color:#00862A;font-weight:600">${o.ctx}</span>` : ""}</div>
      <div class="rib">${(o.rib || ["Backup Job", "Replication Job", "CDP Policy", "Backup Copy", "Copy Job", "Restore", "Import Backup", "Export Backup"]).map((b, i) => `<div class="${o.ribOff && o.ribOff.includes(i) ? "off" : ""}"><i></i>${b}</div>`).join("")}</div>
      <div style="flex:1;display:flex;min-height:0"><div class="left"><div class="tr">${o.tree.map(([l, d, on]) => `<div class="${on ? "on" : ""}" style="padding-left:${12 + d * 16}px">${d < 2 ? "▾ " : ""}${l}</div>`).join("")}</div><div class="nv">${["Home", "Inventory", "Backup Infrastructure", "Storage Infrastructure", "Tape Infrastructure", "Files", "History"].map((n) => `<div class="${n === (o.nav || "Home") ? "on" : ""}"><i></i>${n}</div>`).join("")}</div></div>
      <div style="flex:1;min-width:0;position:relative;overflow:hidden" id="vbbody">${o.body || ""}</div></div>
      <div style="height:26px;border-top:1px solid #D9D9D9;font-size:12px;color:#555;display:flex;align-items:center;padding:0 12px">${o.status || "1 job selected"}</div></div>`;
  },
  // Microsoft admin portals: o.product, o.nav [[label, kind sec|sub|'' , on]], o.body
  ms(o) {
    return `<div class="app ms"><div class="hd"><span class="waf"></span><b style="font-weight:600">${o.product}</b><span class="srch">Search</span><span style="margin-left:auto;display:flex;gap:16px;align-items:center;opacity:.9"><span>🔔</span><span>⚙</span><span>?</span><span style="width:30px;height:30px;border-radius:50%;background:#8764B8;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${o.me || "SA"}</span></span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="nav">${o.nav.map(([l, k, on]) => `<div class="${k || ""} ${on ? "on" : ""}">${k === "sub" ? "" : "<i></i>"}${l}</div>`).join("")}</div>
      <div style="flex:1;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column" id="msbody">${o.body || ""}</div></div></div>`;
  },
  // generic web portal: o.brand, o.color, o.links, o.right, o.body
  web(o) {
    return `<div class="app wp"><div class="hd" style="background:${o.color || "#2D3142"}"><b style="font-size:18px">${o.brand}</b>${(o.links || []).map((l) => `<span style="opacity:.8">${l}</span>`).join("")}<span style="margin-left:auto;opacity:.85">${o.right || ""}</span></div><div style="flex:1;min-height:0;position:relative;overflow:hidden" id="wpbody">${o.body || ""}</div></div>`;
  },
  // Outlook on the web: o.folders, o.list [[from, subj, prev, on]], o.body
  outlook(o) {
    return `<div class="app ol"><div class="hd"><span class="waf" style="width:18px;height:18px;background-image:radial-gradient(#fff 1.4px,transparent 1.6px);background-size:6px 6px"></span><b style="font-weight:600">Outlook</b><span style="margin-left:80px;width:480px;height:30px;border-radius:4px;background:#fff;color:#707070;display:flex;align-items:center;padding:0 12px;font-size:13px">Search</span><span style="margin-left:auto;width:30px;height:30px;border-radius:50%;background:#C4314B;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${o.me || "AN"}</span></div>
      <div class="rib">${(o.rib || ["New mail", "Delete", "Archive", "Report", "Sweep", "Move to", "Reply all"]).map((b) => `<span class="${b === o.ribOn ? "on" : ""}" ${b === "Report" ? 'id="olreport"' : ""}>${b}${b === "Report" ? " ▾" : ""}</span>`).join("")}</div>
      <div style="flex:1;display:flex;min-height:0"><div style="width:220px;background:#fff;border-right:1px solid #E0E0E0;padding:10px 0;font-size:13.5px">${(o.folders || ["Inbox", "Junk Email", "Drafts", "Sent Items", "Deleted Items", "Archive"]).map((f, i) => `<div style="padding:7px 18px;${i === 0 ? "background:#EBF3FC;font-weight:600" : ""}">${f}</div>`).join("")}</div>
      <div style="width:420px;background:#fff;border-right:1px solid #E0E0E0;font-size:13.5px" id="ollist">${(o.list || []).map(([f, s, p, on], i) => `<div id="olm${i}" style="padding:10px 16px;border-bottom:1px solid #F0F0F0;${on ? "background:#EBF3FC;border-left:3px solid #0F6CBD" : ""}"><div style="font-weight:${on ? 700 : 600}">${f}</div><div style="color:${on ? "#0F6CBD" : "#242424"}">${s}</div><div style="color:#616161;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p}</div></div>`).join("")}</div>
      <div style="flex:1;min-width:0;position:relative;overflow:hidden;background:#fff" id="olbody">${o.body || ""}</div></div></div>`;
  },
};
