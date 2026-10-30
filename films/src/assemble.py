"""Build the film: frames -> 30 fps video (2x where marked), voice lines placed at their marks, music ducked under the voice.
usage: python3 assemble.py frames_dir out.mp4 [music.wav] [vo_dir]"""
import json, sys, subprocess, os
d = sys.argv[1]; outp = sys.argv[2]; music = sys.argv[3] if len(sys.argv) > 3 else None; vo = sys.argv[4] if len(sys.argv) > 4 else None
J = json.load(open(os.path.join(d, 'frames.json')))
fr, marks, end = J['frames'], J['marks'], J['end']
spans = []; s0 = None
for m in marks:
    if m['k'] == 'speed':
        if m['v']: s0 = m['t']
        elif s0 is not None: spans.append((s0, m['t'])); s0 = None
def factor(t): return 0.5 if any(a <= t < b for a, b in spans) else 1.0
def outtime(t):  # recording time -> film time
    cut = sum(max(0, min(t, b) - a) * 0.5 for a, b in spans if t > a)
    return t - cut
lines = []; total = 0
for i, (name, t) in enumerate(fr):
    t2 = fr[i + 1][1] if i + 1 < len(fr) else end
    dur = max(0.0, t2 - t) * factor(t)
    lines.append(f"file '{name}'\nduration {dur:.4f}"); total += dur
lines.append(f"file '{fr[-1][0]}'")
open(os.path.join(d, 'list.txt'), 'w').write('\n'.join(lines) + '\n')
vid = outp.replace('.mp4', '.v.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(d, 'list.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-movflags', '+faststart', vid], check=True)
inputs = ['-i', vid]; fc = []; idx = 1
if music:
    inputs += ['-i', music]; fc.append(f'[{idx}:a]atrim=0:{total:.2f},asetpts=PTS-STARTPTS,afade=t=in:d=1.5,afade=t=out:st={max(0, total - 3.5):.2f}:d=3.5,aformat=sample_rates=48000:channel_layouts=stereo,volume=0.85[mus]'); mi = idx; idx += 1
vos = [m for m in marks if m['k'] == 'vo'] if vo else []
labels = []
for m in vos:
    f = os.path.join(vo, m['v'] + '.wav')
    if not os.path.exists(f): continue
    inputs += ['-i', f]; ms = int(outtime(m['t']) * 1000)
    fc.append(f'[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume=1.0[v{idx}]'); labels.append(f'[v{idx}]'); idx += 1
if labels:
    fc.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.2f},atrim=0:{total:.2f}[voice]')
    if music:
        fc.append('[voice]asplit=2[vk][vm]')
        fc.append('[mus][vk]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=500:makeup=1[duck]')
        fc.append('[duck][vm]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]')
    else:
        fc.append('[voice]loudnorm=I=-16:TP=-1.5[a]')
elif music:
    fc.append('[mus]anull[a]')
if fc:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', f'{total:.2f}', '-movflags', '+faststart', outp], check=True)
    os.remove(vid)
else:
    os.replace(vid, outp)
print('duration', round(total, 1), 'speed spans', [(round(a, 1), round(b, 1)) for a, b in spans], 'voice lines', len(labels))
