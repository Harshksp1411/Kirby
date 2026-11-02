// Shared timeline machinery and HTML builders for the real-workflow films (kit.html).
const esc = (s) => String(s);
const H = {
  pl: (t, c = "n") => `<span class="pl ${c}">${t}</span>`,
  dot: (c) => `<span class="dot" style="background:${c}"></span>`,
  sev: (s) => { const c = { Critical: "#D32F2F", High: "#D32F2F", Major: "#D32F2F", Warning: "#F59E0B", Medium: "#F59E0B", Low: "#2E7BD6", Informational: "#8A94A6", Ok: "#2E7D32" }[s] || "#8A94A6"; return `<span class="sev"><i style="background:${c}"></i>${s}</span>`; },
  table: (cols, rows, o = {}) => `<table class="${o.cls || "tbl"}" ${o.id ? `id="${o.id}"` : ""}><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody ${o.tb ? `id="${o.tb}"` : ""}>${rows.map((r) => H.tr(r)).join("")}</tbody></table>`,
  tr: (r, o = {}) => { const cells = Array.isArray(r) ? r : r.c; const id = r.id || o.id; const cl = r.cls || o.cls || ""; return `<tr ${id ? `id="${id}"` : ""} class="${cl}">${cells.map((c, j) => `<td class="c${j}">${c}</td>`).join("")}</tr>`; },
  kv: (pairs, id) => `<div class="kv" ${id ? `id="${id}"` : ""}>${pairs.map(([a, b, i]) => `<span>${a}</span><span ${i ? `id="${i}"` : ""}>${b}</span>`).join("")}</div>`,
  // ServiceNow incident body (works with SH.snow)
  snInc: (o) => `<div style="display:flex;align-items:center;gap:14px"><div><div style="font-size:12.5px;color:#5A6872">${o.kicker || "Incident"} · ${o.num}</div><div style="font-size:21px;font-weight:700" id="sntitle">${o.title}</div></div><div style="margin-left:auto;display:flex;gap:8px">${(o.buttons || ["Assign to me", "Resolve", "Save", "⋯"]).map((b) => `<span class="btn ${b === "Save" ? "p" : ""}">${b}</span>`).join("")}</div></div>
    <div class="hl" id="snhl">${o.hl.map(([a, b, c, i]) => `<div>${a}<b ${i ? `id="${i}"` : ""} style="${c ? "color:" + c : ""}">${b}</b></div>`).join("")}</div>
    <div style="display:flex;gap:16px;min-height:0;flex:1">
      <div style="flex:1.15;background:#fff;border:1px solid #DEE2E6;border-radius:8px;padding:14px 18px;overflow:hidden" id="snleft"><div style="display:flex;gap:22px;font-size:14px;border-bottom:1px solid #EEF0F2;margin-bottom:14px">${(o.ltabs || ["Overview", "Related records", "Investigate"]).map((t, i) => `<span style="padding:6px 0;${i === 0 ? "border-bottom:3px solid #1B2B37;font-weight:700" : "color:#5A6872"}">${t}</span>`).join("")}</div>
        ${o.top || ""}<div class="f">${o.fields.map(([a, b, i, w]) => `<div ${w ? 'style="grid-column:1/3"' : ""}><label>${a}</label><div class="v" ${i ? `id="${i}"` : ""}>${b}</div></div>`).join("")}<div style="grid-column:1/3" id="snresbox"></div></div></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden" id="snright">${o.right || ""}<div class="act" style="flex:1;overflow:hidden" id="snact"><div style="padding:12px 16px;font-weight:700;font-size:15px">Activity</div><div style="margin:0 16px 10px;border:1px solid #CDD3DA;border-radius:6px;padding:9px 12px;font-size:13.5px;color:#8A949E;display:flex;justify-content:space-between"><span>Compose · Work notes</span><span style="font-weight:700;color:#5A6872">Post</span></div><div id="snnotes" style="overflow:hidden">${(o.notes || []).join("")}</div></div></div>
    </div>`,
  note: (who, color, text, time, tag = "Work notes") => `<div class="note"><div class="who"><span class="av" style="background:${color}">${who.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>${who}<span class="tag" style="${tag === "Additional comments" ? "background:#E6F0FA;color:#175CD3" : ""}">${tag}</span><span style="margin-left:auto;font-weight:400;color:#8A949E;font-size:12px">${time}</span></div><div style="margin-top:6px">${text}</div></div>`,
  MV: "#E15AA5",
  // Teams message and adaptive card
  msg: (html, who, time, me) => me ? `<div style="display:flex;justify-content:flex-end"><div style="max-width:560px"><div style="font-size:12.5px;color:#616161;margin-bottom:5px;text-align:right">${time}</div><div style="background:#E8EBFA;border-radius:6px;padding:10px 14px;font-size:14px">${html}</div></div></div>` : `<div style="display:flex;gap:12px;align-items:flex-start"><span class="av ${/^Mova/.test(who) ? "mv" : ""}" style="${/^Mova/.test(who) ? "" : "background:#6264A7"}">${/^Mova/.test(who) ? "M" : who.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span><div><div style="font-size:12.5px;color:#616161;margin-bottom:5px"><b style="color:#242424">${who}</b> &nbsp;${time}</div>${html}</div></div>`,
  card: (o) => `<div class="card" id="${o.id || "apcard"}"><div class="hd">${o.title}</div>${o.intro ? `<div style="padding:12px 18px 0;font-size:14px;line-height:1.5">${o.intro}</div>` : ""}${o.facts ? `<div class="fact">${o.facts.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join("")}</div>` : ""}${o.body || ""}
    ${o.countdown ? `<div style="margin:4px 18px 0;padding:10px 12px;background:#FFF8E1;border:1px solid #F5D78E;border-radius:6px;font-size:13.5px;display:flex;align-items:center;gap:12px"><span id="apcd">${o.countdown} <b>${o.secs || 10} s</b> unless stopped</span><div style="flex:1;height:6px;background:#F1E3B8;border-radius:6px;overflow:hidden"><div id="apbar" style="height:100%;width:100%;background:#E0A800"></div></div></div>` : ""}
    ${o.buttons ? `<div style="display:flex;gap:10px;padding:14px 18px 16px" id="apbtns">${o.buttons.map((b, i) => `<span class="tbtn ${i === 0 ? "p" : ""}" ${i === 0 ? 'id="apok"' : ""}>${b}</span>`).join("")}</div>` : `<div style="height:10px"></div>`}</div>`,
  // line chart with optional forecast and threshold (SVG)
  chart: (o) => {
    const W = o.w || 760, Hh = o.h || 220, pad = 36, d = o.data, f = o.forecast || [], n = d.length + f.length - (f.length ? 1 : 0), max = o.max || 100;
    const x = (i) => pad + (i / (n - 1)) * (W - pad - 10), y = (v) => Hh - 24 - (v / max) * (Hh - 40);
    const path = (arr, off) => arr.map((v, i) => `${i ? "L" : "M"}${x(i + off).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    let s = `<svg width="${W}" height="${Hh}" ${o.id ? `id="${o.id}"` : ""} style="display:block">`;
    for (let g = 0; g <= 4; g++) { const v = (max / 4) * g; s += `<line x1="${pad}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}" stroke="#EEF1F5"/><text x="${pad - 6}" y="${y(v) + 4}" font-size="11" fill="#8A94A6" text-anchor="end">${Math.round(v)}${o.unit || ""}</text>`; }
    if (o.threshold != null) s += `<line x1="${pad}" x2="${W - 10}" y1="${y(o.threshold)}" y2="${y(o.threshold)}" stroke="#D32F2F" stroke-dasharray="5 4"/><text x="${pad + 8}" y="${y(o.threshold) - 6}" font-size="11.5" fill="#D32F2F" text-anchor="start" font-weight="700">${o.tlabel || "Threshold"}</text>`;
    s += `<path d="${path(d, 0)}" fill="none" stroke="${o.color || "#2BA4E0"}" stroke-width="2.5"/>`;
    if (f.length) s += `<path class="fc" d="${path(f, d.length - 1)}" fill="none" stroke="#E15AA5" stroke-width="2.5" stroke-dasharray="7 5"/>`;
    (o.labels || []).forEach(([i, t]) => (s += `<text x="${x(i)}" y="${Hh - 6}" font-size="11" fill="#8A94A6" text-anchor="${i >= n - 2 ? "end" : "middle"}">${t}</text>`));
    (o.marks || []).forEach(([i, v, t, c]) => (s += `<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="${c || "#E15AA5"}"/><text x="${x(i) - 8}" y="${y(v) - 10}" font-size="12" font-weight="700" fill="${c || "#E15AA5"}" text-anchor="end">${t}</text>`));
    return s + `</svg>`;
  },
  // entity graph (Defender-style attack story): nodes [{id,x,y,label,sub,c,ic}], edges [[a,b,label]]
  graph: (nodes, edges, o = {}) => {
    const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
    let s = `<svg width="${o.w || 900}" height="${o.h || 520}" style="display:block" id="${o.id || "graph"}">`;
    edges.forEach(([a, b, l], i) => { const A = N[a], B = N[b]; s += `<g class="ge" id="ge-${a}-${b}"><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#A19F9D" stroke-width="1.6"/>${l ? `<text x="${(A.x + B.x) / 2}" y="${(A.y + B.y) / 2 - 6}" font-size="11.5" fill="#605E5C" text-anchor="middle">${l}</text>` : ""}</g>`; });
    nodes.forEach((n) => { s += `<g class="gn" id="gn-${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${n.r || 24}" fill="#fff" stroke="${n.c || "#605E5C"}" stroke-width="${n.bad ? 3.5 : 2}"/><text x="${n.x}" y="${n.y + 5}" font-size="13" font-weight="700" fill="${n.c || "#605E5C"}" text-anchor="middle">${n.ic || n.label[0]}</text><text x="${n.x}" y="${n.y + (n.r || 24) + 18}" font-size="12.5" fill="#242424" text-anchor="middle" font-weight="600">${n.label}</text>${n.sub ? `<text x="${n.x}" y="${n.y + (n.r || 24) + 34}" font-size="11.5" fill="#605E5C" text-anchor="middle">${n.sub}</text>` : ""}</g>`; });
    return s + `</svg>`;
  },
};

module.exports = (ctx) => {
  const { D, wait, say } = ctx;
  const t0 = () => Date.now() / 1000;
  const scene = async (id, min, fn) => { const d = id ? say(id) : 0, s = t0(); if (fn) await fn(); const left = Math.max(min || 0, d + 0.6) - (t0() - s); if (left > 0) await wait(left); };
  const app = async (kind, o) => { await D("spotOff"); await wait(0.25); await D("win", false); await D("zoomOut"); await wait(0.55); await D("show", kind, o); await D("win", true); await wait(1.0); };
  const swap = async (kind, o) => { await D("spotOff"); await D("zoomOut"); await wait(0.5); await D("show", kind, o); await wait(0.6); };
  const opening = async (o) => {
    await D("logo", true);
    await scene("hook", o.hookMin || 5.2, async () => { const ys = [330, 425, 520]; for (let i = 0; i < o.hook.length; i++) await D("line", o.hook[i], "hook", 150, ys[i], [0, 1300, 2700][i]); });
    for (const st of o.stats || []) { await scene(st[0], st[6] || 5.6, () => D("stat", st[1], st[2], st[3], st[4], st[5])); }
    if (o.statText) for (const st of o.statText) { await D("clearText"); await wait(0.8); await scene(st[0], st[4] || 5.6, async () => { await D("line", st[1], "big y", 150, 330, 0, "width:1600px"); await D("line", st[2], "mid", 154, 500, 500, "width:1400px"); await D("line", st[3], "src", 156, 640, 900); }); }
    await D("clearText"); await wait(0.8);
    await scene("intro", o.introMin || 6.4, async () => {
      await D("line", o.intro[0], "hook", 150, 360, 0, "font-size:64px");
      await D("line", o.intro[1], "hook", 150, 450, 900, "font-size:64px");
      await D("line", o.intro[2], "src", 156, 600, 2200, "font-size:20px;letter-spacing:.06em;text-transform:none");
    });
    await D("clearText"); await D("logo", false); await wait(0.6); await D("demo", true);
  };
  const closing = async (o) => {
    await D("stepOff"); await D("spotOff"); await D("win", false); await D("zoomOut"); await D("demo", false); await D("logo", true);
    await wait(0.8);
    await scene("close", o.closeMin || 9, async () => { for (let i = 0; i < o.close.length; i++) await D("line", o.close[i], "mid", 150, 300 + i * 70, [0, 2900, 5500][i]); });
    await D("clearText"); await wait(0.6);
    await scene("tag", 5.6, async () => {
      await D("line", o.tag[0], "hook", 150, 330, 0);
      await D("line", o.tag[1], "kick y", 150, 430, 400);
      await D("line", o.tag[2] || "With people in control.", "mid", 154, 580, 2600);
    });
    await D("clearText"); await D("logo", false);
    await D("end", true);
    await scene("end", 4.6);
  };
  return { scene, app, swap, opening, closing, ...H, H };
};
module.exports.H = H;
