# Demo films

Short product films in the Movate style: a hook, sourced stats, the tools involved, numbered steps over live footage of the Intelligent Operations Hub, outcomes, end card. Voiceover throughout.

- `NOC_Carrier_Outage_Response.mp4`: generic, for any client. A carrier degradation across five offices handled end to end. Runs on the brand-free hub build (no client name; Movate logo in the header).
- `Kirby_NOC_Network_Agent.mp4`: the earlier Kirby-branded cut, no voiceover.

## Rebuild

From `films/src`, with `npm i @fontsource/manrope`, `pip install kokoro-onnx soundfile`, and the Kokoro model files (`kokoro-v1.0.onnx`, `voices-v1.0.bin` from the kokoro-onnx GitHub release):

    # brand-free hub
    (cd ../../build && MOVATE_FULL=../films/src/movate_full.png MOVATE_MARK=../films/src/movate_mark.png node generic.js app.k1.js app.gen.js && python3 build.py app.gen.js ../films/src/hub_generic.html)
    python3 vo.py vo_noc1.json vo_noc1 af_heart      # voice lines
    python3 music.py bed.wav 190 3 50                # music bed (original, generated)
    node rec.js noc1g.js frames                      # record the hub
    python3 assemble.py frames out.mp4 bed.wav vo_noc1

Stats: ITIC 2024 Hourly Cost of Downtime Survey; Uptime Institute Annual Outage Analysis 2025. Voice: Kokoro (af_heart).
