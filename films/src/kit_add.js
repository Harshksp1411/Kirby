  // ================= generic, data-driven product pages =================
  // themes: a faithful look for each tool (text names only, no vendor logos)
  TH: {
    vsphere: { brand: "vSphere Client", top: "#1D2B36", tfg: "#E9EEF2", acc: "#0079B8", ff: "OS,Inter,sans-serif", bg: "#F4F6F8", sbg: "#FFFFFF", son: "#D9EAF5", line: "#D7DDE3", rad: "2px", thb: "#F7F9FA", abg: "#fff", hot: "#E1F1FB", sw: "300px", topnav: ["Menu"], user: "AD" },
    defender: { brand: "Microsoft Defender", top: "#1B1A19", tfg: "#fff", acc: "#0F6CBD", ff: "Inter,sans-serif", bg: "#FAFAFA", sbg: "#F3F3F3", son: "#E6E6E6", line: "#E0E0E0", rad: "6px", thb: "#FAFAFA", abg: "#fff", hot: "#EBF3FC", sw: "240px", topnav: [], user: "SA" },
    entra: { brand: "Microsoft Entra admin center", top: "#1B1A19", tfg: "#fff", acc: "#0F6CBD", ff: "Inter,sans-serif", bg: "#FAFAFA", sbg: "#F3F3F3", son: "#E6E6E6", line: "#E0E0E0", rad: "6px", thb: "#FAFAFA", abg: "#fff", hot: "#EBF3FC", sw: "250px", topnav: [], user: "SA" },
    intune: { brand: "Microsoft Intune admin center", top: "#1B1A19", tfg: "#fff", acc: "#0F6CBD", ff: "Inter,sans-serif", bg: "#FAFAFA", sbg: "#F3F3F3", son: "#E6E6E6", line: "#E0E0E0", rad: "6px", thb: "#FAFAFA", abg: "#fff", hot: "#EBF3FC", sw: "230px", topnav: [], user: "EA" },
    purview: { brand: "Microsoft Purview", top: "#0B3A3D", tfg: "#fff", acc: "#038387", ff: "Inter,sans-serif", bg: "#FAFAFA", sbg: "#F3F3F3", son: "#E3EEEE", line: "#E0E0E0", rad: "6px", thb: "#FAFAFA", abg: "#fff", hot: "#E3F2F2", sw: "240px", topnav: [], user: "CO" },
    veeam: { brand: "Veeam Backup & Replication", top: "#2C3A41", tfg: "#fff", acc: "#00B336", ff: "OS,Inter,sans-serif", bg: "#EEF1F2", sbg: "#FFFFFF", son: "#DDF3E4", line: "#D3D9DC", rad: "2px", thb: "#F4F6F7", abg: "#F7F9F9", hot: "#E3F6EA", sw: "260px", topnav: ["Home", "Backup Job", "View"], user: "BK" },
    opsramp: { brand: "OpsRamp", top: "#0B1F3A", tfg: "#fff", acc: "#2BA4E0", ff: "OS,Inter,sans-serif", bg: "#F3F5F8", sbg: "#FFFFFF", son: "#E3F1FA", line: "#DDE3EA", rad: "6px", thb: "#F7F9FB", abg: "#fff", hot: "#E6F4FB", sw: "0px", topnav: ["Dashboards", "Infrastructure", "Command Center", "Automation", "Setup"], user: "PR" },
    snow: { brand: "servicenow", top: "#1B2B37", tfg: "#fff", acc: "#1B2B37", ff: "Lato,Inter,sans-serif", bg: "#F1F3F5", sbg: "#FFFFFF", son: "#E8EEF2", line: "#DEE2E6", rad: "8px", thb: "#F7F8F9", abg: "#fff", hot: "#EAF2F7", sw: "0px", topnav: ["All", "Favorites", "History", "Workspaces"], user: "PR" },
    fsm: { brand: "servicenow", top: "#1B2B37", tfg: "#fff", acc: "#1B2B37", ff: "Lato,Inter,sans-serif", bg: "#F1F3F5", sbg: "#FFFFFF", son: "#E8EEF2", line: "#DEE2E6", rad: "8px", thb: "#F7F8F9", abg: "#fff", hot: "#EAF2F7", sw: "0px", topnav: ["All", "Favorites", "History", "Workspaces"], user: "DP" }
  },
  page(c) {
    const t = Object.assign({}, D.TH[c.th], c.theme || {}), vars = `--top:${t.top};--tfg:${t.tfg};--acc:${t.acc};--ff:${t.ff};--bg:${t.bg};--sbg:${t.sbg};--son:${t.son};--line:${t.line};--rad:${t.rad};--thb:${t.thb};--abg:${t.abg};--hot:${t.hot};--sw:${c.sw || t.sw}`;
    const topnav = (c.topnav || t.topnav).map((n) => `<span class="tn ${n === c.topOn ? "on" : ""}">${n}</span>`).join("");
    const side = (c.nav || []).map((n) => { if (n.startsWith("#")) return `<div class="hdr">${n.slice(1)}</div>`; const d = (n.match(/^>+/) || [""])[0].length, x = n.replace(/^>+/, ""); return `<div class="${x === c.navOn ? "on" : ""}" style="padding-left:${16 + d * 18}px"><i></i>${x}</div>`; }).join("");
    const pills = (c.pills || []).map(([x, col], i) => `<span class="pl" id="pill${i}" style="color:${col};background:${col}18">${col ? "<i></i>" : ""}${x}</span>`).join("");
    const acts = c.actions ? `<div class="acts">${c.actions.map(([x, id]) => `<span id="act-${id}"><i></i>${x}</span>`).join("")}</div>` : "";
    const tabs = c.tabs ? `<div class="tabs2">${c.tabs.map((x) => `<span class="${x === c.tabOn ? "on" : ""}">${x}</span>`).join("")}</div>` : "";
    W().innerHTML = `<div class="app pg" style="${vars}"><div class="top"><span class="brand"><i></i>${c.brand || t.brand}</span>${topnav}<span class="srch">${c.search || "Search"}</span><span>${c.tenant || ""}</span><span class="usr">${c.user || t.user}</span></div>
      <div style="flex:1;display:flex;min-height:0">${c.nav ? `<div class="side">${side}</div>` : ""}<div class="main" id="pgmain">${c.crumb ? `<div class="crumb">${c.crumb}</div>` : ""}
      ${c.title ? `<div class="ttl"><div><div style="display:flex;align-items:center;gap:12px"><h1 id="pgt">${c.title}</h1>${pills}</div>${c.sub ? `<div class="sub" id="pgsub">${c.sub}</div>` : ""}</div>${c.right ? `<div style="margin-left:auto;display:flex;gap:8px">${c.right}</div>` : ""}</div>` : ""}
      ${acts}${tabs}<div class="grid" style="grid-template-columns:${(c.cols || "1fr 1fr 1fr").replace(/(\d*\.?\d+)fr/g, "minmax(0,$1fr)")}">${(c.blocks || []).map(D.blk).join("")}</div>
      <div class="fly" id="fly"></div><div class="mdl" id="mdl"><div></div></div><div class="toast" id="toast"></div></div></div></div>`;
    (c.blocks || []).forEach((b) => b.t === "chart" && D.chart(b.id, b));
    setTimeout(() => (c.blocks || []).forEach((b) => { const el = b.t === "chart" && $("#" + b.id, W()); if (el && el.__c && Math.abs(el.__c.w - el.clientWidth) > 4 && !$("#" + b.id + "-x", W()).children.length) D.chart(b.id, b); }), 250);
    return true;
  },
  blk(b) {
    const st = `grid-column:span ${b.w || 1};${b.h ? "height:" + b.h + "px;" : ""}${b.style || ""}`;
    let body = "";
    if (b.t === "kv") body = `<div class="kv" style="${b.kw ? "--kw:" + b.kw + "px" : ""}" id="${b.id || ""}">${b.rows.map(([k, v], i) => `<span>${k}</span><span id="${b.id || "kv"}-${i}">${v}</span>`).join("")}</div>`;
    else if (b.t === "table") body = `<table class="t"><thead><tr>${b.cols.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody id="${b.id}">${(b.rows || []).map((r, i) => `<tr id="${b.id}-r${i}">${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    else if (b.t === "tl") body = `<div class="tl" id="${b.id}">${(b.items || []).map(([a, x]) => `<div><time>${a}</time><span>${x}</span></div>`).join("")}</div>`;
    else if (b.t === "chart") body = `<div id="${b.id}" style="height:${b.ch || 220}px;position:relative"></div>`;
    else body = `<div id="${b.id || ""}">${b.html || ""}</div>`;
    return `<div class="blk" id="blk-${b.id || Math.random().toString(36).slice(2, 7)}" style="${st}">${b.title ? `<div class="bt">${b.title}</div>` : ""}${body}</div>`;
  },
  // line chart: history, optional forecast (dashed), threshold, unit
  chart(id, b) {
    const el = $("#" + id, W()); if (!el) return false; const w = el.clientWidth || 600, h = b.ch || 220, pad = [36, 10, 24, 44];
    const all = [...b.data, ...(b.fc || [])], max = b.max || Math.max(...all, b.thr || 0) * 1.1, n = all.length + (b.room || 0);
    const X = (i) => pad[3] + (i / (n - 1)) * (w - pad[1] - pad[3]), Y = (v) => pad[0] + (1 - v / max) * (h - pad[0] - pad[2]);
    const path = (arr, o) => arr.map((v, i) => `${i ? "L" : "M"}${X(i + o).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
    const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => `<line x1="${pad[3]}" x2="${w - pad[1]}" y1="${Y(max * f)}" y2="${Y(max * f)}" stroke="#EEF0F3"/><text x="${pad[3] - 6}" y="${Y(max * f) + 4}" font-size="11" fill="#7A828C" text-anchor="end">${Math.round(max * f)}${b.unit || ""}</text>`).join("");
    const xl = (b.xl || []).map(([i, s]) => `<text x="${X(i)}" y="${h - 6}" font-size="11" fill="#7A828C" text-anchor="middle">${s}</text>`).join("");
    const thr = b.thr ? `<line x1="${pad[3]}" x2="${w - pad[1]}" y1="${Y(b.thr)}" y2="${Y(b.thr)}" stroke="#C62828" stroke-dasharray="5 4"/><text x="${w - pad[1]}" y="${Y(b.thr) - 6}" font-size="11.5" fill="#C62828" text-anchor="end" font-weight="700">${b.thrL || "Threshold"}</text>` : "";
    const fc = b.fc ? `<path id="${id}-fc" d="${path([b.data.at(-1), ...b.fc], b.data.length - 1)}" stroke="${b.fcol || "#E0A800"}" stroke-width="2.5" fill="none" stroke-dasharray="7 5" style="opacity:0;transition:opacity .8s"/>` : "";
    el.innerHTML = `<svg width="${w}" height="${h}">${grid}${thr}${xl}<path d="${path(b.data, 0)}" stroke="${b.col || "#2B6CB0"}" stroke-width="2.5" fill="none"/>${fc}<g id="${id}-x"></g></svg>`;
    el.__c = { X, Y, b, w, h };
    return true;
  },
  chartFc(id, on = true) { const p = $("#" + id + "-fc", W()); if (p) p.style.opacity = on ? 1 : 0; return true; },
  chartMark(id, i, label, col = "#C62828") { const el = $("#" + id, W()); const { X, Y, b, h } = el.__c; const all = [...b.data, ...(b.fc || [])]; $("#" + id + "-x", W()).innerHTML += `<g class="new"><line x1="${X(i)}" x2="${X(i)}" y1="30" y2="${h - 24}" stroke="${col}" stroke-width="1.5"/><circle cx="${X(i)}" cy="${Y(all[i])}" r="6" fill="${col}"/><rect x="${X(i) - 150}" y="6" width="150" height="22" rx="4" fill="${col}"/><text x="${X(i) - 75}" y="21" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></g>`; return true; },
  chartAfter(id, vals, col = "#1A7F37") { const el = $("#" + id, W()); const { X, Y, b } = el.__c; const o = b.data.length - 1; const d = [b.data.at(-1), ...vals].map((v, i) => `${i ? "L" : "M"}${X(i + o).toFixed(1)} ${Y(v).toFixed(1)}`).join(" "); $("#" + id + "-x", W()).innerHTML += `<path class="new" d="${d}" stroke="${col}" stroke-width="3" fill="none"/>`; D.chartFc(id, false); return true; },
  // edits on whatever is on screen
  set(sel, html, flash = true) { const e = D.el(sel); if (!e) return false; e.innerHTML = html; if (flash) { e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); } return true; },
  css(sel, style) { const e = D.el(sel); if (!e) return false; e.style.cssText += style; return true; },
  cls(sel, c, on = true) { const e = D.el(sel); if (!e) return false; e.classList.toggle(c, on); return true; },
  pill(i, x, col) { const e = $("#pill" + i, W()); if (!e) return false; e.innerHTML = `<i></i>${x}`; e.style.color = col; e.style.background = col + "18"; e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); return true; },
  row(tb, cells, top = true, cls = "") { const b = $("#" + tb, W()); if (!b) return false; const r = document.createElement("tr"); r.className = "new " + cls; r.innerHTML = cells.map((x) => `<td>${x}</td>`).join(""); top ? b.prepend(r) : b.appendChild(r); return true; },
  cell(tb, ri, ci, html) { const r = $$(`#${tb} tr`, W())[ri]; if (!r) return false; const c = r.children[ci]; c.innerHTML = html; c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); return true; },
  rowSel(tb, ri, on = true) { const r = $$(`#${tb} tr`, W())[ri]; if (r) r.classList.toggle("sel", on); return true; },
  tl(id, time, html, top = false) { const b = $("#" + id, W()); if (!b) return false; const d = document.createElement("div"); d.className = "new"; d.innerHTML = `<time>${time}</time><span>${html}</span>`; top ? b.prepend(d) : b.appendChild(d); return true; },
  add(sel, html, top = false) { const b = D.el(sel); if (!b) return false; const d = document.createElement("div"); d.className = "new"; d.innerHTML = html; top ? b.prepend(d) : b.appendChild(d); return true; },
  act(id, state) { const e = $("#act-" + id, W()); if (!e) return false; e.classList.remove("hot", "done"); if (state) e.classList.add(state); if (state === "done") e.innerHTML = "✓ " + e.textContent; return true; },
  fly(title, body, btn = "Confirm", btn2 = "Cancel") { const f = $("#fly", W()); f.innerHTML = `<h3>${title}</h3><div style="line-height:1.5">${body}</div><div class="fb"><span class="pbtn p" id="flyok">${btn}</span><span class="pbtn">${btn2}</span></div>`; f.classList.add("on"); return true; },
  flyOff() { $("#fly", W()).classList.remove("on"); return true; },
  modal(title, body, btn = "OK", btn2 = "Cancel") { const m = $("#mdl", W()); m.firstElementChild.innerHTML = `<b style="font-size:17px">${title}</b><div style="line-height:1.5">${body}</div><div style="display:flex;gap:10px;justify-content:flex-end"><span class="pbtn">${btn2}</span><span class="pbtn p" id="mdlok">${btn}</span></div>`; m.classList.add("on"); return true; },
  modalOff() { $("#mdl", W()).classList.remove("on"); return true; },
  toast(html, col = "#1a7f37") { const t = $("#toast", W()); t.innerHTML = html; t.style.borderLeftColor = col; t.classList.add("on"); clearTimeout(window.__tt); window.__tt = setTimeout(() => t.classList.remove("on"), 4200); return true; },
  type(sel, text, ms = 28) { const e = D.el(sel); if (!e) return false; e.textContent = ""; e.classList.add("typing"); let i = 0; const t = setInterval(() => { e.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); e.classList.remove("typing"); } }, ms); return true; },

  // ================= ServiceNow record (generic) =================
  sn(c) {
    W().innerHTML = `<div class="app sn"><div class="un"><b style="font-size:17px">servicenow</b><span>All</span><span>Favorites</span><span>History</span><span>Workspaces</span><span class="pill" style="margin-left:40px">${c.ws || "Service Operations Workspace"}</span><span style="margin-left:auto;background:rgba(255,255,255,.12);border-radius:16px;padding:5px 160px 5px 14px;opacity:.8">Search</span><span class="av" style="width:30px;height:30px;border-radius:50%;background:#3E8E7E;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${c.user || "PR"}</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="rail"><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;position:relative" id="snwrap"><div class="tabs"><span>Home</span><span>${c.listTab || "Incidents"}</span><span class="on" id="sntab">${c.num}</span></div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;min-height:0;flex:1">
        <div style="display:flex;align-items:center;gap:14px"><div><div style="font-size:12.5px;color:#5A6872">${c.kind || "Incident"} · ${c.num}</div><div style="font-size:21px;font-weight:700" id="sntitle">${c.title}</div></div><div style="margin-left:auto;display:flex;gap:8px"><span class="btn" id="snassist" style="${c.assist ? "" : "display:none"}">✦ Mova iO assist</span><span class="btn">Assign to me</span><span class="btn" id="snres">Resolve</span><span class="btn p">Save</span><span class="btn">⋯</span></div></div>
        <div class="hl" id="snhl">${(c.hl || [["Priority", c.prio || "3 - Moderate"], ["State", c.state || "New"], ["Assigned to", c.assigned || "(empty)"], ["Updated", "just now"], ["Resolution SLA", c.sla || "7h 58m left"]]).map(([a, b], i) => `<div>${a}<b id="snh${i}">${b}</b></div>`).join("")}</div>
        <div style="display:flex;gap:16px;min-height:0;flex:1">
          <div style="flex:1.15;background:#fff;border:1px solid #DEE2E6;border-radius:8px;padding:14px 18px;overflow:hidden" id="snform"><div style="display:flex;gap:22px;font-size:14px;border-bottom:1px solid #EEF0F2;margin-bottom:14px"><span style="padding:6px 0;border-bottom:3px solid #1B2B37;font-weight:700">Details</span><span style="padding:6px 0;color:#5A6872">Related records</span><span style="padding:6px 0;color:#5A6872">Investigate</span></div>
            <div class="f">${c.fields.map(([a, b]) => `<div><label>${a}</label><div class="v" id="f-${a.toLowerCase().replace(/[^a-z]+/g, "")}">${b}</div></div>`).join("")}<div style="grid-column:1/3"><label>Short description</label><div class="v" id="f-short">${c.short || ""}</div></div>${c.desc != null ? `<div style="grid-column:1/3"><label>Description</label><div class="v" id="f-desc" style="min-height:64px;line-height:1.45">${c.desc}</div></div>` : ""}<div style="grid-column:1/3" id="snresbox"></div></div></div>
          <div class="act" style="flex:1;overflow:hidden" id="snact"><div style="padding:12px 16px;font-weight:700;font-size:15px">Activity</div><div style="margin:0 16px 10px;border:1px solid #CDD3DA;border-radius:6px;padding:9px 12px;font-size:13.5px;color:#8A949E;display:flex;justify-content:space-between"><span>Compose · Work notes</span><span style="font-weight:700;color:#5A6872">Post</span></div><div id="snnotes" style="overflow:hidden"></div></div>
        </div></div>
        <div id="snpanel" style="position:absolute;top:40px;right:0;bottom:0;width:560px;background:#fff;box-shadow:-14px 0 40px rgba(0,0,0,.18);transform:translateX(105%);transition:transform .55s cubic-bezier(.2,.8,.2,1);padding:18px 22px;display:flex;flex-direction:column;gap:12px;font-size:14px;overflow:hidden"></div>
      </div></div></div>`;
    (c.notes || []).forEach((n) => D.snNote(...n));
    return true;
  },
  snField(key, html, ai) { const e = $("#f-" + key, W()); if (!e) return false; e.innerHTML = html + (ai ? `<span class="ai">✦ ${ai}</span>` : ""); e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); return true; },
  snHl(i, html, col) { const e = $("#snh" + i, W()); if (!e) return false; e.innerHTML = html; if (col) e.style.color = col; e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); return true; },
  snPanel(html) { const p = $("#snpanel", W()); p.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><span style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#EE3B33,#F7A541 55%,#E15AA5);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800">M</span><b style="font-size:16px">Mova iO assist</b><span style="margin-left:auto;color:#5A6872">✕</span></div>` + html; p.style.transform = "none"; return true; },
  snPanelOff() { $("#snpanel", W()).style.transform = "translateX(105%)"; return true; },
  snPanelAdd(html) { return D.add("#snpanel", html); },
  snRes(text, state = "Resolved") { D.snHl(1, state, "#1B7A43"); const s = $("#snh4", W()); if (s && /SLA/.test(s.parentElement.textContent)) s.textContent = "Met"; $("#snresbox", W()).innerHTML = `<label style="font-size:12.5px;color:#5A6872">Resolution notes</label><div class="v flash" style="border:1px solid #CDD3DA;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;line-height:1.45">${text}</div>`; return true; },
  // ServiceNow list view
  snList(c) {
    W().innerHTML = `<div class="app sn"><div class="un"><b style="font-size:17px">servicenow</b><span>All</span><span>Favorites</span><span>History</span><span>Workspaces</span><span class="pill" style="margin-left:40px">${c.ws || "Service Operations Workspace"}</span><span style="margin-left:auto;background:rgba(255,255,255,.12);border-radius:16px;padding:5px 160px 5px 14px;opacity:.8">Search</span><span class="av" style="width:30px;height:30px;border-radius:50%;background:#3E8E7E;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">PR</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="rail"><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span><span class="ic"></span></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0" class="pg" id="snl"><div class="tabs"><span>Home</span><span class="on">${c.tab || "Incidents"}</span></div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:12px;flex:1;min-height:0"><div style="display:flex;align-items:center;gap:12px"><b style="font-size:20px">${c.title}</b><span style="color:#5A6872;font-size:13.5px">${c.sub || ""}</span><span style="margin-left:auto" class="btn">New</span></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div style="flex:${c.side ? 1.6 : 1};background:#fff;border:1px solid #DEE2E6;border-radius:8px;overflow:hidden"><table class="t" style="width:100%;border-collapse:collapse;font-size:13.5px"><thead><tr>${c.cols.map((x) => `<th style="text-align:left;padding:10px;border-bottom:1px solid #DEE2E6;background:#F7F8F9;color:#5A6872">${x}</th>`).join("")}</tr></thead><tbody id="snlb">${c.rows.map((r, i) => `<tr id="snlb-r${i}">${r.map((x) => `<td style="padding:10px;border-bottom:1px solid #EEF0F2;white-space:nowrap">${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      ${c.side ? `<div style="flex:1;background:#fff;border:1px solid #DEE2E6;border-radius:8px;padding:14px 16px;overflow:hidden;font-size:13.5px" id="snlside">${c.side}</div>` : ""}</div></div></div></div></div>`;
    return true;
  },
  snlRow(cells, top = true) { const b = $("#snlb", W()); const r = document.createElement("tr"); r.className = "new"; r.innerHTML = cells.map((x) => `<td style="padding:10px;border-bottom:1px solid #EEF0F2;white-space:nowrap">${x}</td>`).join(""); top ? b.prepend(r) : b.appendChild(r); return true; },

  // ================= Teams (generic chat / approval) =================
  tms(c) {
    const isChat = c.view !== "channel";
    W().innerHTML = `<div class="app tm"><div class="tb"><span style="position:absolute;left:18px;font-weight:600;color:#424242">Microsoft Teams</span><span class="s">Search</span><span class="av" style="position:absolute;right:16px;width:28px;height:28px;background:#C4314B;font-size:11px">${c.me || "PR"}</span></div>
      <div style="flex:1;display:flex;min-height:0"><div class="ab">${["Activity", "Chat", "Teams", "Calendar", "Calls", "OneDrive", "Apps"].map((a) => `<div class="${(isChat && a === "Chat") || (!isChat && a === "Teams") ? "on" : ""}"><i></i>${a}</div>`).join("")}</div>
      <div class="list"><div style="font-weight:700;font-size:16px;padding:4px 8px 12px">${isChat ? "Chat" : "Teams"}</div>${isChat ? (c.items || [[c.agent, c.preview || "", 1]]).map(([n, p, on]) => `<div class="it ${on ? "on" : ""}"><span class="av ${n.startsWith("Mova") || n.includes("(Mova") ? "mv" : ""}" style="${n.startsWith("Mova") || n.includes("(Mova") ? "" : "background:#6264A7"}">${n.startsWith("Mova") || n.includes("(Mova") ? "M" : n.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span><div style="min-width:0"><div style="font-weight:${on ? 700 : 600}">${n}</div><div style="color:#616161;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p}</div></div></div>`).join("") : `<div class="it"><span class="av" style="background:#4E3047;border-radius:6px">IT</span><b>${c.team || "IT Operations"}</b></div><div style="padding:2px 0 0 52px;line-height:2;color:#424242">${(c.channels || ["General", "Major incidents", "Site updates", "NOC handover"]).map((x) => x === c.channel ? `<b style="color:#5B5FC7">${x}</b>` : x).join("<br>")}</div>`}</div>
      <div style="flex:1;display:flex;flex-direction:column;background:#fff;min-width:0"><div style="height:58px;border-bottom:1px solid #E0E0E0;display:flex;align-items:center;gap:12px;padding:0 20px"><span class="av ${isChat ? "mv" : ""}" style="${isChat ? "" : "background:#4E3047;border-radius:6px"}">${isChat ? "M" : "IT"}</span><b style="font-size:16px">${isChat ? c.agent : (c.team || "IT Operations") + " › " + c.channel}</b><span style="margin-left:18px;font-weight:600;border-bottom:3px solid #5B5FC7;padding:18px 0 15px">${isChat ? "Chat" : "Posts"}</span><span style="color:#616161">${isChat ? "About" : "Files"}</span></div>
      <div id="tmmsgs" style="flex:1;padding:22px 30px;display:flex;flex-direction:column;gap:18px;overflow:hidden;background:#F5F5F5"></div>
      <div style="margin:0 30px 18px;border:1px solid #E0E0E0;border-radius:6px;padding:12px 14px;color:#8A8886;background:#fff;font-size:14px" id="tmbox">Type a message</div></div></div></div>`;
    window.__agent = c.agent; return true;
  },
  tmSay(html, who, min = 0) { return D.tmMsg(html, who || window.__agent, min, false); },
  tmUser(html, name = "", init = "") {
    const m = document.createElement("div"); m.className = "new"; m.style.cssText = "display:flex;gap:12px;align-items:flex-start;flex-direction:row-reverse";
    m.innerHTML = `<div style="max-width:620px"><div style="font-size:12.5px;color:#616161;margin-bottom:5px;text-align:right">${name ? `<b style="color:#242424">${name}</b> &nbsp;` : ""}${tm()}</div><div style="background:#E8EBFA;border-radius:6px;padding:10px 14px;font-size:14px;line-height:1.45">${html}</div></div>`;
    $("#tmmsgs", W()).appendChild(m); return true;
  },
  tmCard(id, title, intro, facts, opts = {}) {
    return D.tmSay(`<div class="card" id="${id}" style="width:${opts.w || 640}px"><div class="hd">${title}</div>${intro ? `<div style="padding:12px 18px 0;font-size:14px;line-height:1.45">${intro}</div>` : ""}
      ${facts ? `<div class="fact">${facts.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join("")}</div>` : ""}
      ${opts.countdown ? `<div style="margin:4px 18px 0;padding:10px 12px;background:#FFF8E1;border:1px solid #F5D78E;border-radius:6px;font-size:13.5px;display:flex;align-items:center;gap:12px"><span id="apcd">${opts.countdown} · runs in <b>10 s</b> unless stopped</span><div style="flex:1;height:6px;background:#F1E3B8;border-radius:6px;overflow:hidden"><div id="apbar" style="height:100%;width:100%;background:#E0A800;transition:width 10s linear"></div></div></div>` : ""}
      ${opts.buttons ? `<div style="display:flex;gap:10px;padding:14px 18px 16px" id="apbtns">${opts.buttons.map((b, i) => `<span class="tbtn ${i ? "" : "p"}" id="${i ? "apb" + i : "apok"}">${b}</span>`).join("")}</div>` : `<div style="height:12px"></div>`}</div>`);
  },
  tmApproveG(by, running) { clearInterval(window.__apT); const b = $("#apbar", W()); if (b) { b.style.transition = "none"; b.style.width = "0%"; } const c = $("#apcd", W()); if (c) c.innerHTML = `<b style='color:#107C10'>✓ Approved by ${by}</b>`; $("#apbtns", W()).innerHTML = `<span style="font-size:13.5px;color:${c ? "#616161" : "#107C10"}">${c ? "" : "✓ Approved by " + by + " · "}${running}</span>`; return true; },

  // ================= Copilot Studio activity (generic) =================
  cst(c) {
    D.copilot();
    $(".cs .hd span:nth-child(3)", W()).textContent = c.agent;
    $(".cs b", W()).parentElement.querySelectorAll("b")[1].textContent = c.run;
    $("#cstr", W()).innerHTML = `<div style="font-weight:600;margin-bottom:10px">Transcript</div><div style="background:#F3F2F1;border-radius:6px;padding:10px 12px;margin-bottom:10px"><div style="font-size:11.5px;color:#605E5C;margin-bottom:4px">Trigger payload · ${c.src}</div><code style="font-size:12px;white-space:pre">${c.payload}</code></div>`;
    const map = $("#csmap", W()), N = c.nodes, pos = (i) => [40 + (i % 2) * 340, 24 + i * (N.length > 10 ? 58 : 66)];
    let svg = `<svg style="position:absolute;inset:0" width="900" height="800">`; for (let i = 1; i < N.length; i++) { const [x1, y1] = pos(i - 1), [x2, y2] = pos(i); svg += `<path d="M${x1 + 150} ${y1 + 52} C ${x1 + 150} ${y1 + 62}, ${x2 + 150} ${y2 - 10}, ${x2 + 150} ${y2}" stroke="#C8C6C4" stroke-width="2" fill="none"/>`; } svg += `</svg>`;
    map.innerHTML = svg + N.map(([t, k, col, d], i) => { const [x, y] = pos(i); return `<div class="node" data-i="${i}" data-d="${d}" style="left:${x}px;top:${y}px"><div class="t"><span class="ti" style="background:${col}">${t[0]}</span>${t}<span class="st">Pending</span></div><div class="k">${k}</div></div>`; }).join("");
    return true;
  },
  csDet(i, title, sub, inp, out) {
    const det = $("#csdet", W()); const n = $(`.node[data-i="${i}"]`, W()); $$(".node", W()).forEach((x) => (x.style.outline = "")); n.style.outline = "2px solid #0F6CBD";
    det.innerHTML = `<div style="width:420px;padding:16px 18px;font-size:13.5px"><div style="font-weight:700;font-size:15px">${title}</div><div style="color:#605E5C;margin:2px 0 12px">${sub}</div><div style="font-weight:600;margin-bottom:6px">Inputs</div><pre style="background:#F3F2F1;border-radius:6px;padding:10px;font-size:12px;margin:0 0 12px;white-space:pre-wrap">${inp}</pre><div style="font-weight:600;margin-bottom:6px">Outputs</div><pre style="background:#F3F2F1;border-radius:6px;padding:10px;font-size:12px;margin:0;white-space:pre-wrap">${out}</pre><div style="margin-top:12px;color:#0F6CBD;font-weight:600">Show rationale</div></div>`;
    det.style.width = "420px"; return true;
  },

  // ================= Outlook (web) =================
  outlook(c) {
    W().innerHTML = `<div class="app ol"><div class="top"><b style="font-size:16px">Outlook</b><span style="margin-left:auto;width:520px;height:30px;border-radius:5px;background:rgba(255,255,255,.2);display:flex;align-items:center;padding:0 12px;font-size:13px">Search</span><span style="margin-left:auto" class="av"></span><span style="width:30px;height:30px;border-radius:50%;background:#C4314B;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${c.me || "KS"}</span></div>
      <div class="rib">${["New mail", "Delete", "Archive", "Report", "Sweep", "Move to", "Reply", "Reply all", "Forward"].map((x) => `<span id="rb-${x.toLowerCase().replace(/ /g, "")}">${x}</span>`).join("")}</div>
      <div style="flex:1;display:flex;min-height:0"><div class="fold">${["Inbox", "Junk Email", "Drafts", "Sent Items", "Deleted Items", "Archive"].map((x) => `<div class="${x === "Inbox" ? "on" : ""}">${x}${x === "Inbox" ? ` <b style="float:right;color:#0F6CBD">${c.unread || 7}</b>` : ""}</div>`).join("")}</div>
      <div class="lst" id="ollst">${c.list.map(([f, s, p, t, on], i) => `<div class="m ${on ? "on" : ""}" id="olm${i}"><b>${f}<span style="float:right;font-weight:400;color:#616161;font-size:12px">${t}</span></b><div class="s">${s}</div><div class="p">${p}</div></div>`).join("")}</div>
      <div class="rd" id="olrd">${c.warn ? `<div class="warn">${c.warn}</div>` : ""}<div style="font-size:20px;font-weight:600;margin-bottom:12px">${c.open.subject}</div><div style="display:flex;gap:12px;align-items:center;margin-bottom:16px"><span style="width:40px;height:40px;border-radius:50%;background:${c.open.col || "#8764B8"};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700">${c.open.init}</span><div><b>${c.open.from}</b><div style="font-size:12.5px;color:#616161">To: ${c.open.to}</div></div><span style="margin-left:auto;font-size:12.5px;color:#616161">${c.open.time}</span></div><div id="olbody">${c.open.body}</div></div></div></div>`;
    return true;
  },
