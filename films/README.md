# Demo films

Short product films in the Movate style: a hook, sourced stats, the tools involved, numbered steps over live footage of the Intelligent Operations Hub, outcomes, end card. Voiceover throughout.

## Current set (real-workflow cuts)

Each film runs a real workflow through faithful recreations of the tool screens (sample data, no vendor logos, "Demo environment" label), with Mova iO agents doing the work, a person approving where it matters, voiceover and music. Generic for any client.

**NOC**
- `NOC_Carrier_Outage_Real_Workflow.mp4` (2:32): carrier degradation across five offices. OpsRamp → ServiceNow → Teams approval → Copilot Studio → SD-WAN orchestrator → carrier portal.
- `NOC_2_Hung_Server_Recovery.mp4` (2:40): plant MES server hangs. OpsRamp inference → vCenter diagnosis → ServiceNow → Teams approval → snapshot and reset in vCenter → problem record.
- `NOC_3_Disk_Capacity_Forecast.mp4` (2:21): file server disk forecast to fill in five days. OpsRamp forecast → growth analysis → pre-approved standard change → online disk extend in vCenter.
- `NOC_4_Failed_Backup_Fix.mp4` (1:57): Veeam job fails on a VSS writer. Root cause → reset → retry → SureBackup-verified restore point → morning summary.
- `NOC_5_Site_Power_Cut.mp4` (2:21): utility power lost. UPS runtime → utility outage notice → load shedding in vCenter with approval → generator → Field Service dispatch.

**SOC**
- `SOC_1_Phishing_Contained.mp4`: reported email → Defender campaign → attack story → Teams approval → purge, block, account reset → reporter thanked.
- `SOC_2_Stolen_Session.mp4`: Entra ID Protection impossible travel + hidden inbox rule → user confirms in Teams → sessions revoked, rule removed.
- `SOC_3_Ransomware_Endpoint.mp4`: Defender for Endpoint ransomware behaviour → isolated in 24 s → spread hunt → Veeam file restore → rebuild.
- `SOC_4_Admin_Role_Reversed.mp4`: Sentinel rule on a role granted outside PIM → checked against change, contract, calendar, sign-in → reversed with on-call approval.
- `SOC_5_Exploited_CVE_Patched.mp4`: exploited browser CVE → ServiceNow Vulnerability Response → expedited change → Intune ring rollout → exposure 1,412 → 31.
- `SOC_6_Data_Theft_DLP.mp4`: data theft caught by DLP (from the first run of this set).

**ServiceNow**
- `ServiceNow_1_Auto_Ticket_Creation.mp4`: tickets created from Teams chat, email and voice, complete and de-duplicated.
- `ServiceNow_2_Auto_Triage.mp4`: category, CI, priority, duplicates and parent incident set, with reasons.
- `ServiceNow_3_Auto_Routing.mp4`: the right group and the right on-shift person, with confidence.
- `ServiceNow_4_Ticket_Summary.mp4`: a 46-note incident summarized, callers updated, resolution notes, KB draft and shift handover.

Sources for the NOC 2-5, SOC 1-5 and ServiceNow 4 films are in `src/kit/`; ServiceNow 1-3 and SOC 6 were built from `src/` (sn1-3.js, the first-run kit) (`kit.html` screens kit, `lib.js`, one script and voice file per film; `recall.sh name:seed` records and assembles).

Stats used: Uptime Institute Annual Outage Analysis 2026; Veeam 2024 Ransomware Trends Report; Verizon 2025 DBIR; IBM Cost of a Data Breach Report 2025.

## Earlier cuts

- `NOC_Carrier_Outage_Real_Workflow.mp4`: NOC film 1, current cut (2:32). The outage worked live through faithful recreations of the real tool screens: OpsRamp alerts and inference, ServiceNow incident with Mova iO work notes, Teams approval card, Copilot Studio activity map, SD-WAN orchestrator path switch, carrier portal ticket, then resolution. Voiceover and music. Sample data, no vendor logos. Built from `src/apps.html` + `src/noc1r.js` + `src/vo_noc1r.json`.
- `NOC_Carrier_Outage_Mova_iO.mp4`: NOC film 1, designed-screens cut. Designed screens (no hub footage), Mova iO agents by name, integration map, human in the loop, voiceover. Generic for any client. Built from `studio.html` + `noc1m.js` + `vo_noc1m.json`.
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
