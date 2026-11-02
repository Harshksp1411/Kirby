# usage: python3 k/finish.py name seed  -> name.mp4 + name_sheet.jpg (frames 4 s after each voice mark, plus scene ends)
import json, sys, subprocess, os
n = sys.argv[1]; seed = sys.argv[2] if len(sys.argv) > 2 else '3'
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
J = json.load(open(f'frames_{n}/frames.json')); end = J['end']
subprocess.run(['python3', 'music.py', f'bed_{n}.wav', str(int(end) + 8), seed], check=True, capture_output=True)
subprocess.run(['python3', 'assemble.py', f'frames_{n}', f'{n}.mp4', f'bed_{n}.wav', f'vo_{n}'], check=True)
vo = json.load(open(f'vo_{n}/durations.json'))
marks = [m for m in J['marks'] if m['k'] == 'vo']
ts = []
for m in marks:
    d = vo.get(m['v'], 4); ts += [m['t'] + 1.5, m['t'] + d * 0.8]
ts = [t for t in ts if t < end - 0.5][:24]
fs = []
for i, t in enumerate(ts):
    f = f'/tmp/sh_{n}_{i:02d}.jpg'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', f'{n}.mp4', '-frames:v', '1', '-vf', 'scale=480:-1', f], check=True); fs.append(f)
while len(fs) % 4: fs.append(fs[-1])
rows = len(fs) // 4
args = sum([['-i', f] for f in fs], [])
lay = '|'.join(f'{(i%4)*480}_{(i//4)*270}' for i in range(len(fs)))
subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', f'xstack=inputs={len(fs)}:layout={lay}', f'{n}_sheet.jpg'], check=True)
print('done', n, round(end, 1), 's', len(fs), 'frames in sheet')
