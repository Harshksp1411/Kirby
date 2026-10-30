# Demo films

Short product films in the Movate style: a hook, sourced stats, the tools involved, numbered steps over live footage of the Intelligent Operations Hub, outcomes, end card. Voiceover throughout.

- `NOC_Carrier_Outage_Mova_iO.mp4`: NOC film 1, current cut. Designed screens (no hub footage), Mova iO agents by name, integration map, human in the loop, voiceover. Generic for any client. Built from `studio.html` + `noc1m.js` + `vo_noc1m.json`.
- `NOC_Carrier_Outage_Response.mp4`: earlier generic cut recorded from the hub. generic, for any client. A carrier degradation across five offices handled end to end. Runs on the brand-free hub build (no client name; Movate logo in the header).
- `Kirby_NOC_Network_Agent.mp4`: the earlier Kirby-branded cut, no voiceover.

## Rebuild

From `films/src`, with `npm i @fontsource/manrope`, `pip install kokoro-onnx soundfile`, and the Kokoro model files (`kokoro-v1.0.onnx`, `voices-v1.0.bin` from the kokoro-onnx GitHub release):

    # brand-free hub
    (cd ../../build && MOVATE_FULL=../films/src/movate_full.png MOVATE_MARK=../films/src/movate_mark.png node generic.js app.k1.js app.gen.js && python3 build.py app.gen.js ../films/src/hub_generic.html)
    python3 vo.py vo_noc1m.json vo_noc1m af_heart      # voice lines
    python3 music.py bed.wav 230 3 40                # music bed (original, generated)
    node rec.js noc1m.js frames                      # designed cut (studio.html); noc1g.js records the hub instead
    python3 assemble.py frames out.mp4 bed.wav vo_noc1m

Stats: ITIC 2024 Hourly Cost of Downtime Survey; Uptime Institute Annual Outage Analysis 2025. Voice: Kokoro (af_heart).

Mova iO agent names and the outcome figures (up to 40% lower MTTR, 80%+ triage accuracy) are Movate's published claims for Mova iO Operations. The integration map is an example NOC deployment; Movate does not publish a connector list.
