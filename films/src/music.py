"""Original ambient-tech music bed for the films: pads, bass, plucked arpeggio and light drums.
usage: python3 music.py out.wav seconds [seed] [intro_seconds]"""
import sys, numpy as np, wave
SR = 44100
out, secs = sys.argv[1], float(sys.argv[2]); seed = int(sys.argv[3]) if len(sys.argv) > 3 else 1; intro = float(sys.argv[4]) if len(sys.argv) > 4 else 30
rng = np.random.default_rng(seed)
BPM = 96; beat = 60 / BPM; bar = beat * 4
N = int(secs * SR) + SR * 2
L = np.zeros(N); R = np.zeros(N)
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)
# D major-ish: Dmaj9, Bm9, Gmaj7(#11), A6sus
prog = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 61], [45, 52, 57, 59, 64]]
def env(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); s = 0.0
    # vectorised one-pole via lfilter-like recursion in chunks
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)
def saw(f, n, phase=0):
    t = np.arange(n) / SR
    return 2 * ((t * f + phase) % 1) - 1
def add(buf, start, sig, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:j] += sig[: j - i] * gain * l; R[i:j] += sig[: j - i] * gain * r
t = 0.0; ci = 0
nbars = int(secs / bar) + 2
for b in range(nbars):
    ch = prog[(b // 2) % 4]
    if b % 2 == 0:
        n = int(bar * 2 * SR + 1.5 * SR)
        pad = np.zeros(n)
        for k, m in enumerate(ch):
            f = m2f(m + 12 if k > 0 else m + 12)
            for det in (-0.12, 0.0, 0.13):
                pad += saw(f * 2 ** (det / 12), n, rng.random())
        pad = lowpass(pad, 900) * env(n, 1.2, 1.6) * 0.035
        add(L, b * bar, pad, -0.3, 1.0); add(L, b * bar + 0.012, pad, 0.3, 1.0)
    pos = b * bar
    after = pos >= intro
    # bass: root on beats 1 and 3 (from intro on)
    if after:
        for q in (0, 2):
            n = int(beat * 1.8 * SR); tt = np.arange(n) / SR; f = m2f(ch[0] - 12)
            s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 2.2) * 0.16
            add(L, pos + q * beat, s, 0, 1)
    # arpeggio 8ths, quieter in the intro
    tones = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 24, ch[2] + 12, ch[4] + 12, ch[1] + 24]
    for e8 in range(8):
        n = int(0.55 * SR); tt = np.arange(n) / SR; f = m2f(tones[(e8 + b) % 8])
        s = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 9)) * np.exp(-tt * 6.5)
        g = 0.05 if after else 0.022
        st = pos + e8 * beat / 2; pan = -0.45 if e8 % 2 else 0.45
        add(L, st, s, pan, g); add(L, st + beat * 0.75, s, -pan, g * 0.35)  # echo
    # drums from intro + 2 bars, stop 8 s before the end
    if pos >= intro + 2 * bar and pos < secs - 8:
        for q in (0, 2):
            n = int(0.35 * SR); tt = np.arange(n) / SR
            k = np.sin(2 * np.pi * (52 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9) * 0.32
            add(L, pos + q * beat, k, 0, 1)
        for q in range(8):
            n = int(0.06 * SR); hh = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 70)
            hh = hh - lowpass(hh, 6000)
            add(L, pos + q * beat / 2, hh, 0.25 if q % 2 else -0.25, 0.035 if q % 2 else 0.018)
        n = int(0.25 * SR); tt = np.arange(n) / SR  # soft clap on 2 and 4
        for q in (1, 3):
            cl = rng.standard_normal(n) * np.exp(-tt * 22); cl = lowpass(cl, 2500) - lowpass(cl, 700)
            add(L, pos + q * beat, cl, 0, 0.09)
mix = np.stack([L[: int(secs * SR)], R[: int(secs * SR)]], 1)
# gentle reverb-ish smear
from scipy.signal import fftconvolve
ir_n = int(1.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 3.2) * 0.02
wet = np.stack([fftconvolve(mix[:, 0], ir)[: len(mix)], fftconvolve(mix[:, 1], ir[::-1])[: len(mix)]], 1)
mix = mix + wet * 0.6
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.82
fade = int(2.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', out, secs)
