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
.kcc-btn{border:1px solid ${C.mag};color:${C.mag};background:#fff;border-radius:8px;padding:4px 10px;font:600 12px/1.2 inherit;cursor:pointer;white-space:nowrap}.kcc-btn:hover{background:${C.mag};color:#fff}
.kcc-dt{width:100%;border-collapse:collapse;font-size:12.5px}.kcc-dt th{position:sticky;top:0;background:#fff;text-align:left;font-weight:600;color:${C.muted};padding:6px 8px;border-bottom:1px solid ${C.line};white-space:nowrap}.kcc-dt td{padding:6px 8px;border-bottom:1px solid #F2EEF1;white-space:nowrap;vertical-align:middle}
.kcc-pred{border:1px solid ${C.line};border-radius:10px;padding:10px 12px;margin-bottom:8px}
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
    root.innerHTML = `<div class="kcc-h2"><b>Operations insight</b><span>noise, speed and what the estate is made of</span></div>
      <div class="kcc-grid kcc-g3">${funnel()}${mttx()}${estInventory()}</div>
      ${renderEstate()}
      ${matrix()}
      <div class="kcc-grid kcc-g21">${changes()}${sla()}</div>
      <div class="kcc-grid kcc-g3">${capacity()}${hygiene()}${shift()}</div>
      ${renderCCPP()}`;
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
  function renderSiteTop(root, c) { root.innerHTML = timeline(c) + renderSitePP(c); }
  function renderSiteMore(root, c) {
    root.innerHTML = `<div class="kcc-h2"><b>Floor, Wi-Fi, WAN and site operations</b><span>${esc(c.label)}</span></div>
      <div class="kcc-grid kcc-g21">${floorplan(c)}${wifi(c)}</div>
      <div class="kcc-grid kcc-g2">${wan(c)}${siteChanges(c)}</div>
      <div class="kcc-grid kcc-g3">${protection(c)}${power(c)}${lifecycle(c)}</div>
      ${contacts(c)}`;
  }

  // ================= DEVICE HEALTH, PREDICT AND PREVENT (shared by Site 360 and Command Center) =================
  const scheduled = {}; // device id -> change number raised from the hub
  const toast = (title, text, kind = "good") => { try { lt({ kind, title, text, nav: null }); } catch (e) {} };
  const DT = { edge: "SD-WAN edge", sw: "Switch", ap: "Access point", srv: "Server (ESXi host)", ilo: "Server management", vm: "Site VM", nas: "NAS", ups: "UPS", prn: "Printer" };
  const devCache = {};
  function devices(c) {
    const key = c.id + c.status + (c.issue ? c.issue.kind : ""), now = S().now;
    if (devCache[key] && devCache[key].t > now - 15000) return devCache[key].d;
    const r = rnd("dev" + c.id), k = c.issue && c.issue.kind, down = c.status === "down", maint = c.status === "maintenance", plant = /Plant/.test(c.kind);
    const v = (b, s) => Math.round(b + r() * s);
    const list = [
      { id: `edge-${c.id}-01`, t: "edge", model: c.carrier === "Jio" || c.carrier === "Airtel" ? "VeloCloud Edge 620" : "VeloCloud Edge 520", cpu: v(18, 30), mem: v(35, 25), temp: v(41, 12), fw: "5.2.2", fwL: "5.2.3" },
      { id: `sw-${c.id}-01`, t: "sw", model: `${c.switchVendor || "Cisco"} Catalyst 9200-48P`, cpu: v(8, 20), mem: v(30, 20), temp: v(38, 10), fw: "17.9.4", fwL: "17.9.5" },
      { id: `sw-${c.id}-02`, t: "sw", model: `${c.switchVendor || "Cisco"} Catalyst 2960-X`, cpu: v(10, 25), mem: v(40, 25), temp: v(40, 12), fw: "15.2(7)E8", fwL: "15.2(7)E10", eos: true },
      { id: `srv-${c.id}`, t: "srv", model: "HPE ProLiant DL380 Gen10", cpu: v(20, 40), mem: v(45, 30), temp: v(22, 6), fw: "U30 2.90", fwL: "U30 3.10" },
      { id: `ilo-${c.id}`, t: "ilo", model: "HPE iLO 5", cpu: v(3, 6), mem: v(20, 10), temp: v(24, 5), fw: "3.05", fwL: "3.08" },
      { id: `vm-${c.id}-app`, t: "vm", model: "Windows Server 2022 VM", cpu: v(15, 45), mem: v(40, 35), disk: v(35, 40), fw: "Tools 12.4", fwL: "Tools 12.4" },
      { id: `nas-${c.id}`, t: "nas", model: "NAS 8 TB · RAID 6", cpu: v(5, 20), mem: v(30, 20), disk: v(45, 35), temp: v(33, 8), fw: "5.1.8", fwL: "5.2.0" },
      { id: `ups-${c.id}`, t: "ups", model: "APC Smart-UPS 6 kVA", load: v(30, 35), temp: v(25, 6), batt: +(1.2 + r() * 3.4).toFixed(1), fw: "UPS 15.3", fwL: "UPS 15.5" },
      ...Array.from({ length: plant ? 8 : 6 }, (_, i) => ({ id: `ap-${c.id}-0${i + 1}`, t: "ap", model: "Wi-Fi 6 access point", cpu: v(10, 30), mem: v(30, 30), temp: v(45, 10), retries: v(3, 9), fw: "17.9.4", fwL: "17.9.5" })),
      { id: `prn-${c.id}-01`, t: "prn", model: "HP LaserJet Enterprise M611", toner: v(8, 80), jams: v(0, 4), fw: "5.7", fwL: "5.7" },
    ];
    list.forEach((d) => {
      if (r() > 0.3) d.fwL = d.fw; d.up = maint ? 0 : v(6, 120); d.alerts = 0; d.risk = r() * 0.12; d.health = v(86, 13); d.state = "ok"; d.trend = Array.from({ length: 14 }, () => 0.1 + r() * 0.15); d.sig = ""; d.act = ""; d.eta = 0;
      // baseline wear signals that a site normally has
      if (d.t === "ups" && d.batt > 3.6) Object.assign(d, { risk: 0.3 + (d.batt - 3.6) * 0.3, sig: `Battery ${d.batt} years old; runtime test fell from 41 to ${v(24, 8)} min`, act: "Replace battery set in the maintenance window", eta: v(20, 40) });
      if (d.t === "nas" && d.disk > 70) Object.assign(d, { risk: 0.3 + (d.disk - 70) / 60, sig: `Volume ${d.disk}% used, growing ${(0.3 + r() * 0.6).toFixed(1)}% a day`, act: "Archive data older than 90 days or add a disk shelf", eta: Math.max(4, Math.round((95 - d.disk) / 0.6)) });
      if (d.t === "vm" && d.disk > 66) Object.assign(d, { risk: 0.25 + (d.disk - 66) / 70, sig: `Disk ${d.disk}% used; forecast to hit 95% in ${Math.max(3, Math.round((95 - d.disk) / 1.1))} days`, act: "Extend the virtual disk (standard change)", eta: Math.max(3, Math.round((95 - d.disk) / 1.1)) });
      if (d.t === "ap" && d.retries > 9) Object.assign(d, { risk: 0.22 + d.retries / 60, sig: `Retry rate ${d.retries}% and rising; co-channel interference`, act: "Re-plan channels; move to 5 GHz-only SSID", eta: 14 });
      if (d.t === "sw" && d.eos) Object.assign(d, { risk: Math.max(d.risk, 0.28), sig: "End of support; 2 open vendor advisories", act: "Replace with Catalyst 9200 (budgeted Q1)", eta: 60 });
      if (d.t === "prn" && d.toner < 15) Object.assign(d, { risk: 0.5, sig: `Toner ${d.toner}%; ${Math.max(1, Math.round(d.toner / 4))} days left at current use`, act: "Ship toner cartridge", eta: Math.max(1, Math.round(d.toner / 4)) });
      if (d.t === "srv" && r() < 0.35) Object.assign(d, { risk: 0.3 + r() * 0.15, sig: `Disk 3 SMART: reallocated sectors ${v(18, 40)} (up from 2 last month)`, act: "Replace drive 3 (hot-swap, spare on site)", eta: v(10, 20) });
      if (d.t === "edge" && r() < 0.25) Object.assign(d, { risk: 0.26, sig: "Primary link CRC errors trending up after midnight", act: "Ask carrier to check the hand-off; swap SFP", eta: 9 });
      // live faults from the hub's own state
      const off = () => Object.assign(d, { live: 1, state: "bad", health: 0, alerts: 2, up: 0, cpu: undefined, mem: undefined, sig: d.sig || "Not responding", risk: 1 });
      if (k === "power" && d.t !== "ups") off();
      if (k === "power" && d.t === "ups") Object.assign(d, { live: 1, state: plant ? "warn" : "bad", health: plant ? 61 : 25, alerts: 1, risk: 0.7, sig: plant ? "Utility lost; feeding from generator" : "On battery, utility lost", act: "Track utility restoration; recharge test after" });
      if (k === "edge-hw" && d.t === "edge") off();
      if (k === "carrier-down" && d.t === "edge") Object.assign(d, { live: 1, state: "bad", health: 22, alerts: 3, risk: 0.9, sig: "Primary circuit down; no backup", act: "Carrier case open" });
      if (k === "onlte" && d.t === "edge") Object.assign(d, { live: 1, state: "warn", health: 64, alerts: 1, risk: 0.5, sig: "Running on 4G backup", act: "Return to primary when carrier clears" });
      if (k === "jitter" && d.t === "edge") Object.assign(d, { live: 1, state: "warn", health: 58, alerts: 2, risk: 0.55, sig: "Jitter 30+ ms at shift start, 5 days running", act: "Circuit upgrade (problem record open)" });
      if (k === "psu" && d.t === "srv") Object.assign(d, { state: "warn", health: 52, alerts: 1, risk: 0.72, sig: "PSU 2 output voltage drifting 11.6 → 11.2 V", act: "Replace PSU 2 before it fails (redundancy lost)", eta: 6 });
      if (k === "temp" && d.t === "ilo") Object.assign(d, { state: "warn", health: 55, temp: 34, alerts: 1, risk: 0.6, sig: "Inlet 34 °C; fan 3 at 92%", act: "Check room cooling; clean filters" });
      if (k === "esxi" && (d.t === "srv" || d.t === "vm")) off();
      if (k === "vmdisk" && d.t === "vm") Object.assign(d, { state: "warn", health: 48, disk: 93, alerts: 1, risk: 0.8, sig: "Disk 93% used; full in about 2 days", act: "Extend disk (CHG awaiting approval)", eta: 2 });
      if ((k === "qnap" || k === "drive") && d.t === "nas") Object.assign(d, { state: "warn", health: 50, alerts: 1, risk: 0.75, sig: "Disk 4 degraded; RAID rebuilding", act: "Replace disk 4", eta: 3 });
      if (k === "switch" && d.id.endsWith("-01") && d.t === "sw") Object.assign(d, { live: 1, state: "warn", health: 54, alerts: 2, risk: 0.65, sig: "Uplink CRC errors 1,240/min; port flaps", act: "Replace uplink optic; check cabling" });
      if (k === "spooler" && d.t === "prn") Object.assign(d, { live: 1, state: "warn", health: 55, alerts: 1, risk: 0.5, sig: "Queue stalled 3 times this week", act: "Driver update on print server" });
      if (maint) Object.assign(d, { state: "maint" });
      if (d.state === "ok") { d.health = Math.round(Math.min(d.health, 100 - d.risk * 55)); if (d.risk > 0.45) d.state = "warn"; }
      d.risk = Math.min(1, d.risk);
      if (d.risk > 0.2 && d.state !== "bad") d.trend = d.trend.map((x, i) => x + (d.risk - 0.15) * (i / 13) * (0.9 + r() * 0.2));
      if (scheduled[d.id]) d.sched = scheduled[d.id];
    });
    devCache[key] = { t: now, d: list };
    return list;
  }
  const hcol = (h, st) => st === "maint" ? C.maint : st === "bad" || h < 40 ? C.bad : st === "warn" || h < 70 ? C.warn : C.ok;
  const actBtn = (d, c) => d.sched ? pill("Scheduled · " + d.sched, C.ok) : `<button class="kcc-btn" data-kcc-act="schedule" data-dev="${d.id}" data-site="${c.id}">Schedule fix</button>`;

  function deviceHealth(c) {
    const ds = devices(c).slice().sort((a, b) => (a.state === "bad" ? -1 : 0) - (b.state === "bad" ? -1 : 0) || a.health - b.health);
    const cell = (v, warn, bad, u = "%") => v == null ? `<span class="kcc-muted">–</span>` : `<span style="color:${v >= bad ? C.bad : v >= warn ? C.warn : C.ink}">${v}${u}</span>`;
    const rows = ds.map((d) => `<tr class="kcc-click" ${kx({ t: "device", id: d.id })}><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${hcol(d.health, d.state)};margin-right:7px"></span><b class="kcc-num">${d.id}</b><div class="kcc-muted" style="font-size:11.5px;margin-left:15px">${DT[d.t]} · ${esc(d.model)}</div></td>
      <td><div style="display:flex;align-items:center;gap:6px"><b class="kcc-num" style="width:26px;color:${hcol(d.health, d.state)}">${d.state === "maint" ? "–" : d.health}</b>${bar(d.health, hcol(d.health, d.state), 6)}</div></td>
      <td class="kcc-num">${cell(d.cpu, 70, 90)}</td><td class="kcc-num">${d.mem != null ? cell(d.mem, 80, 92) : d.load != null ? cell(d.load, 70, 85) : cell(null)}</td><td class="kcc-num">${d.disk != null ? cell(d.disk, 80, 90) : d.toner != null ? cell(d.toner, 101, 101) : cell(null)}</td><td class="kcc-num">${d.temp != null ? cell(d.temp, d.t === "srv" || d.t === "ilo" ? 28 : 55, d.t === "srv" || d.t === "ilo" ? 32 : 65, "°") : cell(null)}</td>
      <td class="kcc-num">${d.state === "bad" ? `<span style="color:${C.bad}">down</span>` : d.up + " d"}</td><td class="kcc-num" style="${d.fw !== d.fwL ? "color:" + C.warn : ""}" title="${d.fw !== d.fwL ? "Latest: " + d.fwL : "Current"}">${esc(d.fw)}${d.fw !== d.fwL ? " ↑" : ""}</td>
      <td>${d.alerts ? pill(d.alerts + " open", d.state === "bad" ? C.bad : C.warn) : `<span class="kcc-muted">0</span>`}</td><td>${spark(d.trend, d.risk > 0.45 ? C.bad : d.risk > 0.2 ? C.warn : C.ok, 64, 20, 1)}</td></tr>`).join("");
    const cnt = { ok: ds.filter((d) => hcol(d.health, d.state) === C.ok).length, warn: ds.filter((d) => hcol(d.health, d.state) === C.warn).length, bad: ds.filter((d) => hcol(d.health, d.state) === C.bad).length };
    const outdated = ds.filter((d) => d.fw !== d.fwL).length;
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b style="color:${C.ok}">${cnt.ok}</b><span>healthy devices</span></div><div class="kcc-kpi"><b style="color:${C.warn}">${cnt.warn}</b><span>degraded or at risk</span></div><div class="kcc-kpi"><b style="color:${C.bad}">${cnt.bad}</b><span>down</span></div><div class="kcc-kpi"><b>${outdated}</b><span>behind on firmware</span></div></div>
      <div style="max-height:430px;overflow:auto" class="scroll-thin"><table class="kcc-dt"><thead><tr><th>Device</th><th style="width:150px">Health</th><th>CPU</th><th>Mem / load</th><th>Disk / toner</th><th>Temp</th><th>Uptime</th><th>Firmware</th><th>Alerts</th><th>Risk, 14 days</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    return card("kcc-dev", "Device health", `${ds.length} monitored devices · OpsRamp, vCenter, iLO, SD-WAN, Wi-Fi controller, UPS card · click a row to drill down`, body);
  }
  function predictive(c) {
    const ds = devices(c).filter((d) => d.risk >= 0.2 && d.state !== "bad" && d.act && !d.live).sort((a, b) => b.risk - a.risk).slice(0, 6);
    const rows = ds.map((d) => { const col = d.risk > 0.6 ? C.bad : d.risk > 0.35 ? C.warn : C.yellow; return `<div class="kcc-pred"><div style="display:flex;align-items:center;gap:10px"><b class="kcc-num kcc-click" ${kx({ t: "device", id: d.id })}>${d.id}</b><span class="kcc-muted" style="font-size:12px">${DT[d.t]}</span><span style="margin-left:auto">${pill(Math.round(d.risk * 100) + "% risk" + (d.eta ? " · ~" + d.eta + " days" : ""), col)}</span></div>
      <div style="display:flex;gap:12px;align-items:center;margin-top:6px"><div style="flex:1;min-width:0"><div style="font-size:12.5px"><span class="kcc-muted">Signal:</span> ${esc(d.sig)}</div><div style="font-size:12.5px;margin-top:2px"><span class="kcc-muted">Prevent:</span> <b>${esc(d.act)}</b></div></div>${spark(d.trend, col, 80, 26, 1)}${actBtn(d, c)}</div></div>`; }).join("");
    return card("kcc-pred", "Predicted failures, next 30 days", "Mova iO prediction agent · trend models on device telemetry, SMART, PSU, battery and error counters", rows || `<p class="kcc-muted">No device is trending towards failure.</p>`, pill(ds.length + " at risk", ds.length ? C.warn : C.ok));
  }
  function preventive(c) {
    const r = rnd("pm" + c.id), now = S().now, day = 864e5, plant = /Plant/.test(c.kind);
    const tasks = [["UPS self-test and runtime check", 30, `ups-${c.id}`], ["UPS battery inspection", 180, `ups-${c.id}`], ["Firmware review: switches and APs", 90, `sw-${c.id}-01`], ["Server hardware health check (iLO)", 30, `srv-${c.id}`], ["Backup restore test (SureBackup)", 30, `vm-${c.id}-app`], ["Server room filter and cooling check", 90, `ilo-${c.id}`], ["Certificate expiry review", 30, `edge-${c.id}-01`], ["Wi-Fi survey and channel plan", 180, `ap-${c.id}-01`], ...(plant ? [["Generator load test", 30, "generator"]] : []), ["Printer service kit", 120, `prn-${c.id}-01`]];
    const rows = tasks.map(([n, every, dev]) => { const since = Math.round(r() * every * 1.25); const due = every - since; const st = due < 0 ? ["Overdue " + -due + " d", C.bad] : due === 0 ? ["Due today", C.warn] : due <= 7 ? ["Due in " + due + " d", C.warn] : ["Next in " + due + " d", C.ok]; return { n, every, dev, since, due, st }; }).sort((a, b) => a.due - b.due);
    const comp = rows.filter((x) => x.due >= 0).length / rows.length;
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b style="color:${comp >= 0.9 ? C.ok : C.warn}">${pct(comp)}</b><span>maintenance plan on time</span></div><div class="kcc-kpi"><b>${rows.filter((x) => x.due < 0).length}</b><span>overdue</span></div><div class="kcc-kpi"><b>${rows.filter((x) => x.due >= 0 && x.due <= 7).length}</b><span>due this week</span></div></div>
      ${rows.map((x) => `<div class="kcc-row"><span style="flex:1;min-width:0">${esc(x.n)}<br><span class="kcc-muted" style="font-size:12px">every ${x.every} days · last done ${x.since} days ago</span></span>${pill(x.st[0], x.st[1])}${x.due <= 7 ? `<button class="kcc-btn" data-kcc-act="pm" data-task="${esc(x.n)}" data-site="${c.id}">${x.due < 0 ? "Book now" : "Book"}</button>` : `<span style="width:58px"></span>`}</div>`).join("")}`;
    return card("kcc-pm", "Preventive maintenance plan", "Recurring tasks in ServiceNow · booked into the Sunday 02:00 window or a field visit", body);
  }
  function reliability(c) {
    const r = rnd("rel" + c.id), now = S().now, n = 30, down = c.status === "down";
    const inc90 = 2 + Math.floor(r() * 5) + (c.status !== "healthy" ? 1 : 0), mtbf = Math.round((90 * 24) / inc90), mttr = Math.round(25 + r() * 70);
    const h = Array.from({ length: n }, (_, i) => Math.round(88 + r() * 10 - (r() < 0.06 ? 15 + r() * 15 : 0)));
    h[n - 1] = c.health != null ? c.health : h[n - 1];
    const W = 520, H = 110, x = (i) => (i / (n - 1)) * W, y = (v) => H - (Math.max(0, v - 40) / 60) * H;
    const path = h.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const dips = h.map((v, i) => [v, i]).filter(([v]) => v < 75);
    const svg = `<svg viewBox="0 -6 ${W} ${H + 22}" style="width:100%;height:auto;display:block"><rect x="0" y="${y(100)}" width="${W}" height="${y(70) - y(100)}" fill="${C.ok}10"/><line x1="0" x2="${W}" y1="${y(70)}" y2="${y(70)}" stroke="${C.warn}" stroke-dasharray="4 4"/><path d="${path} L${W} ${H} L0 ${H} Z" fill="${C.blue}18"/><path d="${path}" fill="none" stroke="${C.blue}" stroke-width="2"/>${dips.map(([v, i]) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${i === n - 1 && down ? C.bad : C.warn}"><title>Day ${i - n + 1}: health ${v}</title></circle>`).join("")}<text x="0" y="${H + 14}" font-size="10" fill="${C.muted}">30 days ago</text><text x="${W}" y="${H + 14}" font-size="10" fill="${C.muted}" text-anchor="end">today</text></svg>`;
    const repeat = [["Wi-Fi drops in the training room", 3], ["Print queue stalls after patching", 2], ["Jitter at shift start", c.issue && c.issue.kind === "jitter" ? 5 : 1]].filter((x) => x[1] > 1 || r() < 0.5);
    const prevented = [["Disk extended before it filled", "vm"], ["Battery swapped after a failed runtime test", "ups"], ["Drive replaced on SMART warning", "srv"], ["Optic swapped on rising CRC errors", "sw"]].filter(() => r() < 0.65);
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${inc90}</b><span>incidents, 90 days</span></div><div class="kcc-kpi"><b>${mtbf} h</b><span>mean time between failures</span></div><div class="kcc-kpi"><b>${mttr} min</b><span>mean time to restore</span></div><div class="kcc-kpi"><b style="color:${C.ok}">${prevented.length}</b><span>incidents prevented this quarter</span></div></div>
      <div class="kcc-muted" style="margin-bottom:4px">Site health score, last 30 days</div>${svg}
      <div class="kcc-grid kcc-g2" style="margin-top:10px;gap:14px"><div><div class="kcc-muted" style="margin-bottom:4px">Repeat issues (90 days)</div>${repeat.map(([t, n]) => `<div class="kcc-row"><span style="flex:1">${t}</span>${pill(n + "×", n > 2 ? C.warn : C.maint)}</div>`).join("") || `<p class="kcc-muted">None.</p>`}</div>
      <div><div class="kcc-muted" style="margin-bottom:4px">Prevented before users noticed</div>${prevented.map(([t]) => `<div class="kcc-row"><span style="color:${C.ok}">✓</span><span style="flex:1">${t}</span></div>`).join("") || `<p class="kcc-muted">Nothing this quarter.</p>`}</div></div>`;
    return card("kcc-rel", "Site reliability", "Health trend, failure rate and what was caught early", body);
  }
  function anomaly(c) {
    const r = rnd("an" + c.id), n = 7 * 24, base = 38 + r() * 8, k = c.issue && c.issue.kind;
    const vals = Array.from({ length: n }, (_, i) => { const hr = i % 24, busy = hr >= 9 && hr <= 18; return base + (busy ? 6 : 0) + (r() - 0.5) * 6; });
    const anom = [Math.floor(n * 0.42), Math.floor(n * 0.78)]; anom.forEach((i) => (vals[i] = base + 38 + r() * 20));
    if (["jitter", "onlte", "carrier-down", "edge-hw"].includes(k)) for (let i = n - 4; i < n; i++) vals[i] = base + 60 + r() * 40;
    const W = 560, H = 150, max = Math.max(...vals) * 1.05, x = (i) => (i / (n - 1)) * W, y = (v) => H - (v / max) * H;
    const band = vals.map((_, i) => { const hr = i % 24, busy = hr >= 9 && hr <= 18; return [base + (busy ? 6 : 0) - 6, base + (busy ? 6 : 0) + 7]; });
    const bandPath = band.map(([lo, hi], i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(hi).toFixed(1)}`).join(" ") + " " + band.slice().reverse().map(([lo], j) => `L${x(n - 1 - j).toFixed(1)} ${y(lo).toFixed(1)}`).join(" ") + " Z";
    const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const outs = vals.map((v, i) => [v, i]).filter(([v, i]) => v > band[i][1] + 8);
    const svg = `<svg viewBox="0 0 ${W} ${H + 16}" style="width:100%;height:auto;display:block"><path d="${bandPath}" fill="${C.ok}22"/><path d="${line}" fill="none" stroke="${C.blue}" stroke-width="1.4"/>${outs.map(([v, i]) => `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="${i > n - 6 ? C.bad : C.warn}"><title>${Math.round(v)} ms · outside the learned band</title></circle>`).join("")}${[0, 1, 2, 3, 4, 5, 6].map((d) => `<text x="${x(d * 24) + 4}" y="${H + 13}" font-size="10" fill="${C.muted}">${["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"][d]}</text>`).join("")}</svg>`;
    const body = `${svg}<div class="kcc-legend" style="margin-top:8px"><span><i style="background:${C.ok}55"></i>Learned normal band (time-of-day aware)</span><span><i style="background:${C.warn};border-radius:50%"></i>Anomaly, explained</span><span><i style="background:${C.bad};border-radius:50%"></i>Anomaly, active</span><span style="margin-left:auto">${outs.length} anomalies in 7 days · ${outs.filter(([, i]) => i > n - 6).length ? "1 active" : "none active"}</span></div>`;
    return card("kcc-anom", "Latency to hub vs learned baseline", "Anomaly detection on the SD-WAN path, last 7 days, hourly", body);
  }
  function renderSitePP(c) {
    return `<div class="kcc-h2"><b>Health, prediction and prevention</b><span>every device, what is likely to fail next, and the plan to stop it</span></div>
      ${deviceHealth(c)}
      <div class="kcc-grid kcc-g2">${predictive(c)}${preventive(c)}</div>
      <div class="kcc-grid kcc-g21">${reliability(c)}${anomaly(c)}</div>`;
  }

  // ---------- Command Center: fleet view of the same
  function fleetHealth() {
    const types = ["edge", "sw", "ap", "srv", "vm", "nas", "ups", "prn"], agg = {};
    types.forEach((t) => (agg[t] = { ok: 0, warn: 0, bad: 0, maint: 0 }));
    S().clinics.forEach((c) => devices(c).forEach((d) => { if (!agg[d.t]) return; const col = hcol(d.health, d.state); agg[d.t][col === C.ok ? "ok" : col === C.warn ? "warn" : col === C.bad ? "bad" : "maint"]++; }));
    const rows = types.map((t) => { const a = agg[t], tot = a.ok + a.warn + a.bad + a.maint; return `<div class="kcc-row"><span style="width:118px;flex:none">${{ edge: "SD-WAN edges", sw: "Switches", ap: "Access points", srv: "ESXi hosts", vm: "Site VMs", nas: "NAS", ups: "UPS", prn: "Printers" }[t]}</span><div style="flex:1;display:flex;height:14px;border-radius:5px;overflow:hidden">${["ok", "warn", "bad", "maint"].map((s) => a[s] ? `<i title="${a[s]} ${s}" style="width:${(a[s] / tot) * 100}%;background:${{ ok: C.ok, warn: C.warn, bad: C.bad, maint: C.maint }[s]}${s === "ok" ? "AA" : ""}"></i>` : "").join("")}</div><b class="kcc-num" style="width:34px;text-align:right">${tot}</b><span class="kcc-num" style="width:58px;text-align:right;color:${a.warn + a.bad ? C.warn : C.muted}">${a.warn + a.bad} at risk</span></div>`; }).join("");
    return card("kcc-fleet", "Fleet device health", "Every monitored device across all sites, by type", rows + `<div class="kcc-legend" style="margin-top:10px"><span><i style="background:${C.ok}AA"></i>Healthy</span><span><i style="background:${C.warn}"></i>Degraded or at risk</span><span><i style="background:${C.bad}"></i>Down</span><span><i style="background:${C.maint}"></i>Maintenance</span></div>`);
  }
  function fleetPredict() {
    const all = []; S().clinics.forEach((c) => devices(c).forEach((d) => { if (d.risk >= 0.3 && d.state !== "bad" && d.state !== "maint" && d.act && !d.live) all.push({ c, d }); }));
    all.sort((a, b) => b.d.risk - a.d.risk);
    const cap = {}, top = all.filter(({ d }) => (cap[d.t] = (cap[d.t] || 0) + 1) <= 2).slice(0, 8);
    const rows = top.map(({ c, d }) => { const col = d.risk > 0.6 ? C.bad : C.warn; return `<div class="kcc-row"><span style="width:44px;flex:none" class="kcc-click" ${kx({ t: "site", id: c.id })}><b>${c.code}</b></span><span style="flex:1;min-width:0"><b class="kcc-num kcc-click" style="font-size:12px" ${kx({ t: "device", id: d.id })}>${d.id}</b> <span class="kcc-muted" style="font-size:12px">${esc(d.sig)}</span><br><span style="font-size:12px">→ ${esc(d.act)}</span></span>${pill(Math.round(d.risk * 100) + "%" + (d.eta ? " · " + d.eta + " d" : ""), col)}${actBtn(d, c)}</div>`; }).join("");
    return card("kcc-fpred", "Predicted failures, all sites", `${all.length} devices trending towards failure in the next 30 days · top risks, at most two per device type`, rows);
  }
  function fleetPrevent() {
    const r = rnd("fprev"), regions = [...new Set(S().clinics.map((c) => c.region))];
    const rows = regions.map((rg) => { const v = 0.82 + r() * 0.17; return `<div class="kcc-row"><span style="width:150px;flex:none">${esc(rg)}</span>${bar(v * 100, v >= 0.9 ? C.ok : C.warn, 7)}<b class="kcc-num" style="width:44px;text-align:right">${pct(v)}</b></div>`; }).join("");
    const prevented = [["hyd-city-fs-02", "Disk extended 5 days before full", "Fri"], ["ups-0389", "Battery set replaced after runtime test", "Thu"], ["srv-0912", "Drive 3 replaced on SMART warning", "Wed"], ["edge-0745-01", "SFP swapped on rising CRC errors", "Tue"], ["Repo-HQ-02", "Retention cut to stop repository filling", "Mon"]];
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b style="color:${C.ok}">14</b><span>incidents prevented this month</span></div><div class="kcc-kpi"><b>31 h</b><span>outage time avoided (estimate)</span></div><div class="kcc-kpi"><b>92%</b><span>maintenance plan on time</span></div></div>
      <div class="kcc-muted" style="margin-bottom:4px">Preventive maintenance on time, by region</div>${rows}
      <div class="kcc-muted" style="margin:12px 0 4px">Recently prevented</div>${prevented.map(([d, t, w]) => `<div class="kcc-row"><span style="color:${C.ok}">✓</span><b class="kcc-num" style="font-size:12px;width:112px;flex:none">${d}</b><span style="flex:1">${t}</span><span class="kcc-muted">${w}</span></div>`).join("")}`;
    return card("kcc-fprev", "Prevention", "Caught early, fixed in a window, before users noticed", body);
  }
  function renderCCPP() {
    return `<div class="kcc-h2"><b>Predict and prevent</b><span>device health across the estate, what is likely to fail, and what was stopped early</span></div>
      <div class="kcc-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) minmax(0,1fr)">${fleetHealth()}${fleetPredict()}${fleetPrevent()}</div>`;
  }
  // buttons: schedule a preventive fix or book a maintenance task
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kcc-act]"); if (!b) return; e.preventDefault(); e.stopPropagation();
    const site = S().clinics.find((c) => c.id === b.dataset.site);
    if (b.dataset.kccAct === "schedule") { const n = "CHG00" + (31900 + Math.floor(Math.random() * 90)); scheduled[b.dataset.dev] = n; Object.keys(devCache).forEach((k) => delete devCache[k]); toast("Preventive change raised", `${n} for ${b.dataset.dev}${site ? " at " + site.label : ""}, booked into the Sunday 02:00 window.`); }
    else { toast("Maintenance booked", `${b.dataset.task}${site ? " · " + site.label : ""} · Sunday 02:00 window, field engineer notified.`); b.outerHTML = pill("Booked", C.ok); }
    last.k = ""; tick();
  }, true);

  // ================= ESTATE GRAPHS (Command Center) and LIVE ESTATE TELEMETRY (Live Operations) =================
  const REG = () => [...new Set(S().clinics.map((c) => c.region))];
  const RCOL = ["#8E4A86", "#E15AA5", "#F39237", "#D9A21B", "#4E3047", "#B83A80"];
  const bwOf = (c) => { const b = String((c.primaryCircuit && c.primaryCircuit.bandwidth) || "100M"); return (parseFloat(b) || 100) * (/G/i.test(b) ? 1000 : 1); };
  const wave = (seed, t, base, amp, period, noise = 0.15, step = 10000) => { const ph = rnd(seed)() * 6.28, n = rnd(seed + Math.floor(t / step))(); return base + amp * Math.sin((2 * Math.PI * t) / period + ph) + (n - 0.5) * 2 * noise * base; };
  const busy = (c, t) => { const h = new Date(t).getHours() + new Date(t).getMinutes() / 60, o = parseInt((c.hours && c.hours.open) || "08"), cl = parseInt((c.hours && c.hours.close) || "18"); const ramp = (x) => Math.max(0, Math.min(1, x)); return 0.18 + 0.82 * ramp(h - o + 0.5) * ramp(cl - h + 0.5); };
  const siteUtil = (c, t) => { if (c.status === "down" && ["carrier-down", "edge-hw", "power"].includes(c.issue && c.issue.kind) && t > S().now - 30 * 6e4) return 0; return Math.max(0.03, Math.min(0.97, wave("u" + c.id, t, 0.42 * busy(c, t) + 0.08, 0.12, 3600e3 * 3, 0.12))); };
  const siteLat = (c, t) => { const k = c.issue && c.issue.kind, base = 28 + (rnd("lb" + c.id)() * 30), recent = t > S().now - 30 * 6e4; if (c.status === "down" && ["carrier-down", "edge-hw", "power"].includes(k) && recent) return null; return Math.max(8, wave("l" + c.id, t, base * (k === "onlte" && recent ? 1.9 : k === "jitter" && recent ? 1.6 : 1), 6, 1800e3, 0.08)); };
  const siteLoss = (c, t) => { const k = c.issue && c.issue.kind, recent = t > S().now - 30 * 6e4; return Math.max(0, wave("p" + c.id, t, k === "jitter" && recent ? 1.8 : k === "onlte" && recent ? 0.9 : 0.12, 0.05, 900e3, 0.6)); };
  const lineChart = (series, o) => {
    const W = o.w || 560, H = o.h || 150, n = series[0].v.length, all = series.flatMap((s) => s.v).filter((x) => x != null), max = o.max || Math.max(...all) * 1.1 || 1, min = o.min || 0;
    const x = (i) => (i / (n - 1)) * W, y = (v) => H - ((v - min) / (max - min)) * H;
    let s = `<svg viewBox="0 -12 ${W} ${H + 28}" style="width:100%;height:auto;display:block">`;
    for (let g = 0; g <= 3; g++) { const v = min + ((max - min) * g) / 3; s += `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#F0ECEF"/><text x="2" y="${y(v) - 3}" font-size="10" fill="${C.muted}">${o.fmt ? o.fmt(v) : Math.round(v)}</text>`; }
    if (o.cap) s += `<line x1="0" x2="${W}" y1="${y(o.cap)}" y2="${y(o.cap)}" stroke="${C.bad}" stroke-dasharray="4 4"/><text x="${W - 2}" y="${y(o.cap) - 3}" font-size="10" text-anchor="end" fill="${C.bad}">${o.capLabel || ""}</text>`;
    if (o.stack) { let acc = new Array(n).fill(0); series.forEach((sr) => { const lo = acc.slice(); acc = acc.map((a, i) => a + (sr.v[i] || 0)); s += `<path d="${acc.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")} ${lo.map((v, i) => `L${x(n - 1 - i).toFixed(1)} ${y(lo[n - 1 - i]).toFixed(1)}`).join(" ")} Z" fill="${sr.c}" opacity=".85"><title>${esc(sr.n)}</title></path>`; }); }
    else series.forEach((sr) => { let d = "", pen = false; sr.v.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `; pen = true; }); s += `${sr.fill ? `<path d="${d} L${W} ${H} L0 ${H} Z" fill="${sr.c}18"/>` : ""}<path d="${d}" fill="none" stroke="${sr.c}" stroke-width="${sr.w || 1.8}"><title>${esc(sr.n)}</title></path>`; const lv = sr.v[n - 1]; if (o.dots && lv != null) s += `<circle cx="${W}" cy="${y(lv)}" r="3.5" fill="${sr.c}"/>`; });
    (o.ticks || []).forEach(([i, t]) => (s += `<text x="${x(i)}" y="${H + 14}" font-size="10" fill="${C.muted}" text-anchor="${i === 0 ? "start" : i >= n - 1 ? "end" : "middle"}">${t}</text>`));
    return s + `</svg>`;
  };
  const legend = (items) => `<div class="kcc-legend" style="margin-top:8px">${items.map(([n, c, v]) => `<span><i style="background:${c}"></i>${esc(n)}${v != null ? ` <b style="color:${C.ink}">${v}</b>` : ""}</span>`).join("")}</div>`;
  const donut = (parts, size = 150, label = "", sub = "") => { const tot = parts.reduce((a, p) => a + p[1], 0) || 1, R = size / 2 - 10, cx = size / 2; let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;flex:none">`; parts.forEach(([n, v, col]) => { const a1 = a0 + (v / tot) * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0; s += `<path d="M${cx + R * Math.cos(a0)} ${cx + R * Math.sin(a0)} A${R} ${R} 0 ${lg} 1 ${cx + R * Math.cos(a1)} ${cx + R * Math.sin(a1)}" fill="none" stroke="${col}" stroke-width="18"><title>${esc(n)}: ${v}</title></path>`; a0 = a1; }); return s + `<text x="${cx}" y="${cx + 2}" text-anchor="middle" font-size="22" font-weight="700" fill="${C.ink}">${label}</text><text x="${cx}" y="${cx + 20}" text-anchor="middle" font-size="11" fill="${C.muted}">${sub}</text></svg>`; };
  const hours24 = (now) => Array.from({ length: 25 }, (_, i) => now - (24 - i) * 3600e3);

  // ----- Command Center estate
  function estInventory() {
    const cl = S().clinics, cnt = {}; cl.forEach((c) => devices(c).forEach((d) => (cnt[d.t] = (cnt[d.t] || 0) + 1)));
    const pcs = cl.reduce((a, c) => a + (c.wsCount || 20) + Math.round((c.users || 100) * 0.6), 0), users = cl.reduce((a, c) => a + (c.users || 0), 0);
    const parts = [["Access points", cnt.ap, RCOL[0]], ["Switches", cnt.sw, RCOL[1]], ["SD-WAN edges", cnt.edge, RCOL[2]], ["Servers, iLO, VMs", (cnt.srv || 0) + (cnt.ilo || 0) + (cnt.vm || 0), RCOL[3]], ["NAS and UPS", (cnt.nas || 0) + (cnt.ups || 0), RCOL[4]], ["Printers", cnt.prn, RCOL[5]]];
    const infra = parts.reduce((a, p) => a + p[1], 0);
    const kinds = {}; cl.forEach((c) => (kinds[c.kind] = (kinds[c.kind] || 0) + 1));
    const body = `<div style="display:flex;gap:16px;align-items:center">${donut(parts, 150, infra, "infra devices")}<div style="flex:1">${parts.map(([n, v, col]) => `<div class="kcc-row"><i style="width:10px;height:10px;border-radius:3px;background:${col};flex:none"></i><span style="flex:1">${n}</span><b class="kcc-num">${v}</b></div>`).join("")}</div></div>
      <div class="kcc-kpis" style="margin-top:12px;margin-bottom:0"><div class="kcc-kpi"><b>${cl.length}</b><span>sites · ${Object.entries(kinds).map(([k, v]) => v + " " + k.toLowerCase() + (v > 1 && !/s$/.test(k) ? "s" : "")).join(", ")}</span></div><div class="kcc-kpi"><b>${pcs.toLocaleString()}</b><span>PCs and laptops</span></div><div class="kcc-kpi"><b>${users.toLocaleString()}</b><span>people on site</span></div></div>`;
    return card("kcc-inv", "Estate inventory", "Everything monitored, from the CMDB and OpsRamp", body);
  }
  function estWan() {
    const now = S().now, hs = hours24(now), regs = REG();
    const series = regs.map((rg, i) => ({ n: rg, c: RCOL[i % RCOL.length], v: hs.map((t) => S().clinics.filter((c) => c.region === rg).reduce((a, c) => a + bwOf(c) * siteUtil(c, t), 0)) }));
    const cap = S().clinics.reduce((a, c) => a + bwOf(c), 0), nowTot = series.reduce((a, s) => a + s.v[24], 0), peak = Math.max(...hs.map((_, i) => series.reduce((a, s) => a + s.v[i], 0)));
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${(nowTot / 1000).toFixed(2)} Gbps</b><span>WAN traffic now</span></div><div class="kcc-kpi"><b>${(peak / 1000).toFixed(2)} Gbps</b><span>peak, 24 h</span></div><div class="kcc-kpi"><b>${(cap / 1000).toFixed(1)} Gbps</b><span>contracted, ${S().clinics.length} primary circuits</span></div></div>
      ${lineChart(series.map((sr) => { const capR = S().clinics.filter((c) => c.region === sr.n).reduce((x, c) => x + bwOf(c), 0) || 1; return { n: sr.n, c: sr.c, v: sr.v.map((v) => (v / capR) * 100) }; }), { h: 160, max: 100, dots: 1, fmt: (v) => Math.round(v) + "%", cap: 80, capLabel: "80% planning threshold", ticks: [[0, hm(hs[0])], [6, hm(hs[6])], [12, hm(hs[12])], [18, hm(hs[18])], [24, "now"]] })}${legend(series.map((sr) => { const capR = S().clinics.filter((c) => c.region === sr.n).reduce((x, c) => x + bwOf(c), 0) || 1; return [sr.n, sr.c, Math.round((sr.v[24] / capR) * 100) + "%"]; }))}`;
    return card("kcc-wan24", "WAN use by region", "Share of contracted capacity in use, primary circuits, last 24 hours · SD-WAN", body);
  }
  function estCarriers() {
    const cl = S().clinics, by = {}; cl.forEach((c) => { const k = c.carrier || "Other"; (by[k] = by[k] || []).push(c); });
    const rows = Object.entries(by).sort((a, b) => b[1].length - a[1].length).map(([k, cs]) => { const r = rnd("car" + k), av = 99.5 + r() * 0.48 - cs.filter((c) => c.status === "down" && ["carrier-down"].includes(c.issue && c.issue.kind)).length * 0.3, lat = cs.map((c) => siteLat(c, S().now)).filter((x) => x != null), al = lat.length ? lat.reduce((a, b) => a + b, 0) / lat.length : 0, bad = cs.filter((c) => ["carrier-down", "onlte", "jitter"].includes(c.issue && c.issue.kind)).length; return `<tr><td><b>${esc(k)}</b></td><td class="kcc-num">${cs.length}</td><td class="kcc-num">${cs.reduce((a, c) => a + bwOf(c), 0)} Mbps</td><td style="width:150px"><div style="display:flex;gap:6px;align-items:center">${bar((av - 99) * 100, av >= 99.9 ? C.ok : av >= 99.5 ? C.warn : C.bad, 6)}<span class="kcc-num">${av.toFixed(2)}%</span></div></td><td class="kcc-num">${lat.length ? Math.round(al) + " ms" : "–"}</td><td>${bad ? pill(bad + " affected", C.warn) : pill("clear", C.ok)}</td></tr>`; }).join("");
    return card("kcc-car", "Circuits by carrier", "Availability over 30 days, latency now, sites affected", `<table class="kcc-dt"><thead><tr><th>Carrier</th><th>Sites</th><th>Capacity</th><th>Availability</th><th>Latency</th><th>Now</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
  function estLatency() {
    const now = S().now, rows = S().clinics.map((c) => ({ c, v: siteLat(c, now), l: siteLoss(c, now) })).sort((a, b) => (b.v == null ? 999 : b.v) - (a.v == null ? 999 : a.v)).slice(0, 10), max = Math.max(...rows.map((r) => r.v || 0), 120);
    return card("kcc-lat", "Latency to hub, worst 10 sites", "Active path, now · packet loss alongside", rows.map(({ c, v, l }) => { const col = v == null ? C.bad : v > 120 ? C.bad : v > 70 ? C.warn : C.ok; return `<div class="kcc-row kcc-click" ${kx({ t: "site", id: c.id })}><span style="width:150px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b>${c.code}</b> <span class="kcc-muted">${esc(c.short || c.name)}</span></span>${bar(v == null ? 100 : (v / max) * 100, col, 10)}<b class="kcc-num" style="width:62px;text-align:right;color:${col}">${v == null ? "down" : Math.round(v) + " ms"}</b><span class="kcc-num kcc-muted" style="width:48px;text-align:right">${v == null ? "–" : l.toFixed(2) + "%"}</span></div>`; }).join(""));
  }
  function estCompute() {
    const now = S().now, hs = hours24(now);
    const cpuA = hs.map((t) => wave("avs-cpu", t, 46, 12, 86400e3, 0.06)), memA = hs.map((t) => wave("avs-mem", t, 68, 4, 86400e3, 0.02)), cpuS = hs.map((t) => S().clinics.reduce((a, c) => a + wave("sc" + c.id, t, 18 + 30 * busy(c, t), 6, 7200e3, 0.1), 0) / S().clinics.length);
    const ds = [["AVS vSAN datastore", 71], ["HQ-DS-01", 64], ["HYD-DS-02", 81], ["RAK-DS-01", 58], ["HAR-DS-01", 39]];
    const vms = S().clinics.length * 4 + 212;
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${S().clinics.length * 2 + 16}</b><span>ESXi hosts</span></div><div class="kcc-kpi"><b>${vms}</b><span>virtual machines</span></div><div class="kcc-kpi"><b>${Math.round(cpuA[24])}%</b><span>AVS cluster CPU now</span></div></div>
      ${lineChart([{ n: "AVS cluster CPU", c: RCOL[0], v: cpuA, fill: 1 }, { n: "AVS cluster memory", c: RCOL[2], v: memA }, { n: "Site hosts CPU (avg)", c: RCOL[1], v: cpuS }], { h: 130, max: 100, fmt: (v) => Math.round(v) + "%", ticks: [[0, "-24 h"], [12, "-12 h"], [24, "now"]], dots: 1 })}${legend([["AVS cluster CPU", RCOL[0]], ["AVS cluster memory", RCOL[2]], ["Site hosts CPU", RCOL[1]]])}
      <div class="kcc-muted" style="margin:12px 0 4px">Datastores</div>${ds.map(([n, v]) => `<div class="kcc-row"><span style="width:150px;flex:none">${n}</span>${bar(v, v > 80 ? C.warn : C.blue, 7)}<b class="kcc-num" style="width:40px;text-align:right">${v}%</b></div>`).join("")}`;
    return card("kcc-comp", "Compute and virtualisation", "Azure VMware Solution core and site ESXi hosts, last 24 hours · vCenter", body);
  }
  function estStorage() {
    const regs = REG(), r = rnd("sto");
    const data = regs.map((rg, i) => { const cap = 20 + Math.round(r() * 60), used = Math.round(cap * (0.45 + r() * 0.4)); return { rg, cap, used, col: RCOL[i % RCOL.length] }; });
    const tot = data.reduce((a, d) => a + d.cap, 0), used = data.reduce((a, d) => a + d.used, 0);
    const grow = Array.from({ length: 13 }, (_, i) => used * (0.86 + i * 0.012) + r() * 2);
    const body = `<div class="kcc-kpis"><div class="kcc-kpi"><b>${used} / ${tot} TB</b><span>used across sites and AVS</span></div><div class="kcc-kpi"><b>+${(((grow[12] - grow[0]) / grow[0]) * 100).toFixed(1)}%</b><span>growth, 90 days</span></div></div>
      ${data.map((d) => `<div class="kcc-row"><span style="width:150px;flex:none">${esc(d.rg)}</span><div class="kcc-bar" style="height:12px"><i style="width:${(d.used / d.cap) * 100}%;background:${d.col}"></i></div><span class="kcc-num" style="width:86px;text-align:right">${d.used} / ${d.cap} TB</span></div>`).join("")}
      <div class="kcc-muted" style="margin:12px 0 4px">Used capacity, last 90 days</div>${lineChart([{ n: "Used TB", c: C.mag, v: grow, fill: 1 }], { h: 70, min: Math.floor(grow[0] * 0.95), fmt: (v) => Math.round(v) + " TB", ticks: [[0, "90 days ago"], [12, "today"]] })}`;
    return card("kcc-sto", "Storage capacity", "NAS, site datastores and AVS vSAN", body);
  }
  function estEndpoints() {
    const r = rnd("ep"), bins = [["<50", 2], ["50–60", 4], ["60–70", 9], ["70–80", 22], ["80–90", 41], ["90+", 22]].map(([l, v]) => [l, Math.round(v * (0.9 + r() * 0.2))]), max = Math.max(...bins.map((b) => b[1]));
    const os = [["Windows 11 24H2", 61, RCOL[0]], ["Windows 11 23H2", 27, RCOL[1]], ["Windows 10 22H2", 9, RCOL[2]], ["macOS", 3, RCOL[3]]];
    const age = [["< 2 years", 38], ["2–3 years", 34], ["3–4 years", 19], ["4+ years", 9]];
    const body = `<div class="kcc-muted" style="margin-bottom:4px">Experience score (DEX), % of devices</div><div style="display:flex;gap:6px;align-items:flex-end;height:90px">${bins.map(([l, v], i) => `<div style="flex:1;text-align:center"><div class="kcc-num" style="font-size:11px">${v}%</div><div style="height:${(v / max) * 60}px;background:${i < 2 ? C.bad : i < 3 ? C.warn : C.ok};border-radius:4px 4px 0 0;opacity:.85"></div><div class="kcc-muted" style="font-size:11px">${l}</div></div>`).join("")}</div>
      <div style="display:flex;gap:14px;align-items:center;margin-top:14px">${donut(os.map(([n, v, c]) => [n, v, c]), 120, "OS", "builds")}<div style="flex:1">${os.map(([n, v, c]) => `<div class="kcc-row"><i style="width:10px;height:10px;border-radius:3px;background:${c};flex:none"></i><span style="flex:1">${n}</span><b class="kcc-num">${v}%</b></div>`).join("")}</div></div>
      <div class="kcc-muted" style="margin:10px 0 4px">Device age</div><div style="display:flex;height:16px;border-radius:5px;overflow:hidden">${age.map(([l, v], i) => `<i title="${l}: ${v}%" style="width:${v}%;background:${[C.ok, C.blue, C.warn, C.bad][i]}"></i>`).join("")}</div>${legend(age.map(([l, v], i) => [l, [C.ok, C.blue, C.warn, C.bad][i], v + "%"]))}`;
    return card("kcc-ep", "PCs and laptops", "Endpoint Analytics and Intune", body);
  }
  function estAvail() {
    const cl = S().clinics, days = 30, now = S().now;
    const cell = (c, d) => { if (d === days - 1) return c.status === "down" ? [C.bad, "down now"] : c.status === "degraded" ? [C.warn, "degraded now"] : c.status === "maintenance" ? [C.maint, "maintenance"] : [C.ok + "88", "100%"]; const r = rnd("av" + c.id + d)(); return r < 0.012 ? [C.bad, (97 + r * 100).toFixed(2) + "%"] : r < 0.04 ? [C.warn, (99.4 + r).toFixed(2) + "%"] : [C.ok + "88", "100%"]; };
    const head = `<tr><td></td>${Array.from({ length: days }, (_, d) => `<td style="font-size:10px;color:${C.muted};text-align:center">${(d % 5 === 0 || d === days - 1) ? new Date(now - (days - 1 - d) * 864e5).getDate() : ""}</td>`).join("")}<td></td></tr>`;
    const rows = cl.map((c) => { const cells = Array.from({ length: days }, (_, d) => cell(c, d)); const up = 100 - cells.filter((x) => x[0] === C.bad).length * 0.12 - cells.filter((x) => x[0] === C.warn).length * 0.02; return `<tr><td class="kcc-click" style="white-space:nowrap;padding-right:8px" ${kx({ t: "site", id: c.id })}><b>${c.code}</b> <span class="kcc-muted">${esc(c.short || c.name)}</span></td>${cells.map(([col, t], d) => `<td title="${c.code} · ${new Date(now - (days - 1 - d) * 864e5).toDateString().slice(4, 10)} · ${t}" style="background:${col};height:16px;border-radius:3px"></td>`).join("")}<td class="kcc-num" style="padding-left:8px;font-weight:650">${up.toFixed(2)}%</td></tr>`; }).join("");
    return card("kcc-avail", "Site availability, last 30 days", "Daily availability per site · red: outage, amber: degraded", `<table style="width:100%;border-collapse:separate;border-spacing:2px;font-size:12px;table-layout:fixed"><colgroup><col style="width:190px">${"<col>".repeat(days)}<col style="width:64px"></colgroup>${head}${rows}</table>${legend([["100%", C.ok + "88"], ["Degraded", C.warn], ["Outage", C.bad], ["Maintenance", C.maint]])}`);
  }
  function renderEstate() {
    return `<div class="kcc-h2"><b>Estate</b><span>sites, circuits, compute, storage and endpoints</span></div>
      <div class="kcc-grid kcc-g2">${estCarriers()}${estLatency()}</div>
      <div class="kcc-grid kcc-g21">${estWan()}${estCompute()}</div>
      <div class="kcc-grid kcc-g2">${estStorage()}${estEndpoints()}</div>
      ${estAvail()}`;
  }

  // ----- Live Operations: streaming estate telemetry
  function liveThroughput() {
    const now = S().now, N = 60, ts = Array.from({ length: N }, (_, i) => now - (N - 1 - i) * 10000), regs = REG();
    const series = regs.map((rg, i) => ({ n: rg, c: RCOL[i % RCOL.length], v: ts.map((t) => S().clinics.filter((c) => c.region === rg).reduce((a, c) => a + bwOf(c) * siteUtil(c, t) * (0.92 + rnd("tp" + c.id + Math.floor(t / 10000))() * 0.16), 0)) }));
    return card("kcc-ltp", "WAN throughput by region", "Inbound, every 10 seconds, last 10 minutes", lineChart(series, { h: 170, dots: 1, fmt: (v) => Math.round(v) + "M", ticks: [[0, "-10 min"], [30, "-5 min"], [59, "now"]] }) + legend(series.map((s) => [s.n, s.c, Math.round(s.v[N - 1]) + " Mbps"])), pill("Live", C.ok));
  }
  function liveLatHeat() {
    const now = S().now, M = 30, cl = S().clinics;
    const col = (v) => v == null ? C.bad : v < 40 ? "#CFE8D7" : v < 60 ? "#9FD0AE" : v < 80 ? "#F6D49A" : v < 120 ? C.warn : C.bad;
    const rows = cl.map((c) => `<tr><td class="kcc-click" style="white-space:nowrap;padding-right:8px;font-size:12px" ${kx({ t: "site", id: c.id })}><b>${c.code}</b></td>${Array.from({ length: M }, (_, i) => { const t = now - (M - 1 - i) * 6e4, v = siteLat(c, t); return `<td title="${c.code} · ${hm(t)} · ${v == null ? "no path" : Math.round(v) + " ms"}" style="background:${col(v)};height:14px;border-radius:2px"></td>`; }).join("")}<td class="kcc-num" style="padding-left:6px;font-size:12px">${siteLat(c, now) == null ? "down" : Math.round(siteLat(c, now))}</td></tr>`).join("");
    return card("kcc-lheat", "Latency heatmap, every site", "Per minute, last 30 minutes · ms to hub on the active path", `<table style="width:100%;border-collapse:separate;border-spacing:2px">${rows}</table>${legend([["< 40 ms", "#CFE8D7"], ["40–60", "#9FD0AE"], ["60–80", "#F6D49A"], ["80–120", C.warn], ["> 120 or down", C.bad]])}`, pill("Live", C.ok));
  }
  function liveCarrierLoss() {
    const now = S().now, by = {}; S().clinics.forEach((c) => (by[c.carrier || "Other"] = by[c.carrier || "Other"] || []).push(c));
    const rows = Object.entries(by).map(([k, cs]) => { const series = Array.from({ length: 30 }, (_, i) => cs.reduce((a, c) => a + siteLoss(c, now - (29 - i) * 6e4), 0) / cs.length), v = series[29], col = v > 1 ? C.bad : v > 0.4 ? C.warn : C.ok; return `<div class="kcc-row"><span style="width:90px;flex:none"><b>${esc(k)}</b></span>${spark(series, col, 140, 26, Math.max(1.5, ...series))}<b class="kcc-num" style="width:56px;text-align:right;color:${col}">${v.toFixed(2)}%</b><span class="kcc-muted kcc-num" style="width:56px;text-align:right">${cs.length} sites</span></div>`; }).join("");
    return card("kcc-lloss", "Packet loss by carrier", "Average across that carrier's sites, last 30 minutes", rows, pill("Live", C.ok));
  }
  function liveUsers() {
    const now = S().now, cl = S().clinics, N = 30, ts = Array.from({ length: N }, (_, i) => now - (N - 1 - i) * 6e4);
    const m = [["Wi-Fi clients", (t) => cl.reduce((a, c) => a + (c.status === "down" && t > now - 30 * 6e4 && (c.issue || {}).kind === "power" ? 0 : (c.users || 100) * 0.9 * busy(c, t)), 0) * (0.95 + rnd("wf" + Math.floor(t / 6e4))() * 0.1), RCOL[0]], ["GlobalProtect VPN sessions", (t) => 640 + wave("vpn", t, 0, 60, 3600e3, 0), RCOL[1]], ["Teams calls in progress", (t) => Math.max(0, wave("tc", t, 180, 40, 1800e3, 0.2)), RCOL[2]], ["File Services sessions (RDS)", (t) => wave("rds", t, 1150, 90, 3600e3, 0.04), RCOL[4]]];
    return card("kcc-lusers", "People on the estate now", "Connected sessions, last 30 minutes", m.map(([n, f, col]) => { const v = ts.map(f); return `<div class="kcc-row"><span style="flex:1">${n}</span>${spark(v, col, 130, 28)}<b class="kcc-num" style="width:64px;text-align:right;font-size:16px">${Math.round(v[N - 1]).toLocaleString()}</b></div>`; }).join(""), pill("Live", C.ok));
  }
  function liveTopCircuits() {
    const now = S().now, rows = S().clinics.map((c) => ({ c, u: siteUtil(c, now) })).sort((a, b) => b.u - a.u).slice(0, 10);
    return card("kcc-ltop", "Busiest circuits now", "Primary circuit use, in and out", rows.map(({ c, u }) => { const col = u > 0.8 ? C.bad : u > 0.65 ? C.warn : C.blue; return `<div class="kcc-row kcc-click" ${kx({ t: "site", id: c.id })}><span style="width:150px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b>${c.code}</b> <span class="kcc-muted">${esc(c.carrier || "")} ${bwOf(c)}M</span></span>${bar(u * 100, col, 10)}<b class="kcc-num" style="width:44px;text-align:right">${Math.round(u * 100)}%</b><span class="kcc-num kcc-muted" style="width:70px;text-align:right">${(u * bwOf(c)).toFixed(1)} Mbps</span></div>`; }).join(""), pill("Live", C.ok));
  }
  function liveCompute() {
    const now = S().now, vms = S().clinics.filter((c) => c.status !== "maintenance").map((c) => ({ id: `vm-${c.id}-app`, c, v: (c.issue && c.issue.kind === "esxi") ? null : Math.min(99, wave("vmc" + c.id, now, 20 + 40 * busy(c, now), 12, 900e3, 0.15)) })).sort((a, b) => (b.v == null ? 999 : b.v) - (a.v == null ? 999 : a.v)).slice(0, 8);
    const g = (v, l) => { const a = Math.PI * (1 - v / 100), x = 60 + 46 * Math.cos(a), y = 58 - 46 * Math.sin(a), col = v > 85 ? C.bad : v > 70 ? C.warn : C.ok; return `<div style="flex:1;text-align:center"><svg viewBox="0 0 120 70" style="width:100%;max-width:140px"><path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="#EFEAEE" stroke-width="9" stroke-linecap="round"/><path d="M14 58 A46 46 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round"/><text x="60" y="56" font-size="17" font-weight="700" text-anchor="middle" fill="${C.ink}">${Math.round(v)}%</text></svg><div class="kcc-muted" style="font-size:12px;margin-top:-4px">${l}</div></div>`; };
    const body = `<div style="display:flex;gap:6px">${g(wave("avs-cpu", now, 46, 12, 86400e3, 0.06), "AVS CPU")}${g(wave("avs-mem", now, 68, 4, 86400e3, 0.02), "AVS memory")}${g(71, "vSAN used")}</div><div class="kcc-muted" style="margin:10px 0 4px">Busiest site VMs, CPU now</div>${vms.map(({ id, c, v }) => `<div class="kcc-row kcc-click" ${kx({ t: "device", id })}><span class="kcc-num" style="width:120px;flex:none"><b style="font-size:12px">${id}</b></span>${bar(v == null ? 100 : v, v == null ? C.bad : v > 85 ? C.bad : v > 70 ? C.warn : C.blue, 8)}<b class="kcc-num" style="width:48px;text-align:right">${v == null ? "down" : Math.round(v) + "%"}</b></div>`).join("")}`;
    return card("kcc-lcomp", "Compute now", "vCenter, refreshed every 20 seconds", body, pill("Live", C.ok));
  }
  function renderLive() {
    return `<div class="kcc-h2"><b>Live estate telemetry</b><span>network, people, compute, streaming from the estate</span></div>
      <div class="kcc-grid kcc-g21">${liveThroughput()}${liveUsers()}</div>
      <div class="kcc-grid kcc-g21">${liveLatHeat()}<div style="display:flex;flex-direction:column;gap:16px;min-width:0">${liveTopCircuits()}${liveCarrierLoss()}</div></div>
      <div class="kcc-grid kcc-g2">${liveCompute()}${estLatency()}</div>`;
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
        const key = "cc" + Math.floor(s.now / 15000) + s.clinics.map((c) => c.status[0]).join("");
        if (key !== last.k) { renderCC(root); last.k = key; }
      } else if (page === "live") {
        let root = document.getElementById("kcc-live");
        if (!root) { const h = findText("main h2, main h3, main div, main span", "Tower timeline"); const sec = h && sectionOf(h); if (!sec) return; root = document.createElement("div"); root.id = "kcc-live"; root.className = "kcc-wrap"; sec.after(root); last.k = ""; }
        const key = "lv" + Math.floor(s.now / 3000) + s.clinics.map((c) => c.status[0]).join("");
        if (key !== last.k) { root.innerHTML = renderLive(); last.k = key; }
      } else if (page === "clinic360") {
        const c = siteOnPage(); if (!c) return;
        let top = document.getElementById("kcc-s1"), more = document.getElementById("kcc-s2");
        if (!top || top.dataset.site !== c.id) { top && top.remove(); const h = findText("main h2, main h3, main div, main span", "Site metrics"); const sec = h && sectionOf(h); if (!sec) return; top = document.createElement("div"); top.id = "kcc-s1"; top.className = "kcc-wrap"; top.dataset.site = c.id; sec.after(top); last.k = ""; }
        if (!more || more.dataset.site !== c.id) { more && more.remove(); const h = findText("main h2, main h3, main div, main span", "Dependencies"); const sec = h && sectionOf(h); if (!sec) return; more = document.createElement("div"); more.id = "kcc-s2"; more.className = "kcc-wrap"; more.dataset.site = c.id; (sec.parentElement && sec.parentElement.children.length < 4 ? sec.parentElement : sec).after(more); last.k = ""; }
        const key = "s" + c.id + Math.floor(s.now / 20000) + c.status;
        if (key !== last.k) { renderSiteTop(top, c); renderSiteMore(more, c); last.k = key; }
      }
    } catch (e) { console.warn("kcc", e); }
  }
  function start() { const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); setInterval(tick, 1000); setTimeout(tick, 400); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
  return { tick };
})();
