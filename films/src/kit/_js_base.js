const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = () => $("#win");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cam = { k: 1, tx: 0, ty: 0 };
const TC = { OpsRamp: "#1F5BA8", ServiceNow: "#2F5B4F", "Copilot Studio": "#5B5FC7", "Key Vault": "#0078D4", "Microsoft Teams": "#5B5FC7", "SD-WAN Orchestrator": "#00838F", "Carrier portal": "#7A4A6E", "Mova iO": "#E15AA5" };
const now0 = [7, 38]; let clockMin = 0;
const tm = (add = 0) => { const m = now0[1] + clockMin + add; return `${String(now0[0] + Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const SITES = [["MUM", "Mumbai Sales Office", "mum-sales-edge-01", 410, 4.1], ["PUN", "Pune Sales Office", "pun-sales-edge-01", 388, 3.8], ["DEL", "Delhi Sales Office", "del-sales-edge-01", 395, 4.4], ["IND", "Indore Sales Office", "ind-sales-edge-01", 362, 3.6], ["KOL", "Kolkata Sales Office", "kol-sales-edge-01", 377, 3.9]];
const D = window.D = {
  ready: () => true,
  // ---------- film chrome
  logo(on) { $("#logo").style.opacity = on ? 1 : 0; },
  demo(on) { $("#demo").style.opacity = on ? 1 : 0; },
  line(html, cls, x, y, delay = 0, style = "") { const d = document.createElement("div"); d.className = "line " + cls; d.innerHTML = html; d.style.left = x + "px"; d.style.top = y + "px"; if (style) d.style.cssText += style; $("#txt").appendChild(d); setTimeout(() => d.classList.add("in"), 40 + delay); return true; },
  clearText() { const old = $$("#txt > *"); old.forEach((c) => { c.classList.add("out"); c.classList.remove("in"); }); setTimeout(() => old.forEach((c) => c.remove()), 750); },
  count(sel, to, pre = "", suf = "", ms = 1400) { const el = $$("#txt .line").at(-1); if (!el) return; const t0 = performance.now(); const f = (t) => { const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = pre + Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); },
  stat(n, pre, suf, text, src) { D.clearText(); setTimeout(() => { D.line("", "big y", 150, 330); D.count(null, n, pre, suf); D.line(text, "mid", 154, 500, 350, "width:1300px"); D.line(src, "src", 156, 640 + (text.length > 70 ? 54 : 0), 700); }, 760); },
  step(n, t, tools) { const l = $("#lower"); l.classList.remove("on"); setTimeout(() => { $(".n", l).textContent = "STEP " + String(n).padStart(2, "0"); $(".t", l).textContent = t; $(".tl", l).innerHTML = (tools || []).map((x) => `<span><i style="background:${TC[x] || "#666"}"></i>${x}</span>`).join(""); l.classList.add("on"); }, 380); },
  stepOff() { $("#lower").classList.remove("on"); },
  speed(on) { $("#badge").classList.toggle("on", on); },
  end(on) { $("#endcard").classList.toggle("on", on); },
  win(on) { W().classList.toggle("on", on); },
  // ---------- camera, spotlight, cursor (selectors resolve inside the app window)
  setCam(k, tx, ty) { Object.assign(cam, { k, tx, ty }); $("#cam").style.transform = `translate(${tx}px,${ty}px) scale(${k})`; },
  local(el) { const r = el.getBoundingClientRect(); return { x: (r.x - cam.tx) / cam.k, y: (r.y - cam.ty) / cam.k, w: r.width / cam.k, h: r.height / cam.k }; },
  stage(l) { return { x: l.x * cam.k + cam.tx, y: l.y * cam.k + cam.ty, w: l.w * cam.k, h: l.h * cam.k }; },
  el(sel) { return typeof sel === "string" ? $(sel, W()) : sel; },
  focus(sel, o = {}) {
    const e = D.el(sel); if (!e) return false; const p = o.pad == null ? 8 : o.pad; const l = D.local(e); l.x -= p; l.y -= p; l.w += 2 * p; l.h += 2 * p;
    let k = Math.min(o.maxK || 1.8, 1920 * (o.fill || 0.8) / l.w, 1080 * (o.fill || 0.8) / l.h); k = Math.max(1, k);
    let tx = 960 - (l.x + l.w / 2) * k, ty = 540 - (l.y + l.h / 2) * k; tx = Math.min(0, Math.max(1920 - 1920 * k, tx)); ty = Math.min(0, Math.max(1080 - 1080 * k, ty));
    if (o.zoom === false) { k = cam.k; tx = cam.tx; ty = cam.ty; }
    D.setCam(k, tx, ty);
    if (o.spot !== false) { const s = D.stage(l), sp = $("#spot"); Object.assign(sp.style, { left: s.x + "px", top: s.y + "px", width: s.w + "px", height: s.h + "px" }); sp.classList.add("on"); } else D.spotOff();
    return true;
  },
  zoomOut() { D.setCam(1, 0, 0); D.spotOff(); },
  spotOff() { $("#spot").classList.remove("on"); },
  cursor(sel, click) { const e = D.el(sel); if (!e) return; const s = D.stage(D.local(e)), c = $("#cursor"); c.classList.add("on"); c.style.left = s.x + s.w / 2 + "px"; c.style.top = s.y + s.h / 2 + "px"; if (click) setTimeout(() => { c.classList.remove("click"); void c.offsetWidth; c.classList.add("click"); }, 950); },
  cursorOff() { $("#cursor").classList.remove("on"); },
  tick(m) { clockMin += m; },

