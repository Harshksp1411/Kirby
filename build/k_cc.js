// ---- Command Center and Site 360 enrichment: extra live panels drawn from the hub's own state.
// Command Center: noise funnel, MTTx breakdown, agents at work, site x service health matrix, changes timeline,
// SLA at risk, capacity forecast, operational hygiene, on shift now.
// Site 360: 24-hour layer timeline, floor plan, Wi-Fi experience, WAN by application, changes, protection,
// power and environment, asset lifecycle, contacts and contracts.
const KCC = (() => {
  const C = { ok: "#1B7A43", warn: "#E08A1E", bad: "#C23A26", maint: "#8E9099", plum: "#4E3047", mag: "#B83A80", ink: "#1F2124", muted: "#5E6168", line: "#E6E1E5", soft: "#F7F4F6", blue: "#8E4A86", pink: "#E15AA5", orange: "#F39237", yellow: "#D9A21B" };
  const S = () => W.get();
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const kx = (v) => `data-kx='${esc(JSON.stringify(v))}' data-kx-force="1"`;
  const hm = (ts) => { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const rnd = (seed) => { let h = 2166136261; for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; };
  const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";
  const pill = (t, col) => `<span class="kcc-pill" style="color:${col};background:${col}14;border-color:${col}40">${esc(t)}</span>`;
  const card = (id, title, sub, body, extra = "", span = "") => `<section class="kcc-card" id="${id}" style="${span}"><header><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ""}</div>${extra}</header>${body}</section>`;
  const bar = (v, col, h = 8) => `<div class="kcc-bar" style="height:${h}px"><i style="width:${Math.max(0, Math.min(100, v))}%;background:${col}"></i></div>`;
  const spark = (vals, col, w = 90, h = 24, max) => { const m = max || Math.max(...vals, 1); const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - (v / m) * (h - 2) - 1}`).join(" "); return `<svg width="${w}" height="${h}" class="kcc-spark"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.6"/></svg>`; };

  const css = `
.kcc-wrap{display:flex;flex-direction:column;gap:16px;margin:4px 0 16px}
.kcc-h2{display:flex;align-items:baseline;gap:10px;margin:6px 2px -4px}.kcc-h2 b{font-size:17px;font-weight:650;color:${C.ink}}.kcc-h2 span{font-size:12.5px;color:${C.muted}}
.kcc-grid{display:grid;gap:16px}.kcc-g3{grid-template-columns:repeat(3,minmax(0,1fr))}.kcc-g2{grid-template-columns:repeat(2,minmax(0,1fr))}.kcc-g21{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}
.kcc-card{background:#fff;border:1px solid ${C.line};border-radius:16px;padding:16px 18px;min-width:0;font-size:13px;color:${C.ink}}
.kcc-card header{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.kcc-card header>div{flex:1;min-width:0}
.kcc-card h3{margin:0;font-size:15px;font-weight:650}.kcc-card header p{margin:2px 0 0;font-size:12.5px;color:${C.muted}}
.kcc-pill{display:inline-flex;align-items:center;gap:5px;border:1px solid;border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:600;white-space:nowrap}
.kcc-bar{background:#EFEAEE;border-radius:6px;overflow:hidden;flex:1}.kcc-bar i{display:block;height:100%;border-radius:6px;transition:width .8s}
.kcc-row{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #F2EEF1}.kcc-row:last-child{border-bottom:0}
.kcc-muted{color:${C.muted}}.kcc-num{font-variant-numeric:tabular-nums}
.kcc-kpis{display:flex;gap:10px;margin-bottom:12px}.kcc-kpi{flex:1;background:${C.soft};border-radius:10px;padding:8px 10px}.kcc-kpi b{display:block;font-size:20px;font-weight:650}.kcc-kpi span{font-size:11.5px;color:${C.muted}}
.kcc-mx{width:100%;border-collapse:separate;border-spacing:3px;font-size:12px}.kcc-mx th{font-weight:600;color:${C.muted};text-align:center;padding:2px 4px;white-space:nowrap}.kcc-mx th.l{text-align:left}
.kcc-mx td.c{height:22px;border-radius:5px;cursor:pointer;text-align:center;font-size:10.5px;font-weight:700;color:#fff}.kcc-mx td.c:hover{outline:2px solid ${C.mag};outline-offset:1px}
.kcc-mx td.s{white-space:nowrap;padding-right:8px;cursor:pointer}.kcc-mx td.s:hover{color:${C.mag}}.kcc-mx tr.r td{padding-top:8px;font-size:11px;font-weight:700;color:${C.muted};letter-spacing:.04em;text-transform:uppercase}
.kcc-legend{display:flex;gap:14px;font-size:12px;color:${C.muted};flex-wrap:wrap}.kcc-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.kcc-click{cursor:pointer}.kcc-click:hover{background:#FBF6FA}
.kcc-tl{position:relative}.kcc-tl .lane{display:flex;align-items:center;gap:8px;height:24px}.kcc-tl .lane>span{width:120px;flex:none;font-size:12px;color:${C.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kcc-tl .cells{flex:1;display:flex;gap:1px;height:16px}.kcc-tl .cells i{flex:1;border-radius:2px}
.kcc-axis{display:flex;justify-content:space-between;margin-left:128px;font-size:11px;color:${C.muted};margin-top:4px}
.kcc-chip{display:inline-block;background:${C.soft};border-radius:6px;padding:2px 7px;margin:2px 4px 2px 0;font-size:11.5px}
.kcc-fp{width:100%;height:auto;display:block}
.kcc-fp .dev{cursor:pointer}.kcc-fp .dev:hover circle,.kcc-fp .dev:hover rect{stroke:${C.mag};stroke-width:2.5}
@media (max-width:1200px){.kcc-g3{grid-template-columns:repeat(2,minmax(0,1fr))}.kcc-g21{grid-template-columns:1fr}}
`;

  // ---------- shared helpers on hub state
  const LAYER_OF = { "carrier-down": ["Network", "Voice"], "edge-hw": ["Network", "Voice"], onlte: ["Network"], jitter: ["Voice", "Network"], switch: ["Network"], esxi: ["Servers", "Storage"], psu: ["Servers"], temp: ["Servers"], drive: ["Storage"], vmdisk: ["Storage"], qnap: ["Storage"], ws: ["PCs"], spooler: ["PCs"], intune: ["PCs"], power: ["Power", "Network", "Servers", "PCs", "Voice"] };
  const COLS = ["Network", "Voice", "PCs", "Servers", "Storage", "Identity", "Power", "Security"];
  const cellState = (c, col) => {
    if (c.status === "maintenance") return "maint";
    const k = c.issue && c.issue.kind, hit = (LAYER_OF[k] || []).indexOf(col);
    if (hit >= 0) return c.status === "down" && (hit === 0 || k === "power" || k === "carrier-down" || k === "edge-hw") ? "bad" : "warn";
    return "ok";
  };
  const ccol = (st) => ({ ok: C.ok, warn: C.warn, bad: C.bad, maint: C.maint }[st]);
  const siteOpen = (c) => !["Closed", "Resolved", "Cancelled"].includes(c.state);

  // ================= COMMAND CENTER =================
  function funnel() {
    const f = S().funnel || {}, raw = f.raw || 1;
    const steps = [["Raw events", raw, C.maint, "Every signal from OpsRamp, VeloCloud, vCenter, iLO, carriers"], ["After auto-clear", raw - (f.autoCleared || 0), "#A88AA0", `${f.autoCleared || 0} flaps and self-healing blips cleared`], ["Deduplicated alerts", f.digest || 0, C.blue, "Duplicates and repeats folded"], ["Correlated alerts", f.correlatedAlerts || 0, C.pink, "Linked by topology, time, carrier, change"], ["Alert groups", f.groups || 0, C.orange, "One group per real problem"], ["Incidents", f.incidents || 0, C.mag, "Raised in ServiceNow"], ["Resolved without a person", f.autoResolved || 0, C.ok, "Runbooks with verification"]];
    const comp = 1 - (f.incidents || 0) / raw;
    const meth = Object.entries(S().corrMethods || {}).map(([k, v]) => `<span class="kcc-chip">${esc(k)} <b>${v}</b></span>`).join("");
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${pct(comp, 1)}</b><span>event-to-incident compression</span></div><div class="kcc-kpi"><b>${f.contained || 0} / ${f.calls || 0}</b><span>calls answered by the voice agent</span></div></div>
      ${steps.map(([l, v, col, d], i) => `<div class="kcc-row kcc-click" ${kx(i >= 5 ? { t: "incidents", f: "open", label: "Open incidents" } : { t: "alerts", label: l })} title="${esc(d)}"><span style="width:150px;flex:none">${l}</span><div class="kcc-bar" style="height:14px"><i style="width:${Math.max(2, (v / raw) * 100)}%;background:${col}"></i></div><b class="kcc-num" style="width:40px;text-align:right">${v}</b></div>`).join("")}
      <div style="margin-top:10px" class="kcc-muted">Correlation methods today</div><div>${meth}</div>`;
    return card("kcc-funnel", "Noise reduction, today", "From raw events to the incidents people work on", body, pill("Live", C.ok));
  }
  function mttx() {
    const r = rnd("mttx"), days = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Today"];
    const data = days.map((d, i) => { const k = 1 - i * 0.07; return { d, det: +(2 + r() * 2 * k).toFixed(1), ack: +(1 + r() * 3 * k).toFixed(1), res: Math.round((40 + r() * 25) * k - (i === 6 ? 14 : 0)) }; });
    const max = Math.max(...data.map((x) => x.det + x.ack + x.res)), H = 120;
    const bars = data.map((x, i) => { const tot = x.det + x.ack + x.res, h = (v) => (v / max) * H; return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px" title="${x.d}: detect ${x.det} min · acknowledge ${x.ack} min · resolve ${x.res} min"><span class="kcc-num" style="font-size:11px;color:${C.muted}">${Math.round(tot)}</span><div style="width:60%;display:flex;flex-direction:column-reverse;height:${H}px;justify-content:flex-start"><i style="height:${h(x.det)}px;background:${C.maint};border-radius:0 0 4px 4px"></i><i style="height:${h(x.ack)}px;background:${C.orange}"></i><i style="height:${h(x.res)}px;background:${i === 6 ? C.mag : C.blue};border-radius:4px 4px 0 0"></i></div><span style="font-size:11.5px;${i === 6 ? "font-weight:700" : "color:" + C.muted}">${x.d}</span></div>`; }).join("");
    const rd = S().resolvedDurations || []; if (rd.length) data[6].res = Math.round(rd.reduce((a, b) => a + b, 0) / rd.length);
    const t = data[6];
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${t.det} min</b><span>time to detect</span></div><div class="kcc-kpi"><b>${t.ack} min</b><span>time to acknowledge</span></div><div class="kcc-kpi"><b>${t.res} min</b><span>time to resolve</span></div></div>
      <div style="display:flex;gap:4px;align-items:flex-end">${bars}</div>
      <div class="kcc-legend" style="margin-top:8px"><span><i style="background:${C.maint}"></i>Detect</span><span><i style="background:${C.orange}"></i>Acknowledge</span><span><i style="background:${C.blue}"></i>Resolve</span><span style="margin-left:auto"><b style="color:${C.ok}">82%</b> resolved within 1 hour</span></div>`;
    return card("kcc-mttx", "Mean time to detect, acknowledge, resolve", "Minutes per incident, last 7 days", body);
  }
  const AGENT_NAMES = { intake: "Intake", noise: "Noise filter", correlation: "Correlation", impact: "Impact", diagnosis: "Diagnosis", runbook: "Runbook", verification: "Verification", ticket: "Ticketing", vendor: "Vendor", comms: "Comms", dispatch: "Dispatch", prediction: "Prediction", knowledge: "Knowledge", readiness: "Readiness" };
  function agents() {
    const a = (S().agents || []).slice().sort((x, y) => y.actionsToday - x.actionsToday), tot = a.reduce((s, x) => s + x.actionsToday, 0), max = Math.max(...a.map((x) => x.actionsToday), 1), now = S().now;
    const rows = a.slice(0, 9).map((x) => { const busy = x.workingUntil > now; return `<div class="kcc-row" title="${esc(x.lastAction)}"><span style="width:8px;height:8px;border-radius:50%;flex:none;background:${busy ? C.mag : C.ok};${busy ? "box-shadow:0 0 0 3px " + C.mag + "33" : ""}"></span><span style="width:96px;flex:none">${AGENT_NAMES[x.id] || x.id}</span>${bar((x.actionsToday / max) * 100, busy ? C.mag : C.blue, 7)}<b class="kcc-num" style="width:30px;text-align:right">${x.actionsToday}</b><span class="kcc-muted kcc-num" style="width:44px;text-align:right">${x.success}%</span></div>`; }).join("");
    return card("kcc-agents", "Copilot Studio agents at work", `${tot} actions today across ${a.length} agents · success rate per agent`, rows, `<span class="kcc-click" ${kx({ t: "actions" })}>${pill("Activity log", C.mag)}</span>`);
  }
  function matrix() {
    const cl = S().clinics.slice(), regions = [...new Set(cl.map((c) => c.region))];
    const head = `<tr><th class="l">Site</th>${COLS.map((c) => `<th>${c}</th>`).join("")}</tr>`;
    let rows = "";
    regions.forEach((rg) => {
      rows += `<tr class="r"><td colspan="${COLS.length + 1}">${esc(rg)}</td></tr>`;
      cl.filter((c) => c.region === rg).forEach((c) => {
        rows += `<tr><td class="s" ${kx({ t: "site", id: c.id })}><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${ccol({ healthy: "ok", degraded: "warn", down: "bad", maintenance: "maint" }[c.status])};margin-right:6px"></span><b>${c.code}</b> <span class="kcc-muted">${esc(c.short || c.name)}</span></td>${COLS.map((col) => { const st = cellState(c, col); return `<td class="c" style="background:${ccol(st)}${st === "ok" ? "26" : ""};color:${st === "ok" ? C.ok : "#fff"}" ${kx(st === "ok" ? { t: "site", id: c.id } : c.issue && c.issue.incident ? { t: "incident", n: c.issue.incident } : { t: "site", id: c.id })} title="${esc(c.code + " · " + col + ": " + ({ ok: "healthy", warn: "degraded", bad: "down", maint: "in maintenance" }[st]) + (st !== "ok" && c.issue ? " · " + c.issue.text : ""))}">${st === "ok" ? "" : st === "maint" ? "M" : "!"}</td>`; }).join("")}</tr>`;
      });
    });
    const counts = COLS.map((col) => cl.filter((c) => ["warn", "bad"].includes(cellState(c, col))).length);
    const body = `<div style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:18px"><table class="kcc-mx">${head}${rows}</table>
      <div><div class="kcc-muted" style="margin-bottom:6px">Sites affected, by layer</div>${COLS.map((c, i) => `<div class="kcc-row"><span style="width:70px">${c}</span>${bar((counts[i] / cl.length) * 100, counts[i] ? C.warn : C.ok, 7)}<b class="kcc-num" style="width:22px;text-align:right">${counts[i]}</b></div>`).join("")}
      <div class="kcc-legend" style="margin-top:12px"><span><i style="background:${C.ok}40"></i>Healthy</span><span><i style="background:${C.warn}"></i>Degraded</span><span><i style="background:${C.bad}"></i>Down</span><span><i style="background:${C.maint}"></i>Maintenance</span></div>
      <p class="kcc-muted" style="margin-top:10px;font-size:12px;line-height:1.5">Each cell drills to the site or its incident. One column lighting up across many sites points to a shared cause; one row lighting up points to the site itself.</p></div></div>`;
    return card("kcc-matrix", "Site and service health", `${cl.length} sites × ${COLS.length} layers, live`, body, pill("Live", C.ok));
  }
  function changes() {
    const s = S(), now = s.now, t0 = now - 6 * 3600e3, t1 = now + 18 * 3600e3, span = t1 - t0, x = (t) => Math.max(0, Math.min(100, ((t - t0) / span) * 100));
    const openCI = new Set(); s.incidents.filter((i) => i.state !== "Resolved" && i.state !== "Closed").forEach((i) => { (i.clinicIds || []).forEach((id) => openCI.add(id)); if (i.rootCauseEntity) openCI.add(i.rootCauseEntity); });
    const list = s.changes.slice().sort((a, b) => a.start - b.start).map((c) => {
      const risk = { High: C.bad, Medium: C.warn, Low: C.ok }[c.risk] || C.maint, s1 = Math.max(c.start, t0), e1 = Math.min(c.end || c.start + 3600e3, t1);
      const coll = (c.cis || []).some((ci) => [...openCI].some((o) => String(ci).includes(o) || String(o).includes(ci))) || /month-end/i.test(c.title);
      const st = c.state, done = st === "Closed";
      return `<div class="kcc-row kcc-click" ${kx({ t: "actions" })} title="${esc(c.number + " · " + c.title + " · " + c.state + " · risk " + c.risk)}"><span style="width:230px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b style="font-size:12px">${c.number}</b> <span class="${done ? "kcc-muted" : ""}">${esc(c.title)}</span></span><div style="flex:1;position:relative;height:16px;background:#F7F4F6;border-radius:4px">${e1 > s1 ? `<i style="position:absolute;left:${x(s1)}%;width:${Math.max(1.2, x(e1) - x(s1))}%;top:2px;bottom:2px;border-radius:3px;background:${done ? C.maint : risk};opacity:${done ? 0.45 : 0.9}"></i>` : ""}<i style="position:absolute;left:${x(now)}%;top:-3px;bottom:-3px;width:2px;background:${C.ink}"></i></div><span style="width:120px;flex:none;text-align:right">${coll && !done ? pill("Check overlap", C.bad) : pill(st, done ? C.maint : C.plum)}</span></div>`;
    }).join("");
    const ticks = [-6, 0, 6, 12, 18].map((h) => `<span>${h === 0 ? "now" : hm(now + h * 3600e3)}</span>`).join("");
    const ticks2 = [-6, 0, 6, 12, 18].map((h) => `<span style="position:absolute;left:${x(now + h * 3600e3)}%;transform:translateX(-50%)">${h === 0 ? "now" : hm(now + h * 3600e3)}</span>`).join("");
    const body = `${list}<div style="display:flex;gap:10px;font-size:11px;color:${C.muted}"><span style="width:230px;flex:none"></span><div style="flex:1;position:relative;height:14px">${ticks2}</div><span style="width:120px;flex:none"></span></div>
      <div class="kcc-legend" style="margin-top:10px"><span><i style="background:${C.bad}"></i>High risk</span><span><i style="background:${C.warn}"></i>Medium</span><span><i style="background:${C.ok}"></i>Low</span><span><i style="background:${C.maint};opacity:.5"></i>Done</span><span style="margin-left:auto">“Check overlap”: touches a site or service with an open incident, or a business freeze</span></div>`;
    return card("kcc-changes", "Changes and maintenance", "Past 6 hours and next 18 hours · ServiceNow change calendar", body);
  }
  function sla() {
    const s = S(), now = s.now, tgt = { P1: 4, P2: 8, P3: 24, P4: 72 };
    const open = s.incidents.filter((i) => !["Resolved", "Closed"].includes(i.state)).map((i) => { const T = (tgt[i.priority] || 24) * 3600e3, used = (now - i.createdAt) / T; return { i, used, left: i.createdAt + T - now }; }).sort((a, b) => b.used - a.used);
    const rows = open.map(({ i, used, left }) => { const col = used > 0.75 ? C.bad : used > 0.5 ? C.warn : C.ok, lm = Math.round(left / 6e4); return `<div class="kcc-row kcc-click" ${kx({ t: "incident", n: i.number })}><span style="width:30px;flex:none">${pill(i.priority, i.priority === "P1" ? C.bad : C.warn)}</span><span style="flex:1.4;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b style="font-size:12px">${i.number}</b> ${esc(i.title)}</span>${bar(used * 100, col, 7)}<span class="kcc-num" style="width:78px;text-align:right;color:${col};font-weight:650">${lm > 0 ? (lm >= 60 ? Math.floor(lm / 60) + " h " + (lm % 60) + " m" : lm + " min") : "breached"}</span></div>`; }).join("");
    const vc = (s.vendorCases || []).filter((v) => v.state !== "Resolved").map((v) => `<div class="kcc-row"><span style="width:80px;flex:none"><b style="font-size:12px">${esc(v.id)}</b></span><span style="flex:1">${esc(v.carrier)} · ${esc(v.title)}</span><span class="kcc-muted">${Math.round((now - v.openedAt) / 6e4)} min open</span></div>`).join("");
    const wo = (s.dispatches || []).map((d) => `<div class="kcc-row"><span style="width:80px;flex:none"><b style="font-size:12px">${esc(d.id)}</b></span><span style="flex:1">${esc(d.technician)} · ${esc(d.reason)}</span><span>${pill(d.state, C.plum)}</span><span class="kcc-muted" style="width:70px;text-align:right">ETA ${hm(d.eta)}</span></div>`).join("");
    const body = `${rows || `<p class="kcc-muted">No open incidents.</p>`}<div class="kcc-muted" style="margin:12px 0 4px">Waiting on vendors and carriers</div>${vc || `<p class="kcc-muted">None open.</p>`}<div class="kcc-muted" style="margin:12px 0 4px">Engineers in the field</div>${wo || `<p class="kcc-muted">None dispatched.</p>`}`;
    return card("kcc-sla", "Resolution SLA at risk", "Open incidents by share of SLA used · P1 4 h, P2 8 h, P3 24 h", body);
  }
  function capacity() {
    const items = [["vm-0301-app", "VM disk (D:)", 91, 3, "CHG0031879 awaiting approval", "0301"], ["KEMS L01 · Kuwait", "Circuit peak use", 96, 0, "PRB0004409: upgrade to 100 Mbps", "0611"], ["Repo-HQ-02", "Backup repository", 78, 11, "Retention review opened", null], ["AVS cluster AV64", "Memory", 72, 19, "Add one host in Q1 plan", null], ["Microsoft 365 E3", "Licences assigned", 94, 9, "38 seats left; 41 starters this month", null], ["nas-0389", "NAS volume", 83, 14, "Archive CCTV older than 30 days", "0389"]];
    const r = rnd("cap");
    const rows = items.map(([n, m, v, d, a, id]) => { const col = d <= 3 ? C.bad : d <= 10 ? C.warn : C.ok; const tr = Array.from({ length: 14 }, (_, i) => v - 14 + i + r() * 2); return `<div class="kcc-row ${id ? "kcc-click" : ""}" ${id ? kx({ t: "site", id }) : ""} title="${esc(a)}"><span style="flex:1;min-width:0"><b>${esc(n)}</b><br><span class="kcc-muted" style="font-size:12px">${esc(m)} · ${esc(a)}</span></span>${spark(tr, col, 70, 22, 100)}<span class="kcc-num" style="width:38px;text-align:right">${v}%</span><span style="width:76px;text-align:right">${pill(d === 0 ? "at limit" : d + " days", col)}</span></div>`; }).join("");
    return card("kcc-cap", "Capacity forecast", "Resources expected to cross their threshold in the next 21 days", rows);
  }
  function hygiene() {
    const s = S(), cl = s.clinics, drifted = Object.keys(s.drift || {}).length;
    const rows = [["Backups succeeded, last 24 h", 99.1, "1,046 of 1,055 jobs; 9 retried and passed", C.ok], ["Restore tests passed, 30 days", 100, "22 of 22 sites, SureBackup", C.ok], ["Windows patch compliance", 96.4, "1,412 devices; 51 waiting on a reboot", C.ok], ["Intune compliant devices", 94.2, "82 non-compliant, 61 on old OS builds", C.warn], ["Network configs matching golden", (1 - drifted / 44) * 100, `${drifted} switch drifted from golden config`, drifted ? C.warn : C.ok], ["Certificates, 30+ days to expiry", 97, "3 expire within 30 days; rotation CHG0031876", C.warn], ["Devices in support", 91, "12 switches and 4 UPS past end of support", C.warn], ["Alerts mapped to a CI", 98.7, "Unmapped alerts go to CMDB review", C.ok]];
    return card("kcc-hyg", "Operational hygiene", "The basics that prevent tomorrow's incidents", rows.map(([l, v, d, col]) => `<div class="kcc-row" title="${esc(d)}"><span style="width:210px;flex:none">${l}</span>${bar(v, col, 7)}<b class="kcc-num" style="width:52px;text-align:right">${v.toFixed(1)}%</b></div>`).join("") + `<p class="kcc-muted" style="margin:8px 0 0;font-size:12px">Hover a row for the detail.</p>`);
  }
  function shift() {
    const s = S(), byTower = {}; s.incidents.filter((i) => !["Resolved", "Closed"].includes(i.state)).forEach((i) => (i.towers || []).forEach((t) => (byTower[t] = (byTower[t] || 0) + 1)));
    const ppl = [["Network", "Karthik V.", "network", "L2 · Global IT Hub"], ["Compute and storage", "Arjun R.", "compute", "L2"], ["Service desk", "Kavya S.", "servicedesk", "Lead · 6 agents"], ["End-user computing", "Rohit N.", "euc", "L2"], ["Security", "Kiran S.", "security", "SOC L2"], ["Field services", "Faisal N.", "field", "Middle East"], ["Duty manager", "Priya R.", "-", "Escalation · P1"]];
    const rows = ppl.map(([t, n, k, r]) => `<div class="kcc-row"><span style="width:28px;height:28px;border-radius:50%;background:${C.plum};color:#fff;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex:none">${n.split(" ").map((x) => x[0]).join("")}</span><span style="flex:1;min-width:0"><b>${n}</b> <span class="kcc-muted">· ${t}</span><br><span class="kcc-muted" style="font-size:12px">${r}</span></span>${byTower[k] ? pill(byTower[k] + " open", C.warn) : k === "-" ? "" : pill("clear", C.ok)}</div>`).join("");
    const prb = (s.problems || []).map((p) => `<div class="kcc-row"><b style="font-size:12px;width:92px;flex:none">${esc(p.number)}</b><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</span><span class="kcc-muted">${esc(p.state)}</span></div>`).join("");
    return card("kcc-shift", "On shift now", "Owners by tower · handover at 14:00 IST", rows + `<div class="kcc-muted" style="margin:12px 0 4px">Problems under investigation</div>` + prb);
  }
  function renderCC(root) {
    root.innerHTML = `<div class="kcc-h2"><b>Operations insight</b><span>noise, speed, coverage and what is coming</span></div>
      <div class="kcc-grid kcc-g3">${funnel()}${mttx()}${agents()}</div>
      ${matrix()}
      <div class="kcc-grid kcc-g21">${changes()}${sla()}</div>
      <div class="kcc-grid kcc-g3">${capacity()}${hygiene()}${shift()}</div>`;
  }

  // ================= SITE 360 =================
  const openH = (c, h) => { const o = parseInt((c.hours && c.hours.open) || "08"), cl = parseInt((c.hours && c.hours.close) || "18"); return h >= o && h < cl; };
  const clientsAt = (c, t, r) => { const h = new Date(t).getHours(); return openH(c, h) ? Math.round(60 + r * (c.users || 120) * 0.6) : Math.round(3 + r * 6); };
  const coordinator = () => { const m = (document.querySelector("main") || document.body).innerText.match(/Site IT coordinator:\s*([^\n·]+)/); return m ? m[1].trim() : null; };
  function siteOnPage() {
    const h = document.querySelector("main h1"); if (!h) return null; const t = h.textContent.trim();
    return S().clinics.find((c) => c.name === t || c.short === t || c.label === t) || null;
  }
  const LAYERS = [["WAN", ["carrier-down", "onlte", "jitter", "edge-hw", "power"]], ["LAN and Wi-Fi", ["switch", "power"]], ["Voice", ["jitter", "carrier-down", "edge-hw", "power"]], ["Servers and VMs", ["esxi", "psu", "temp", "vmdisk", "power"]], ["Storage and backup", ["drive", "qnap", "vmdisk"]], ["PCs and printers", ["ws", "spooler", "intune", "power"]], ["Power", ["power"]], ["Security", []]];
  function timeline(c) {
    const s = S(), now = s.now, n = 96, step = 15 * 6e4, t0 = now - n * step, r = rnd("tl" + c.id), k = c.issue && c.issue.kind;
    const inc = s.incidents.find((i) => (i.clinicIds || []).includes(c.id) && !["Resolved", "Closed"].includes(i.state));
    const start = inc ? inc.createdAt : now - 25 * 6e4;
    const past = [...s.incidents.filter((i) => (i.clinicIds || []).includes(c.id) && ["Resolved", "Closed"].includes(i.state)).map((i) => ({ a: i.createdAt, b: i.resolvedAt || i.createdAt + 46 * 6e4, n: i.number + " " + i.title, kind: i.towers && i.towers.includes("compute") ? 3 : 0 })), ...(s.vendorCases || []).filter((v) => c.primaryCircuit && v.circuit === c.primaryCircuit.id).map((v) => ({ a: v.openedAt - 46 * 6e4, b: v.openedAt + 40 * 6e4, n: v.id + " " + v.carrier + ": " + v.title, kind: 0 }))].filter((p) => p.b > t0);
    const pastBlip = past.length ? -99 : Math.floor(r() * 60) + 10, blipLayer = Math.floor(r() * 4);
    const open = (h) => { const o = parseInt((c.hours && c.hours.open) || "08"), cl = parseInt((c.hours && c.hours.close) || "18"); return h >= o && h < cl; };
    const lanes = LAYERS.map(([name, kinds], li) => {
      const cells = Array.from({ length: n }, (_, i) => { const t = t0 + i * step; let col = C.ok + "55";
        if (c.status === "maintenance" && t > now - 3 * 3600e3) col = C.maint;
        else if (kinds.includes(k) && t >= start - step) col = c.status === "down" && (li === 0 || k === "power" || li === 3) ? C.bad : C.warn;
        else if (past.some((p) => p.kind === li && t >= p.a - step && t <= p.b)) col = C.warn;
        else if (li === blipLayer && i >= pastBlip && i < pastBlip + 2 + Math.floor(r() * 3)) col = C.warn;
        return `<i style="background:${col}" title="${name} · ${hm(t)}"></i>`; }).join("");
      return `<div class="lane"><span>${name}</span><div class="cells">${cells}</div></div>`;
    }).join("");
    const biz = `<div class="lane"><span>Business hours</span><div class="cells">${Array.from({ length: n }, (_, i) => `<i style="background:${open(new Date(t0 + i * step).getHours()) ? C.plum + "55" : "#F2EEF1"}"></i>`).join("")}</div></div>`;
    const ch = s.changes.filter((x) => (x.cis || []).some((ci) => String(ci).includes(c.id) || String(ci).includes(c.code) || (c.seg && String(ci) === c.seg))).map((x) => ({ t: x.start, l: x.number + " " + x.title, col: C.blue }));
    const ev = [...ch, ...past.map((p) => ({ t: p.a, l: p.n + " (resolved)", col: C.warn })), ...(inc ? [{ t: inc.createdAt, l: inc.number + " " + inc.title, col: C.bad }] : [])].filter((m) => m.t > t0);
    const marks = `<div style="position:relative;height:16px;margin-left:128px">${ev.map((m) => `<span title="${esc(hm(m.t) + " · " + m.l)}" style="position:absolute;left:calc(${((m.t - t0) / (n * step)) * 100}% - 6px);top:0;width:12px;height:12px;border-radius:50%;background:${m.col};border:2px solid #fff;box-shadow:0 0 0 1px ${m.col}"></span>`).join("")}</div>`;
    const avail = 100 - (c.status === "down" ? ((now - start) / (24 * 3600e3)) * 100 : c.status === "degraded" ? 0.2 : 0.05);
    const ticks = [0, 24, 48, 72, 96].map((i) => `<span>${i === 96 ? "now" : hm(t0 + i * step)}</span>`).join("");
    const body = `<div class="kcc-tl">${marks}${lanes}${biz}<div class="kcc-axis">${ticks}</div></div>
      <div class="kcc-legend" style="margin-top:10px"><span><i style="background:${C.ok}55"></i>Healthy</span><span><i style="background:${C.warn}"></i>Degraded</span><span><i style="background:${C.bad}"></i>Down</span><span><i style="background:${C.maint}"></i>Maintenance</span><span><i style="background:${C.bad};border-radius:50%"></i>Incident</span><span><i style="background:${C.blue};border-radius:50%"></i>Change</span><span style="margin-left:auto">Availability, 24 h: <b>${Math.max(0, avail).toFixed(2)}%</b></span></div>`;
    return card("kcc-tl", "Last 24 hours, by layer", "15-minute slots · hover a slot or marker for detail", body);
  }
  function floorplan(c) {
    const r = rnd("fp" + c.id), k = c.issue && c.issue.kind, down = c.status === "down", plant = /Plant/.test(c.kind);
    const zones = plant ? [["Production floor", 20, 20, 470, 230], ["Warehouse", 500, 20, 230, 230], ["Offices", 20, 260, 330, 150], ["Server room", 360, 260, 130, 150], ["Canteen and reception", 500, 260, 230, 150]] : [["Open office", 20, 20, 470, 230], ["Meeting rooms", 500, 20, 230, 110], ["Training", 500, 140, 230, 110], ["Reception", 20, 260, 330, 150], ["Server room", 360, 260, 130, 150], ["Pantry", 500, 260, 230, 150]];
    const aps = [[120, 90], [300, 90], [430, 180], [600, 80], [620, 200], [160, 330], [600, 330], [250, 200]].slice(0, plant ? 8 : 7);
    const totC = down ? 0 : clientsAt(c, S().now, rnd("wf" + c.id)()), wts = aps.map(() => 0.4 + r()), wsum = wts.reduce((a, b) => a + b, 0);
    const apEls = aps.map(([x, y], i) => { const cl = down ? 0 : Math.round((totC * wts[i]) / wsum), bad = down || (k === "switch" && i < 3), warn = !bad && cl > 45; const col = bad ? C.bad : warn ? C.warn : C.ok; return `<g class="dev" ${kx({ t: "site", id: c.id })}><title>AP ${c.id.slice(2)}-0${i + 1} · ${bad ? "offline" : cl + " clients"}</title><circle cx="${x}" cy="${y}" r="${10 + cl / 5}" fill="${col}22" stroke="${col}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="5" fill="${col}"/><text x="${x}" y="${y + 22 + cl / 5}" font-size="11" text-anchor="middle" fill="${C.muted}">${bad ? "offline" : cl}</text></g>`; }).join("");
    const dev = (x, y, id, label, bad, w = 26) => `<g class="dev" ${kx({ t: "device", id })}><title>${id}</title><rect x="${x}" y="${y}" width="${w}" height="16" rx="3" fill="${bad ? C.bad : C.plum}" stroke="#fff"/><text x="${x + w / 2}" y="${y + 12}" font-size="9.5" text-anchor="middle" fill="#fff" font-weight="700">${label}</text></g>`;
    const srvBad = ["esxi", "psu", "temp", "power"].includes(k), swBad = k === "switch" || k === "power", edgeBad = ["edge-hw", "carrier-down", "power"].includes(k);
    const room = `${dev(372, 300, `srv-${c.id}`, "SRV", srvBad)}${dev(402, 300, `nas-${c.id}`, "NAS", k === "qnap" || k === "drive")}${dev(432, 300, `edge-${c.id}-01`, "EDGE", edgeBad, 34)}${dev(372, 326, `sw-${c.id}-01`, "SW1", swBad)}${dev(402, 326, `sw-${c.id}-02`, "SW2", k === "power")}${dev(432, 326, "ups", "UPS", k === "power", 34)}`;
    const prn = [[60, 220], [460, 120]].map(([x, y], i) => dev(x, y, `prn-${c.id}-0${i + 1}`, "PRN", k === "spooler" && i === 0)).join("");
    const svg = `<svg viewBox="0 0 750 420" class="kcc-fp">${zones.map(([n, x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${n === "Server room" ? "#F4EEF3" : "#FAF8F9"}" stroke="#E2DCE0"/><text x="${x + 10}" y="${y + 18}" font-size="11.5" fill="${C.muted}" font-weight="600">${n}</text>`).join("")}${apEls}${room}${prn}</svg>`;
    const body = `${svg}<div class="kcc-legend" style="margin-top:6px"><span><i style="background:${C.ok};border-radius:50%"></i>Access point (circle size = clients)</span><span><i style="background:${C.plum}"></i>Network, server, power</span><span><i style="background:${C.bad}"></i>Fault</span><span style="margin-left:auto">Click a device to drill down</span></div>`;
    return card("kcc-fp", "Floor plan", `${aps.length} access points · server room · printers`, body);
  }
  function wifi(c) {
    const r = rnd("wf" + c.id), down = c.status === "down", k = c.issue && c.issue.kind, hit = k === "switch" ? 0.18 : 0;
    let sle = [["Time to connect", 0.97 - r() * 0.04 - hit], ["Successful connects", 0.99 - r() * 0.02 - hit], ["Coverage", 0.95 - r() * 0.05], ["Roaming", 0.93 - r() * 0.06 - hit], ["Throughput", 0.9 - r() * 0.08], ["AP uptime", down ? 0 : 0.999 - hit]];
    if (down && (k === "power" || k === "switch")) sle = sle.map(([l]) => [l, 0]);
    const r0 = rnd("wf" + c.id)(), n = 24, hrs = Array.from({ length: n }, (_, i) => i === n - 1 ? clientsAt(c, S().now, r0) : clientsAt(c, S().now - (n - 1 - i) * 3600e3, r()));
    if (down) hrs[n - 1] = 0;
    const max = Math.max(...hrs), now = Math.round(hrs[n - 1]);
    const chart = `<div style="display:flex;gap:2px;align-items:flex-end;height:64px">${hrs.map((v, i) => `<i style="flex:1;height:${(v / max) * 100}%;background:${i === n - 1 ? C.mag : C.blue}88;border-radius:2px 2px 0 0"></i>`).join("")}</div>`;
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${now}</b><span>clients now</span></div><div class="kcc-kpi"><b>${down ? "–" : (2.1 + r()).toFixed(1) + " s"}</b><span>median time to connect</span></div><div class="kcc-kpi"><b>${down ? "–" : Math.round(-58 - r() * 9) + " dBm"}</b><span>median signal</span></div></div>
      ${sle.map(([l, v]) => { const col = v >= 0.9 ? C.ok : v >= 0.75 ? C.warn : C.bad; return `<div class="kcc-row"><span style="width:140px;flex:none">${l}</span>${bar(v * 100, col, 7)}<b class="kcc-num" style="width:46px;text-align:right">${pct(Math.max(0, v))}</b></div>`; }).join("")}
      <div class="kcc-muted" style="margin:10px 0 4px">Wi-Fi clients, last 24 hours</div>${chart}`;
    return card("kcc-wifi", "Wi-Fi experience", "Service levels: share of client minutes meeting the target", body);
  }
  function wan(c) {
    const r = rnd("wan" + c.id), bw = parseInt((c.primaryCircuit && c.primaryCircuit.bandwidth) || "100"), down = c.status === "down" && ["carrier-down", "edge-hw", "power"].includes(c.issue && c.issue.kind);
    const apps = [["Microsoft Teams", 0.24, C.blue], ["Microsoft 365", 0.19, C.pink], ["File Services (AVS)", 0.17, C.mag], [/Plant/.test(c.kind) ? "CCTV upload" : "Web browsing", 0.13, C.orange], ["Windows Update", 0.09, C.yellow], ["Engineering CAD", 0.08, C.plum], ["Other", 0.1, C.maint]].map(([n, v, col]) => [n, v * (0.8 + r() * 0.4), col]);
    const tot = apps.reduce((s, a) => s + a[1], 0);
    const stack = `<div style="display:flex;height:18px;border-radius:6px;overflow:hidden;margin-bottom:8px">${apps.map(([n, v, col]) => `<i title="${n} ${pct(v / tot)}" style="width:${(v / tot) * 100}%;background:${col}"></i>`).join("")}</div>`;
    const list = apps.map(([n, v, col]) => `<div class="kcc-row"><i style="width:10px;height:10px;border-radius:3px;background:${col};flex:none"></i><span style="flex:1">${n}</span><span class="kcc-num kcc-muted">${(v / tot * bw * 0.55).toFixed(1)} Mbps</span><b class="kcc-num" style="width:44px;text-align:right">${pct(v / tot)}</b></div>`).join("");
    const n = 48, inb = Array.from({ length: n }, (_, i) => (down && i > n - 3 ? 0 : (0.25 + 0.45 * Math.max(0, Math.sin((i / n) * Math.PI * 1.1)) + r() * 0.12) * bw));
    const out = inb.map((v) => v * (0.35 + r() * 0.1)), W = 520, H = 90, y = (v) => H - (v / bw) * H;
    const path = (a) => a.map((v, i) => `${i ? "L" : "M"}${((i / (n - 1)) * W).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const svg = `<svg viewBox="0 0 ${W} ${H + 14}" style="width:100%;height:auto;display:block"><line x1="0" x2="${W}" y1="${y(bw * 0.8)}" y2="${y(bw * 0.8)}" stroke="${C.bad}" stroke-dasharray="4 4"/><text x="${W - 4}" y="${y(bw * 0.8) - 4}" font-size="10" text-anchor="end" fill="${C.bad}">80% of ${bw} Mbps</text><path d="${path(inb)} L${W} ${H} L0 ${H} Z" fill="${C.blue}22" stroke="${C.blue}" stroke-width="1.5"/><path d="${path(out)}" fill="none" stroke="${C.orange}" stroke-width="1.5"/><text x="0" y="${H + 12}" font-size="10" fill="${C.muted}">-24 h</text><text x="${W}" y="${H + 12}" font-size="10" fill="${C.muted}" text-anchor="end">now</text></svg>`;
    const peak = Math.max(...inb);
    const body = `${stack}${list}<div class="kcc-muted" style="margin:12px 0 4px">Primary circuit ${esc(c.primaryCircuit && c.primaryCircuit.id)} · peak ${pct(peak / bw)} of ${bw} Mbps <span style="margin-left:8px"><i style="display:inline-block;width:10px;height:3px;background:${C.blue};vertical-align:3px"></i> in</span> <span><i style="display:inline-block;width:10px;height:3px;background:${C.orange};vertical-align:3px"></i> out</span></div>${svg}`;
    return card("kcc-wan", "WAN use by application", down ? "Last hour before the outage · circuit use, last 24 hours" : "SD-WAN application visibility, last hour · circuit use, last 24 hours", body, down ? pill("Circuit down", C.bad) : "");
  }
  function siteChanges(c) {
    const s = S(), now = s.now, r = rnd("sc" + c.id);
    const real = s.changes.filter((x) => (x.cis || []).some((ci) => String(ci).includes(c.id) || String(ci).includes(c.code) || (c.seg && String(ci) === c.seg))).map((x) => [x.start, x.number, x.title, x.state, x.risk]);
    const gen = [[now + (2 + Math.floor(r() * 4)) * 864e5, "CHG00319" + Math.floor(10 + r() * 80), "Monthly Windows patching · site PCs and servers (Sun 02:00)", "Scheduled", "Low"], [now - (3 + Math.floor(r() * 5)) * 864e5, "CHG00317" + Math.floor(10 + r() * 80), `Firmware update · ${c.switchVendor || "Cisco"} switches`, "Closed", "Low"], [now + (9 + Math.floor(r() * 6)) * 864e5, "CHG00320" + Math.floor(10 + r() * 80), "UPS battery replacement (vendor visit)", "Scheduled", "Medium"]];
    const all = [...real, ...gen].sort((a, b) => b[0] - a[0]);
    const fmt = (t) => { const d = Math.round((t - now) / 864e5); return d === 0 ? "today " + hm(t) : d > 0 ? "in " + d + " day" + (d > 1 ? "s" : "") : -d + " day" + (d < -1 ? "s" : "") + " ago"; };
    const rows = all.map(([t, n, ti, st, rk]) => `<div class="kcc-row"><span style="width:96px;flex:none" class="kcc-muted">${fmt(t)}</span><span style="flex:1;min-width:0"><b style="font-size:12px">${n}</b> ${esc(ti)}</span>${pill(st, st === "Closed" ? C.maint : C.plum)}<span style="width:56px;text-align:right">${pill(rk, { High: C.bad, Medium: C.warn, Low: C.ok }[rk])}</span></div>`).join("");
    const win = `<div class="kcc-kpis" style="margin-top:12px;margin-bottom:0"><div class="kcc-kpi"><b>Sun 02:00–04:00</b><span>maintenance window</span></div><div class="kcc-kpi"><b>${c.hours ? c.hours.open + "–" + c.hours.close : "08:00–18:00"}</b><span>business hours (${c.hours ? c.hours.days : "Mon–Fri"})</span></div></div>`;
    return card("kcc-sch", "Changes and maintenance at this site", "Recent and upcoming · ServiceNow", rows + win);
  }
  function protection(c) {
    const r = rnd("pr" + c.id), devs = (c.wsCount || 20) + Math.round((c.users || 100) * 0.6), ncomp = Math.round(r() * 6) + (c.issue && c.issue.kind === "intune" ? 9 : 0);
    const vul = [["Critical", Math.round(r() * 2), C.bad], ["High", Math.round(3 + r() * 8), C.warn], ["Medium", Math.round(10 + r() * 25), C.yellow], ["Low", Math.round(20 + r() * 40), C.maint]];
    const vmax = Math.max(...vul.map((v) => v[1]), 1);
    const rows = [["Intune compliant devices", (devs - ncomp) / devs, `${devs - ncomp} of ${devs}`], ["Windows patch compliance", 0.93 + r() * 0.06, "last cycle 18 days ago"], ["Defender for Endpoint active", 0.99 + r() * 0.01, "agents reporting"], ["Backups, last 24 h", c.issue && ["drive", "qnap"].includes(c.issue.kind) ? 0.75 : 1, "nightly + hourly snapshots"]];
    const body = `${rows.map(([l, v, d]) => { const col = v >= 0.95 ? C.ok : v >= 0.85 ? C.warn : C.bad; return `<div class="kcc-row" title="${esc(d)}"><span style="width:190px;flex:none">${l}</span>${bar(v * 100, col, 7)}<b class="kcc-num" style="width:46px;text-align:right">${pct(v)}</b></div>`; }).join("")}
      <div class="kcc-muted" style="margin:12px 0 6px">Open vulnerabilities on site devices</div><div style="display:flex;gap:8px;align-items:flex-end;height:70px">${vul.map(([l, v, col]) => `<div style="flex:1;text-align:center"><div class="kcc-num" style="font-weight:700">${v}</div><div style="height:${(v / vmax) * 40 + 2}px;background:${col};border-radius:4px 4px 0 0"></div><div class="kcc-muted" style="font-size:11px">${l}</div></div>`).join("")}</div>
      <div class="kcc-row" style="margin-top:10px"><span style="flex:1">Last restore test</span><b>${Math.round(3 + r() * 20)} days ago · passed</b></div><div class="kcc-row"><span style="flex:1">Security alerts, 7 days</span><b>${Math.round(r() * 3)}</b><span class="kcc-muted">all closed</span></div>`;
    return card("kcc-prot", "Protection and compliance", "Intune, Defender, patching and backup for this site", body);
  }
  function power(c) {
    const r = rnd("pw" + c.id), on = c.issue && c.issue.kind === "power", plant = /Plant/.test(c.kind), gen = on && plant, temp = (c.issue && c.issue.kind === "temp") ? 31.5 : 21 + r() * 3, hum = 42 + r() * 10;
    const gauge = (v, min, max, lo, hi, unit, lab) => { const a = Math.PI * (1 - (Math.max(min, Math.min(max, v)) - min) / (max - min)), x = 60 + 46 * Math.cos(a), y = 58 - 46 * Math.sin(a), col = v < lo || v > hi ? C.bad : C.ok; return `<div style="flex:1;text-align:center"><svg viewBox="0 0 120 70" style="width:100%;max-width:150px"><path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="#EFEAEE" stroke-width="9" stroke-linecap="round"/><path d="M14 58 A46 46 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round"/><text x="60" y="56" font-size="16" font-weight="700" text-anchor="middle" fill="${C.ink}">${v.toFixed(unit === "%" ? 0 : 1)}${unit}</text></svg><div class="kcc-muted" style="font-size:12px;margin-top:-4px">${lab}</div></div>`; };
    const body = `<div style="display:flex;gap:6px">${gauge(on ? 0 : 100, 0, 100, 50, 101, "%", "Utility input")}${gauge(on ? (gen ? 88 : 63) : 100, 0, 100, 40, 101, "%", "UPS battery")}${gauge(temp, 10, 40, 15, 27, "°C", "Server room")}${gauge(hum, 0, 100, 30, 60, "%", "Humidity")}</div>
      <div class="kcc-row" style="margin-top:8px"><span style="flex:1">UPS</span><b>${gen ? "On line from generator · recharging" : on ? "On battery · 22 min left" : "On line · 41 min runtime at " + Math.round(35 + r() * 25) + "% load"}</b></div>
      <div class="kcc-row"><span style="flex:1">Generator</span><b>${/Plant/.test(c.kind) ? (on ? "Running · essential load only" : "Last monthly test " + Math.round(4 + r() * 20) + " days ago · passed") : "None on site"}</b></div>
      <div class="kcc-row"><span style="flex:1">UPS battery age</span><b>${(1.5 + r() * 3).toFixed(1)} years</b><span class="kcc-muted">replace at 4</span></div>`;
    return card("kcc-pwr", "Power and environment", "UPS, generator and server room probes", body, gen ? pill("On generator", C.warn) : on ? pill("On battery", C.bad) : pill("Normal", C.ok));
  }
  function lifecycle(c) {
    const r = rnd("lc" + c.id), y = 2026;
    const items = [[`edge-${c.id}-01`, c.switchVendor === "Cisco" ? "VeloCloud Edge 620" : "Palo Alto PA-820", y + 1 + Math.round(r() * 2), y + 3], [`sw-${c.id}-01`, `${c.switchVendor || "Cisco"} Catalyst 9200`, y - 1 + Math.round(r() * 2), y + 2], [`sw-${c.id}-02`, `${c.switchVendor || "Cisco"} Catalyst 2960-X`, y - 1, y - 1], [`srv-${c.id}`, "HPE ProLiant DL380 Gen10", y + Math.round(r() * 2), y + 3], [`nas-${c.id}`, "NAS 8 TB", y + 1, y + 4], ["UPS", "APC Smart-UPS 6 kVA", y, y + 1]];
    const rows = items.map(([id, m, w, e]) => { const col = e <= y ? C.bad : w <= y ? C.warn : C.ok, txt = e <= y ? "End of support" : w <= y ? "Warranty ended" : "In warranty"; return `<div class="kcc-row ${id.includes("-") ? "kcc-click" : ""}" ${id.includes("-") ? kx({ t: "device", id }) : ""}><span style="flex:1;min-width:0"><b class="kcc-num" style="font-size:12px">${id}</b><br><span class="kcc-muted" style="font-size:12px">${m}</span></span><span class="kcc-muted kcc-num" style="width:110px;font-size:12px">warranty ${w}<br>support ${e}</span><span style="width:120px;text-align:right">${pill(txt, col)}</span></div>`; }).join("");
    return card("kcc-life", "Asset lifecycle", "Warranty and end-of-support from the CMDB", rows);
  }
  function contacts(c) {
    const r = rnd("ct" + c.id), carrier = c.carrier || "Jio";
    const rows = [["Site IT coordinator", coordinator() || ["Deepa K.", "Rahul S.", "Fatima A.", "Nguyen T."][Math.floor(r() * 4)], "Teams · mobile on file"], ["Site manager", ["Vikram I.", "Sana K.", "Omar H.", "Linh P."][Math.floor(r() * 4)], "Escalation for business impact"], [`${carrier} account manager`, `${carrier} Enterprise NOC`, `Circuit ${c.primaryCircuit && c.primaryCircuit.id} · SLA 99.5% · MTTR 4 h`], ["Backup circuit", (c.backupCircuit && c.backupCircuit.type) || "4G", (c.backupCircuit && c.backupCircuit.id) || "–"], [`${c.switchVendor || "Cisco"} support`, "Smart Net Total Care", "Next business day parts"], ["Field engineer pool", c.region, "Nearest: 26 min"]];
    const body = rows.map(([a, b, d]) => `<div class="kcc-row"><span style="width:160px;flex:none" class="kcc-muted">${a}</span><span style="flex:1;min-width:0"><b>${esc(b)}</b><br><span class="kcc-muted" style="font-size:12px">${esc(d)}</span></span></div>`).join("") + `<div class="kcc-row"><span style="width:160px;flex:none" class="kcc-muted">Circuit contract</span><b>renews ${["Mar", "Jun", "Sep", "Dec"][Math.floor(r() * 4)]} 2027</b><span class="kcc-muted">SLA credits this year: ${Math.floor(r() * 3)}</span></div>`;
    return card("kcc-ct", "Contacts and contracts", "Who to call, and what we pay for", body);
  }
  function renderSiteTop(root, c) { root.innerHTML = timeline(c); }
  function renderSiteMore(root, c) {
    root.innerHTML = `<div class="kcc-h2"><b>Site deep dive</b><span>${esc(c.label)} · floor, Wi-Fi, WAN, protection, power and lifecycle</span></div>
      <div class="kcc-grid kcc-g21">${floorplan(c)}${wifi(c)}</div>
      <div class="kcc-grid kcc-g2">${wan(c)}${siteChanges(c)}</div>
      <div class="kcc-grid kcc-g3">${protection(c)}${power(c)}${lifecycle(c)}</div>
      ${contacts(c)}`;
  }

  // ---------- mount: find the page's section column and place our blocks
  const sectionOf = (el) => { let e = el; while (e && e.parentElement) { const p = e.parentElement; if (p.children.length >= 4 && getComputedStyle(p).flexDirection === "column" && p.getBoundingClientRect().width > 900) return e; if (p.tagName === "MAIN") return e; e = p; } return null; };
  const findText = (sel, txt) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim() === txt);
  let last = { k: "", t: 0 };
  function tick() {
    try {
      const s = S(), page = s.page;
      if (page === "command") {
        let root = document.getElementById("kcc-cc");
        if (!root) { const h = findText("main h2, main h3, main div, main span", "Service levels and error budgets"); const sec = h && sectionOf(h); if (!sec) return; root = document.createElement("div"); root.id = "kcc-cc"; root.className = "kcc-wrap"; sec.after(root); last.k = ""; }
        const key = "cc" + Math.floor(s.now / 4000) + s.clinics.map((c) => c.status[0]).join("");
        if (key !== last.k) { renderCC(root); last.k = key; }
      } else if (page === "clinic360") {
        const c = siteOnPage(); if (!c) return;
        let top = document.getElementById("kcc-s1"), more = document.getElementById("kcc-s2");
        if (!top || top.dataset.site !== c.id) { top && top.remove(); const h = findText("main h2, main h3, main div, main span", "Site metrics"); const sec = h && sectionOf(h); if (!sec) return; top = document.createElement("div"); top.id = "kcc-s1"; top.className = "kcc-wrap"; top.dataset.site = c.id; sec.after(top); last.k = ""; }
        if (!more || more.dataset.site !== c.id) { more && more.remove(); const h = findText("main h2, main h3, main div, main span", "Dependencies"); const sec = h && sectionOf(h); if (!sec) return; more = document.createElement("div"); more.id = "kcc-s2"; more.className = "kcc-wrap"; more.dataset.site = c.id; (sec.parentElement && sec.parentElement.children.length < 4 ? sec.parentElement : sec).after(more); last.k = ""; }
        const key = "s" + c.id + Math.floor(s.now / 5000) + c.status;
        if (key !== last.k) { renderSiteTop(top, c); renderSiteMore(more, c); last.k = key; }
      }
    } catch (e) { console.warn("kcc", e); }
  }
  function start() { const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); setInterval(tick, 1000); setTimeout(tick, 400); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
  return { tick };
})();
