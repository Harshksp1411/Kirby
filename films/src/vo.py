import json, sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
T = '/tmp/claude-0/-home-claude/30985d71-a09e-5aab-b79c-a0bce0db7c3e/scratchpad/tts/'
k = Kokoro(T + 'kokoro.onnx', T + 'voices.bin')
lines = json.load(open(sys.argv[1])); out = sys.argv[2]; voice = sys.argv[3] if len(sys.argv) > 3 else 'af_heart'
dur = {}
for key, text in lines.items():
    s, sr = k.create(text, voice=voice, speed=0.98, lang='en-us')
    s = np.concatenate([np.zeros(int(0.05 * sr)), s, np.zeros(int(0.15 * sr))])
    sf.write(f'{out}/{key}.wav', s, sr); dur[key] = round(len(s) / sr, 2)
json.dump(dur, open(f'{out}/durations.json', 'w'), indent=1); print(dur)
