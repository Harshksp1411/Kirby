// Shared timeline helpers for the real-workflow films (kit.html).
module.exports = (ctx) => {
  const { D, wait, say } = ctx;
  const t0 = () => Date.now() / 1000;
  // a scene holds the screen until its voice line has finished (plus a breath), or for min seconds
  const scene = async (id, min, fn) => { const d = id ? say(id) : 0, s = t0(); if (fn) await fn(); const left = Math.max(min || 0, d + 0.6) - (t0() - s); if (left > 0) await wait(left); };
  // switch to another app window
  const app = async (fn, ...a) => { await D('spotOff'); await wait(0.25); await D('win', false); await D('zoomOut'); await wait(0.55); await D(fn, ...a); await D('win', true); await wait(1.0); };
  const click = async (sel, after = 0.5) => { await D('cursor', sel, true); await wait(1.05); await D('cursorOff'); if (after) await wait(after); };
  const opening = async (o) => {
    await D('demo', false); await D('logo', true);
    await scene('hook', 5, async () => { for (let i = 0; i < o.hook.length; i++) await D('line', o.hook[i], 'hook', 150, 330 + i * 95, [0, 1300, 2700][i]); });
    if (o.stat) await scene('stat', 6, () => D('stat', o.stat[0], o.stat[1], o.stat[2], o.stat[3], o.stat[4]));
    if (o.quote) { await D('clearText'); await wait(0.8); await scene('stat', 5.5, async () => { await D('line', o.quote[0], 'hook', 150, 360, 0, 'width:1500px;font-size:66px'); await D('line', o.quote[1], 'src', 156, 600, 900); }); }
    await D('clearText'); await wait(0.8);
    await scene('intro', 6.4, async () => {
      await D('line', o.intro[0], 'hook', 150, 360, 0, 'font-size:64px');
      await D('line', o.intro[1], 'hook', 150, 450, 900, 'font-size:64px');
      await D('line', o.tools.join(' · '), 'src', 156, 600, 2200, 'font-size:20px;letter-spacing:.06em;text-transform:none');
    });
    await D('clearText'); await D('logo', false); await wait(0.6); await D('demo', true);
  };
  const closing = async (o) => {
    await D('stepOff'); await D('spotOff'); await D('win', false); await D('zoomOut'); await D('demo', false); await D('logo', true);
    await wait(0.8);
    await scene('close', 8.5, async () => { for (let i = 0; i < o.close.length; i++) await D('line', o.close[i], 'mid', 150, 300 + i * 70, [0, 2700, 5300][i]); });
    await D('clearText'); await wait(0.6);
    await scene('tag', 5.6, async () => {
      await D('line', o.tag[0], 'hook', 150, 330, 0);
      await D('line', o.tag[1], 'kick y', 150, 430, 400);
      await D('line', 'With people in control.', 'mid', 154, 580, 2600);
    });
    await D('clearText'); await D('logo', false);
    await D('end', true);
    await scene('end', 4.4);
  };
  return { scene, app, click, opening, closing, t0 };
};
