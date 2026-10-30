
// ---- Drill-down everywhere: any count, tile, status, site, incident or device opens a panel that goes down to the root cause and next action.
const KXD = (() => {
  const C = { ok: "#1B7A43", warn: "#E08A1E", bad: "#C23A26", maint: "#8E9099", plum: "#4E3047", mag: "#B83A80", ink: "#1F2124", muted: "#5E6168", line: "#E6E1E5" };
  const ST = { healthy: ["Healthy", C.ok], degraded: ["Degraded", C.warn], down: ["Down", C.bad], maintenance: ["Maintenance", C.maint] };
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const S = () => W.get();
  const site = (id) => S().clinics.find((c) => c.id === id);
  const incOf = (c) => c && c.issue && c.issue.incident ? S().incidents.find((i) => i.number === c.issue.incident) : Gn(S()).find((i) => i.clinicIds.includes(c.id));
  const ago = (ts) => { const m = Math.max(0, Math.round((S().now - ts) / 6e4)); return m < 1 ? "just now" : m < 60 ? m + " min ago" : Math.floor(m / 60) + " h " + (m % 60) + " min ago"; };
  const clock = (ts) => { try { return ge(ts); } catch (e) { return ""; } };
  const pill = (txt, col) => `<span class="kxd-pill" style="color:${col};background:${col}14;border-color:${col}40"><i style="background:${col}"></i>${esc(txt)}</span>`;
  const stPill = (c) => { const s = ST[c.status] || ST.healthy; return pill(s[0], s[1]); };
  const link = (label, view, extra = "") => `<a class="kxd-link" data-go='${esc(JSON.stringify(view))}' ${extra}>${esc(label)}</a>`;
  const btn = (label, act, arg, primary) => `<button class="kxd-btn${primary ? " kxd-primary" : ""}" data-act="${act}" data-arg="${esc(arg || "")}">${esc(label)}</button>`;

  // which layer of the path is at fault, by issue kind
  const LAYERS = [["people", "People"], ["devices", "PCs, printers and scanners"], ["lan", "Site LAN and Wi-Fi"], ["server", "Site server, VM and storage"], ["edge", "Edge device"], ["circuit", "Carrier circuit"], ["core", "Hub, Azure and AWS"]];
  const LAYER_OF = { "carrier-down": "circuit", onlte: "circuit", jitter: "circuit", circuit: "circuit", lte: "circuit", "edge-hw": "edge", power: "power", esxi: "server", psu: "server", temp: "server", drive: "server", vmdisk: "server", qnap: "server", switch: "lan", ws: "devices", intune: "devices", spooler: "devices", epic: "core", maint: null };
  const DEV_OF = (c) => { const k = c.issue && c.issue.kind, id = c.id; return { "edge-hw": [`edge-${id}-01`], esxi: [`srv-${id}`, `vm-${id}-app`], psu: [`srv-${id}`], temp: [`srv-${id}`, `ilo-${id}`], drive: [`srv-${id}`], vmdisk: [`vm-${id}-app`], qnap: [`nas-${id}`], switch: [`sw-${id}-01`], ws: [`ws-${id}-01`, `ws-${id}-02`], spooler: [`prn-${id}-01`, `ws-${id}-01`], intune: [`img-${id}-01`], "carrier-down": [`edge-${id}-01`], onlte: [`edge-${id}-01`], jitter: [`edge-${id}-01`] }[k] || []; };
  const NEXT = {
    "carrier-down": [["Steer to backup circuit (RB-003)", "steer"], ["Raise carrier case with evidence (RB-005)", "carrier"]],
    circuit: [["Steer to backup circuit (RB-003)", "steer"], ["Raise carrier case with evidence (RB-005)", "carrier"]],
    onlte: [["Return to primary when stable (RB-004)", "primary"], ["Raise carrier case with evidence (RB-005)", "carrier"]],
    jitter: [["Steer to backup circuit (RB-003)", "steer"], ["Apply proactive watch (RB-038)", "watch"]],
    "edge-hw": [["Dispatch engineer with a spare edge", "dispatch"], ["Steer to backup circuit (RB-003)", "steer"]],
    power: [["Call the site IT coordinator", "notify"], ["Dispatch engineer if not back in 30 min", "dispatch"]],
    esxi: [["Run host health check (RB-008)", "diag"], ["Restart VM via vCenter (RB-007)", "rb:RB-007"]],
    psu: [["Order PSU and book visit after close", "dispatch"], ["Run host health check (RB-008)", "diag"]],
    drive: [["Order replacement drive (RB-010)", "rb:RB-010"], ["Book visit after close", "dispatch"]],
    vmdisk: [["VM disk cleanup (RB-012)", "rb:RB-012"], ["Extend VM disk by change (RB-013)", "rb:RB-013"]],
    switch: [["Bounce the flapping port (RB-006)", "rb:RB-006"], ["Dispatch engineer", "dispatch"]],
    ws: [["Workstation performance fix (RB-015)", "rb:RB-015"], ["Run site diagnostics", "diag"]],
    spooler: [["Restart print spooler (RB-014)", "rb:RB-014"]],
    maint: [["Run site diagnostics", "diag"]]
  };
  const FORECAST = { circuit: "Loss on the shared segment is climbing; without a steer, Teams calls and file access at every office on it get worse within 15 minutes.", jitter: "Jitter is rising about 0.8 ms a minute; the 30 ms limit is likely to be crossed in about 25 minutes.", onlte: "The 4G backup carries the load, but it is near its data cap; on 4G for more than 6 hours it will slow down.", vmdisk: "At the current growth the disk is full in about 3 days.", psu: "With one PSU left, a second failure takes the server down; the risk stays until the part is fitted.", drive: "The drive is predicted to fail within 7 days; RAID 1 still protects the data.", switch: "Port flaps are getting more frequent; at this rate the uplink drops for good within the shift.", ws: "Experience score is falling after the Teams update; more PCs are likely to report the same.", "carrier-down": "Until the carrier splices the fibre, the site stays on backup or down.", "edge-hw": "The site stays down until the replacement edge is fitted.", esxi: "The VM will not come back by itself; file and print stay down until it is restarted.", power: "UPS gives about 45 minutes; after that the cabinet goes dark." };

  let stack = [], root = null, timer = null;
  function ensure() {
    if (root) return;
    const st = document.createElement("style");
    st.textContent = `
[data-kx]{cursor:pointer}
[data-kx]:not([data-kx-tile]):hover{text-decoration:underline dotted ${C.mag};text-underline-offset:3px;text-decoration-thickness:1.5px}
[data-kx-tile]{position:relative;transition:box-shadow .15s}
[data-kx-tile]:hover{box-shadow:0 0 0 2px ${C.mag}!important}
[data-kx-tile]:hover::after{content:"Drill down \\203A";position:absolute;right:10px;bottom:8px;font:600 11px/1 "Source Sans 3 Variable",system-ui;color:#fff;background:${C.mag};padding:4px 8px;border-radius:999px;pointer-events:none}
#kxd-scrim{position:fixed;inset:0;background:rgba(46,26,42,.28);z-index:9000;opacity:0;transition:opacity .2s}
#kxd{position:fixed;top:0;right:0;bottom:0;width:min(640px,100vw);background:#fff;z-index:9001;box-shadow:-18px 0 48px rgba(46,26,42,.22);transform:translateX(102%);transition:transform .25s ease;display:flex;flex-direction:column;font-family:"Source Sans 3 Variable",system-ui,sans-serif;color:${C.ink}}
#kxd.on{transform:none}#kxd-scrim.on{opacity:1}
.kxd-head{background:${C.plum};color:#fff;padding:14px 18px 12px;position:relative}
.kxd-head::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#EE3B33,#F15A4A 22%,#F7A541 45%,#FFE14D 60%,#F29A7A 78%,#E15AA5)}
.kxd-crumbs{font-size:12px;opacity:.8;display:flex;gap:6px;flex-wrap:wrap;align-items:center}.kxd-crumbs a{cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.kxd-title{font-size:20px;font-weight:650;margin-top:6px;line-height:1.25}.kxd-sub{font-size:13px;opacity:.85;margin-top:2px}
.kxd-x{position:absolute;right:12px;top:12px;background:rgba(255,255,255,.14);border:0;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px}
.kxd-back{background:rgba(255,255,255,.14);border:0;color:#fff;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:12px}
.kxd-body{overflow:auto;padding:14px 18px 28px;flex:1}
.kxd-sec{margin-top:16px}.kxd-sec h4{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};font-weight:650}
.kxd-card{border:1px solid ${C.line};border-radius:10px;padding:10px 12px;background:#fff}
.kxd-hl{border-left:4px solid ${C.bad};background:#FCEBE7}
.kxd-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid;border-radius:999px;padding:1px 9px;font-size:12px;font-weight:600;white-space:nowrap}.kxd-pill i{width:7px;height:7px;border-radius:50%}
.kxd-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-bottom:1px solid ${C.line};cursor:pointer}.kxd-row:hover{background:#F7F2F5}.kxd-row:last-child{border-bottom:0}
.kxd-row .m{flex:1;min-width:0}.kxd-row .t{font-weight:600;font-size:14px}.kxd-row .d{font-size:12.5px;color:${C.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kxd-row .chev{color:${C.mag};font-weight:700}
.kxd-link{color:${C.mag};cursor:pointer;font-weight:600;text-decoration:underline dotted;text-underline-offset:3px}
.kxd-btn{border:1px solid ${C.line};background:#fff;border-radius:8px;padding:7px 11px;font:600 13px/1.1 inherit;cursor:pointer;color:${C.plum};margin:0 6px 6px 0}.kxd-btn:hover{border-color:${C.mag}}
.kxd-primary{background:${C.mag};border-color:${C.mag};color:#fff}.kxd-primary:hover{background:#962E68}
.kxd-chain{display:flex;flex-direction:column;gap:0}.kxd-layer{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;font-size:13.5px}
.kxd-layer .dot{width:12px;height:12px;border-radius:50%;flex:none;box-shadow:0 0 0 3px #fff}.kxd-layer .why{margin-left:auto;font-size:12px;color:${C.muted};text-align:right;max-width:58%}
.kxd-layer.fault{background:#FCEBE7;font-weight:650}.kxd-layer.fault .why{color:${C.bad};font-weight:600}
.kxd-vline{width:2px;height:8px;background:${C.line};margin-left:15px}
.kxd-kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kxd-kv>div{border:1px solid ${C.line};border-radius:8px;padding:8px 10px}.kxd-kv b{display:block;font-size:19px;font-weight:650}.kxd-kv span{font-size:12px;color:${C.muted}}
.kxd-bar{height:7px;background:#EEE8EC;border-radius:9px;overflow:hidden}.kxd-bar i{display:block;height:100%;border-radius:9px}
.kxd-ev{display:flex;gap:10px;font-size:12.5px;padding:6px 0;border-bottom:1px dashed ${C.line}}.kxd-ev:last-child{border:0}.kxd-ev time{font-family:ui-monospace,Menlo,monospace;color:${C.muted};flex:none}
.kxd-devs{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.kxd-dev{display:flex;align-items:center;gap:8px;border:1px solid ${C.line};border-radius:8px;padding:6px 9px;font-size:12.5px;cursor:pointer}.kxd-dev:hover{border-color:${C.mag}}.kxd-dev i{width:8px;height:8px;border-radius:50%;flex:none}.kxd-dev code{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.kxd-note{font-size:12.5px;color:${C.muted};margin-top:6px}
.kxd-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}.kxd-filters a{border:1px solid ${C.line};border-radius:999px;padding:3px 10px;font-size:12.5px;cursor:pointer}.kxd-filters a.on{background:${C.plum};color:#fff;border-color:${C.plum}}
`;
    document.head.appendChild(st);
    const scrim = document.createElement("div"); scrim.id = "kxd-scrim"; scrim.style.display = "none";
    root = document.createElement("aside"); root.id = "kxd"; root.setAttribute("aria-label", "Drill down");
    document.body.append(scrim, root);
    scrim.addEventListener("click", close);
    root.addEventListener("click", onPanelClick);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stack.length) { e.stopPropagation(); close(); } }, true);
  }
  function open(view, fresh) {
    ensure();
    if (fresh) stack = [];
    stack.push(view); render();
    const scrim = document.getElementById("kxd-scrim"); scrim.style.display = "block";
    requestAnimationFrame(() => { scrim.classList.add("on"); root.classList.add("on"); });
    clearInterval(timer); timer = setInterval(() => { if (stack.length) render(true); }, 2500);
  }
  function close() {
    if (!root) return; stack = []; clearInterval(timer);
    root.classList.remove("on"); const scrim = document.getElementById("kxd-scrim"); scrim.classList.remove("on"); setTimeout(() => { scrim.style.display = "none"; }, 220);
  }
  function title(v) {
    const s = S();
    switch (v.t) {
      case "sites": return v.label || "Sites";
      case "site": { const c = site(v.id); return c ? `#${c.id} ${c.name}` : "Site"; }
      case "incidents": return v.label || "Incidents";
      case "incident": return v.n;
      case "device": return v.id;
      case "service": return v.name;
      case "alerts": return v.label || "Alerts";
      case "actions": return "Copilot Studio actions";
      default: return "";
    }
  }
  function render(soft) {
    const v = stack[stack.length - 1]; if (!v) return;
    const body = root.querySelector(".kxd-body"), sc = soft && body ? body.scrollTop : 0;
    let head = "", html = "";
    try { [head, html] = VIEWS[v.t](v); } catch (e) { head = `<div class="kxd-title">${esc(title(v))}</div>`; html = `<div class="kxd-card">Nothing more to show here.</div>`; console.warn(e); }
    const crumbs = stack.map((x, i) => i < stack.length - 1 ? `<a data-crumb="${i}">${esc(title(x))}</a> ›` : "").join(" ");
    root.innerHTML = `<div class="kxd-head"><button class="kxd-x" data-act="close" aria-label="Close">✕</button><div class="kxd-crumbs">${stack.length > 1 ? `<button class="kxd-back" data-act="back">← Back</button>` : ""}<span>Drill down</span>${crumbs ? " › " + crumbs : ""}</div>${head}</div><div class="kxd-body">${html}</div>`;
    if (soft) root.querySelector(".kxd-body").scrollTop = sc;
  }
  function onPanelClick(e) {
    const a = e.target.closest("[data-act],[data-go],[data-crumb]"); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    if (a.dataset.crumb != null) { stack = stack.slice(0, +a.dataset.crumb + 1); render(); return; }
    if (a.dataset.go) { stack.push(JSON.parse(a.dataset.go)); render(); root.querySelector(".kxd-body").scrollTop = 0; return; }
    act(a.dataset.act, a.dataset.arg);
  }
  const toast = (title, text, kind = "good") => { try { lt({ kind, title, text, nav: null }); } catch (e) {} };
  function runbook(rb, c, target) {
    try {
      if (!_e[rb]) return toast("Runbook not found", rb, "info");
      yt({ runbook: _e[rb], title: `${_e[rb].name} – ${c ? c.label : target}`, target: target || (c && c.label), clinicId: c ? c.id : null, incident: c && incOf(c) ? incOf(c).number : null, mode: "in", approved: true, approvedBy: yi(), skipTo: 3, source: "manual", ctx: { clinicIds: c ? [c.id] : [], teams: false } });
      toast(`${rb} started`, `${_e[rb].name} on ${target || c.label}. Follow it in Live Operations.`);
    } catch (e) { toast("Could not start " + rb, String(e.message || e), "info"); }
  }
  function act(a, arg) {
    const v = stack[stack.length - 1], c = v && v.t === "site" ? site(v.id) : arg && site(arg);
    switch (a) {
      case "close": return close();
      case "back": stack.pop(); return stack.length ? render() : close();
      case "steer": sh(c.id); toast("Steering to backup", c.label); break;
      case "primary": ah(c.id); toast("Returning to primary", c.label); break;
      case "diag": Bc(c.id); toast("Diagnostics running", c.label); break;
      case "maint": Rc(c.id, 120); toast("Maintenance window set", c.label + " for 2h"); break;
      case "dispatch": pl(c.id, { afterHours: c.status !== "down", incident: incOf(c) ? incOf(c).number : null, reason: c.issue ? c.issue.text : "Onsite check" }); toast("Engineer dispatched", c.label); break;
      case "notify": ul(c.id); toast("Site IT coordinator updated", c.label); break;
      case "watch": XM([c.id]); toast("Proactive watch applied", c.label); break;
      case "carrier": toast("Carrier case raised", `${c.carrier} case with loss, jitter and traceroute evidence for ${c.primaryCircuit.id}`); break;
      case "page": Iu(arg || "network"); break;
      case "site360": De(c.id); oe("clinic360"); close(); return;
      case "inc": oe("incidents", arg); close(); return;
      case "major": Mq(arg); break;
      case "problem": zM(arg); toast("Problem record created", arg); break;
      case "netgraph": De(c ? c.id : null); oe("netgraph"); close(); return;
      case "page-go": oe(arg); close(); return;
      default:
        if (a && a.startsWith("rb:")) { const dv = v && v.t === "device" ? v.id : null; runbook(a.slice(3), c || (dv && site(dv.split("-")[1])), dv); }
    }
    setTimeout(() => render(true), 300);
  }

  function siteRow(c) {
    const inc = incOf(c);
    return `<div class="kxd-row" data-go='${JSON.stringify({ t: "site", id: c.id })}'>${stPill(c)}<div class="m"><div class="t">#${c.id} ${esc(c.name)}</div><div class="d">${esc(c.region)} \xB7 ${esc(c.issue ? c.issue.text : c.fixedOvernight ? "Fixed overnight: " + c.fixedOvernight.text : "All checks passing")}${inc ? " \xB7 " + inc.number : ""}</div></div><b style="font-size:13px;color:${c.health < 60 ? C.bad : c.health < 85 ? C.warn : C.ok}">${c.health}</b><span class="chev">›</span></div>`;
  }
  function incRow(i) {
    const col = i.priority === "P1" ? C.bad : i.priority === "P2" ? C.warn : "#8E4A86";
    return `<div class="kxd-row" data-go='${JSON.stringify({ t: "incident", n: i.number })}'>${pill(i.priority, col)}<div class="m"><div class="t">${esc(i.number)} \xB7 ${esc(i.title)}</div><div class="d">${esc(i.state)} \xB7 ${esc(i.owner || i.assignmentGroup || "")}${i.rootCause ? " \xB7 Root cause: " + esc(i.rootCause) : ""}</div></div><span class="chev">›</span></div>`;
  }
  function devStatus(c, d) {
    const bad = DEV_OF(c);
    if (c.status === "down" && c.issue && c.issue.kind === "power") return C.bad;
    if (bad.includes(d.id)) return c.status === "down" ? C.bad : C.warn;
    if (c.status === "down" && /^(edge|ap|ws|img|prn|sw)/.test(d.id) && ["carrier-down", "edge-hw"].includes(c.issue && c.issue.kind)) return C.warn;
    return C.ok;
  }
  function spark(seed, base, hot) {
    let x = 0, pts = []; const r = (k) => { const v = Math.sin(seed * 9.13 + k * 1.7) * 0.5 + Math.sin(seed * 3.1 + k * 0.6) * 0.5; return v; };
    for (let k = 0; k < 30; k++) { const v = Math.max(2, Math.min(99, base + r(k) * 9 + (hot && k > 22 ? (k - 22) * 6 : 0))); pts.push(`${(k / 29 * 280).toFixed(1)},${(46 - v / 100 * 42).toFixed(1)}`); }
    return `<svg viewBox="0 0 280 48" width="100%" height="48" preserveAspectRatio="none"><polyline fill="none" stroke="${hot ? C.bad : C.mag}" stroke-width="2" points="${pts.join(" ")}"/></svg>`;
  }
  function eventsFor(pred, n = 8) {
    const ev = S().events.filter(pred).sort((a, b) => b.ts - a.ts).slice(0, n);
    if (!ev.length) return `<div class="kxd-note">No alerts in the live window.</div>`;
    return ev.map((e) => { const col = e.severity === "critical" ? C.bad : e.severity === "error" ? "#E0662A" : e.severity === "warning" ? C.warn : C.muted; const dev = /^(edge|sw|srv|ilo|vm|nas|dvr|ap|ws|img|prn)-\d{4}/.test(e.entityId || "");
      return `<div class="kxd-ev"><time>${clock(e.ts)}</time><span style="color:${col};font-weight:650;flex:none">${esc(e.severity)}</span><span>${dev ? link(e.entityId, { t: "device", id: e.entityId }) + " \xB7 " : ""}${esc(e.message)}${e.incident ? ` \xB7 ${link(e.incident, { t: "incident", n: e.incident })}` : ""}</span></div>`; }).join("");
  }

  const VIEWS = {
    sites(v) {
      const s = S(); const want = v.status;
      let list = s.clinics.filter((c) => want === "all" ? true : want === "nonhealthy" ? c.status !== "healthy" : want === "open" ? (() => { try { return As(c, s.now) === "open"; } catch (e) { return true; } })() : want === "region" ? c.region === v.region : want === "kind" ? c.kind === v.kind : c.status === want);
      const order = { down: 0, degraded: 1, maintenance: 2, healthy: 3 }; list = list.sort((a, b) => order[a.status] - order[b.status] || a.health - b.health);
      const counts = ["down", "degraded", "maintenance", "healthy"].map((k) => [k, s.clinics.filter((c) => c.status === k).length]);
      const filt = `<div class="kxd-filters">${[["nonhealthy", "Needs attention"], ...counts.map(([k, n]) => [k, `${ST[k][0]} ${n}`]), ["all", `All ${s.clinics.length}`]].map(([k, l]) => `<a class="${k === want ? "on" : ""}" data-go='${JSON.stringify({ t: "sites", status: k, label: l.replace(/ \d+$/, "") + " sites" })}'>${esc(l)}</a>`).join("")}</div>`;
      const by = {}; list.forEach((c) => { const k = c.issue ? (LAYER_OF[c.issue.kind] || "other") : "none"; by[k] = (by[k] || 0) + 1; });
      const why = Object.entries(by).filter(([k]) => k !== "none").map(([k, n]) => `${n} \xD7 ${(LAYERS.find((l) => l[0] === k) || [0, k === "power" ? "Site power" : "Other"])[1]}`).join(" \xB7 ");
      return [`<div class="kxd-title">${esc(v.label || "Sites")}</div><div class="kxd-sub">${list.length} of ${s.clinics.length} sites${why ? " \xB7 where it breaks: " + esc(why) : ""}</div>`,
        `${filt}<div class="kxd-card" style="padding:0">${list.map(siteRow).join("") || `<div class="kxd-note" style="padding:12px">No sites in this group.</div>`}</div><div class="kxd-note">Pick a site to see the fault path, root cause, evidence and next action.</div>`];
    },
    site(v) {
      const c = site(v.id); if (!c) throw new Error("no site");
      const inc = incOf(c), kind = c.issue && c.issue.kind, fault = LAYER_OF[kind];
      let risk = null; try { risk = Rr(c); } catch (e) {}
      const rv = risk ? (risk.risk != null ? risk.risk : risk.score) : null, drivers = risk ? (risk.drivers || risk.top || []) : [];
      const ruled = inc && inc.ruledOut ? inc.ruledOut : [];
      const chain = LAYERS.map(([k, l], idx) => {
        const isF = fault === k || (fault === "power" && ["lan", "edge", "server", "devices"].includes(k)), col = isF ? (c.status === "down" ? C.bad : C.warn) : c.status === "maintenance" ? C.maint : C.ok;
        const KW = { people: /people|user/i, devices: /workstation|\bPC|printer|scanner|endpoint/i, lan: /LAN|switch|Wi-?Fi|access point/i, server: /server|VM\b|storage|vCenter|iLO|NAS|ESXi/i, edge: /edge|router|gateway|VeloCloud|firewall/i, circuit: /circuit|carrier|Airtel|Jio|Tata|KEMS|STC|MPLS/i, core: /Hub|DC2|core|AWS|Azure|AVS|data cent/i };
        const r = ruled.find((x) => KW[k] && KW[k].test(x.entity));
        const why = isF ? (fault === "power" ? "No power: every device went silent in the same second" : c.issue.text) : r ? "Ruled out: " + r.reason : k === "people" ? `${c.users} people on site` : k === "circuit" ? `${c.carrier} ${c.primaryCircuit.bandwidth} \xB7 ${c.path === "lte" ? "on backup" : "primary active"}` : k === "edge" ? KX_EDGE(c.id) : "Healthy";
        return (idx ? `<div class="kxd-vline"></div>` : "") + `<div class="kxd-layer${isF ? " fault" : ""}"><span class="dot" style="background:${col}"></span><span>${esc(l)}</span><span class="why">${esc(why)}</span></div>`;
      }).join("");
      const recs = (NEXT[kind] || (c.status === "healthy" ? [] : [["Run site diagnostics", "diag"]])).map((x, i) => btn(x[0], x[1], c.id, i === 0)).join("");
      const devs = oi(c);
      const devHtml = devs.filter((d) => !/^ws-/.test(d.id) || /-0[1-3]$/.test(d.id)).slice(0, 18).map((d) => { const col = devStatus(c, d); return `<div class="kxd-dev" data-go='${JSON.stringify({ t: "device", id: d.id })}'><i style="background:${col}"></i><code>${esc(d.id)}</code><span style="color:${C.muted};margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%">${esc(d.label)}</span></div>`; }).join("");
      const people = `<div class="kxd-kv"><div><b>${c.users}</b><span>people at the site</span></div><div><b>${devs.length}</b><span>monitored devices</span></div><div><b>${inc && inc.blastRadius ? inc.blastRadius.clinics : c.status === "healthy" ? 0 : 1}</b><span>sites in the same incident</span></div></div>`;
      return [`<div class="kxd-title">#${c.id} ${esc(c.name)}</div><div class="kxd-sub">${esc(c.kind)} \xB7 ${esc(c.city)} \xB7 ${esc(c.region)} \xB7 health ${c.health}</div><div style="margin-top:8px">${stPill(c)} ${inc ? pill(inc.priority + " \xB7 " + inc.number, "#fff") : ""}</div>`,
        `<div class="kxd-card ${c.status === "healthy" ? "" : "kxd-hl"}" style="${c.status === "degraded" ? "border-left-color:" + C.warn + ";background:#FEF2E3" : ""}"><b>${esc(c.issue ? c.issue.text : "All checks passing")}</b>${c.fixedOvernight && !c.issue ? `<div class="kxd-note">Fixed overnight by Copilot Studio: ${esc(c.fixedOvernight.text)} (${esc(c.fixedOvernight.rb)})</div>` : ""}</div>
        ${inc ? `<div class="kxd-sec"><h4>Root cause</h4><div class="kxd-card"><div style="font-weight:650">${esc(inc.rootCause || "Being diagnosed")}</div><div class="kxd-note">${inc.rootCauseEntity ? "Fault point: " + (/^(edge|sw|srv|ilo|vm|nas|dvr|ap|ws|img|prn)-\d{4}/.test(inc.rootCauseEntity) ? link(inc.rootCauseEntity, { t: "device", id: inc.rootCauseEntity }) : `<b>${esc(inc.rootCauseEntity)}</b>`) + " \xB7 " : ""}confidence ${inc.confidence || "–"}%${inc.correlation ? ` \xB7 ${esc(inc.correlation.method)}: ${inc.correlation.signals} alerts${inc.correlation.calls ? ", " + inc.correlation.calls + " calls" : ""} grouped` : ""} \xB7 ${link("Open " + inc.number, { t: "incident", n: inc.number })}</div><div class="kxd-bar" style="margin-top:8px"><i style="width:${inc.confidence || 50}%;background:${C.mag}"></i></div></div></div>` : ""}
        <div class="kxd-sec"><h4>Fault path, people to cloud</h4><div class="kxd-card kxd-chain">${chain}</div></div>
        <div class="kxd-sec"><h4>Next best action</h4>${recs || `<div class="kxd-note" style="margin:0 0 6px">Nothing needs doing. Copilot Studio keeps watching.</div>`}<div>${btn("Run site diagnostics", "diag", c.id)}${btn("Notify site IT coordinator", "notify", c.id)}${btn("Put in maintenance 2h", "maint", c.id)}${btn("Dispatch engineer", "dispatch", c.id)}${btn("Open Site 360", "site360", c.id)}${btn("Show on network graph", "netgraph", c.id)}</div></div>
        <div class="kxd-sec"><h4>Predicted, next 4 hours</h4><div class="kxd-card"><div style="display:flex;align-items:baseline;gap:8px"><b style="font-size:26px;color:${rv >= 60 ? C.bad : rv >= 30 ? C.warn : C.ok}">${rv != null ? rv : "–"}</b><span class="kxd-note">risk out of 100</span></div><div class="kxd-bar" style="margin:6px 0 8px"><i style="width:${rv || 0}%;background:${rv >= 60 ? C.bad : rv >= 30 ? C.warn : C.ok}"></i></div>${FORECAST[kind] ? `<div style="font-size:13.5px">${esc(FORECAST[kind])}</div>` : ""}${drivers.length ? `<div class="kxd-note">${drivers.map((d) => esc(Array.isArray(d) ? `+${d[0]} ${d[1]}` : d.text || d)).join("<br>")}</div>` : ""}</div></div>
        <div class="kxd-sec"><h4>Impact</h4>${people}</div>
        <div class="kxd-sec"><h4>Evidence: live alerts at this site</h4><div class="kxd-card">${eventsFor((e) => e.clinicId === c.id && e.severity !== "info")}</div></div>
        <div class="kxd-sec"><h4>Devices (pick one to go deeper)</h4><div class="kxd-devs">${devHtml}</div></div>`];
    },
    device(v) {
      const sid = (v.id.match(/-(\d{4})/) || [])[1], c = site(sid); if (!c) throw new Error("no site");
      const d = oi(c).find((x) => x.id === v.id) || { id: v.id, label: v.id, vendor: "", base: { cpu: 30, mem: 40, disk: 50, tempC: 25, uptimeDays: 30 } };
      const col = devStatus(c, d), hot = col !== C.ok, b = d.base || {};
      const inc = S().incidents.find((i) => i.rootCauseEntity === d.id) || (hot ? incOf(c) : null);
      const metric = (l, val, max, unit) => { const pct = Math.min(100, val / max * 100), mc = pct > 90 ? C.bad : pct > 75 ? C.warn : C.ok; return `<div><span>${l}</span><b>${val}${unit}</b><div class="kxd-bar" style="margin-top:4px"><i style="width:${pct}%;background:${mc}"></i></div></div>`; };
      const dark = col === C.bad && (["power", "edge-hw", "esxi"].includes(c.issue && c.issue.kind));
      const cpu = hot && /^(srv|vm)/.test(d.id) && c.issue && c.issue.kind === "esxi" ? 0 : b.cpu, disk = c.issue && c.issue.kind === "vmdisk" && /^vm/.test(d.id) ? 93 : b.disk;
      const siteActs = hot && DEV_OF(c).includes(d.id) || (hot && c.issue && c.issue.kind === "power") ? (NEXT[c.issue.kind] || []) : [];
      const acts = { edge: [["Steer to backup circuit (RB-003)", "steer"], ["Return to primary (RB-004)", "primary"]], switch: [["Bounce port (RB-006)", "rb:RB-006"], ["Back up config", "rb:RB-027"]], server: [["Host health check (RB-008)", "rb:RB-008"], ["Order part and book visit", "dispatch"]], ilo: [["Host health check (RB-008)", "rb:RB-008"]], vm: [["Restart VM via vCenter (RB-007)", "rb:RB-007"], ["VM disk cleanup (RB-012)", "rb:RB-012"]], nas: [["NetWorker disk check (RB-011)", "rb:RB-011"]], ws: [["Workstation performance fix (RB-015)", "rb:RB-015"]], img: [["Workstation performance fix (RB-015)", "rb:RB-015"]], prn: [["Restart print spooler (RB-014)", "rb:RB-014"]], ap: [["Bounce AP port (RB-006)", "rb:RB-006"]], dvr: [["Dispatch engineer", "dispatch"]] }[d.type] || [];
      return [`<div class="kxd-title" style="font-family:ui-monospace,Menlo,monospace">${esc(d.id)}</div><div class="kxd-sub">${esc(d.label)} \xB7 ${esc(d.vendor)} \xB7 ${esc(c.label)}</div><div style="margin-top:8px">${pill(col === C.ok ? "Healthy" : col === C.bad ? "Down" : "Degraded", col)}</div>`,
        `${hot ? `<div class="kxd-card kxd-hl" style="${col === C.warn ? "border-left-color:" + C.warn + ";background:#FEF2E3" : ""}"><b>${esc(c.issue ? c.issue.text : "Fault")}</b>${inc ? `<div class="kxd-note">Part of ${link(inc.number, { t: "incident", n: inc.number })}: ${esc(inc.rootCause || inc.title)}</div>` : ""}</div>` : `<div class="kxd-card"><b>Healthy.</b> <span class="kxd-note">No open alerts on this device.</span></div>`}
        <div class="kxd-sec"><h4>Live metrics</h4>${dark ? `<div class="kxd-card"><b style="color:${C.bad}">No data: the device stopped answering ${c.issue && c.issue.kind === "power" ? "when site power was lost" : "at the time of the fault"}.</b><div class="kxd-note">Last good reading: CPU ${b.cpu}% \xB7 memory ${b.mem}% \xB7 uptime ${b.uptimeDays} days. OpsRamp polls every 60 seconds; the next good poll closes the alert.</div></div>` : `<div class="kxd-kv">${metric("CPU", cpu, 100, "%")}${metric("Memory", b.mem, 100, "%")}${metric("Disk", disk, 100, "%")}${metric("Temperature", b.tempC, 45, "\xB0C")}<div><span>Uptime</span><b>${hot && c.issue && c.issue.kind === "esxi" && /^srv/.test(d.id) ? 0 : b.uptimeDays} d</b></div><div><span>CMDB</span><b style="font-size:14px">${esc(d.cmdbCi || "No CI yet")}</b></div></div><div class="kxd-card" style="margin-top:8px;padding:6px 8px"><div class="kxd-note" style="margin:0 0 2px">Last 30 minutes${hot ? ", rising" : ""}</div>${spark(+(sid || 1) + d.id.length, disk > 85 ? disk - 6 : b.cpu, hot)}</div>`}</div>
        <div class="kxd-sec"><h4>Next best action</h4>${siteActs.map((x, i) => btn(x[0], x[1], c.id, i === 0)).join("")}${acts.filter((x) => !siteActs.find((y) => y[1] === x[1])).map((x, i) => btn(x[0], x[1], c.id, !siteActs.length && i === 0 && hot)).join("")}<a class="kxd-btn" data-go='${JSON.stringify({ t: "site", id: c.id })}'>Open the site \u203A</a></div>
        <div class="kxd-sec"><h4>Alerts from this device</h4><div class="kxd-card">${eventsFor((e) => e.entityId === d.id, 10)}</div></div>
        <div class="kxd-sec"><h4>Where it sits</h4><div class="kxd-card">${link("#" + c.id + " " + c.name, { t: "site", id: c.id })} \xB7 OpsRamp resource ${esc(d.lmResourceId || "")}</div></div>`];
    },
    incidents(v) {
      const s = S(); let list = v.f === "p12" ? Gn(s).filter((i) => i.priority === "P1" || i.priority === "P2") : v.f === "resolved" ? s.incidents.filter((i) => i.state === "Resolved" || i.state === "Closed") : v.f === "all" ? s.incidents : Gn(s);
      list = list.slice().sort((a, b) => a.priority.localeCompare(b.priority));
      return [`<div class="kxd-title">${esc(v.label || "Open incidents")}</div><div class="kxd-sub">${list.length} incidents \xB7 one per root cause, alerts and calls grouped inside</div>`,
        `<div class="kxd-filters">${[["p12", "P1 and P2"], ["open", "All open"], ["resolved", "Resolved"]].map(([k, l]) => `<a class="${k === (v.f || "open") ? "on" : ""}" data-go='${JSON.stringify({ t: "incidents", f: k, label: l + " incidents" })}'>${l}</a>`).join("")}</div><div class="kxd-card" style="padding:0">${list.map(incRow).join("") || `<div class="kxd-note" style="padding:12px">None.</div>`}</div>`];
    },
    incident(v) {
      const s = S(), i = s.incidents.find((x) => x.number === v.n); if (!i) throw new Error("no incident");
      const sites = i.clinicIds.map(site).filter(Boolean);
      const vc = (s.vendorCases || []).filter((x) => x.incident === i.number), dp = (s.dispatches || []).filter((x) => x.incident === i.number), ap = (s.approvals || []).filter((x) => x.incident === i.number && x.status === "pending");
      const tl = (i.timeline || []).slice(-7).reverse().map((t) => `<div class="kxd-ev"><time>${clock(t.ts)}</time><span><b>${esc(t.actor)}</b> \xB7 ${esc(t.text)}</span></div>`).join("");
      const br = i.blastRadius || {};
      return [`<div class="kxd-title">${esc(i.number)} \xB7 ${esc(i.title)}</div><div class="kxd-sub">${esc(i.state)} \xB7 ${esc(i.assignmentGroup || "")} \xB7 owner ${esc(i.owner || "–")}</div><div style="margin-top:8px">${pill(i.priority, i.priority === "P1" ? "#FFB4A8" : "#FFD9A0")}${i.major ? " " + pill("Major incident", "#FFB4A8") : ""}</div>`,
        `<div class="kxd-sec" style="margin-top:0"><h4>Root cause</h4><div class="kxd-card kxd-hl"><b>${esc(i.rootCause || "Being diagnosed")}</b><div class="kxd-note">${i.rootCauseEntity ? "Fault point: " + (/^(edge|sw|srv|ilo|vm|nas|dvr|ap|ws|img|prn)-\d{4}/.test(i.rootCauseEntity) ? link(i.rootCauseEntity, { t: "device", id: i.rootCauseEntity }) : "<b>" + esc(i.rootCauseEntity) + "</b>") + " \xB7 " : ""}confidence ${i.confidence || "–"}%</div><div class="kxd-bar" style="margin-top:6px"><i style="width:${i.confidence || 50}%;background:${C.mag}"></i></div></div></div>
        ${i.correlation ? `<div class="kxd-sec"><h4>How it was found</h4><div class="kxd-kv"><div><b>${i.correlation.signals}</b><span>alerts grouped</span></div><div><b>${i.correlation.calls || 0}</b><span>calls and chats</span></div><div><b style="font-size:15px">${esc(i.correlation.method)}</b><span>correlation</span></div></div></div>` : ""}
        ${(i.ruledOut || []).length ? `<div class="kxd-sec"><h4>Ruled out, with evidence</h4><div class="kxd-card">${i.ruledOut.map((r) => `<div class="kxd-ev"><span style="color:${C.ok};font-weight:700">✓</span><span><b>${esc(r.entity)}</b> \xB7 ${esc(r.reason)}</span></div>`).join("")}</div></div>` : ""}
        <div class="kxd-sec"><h4>Sites affected (pick one)</h4><div class="kxd-card" style="padding:0">${sites.map(siteRow).join("") || `<div class="kxd-note" style="padding:12px">Estate-wide service</div>`}</div></div>
        <div class="kxd-sec"><h4>Impact</h4><div class="kxd-kv"><div><b>${br.clinics != null ? br.clinics : sites.length}</b><span>sites</span></div><div><b>${br.clinicians != null ? br.clinicians : sites.reduce((n, c) => n + c.users, 0)}</b><span>people</span></div><div><b style="font-size:14px">${esc((br.services || []).slice(0, 3).join(", ") || "–")}</b><span>services</span></div></div></div>
        ${vc.length || dp.length || ap.length ? `<div class="kxd-sec"><h4>Work in flight</h4><div class="kxd-card">${vc.map((x) => `<div class="kxd-ev"><span>📞</span><span>Carrier case <b>${esc(x.id || x.number)}</b> \xB7 ${esc(x.vendor || x.carrier || "")} \xB7 ${esc(x.state || x.status || "")}</span></div>`).join("")}${dp.map((x) => `<div class="kxd-ev"><span>🚚</span><span><b>${esc(x.id)}</b> ${esc(x.technician)} \xB7 ${esc(x.reason)} \xB7 ${esc(x.state)} \xB7 ${esc(x.window || "")}</span></div>`).join("")}${ap.map((x) => `<div class="kxd-ev"><span>✋</span><span>Approval waiting: <b>${esc(x.action)}</b> \xB7 risk ${esc(x.risk)}</span></div>`).join("")}</div></div>` : ""}
        <div class="kxd-sec"><h4>Next best action</h4>${btn("Open in Tickets & Approvals", "inc", i.number, true)}${!i.major ? btn("Declare major incident", "major", i.number) : ""}${btn("Create problem record", "problem", i.number)}${btn("Page on-call", "page", (i.towers || ["network"])[0])}</div>
        <div class="kxd-sec"><h4>Timeline</h4><div class="kxd-card">${tl || `<div class="kxd-note">No updates yet.</div>`}</div></div>`];
    },
    service(v) {
      const s = S(), kinds = v.kinds || [];
      const hit = s.clinics.filter((c) => c.issue && kinds.includes(c.issue.kind) && c.status !== "healthy");
      return [`<div class="kxd-title">${esc(v.name)}</div><div class="kxd-sub">${hit.length ? hit.length + " sites affected right now" : "Healthy at every site"}</div>`,
        `<div class="kxd-card" style="padding:0">${(hit.length ? hit : s.clinics.filter((c) => c.status !== "healthy").slice(0, 0)).map(siteRow).join("") || `<div class="kxd-note" style="padding:12px">No site has a fault on this service. ${link("See every site", { t: "sites", status: "all", label: "All sites" })}</div>`}</div>
        <div class="kxd-sec"><h4>Open incidents touching it</h4><div class="kxd-card" style="padding:0">${Gn(s).filter((i) => i.clinicIds.some((id) => hit.find((c) => c.id === id))).map(incRow).join("") || `<div class="kxd-note" style="padding:12px">None.</div>`}</div></div>${v.page ? `<div class="kxd-sec">${btn("Open the full page", "page-go", v.page, true)}</div>` : ""}`];
    },
    alerts(v) {
      const s = S(), sev = v.sev;
      return [`<div class="kxd-title">${esc(v.label || "Live alerts")}</div><div class="kxd-sub">${s.events.filter((e) => !sev || e.severity === sev).length} in the live window</div>`,
        `<div class="kxd-filters">${[["", "All"], ["critical", "Critical"], ["error", "Error"], ["warning", "Warning"]].map(([k, l]) => `<a class="${k === (sev || "") ? "on" : ""}" data-go='${JSON.stringify({ t: "alerts", sev: k, label: l + " alerts" })}'>${l}</a>`).join("")}</div><div class="kxd-card">${eventsFor((e) => (!sev ? e.severity !== "info" : e.severity === sev), 25)}</div>`];
    },
    actions() {
      const s = S(), list = (s.audit || []).filter((a) => /^Copilot/.test(a.actor || "")).slice(0, 20);
      return [`<div class="kxd-title">What Copilot Studio did</div><div class="kxd-sub">${list.length} recent actions, each with its runbook and evidence</div>`,
        `<div class="kxd-card">${list.map((a) => `<div class="kxd-ev"><time>${clock(a.ts)}</time><span><b>${esc(a.action)}</b>${a.target ? " \xB7 " + esc(a.target) : ""} \xB7 ${esc(a.result || "")}</span></div>`).join("") || `<div class="kxd-note">Nothing yet.</div>`}</div>`];
    }
  };

  // ---- find drillable things on whatever page is showing
  const TILES = [
    [/^Healthy \/ Degraded \/ Down$/, () => ({ t: "sites", status: "nonhealthy", label: "Sites that need attention" })],
    [/^Sites open now$/, () => ({ t: "sites", status: "open", label: "Sites open now" })],
    [/^Active P1 \/ P2$/, () => ({ t: "incidents", f: "p12", label: "P1 and P2 incidents" })],
    [/^Open incidents$/, () => ({ t: "incidents", f: "open", label: "Open incidents" })],
    [/^(Auto-resolved today|Hours returned|Actions today|Autonomous actions)$/, () => ({ t: "actions" })],
    [/^MTTR today$/, () => ({ t: "incidents", f: "resolved", label: "Resolved incidents" })],
    [/^(Alerts in today|Raw alerts per minute|Alerts per minute|Noise removed|Correlation groups)$/, () => ({ t: "alerts", label: "Live alerts" })],
    [/^Core services availability$/, () => ({ t: "service", name: "Core services", kinds: ["epic"] })]
  ];
  const SVC = () => { try { return BCe.map((x) => [x.name, x]); } catch (e) { return []; } };
  const DEV_RE = /^(edge|sw|srv|ilo|vm|nas|dvr|ap|ws|img|prn)-\d{4}(?:-[\w]+)?/;
  const STATUS_WORD = { Down: "down", Degraded: "degraded", Healthy: "healthy", Maintenance: "maintenance", "In maintenance": "maintenance" };
  let labels = null;
  function siteIndex() {
    if (labels) return labels; labels = new Map();
    S().clinics.forEach((c) => { [c.label, c.name, `#${c.id}`, `#${c.id} ${c.name}`, `${c.code} ${c.name}`].forEach((k) => labels.set(k, c.id)); });
    return labels;
  }
  const isLeafish = (el) => !el.querySelector("div,table,ul,section,button");
  const clickable = (el) => !!el.closest("button,a,[role=button],.cursor-pointer,input,select,textarea,label");
  function tag(el, view, tile) {
    const j = JSON.stringify(view); if (el.dataset.kx === j) return;
    el.dataset.kx = j; if (tile) el.dataset.kxTile = "1";
  }
  function scan() {
    if (!document.body) return;
    const main = document.querySelector("main") || document.body, idx = siteIndex();
    const els = main.querySelectorAll("span,div,b,strong,td,p,h1,h2,h3,h4,code,li");
    for (const el of els) {
      if (el.closest("#kxd") || el.closest("[role=dialog]")) continue;
      const tx = (el.textContent || "").trim(); if (!tx || tx.length > 140) continue;
      // tiles: a short label whose card becomes the target
      if (tx.length < 40 && el.children.length === 0) {
        let v = null; for (const [re, f] of TILES) if (re.test(tx)) { v = f(); break; }
        if (!v) { const s = SVC().find(([n]) => n === tx); if (s) v = { t: "service", name: s[1].name, kinds: s[1].kinds, page: s[1].page }; }
        if (v) { let card = el; for (let k = 0; k < 6 && card.parentElement; k++) { card = card.parentElement; const cs = getComputedStyle(card); if (parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderRadius) > 0) break; } tag(card, v, true); continue; }
        const sw = STATUS_WORD[tx]; if (sw && el.offsetWidth < 160 && !clickable(el)) { tag(el, { t: "sites", status: sw, label: STATUS_WORD[tx] === "down" ? "Sites that are down" : tx + " sites" }); continue; }
      }
      if (!isLeafish(el) || clickable(el)) continue;
      const inc = tx.match(/\bINC\d{7}\b/); if (inc && el.querySelectorAll("*").length < 6) { tag(el, { t: "incident", n: inc[0] }); continue; }
      const dv = tx.match(DEV_RE); if (dv && tx.length < 90) { tag(el, { t: "device", id: dv[0] }); continue; }
      if (idx.has(tx)) { tag(el, { t: "site", id: idx.get(tx) }); continue; }
      const m = tx.match(/^#?(\d{4})\b|#(\d{4})\b/); if (m && tx.length < 70) { const id = m[1] || m[2]; if (site(id)) { tag(el, { t: "site", id }); continue; } }
      for (const [k, id] of idx) if (k.length > 6 && tx.startsWith(k) && tx.length < k.length + 40) { tag(el, { t: "site", id }); break; }
    }
    // header status counts beside "All sites" (titles like "6 down"), and the open-incidents count
    document.querySelectorAll('span[title$=" healthy"],span[title$=" degraded"],span[title$=" down"]').forEach((d) => { const st = d.title.split(" ").pop(); tag(d, { t: "sites", status: st, label: ST[st][0] + " sites" }); d.dataset.kxForce = "1"; });
    document.querySelectorAll('button[title="Health of the sites in this view"] span').forEach((d) => { const tx = (d.textContent || "").trim(); if (/open incidents$/.test(tx)) { tag(d, { t: "incidents", f: "open", label: "Open incidents" }); d.dataset.kxForce = "1"; } else if (/^\d+ sites$/.test(tx)) { tag(d, { t: "sites", status: "all", label: "All sites" }); d.dataset.kxForce = "1"; } });
  }
  function onDocClick(e) {
    const el = e.target.closest("[data-kx]"); if (!el || el.closest("#kxd")) return;
    if (!el.dataset.kxTile && !el.dataset.kxForce && e.target.closest("button,a") && !el.contains(e.target.closest("button,a"))) return;
    e.preventDefault(); e.stopPropagation();
    open(JSON.parse(el.dataset.kx), true);
  }
  function start() {
    ensure();
    document.addEventListener("click", onDocClick, true);
    setInterval(scan, 900); setTimeout(scan, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
  return { open, close };
})();
// presenter hook used by the demo films and the presenter's own scripts
window.KirbyHub = { open: (x) => Ve(x), pause: (b) => ot((s) => { s.paused = !!b; }), speed: (x) => G9(x), ui: (o) => Qn(o), tool: (id, ref) => Ut(id, { ref: ref || null }), nav: (step) => WM(step), scenario: (id) => tC(id), reset: () => yu(), drill: (v) => KXD.open(v, true), closeDrill: () => KXD.close(), go: (page, arg) => oe(page, arg), site: (id) => De(id), state: () => W.get() };
