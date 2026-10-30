import json, sys, subprocess, os
d = sys.argv[1]; outp = sys.argv[2]; music = sys.argv[3] if len(sys.argv) > 3 else None
J = json.load(open(os.path.join(d, 'frames.json')))
fr, marks, end = J['frames'], J['marks'], J['end']
spans = []; s0 = None
for m in marks:
    if m['k'] == 'speed':
        if m['v']: s0 = m['t']
        elif s0 is not None: spans.append((s0, m['t'])); s0 = None
def factor(t): return 0.5 if any(a <= t < b for a, b in spans) else 1.0
lines = []; total = 0
for i, (name, t) in enumerate(fr):
    t2 = fr[i + 1][1] if i + 1 < len(fr) else end
    dur = max(0.0, t2 - t) * factor(t)
    lines.append(f"file '{name}'\nduration {dur:.4f}"); total += dur
lines.append(f"file '{fr[-1][0]}'")
open(os.path.join(d, 'list.txt'), 'w').write('\n'.join(lines) + '\n')
vid = outp if not music else outp.replace('.mp4', '.v.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(d, 'list.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-movflags', '+faststart', vid], check=True)
if music:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', music, '-filter_complex', f'[1:a]atrim=0:{total:.2f},afade=t=in:d=1.5,afade=t=out:st={max(0,total-3):.2f}:d=3,volume=0.9[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outp], check=True)
    os.remove(vid)
print('duration', round(total, 1), 'speed spans', spans)
