// NOC film 2: a plant application server hangs; Mova iO diagnoses through vCenter and resets it after a Teams approval.
const SEV = (s) => `<span class="sev"><i style="background:${{ Critical: "#D32F2F", Warning: "#F59E0B", Ok: "#2E7D32" }[s]}"></i>${s}</span>`;
const VM = "har-plant-vm-app";
const ops = {
  th: "opsramp", topOn: "Command Center", crumb: "Command Center › Alerts", title: "Alerts", tenant: "Client: Global Operations",
  pills: [["Critical 0", "#C62828"], ["Warning 0", "#B26A00"], ["Inferences 0", "#5A6577"]], right: `<span class="pbtn">Last 1 hour</span><span class="pbtn">Columns</span>`, cols: "1fr",
  blocks: [{ t: "table", id: "al", cols: ["Severity", "Subject", "Resource", "Metric", "Source", "Created", "Status"], rows: [
    [SEV("Ok"), "Disk usage back below threshold", "hyd-city-fs-02", "disk.used.pct", "Agent", "07:52:10", "Resolved"],
    [SEV("Warning"), "CPU above 85% for 10 min", "jed-office-esx-01", "cpu.util", "vCenter", "07:37:44", "Acknowledged"],
    [SEV("Ok"), "Backup job completed after retry", "rak-plant-nas-01", "backup.status", "Veeam", "07:20:03", "Resolved"],
    [SEV("Ok"), "Certificate renewed", "vpn-gw-hub-02", "cert.days", "Agent", "06:58:12", "Resolved"],
    [SEV("Ok"), "Ping restored", "vnf-factory-edge-01", "ping.loss", "SD-WAN", "06:44:51", "Resolved"],
    [SEV("Warning"), "Print queue above 20 jobs", "hal-plant-prn-02", "print.queue", "Agent", "06:31:20", "Auto-resolved"],
    [SEV("Ok"), "Service restarted by policy", "shu-plant-vm-mes", "svc.status", "Agent", "06:12:09", "Resolved"]] }]
};
const vc = (state) => ({
  th: "vsphere", topnav: ["Menu"], search: "Search in all environments", tenant: "administrator@VSPHERE.LOCAL",
  nav: ["vcsa-01.corp.local", ">HAR-Plant-DC", ">>har-cluster-01", ">>>har-esx-01.corp.local", ">>>>har-plant-vm-app", ">>>>har-plant-vm-db", ">>>>har-plant-dc01", ">>>har-esx-02.corp.local", ">HAL-Plant-DC", ">VAD-Office-DC"], navOn: VM,
  title: VM, sub: "Virtual machine · har-esx-01.corp.local · har-cluster-01", pills: [["Powered On", "#1A7F37"]],
  actions: [["Power Off", "off"], ["Shut Down Guest OS", "shut"], ["Restart Guest OS", "restart"], ["Reset", "reset"], ["Take Snapshot", "snap"], ["Launch Web Console", "console"], ["Migrate", "mig"]],
  tabs: ["Summary", "Monitor", "Configure", "Permissions", "Datastores", "Networks", "Snapshots"], tabOn: "Summary", cols: "1fr 1fr 1.25fr",
  blocks: [
    { t: "kv", id: "gos", title: "Guest OS", kw: 140, rows: [["Guest OS", "Microsoft Windows Server 2019"], ["VMware Tools", `<b style="color:#C62828">Not running · heartbeat lost</b>`], ["DNS name", "har-plant-vm-app.corp.local"], ["IP addresses", "10.41.12.25"], ["Services", "File shares, print server, MES client"], ["Uptime", "41 days"]] },
    { t: "kv", id: "hst", title: "Host, storage and network", kw: 120, rows: [["Host", `har-esx-01 · <b style="color:#1A7F37">Connected</b>`], ["Host CPU", "41%"], ["Host memory", "58%"], ["Datastore", "har-ds-01 · 62% free"], ["Network", "VM Network · connected"], ["Alarms", `<b style="color:#C62828">Virtual machine CPU usage</b>`]] },
    { t: "chart", id: "cpu", title: "Guest CPU usage · last 60 minutes", ch: 200, data: [22, 25, 21, 24, 28, 26, 23, 27, 31, 35, 48, 72, 96, 100, 100, 100, 100, 100, 100, 100], max: 100, room: 3, unit: "%", col: "#0079B8", xl: [[0, "07:00"], [10, "07:30"], [19, "08:00"], [22, "now"]] },
    { t: "table", id: "tasks", title: "Recent Tasks", w: 3, cols: ["Task Name", "Target", "Status", "Details", "Initiator", "Queued For", "Start Time", "Completion Time", "Server"], rows: [["Reconfigure virtual machine", "har-plant-vm-db", `<span style="color:#1A7F37">✓ Completed</span>`, "", "VSPHERE.LOCAL\\svc-backup", "4 ms", "06:02:11", "06:02:13", "vcsa-01.corp.local"]] }]
});
module.exports = {
  page: "kit.html", vo: "vo_noc2",
  async setup({ D, wait }) { await D("demo", false); await wait(0.4); },
  async run(ctx) {
    const { D, wait } = ctx, { scene, app, click, opening, closing } = require("./lib.js")(ctx);
    await opening({ hook: ["A plant server stops answering.", "Print jobs pile up.", "The line waits."], stat: [23, "", "%", "of impactful outages in 2024 were caused by IT and networking issues", "Source: Uptime Institute, Annual Outage Analysis 2025"], intro: ["How <span class=\"y\">Mova iO</span> brings a frozen server back,", "before the plant floor notices."], tools: ["OpsRamp", "ServiceNow", "vCenter", "Microsoft Teams", "Key Vault"] });

    // 1 alerts
    await scene("s1", 11, async () => {
      await D("step", 1, "The server goes quiet", ["OpsRamp"]);
      await app("page", ops);
      const A = [["Critical", "Ping loss 100%", VM, "ping.loss", "Agent"], ["Critical", "VMware Tools heartbeat lost", VM, "vm.tools.heartbeat", "vCenter"], ["Critical", "File share \\\\har-fs unreachable", VM, "smb.check", "Synthetic"], ["Warning", "VM CPU usage 100% for 15 min", VM, "vm.cpu.usage", "vCenter"], ["Critical", "Print spooler not responding", VM, "svc.spooler", "Agent"], ["Warning", "MES client sessions dropped", "har-plant-mes-gw", "app.sessions", "Synthetic"]];
      let c = 0, w = 0;
      for (let i = 0; i < A.length; i++) { const [s, sub, r, m, src] = A[i]; await D("row", "al", [SEV(s), sub, r, m, src, `07:5${8 + Math.floor(i / 3)}:${String(10 + i * 7).padStart(2, "0")}`, "Open"], true, "alr"); s === "Critical" ? c++ : w++; await D("pill", 0, "Critical " + c, "#C62828"); await D("pill", 1, "Warning " + w, "#B26A00"); await wait(0.75); }
      await wait(0.4); await D("focus", "#blk-al", { maxK: 1.5, fill: 0.92, pad: 0 });
    });
    // 2 one inference, one incident
    await scene("s2", 8.4, async () => {
      await D("step", 2, "Eight signals, one incident", ["OpsRamp", "Mova iO", "ServiceNow"]);
      await D("row", "al", [`<b>▾</b> ${SEV("Critical")}`, `<b>Inference #48377 · Guest OS hang on ${VM}</b> <span class="pl" style="background:#EEF2F5;color:#5A6577;margin-left:6px">6 alerts · 2 calls</span>`, VM, "correlation", "OpsQ · Mova iO", "07:59:31", `<b style="color:#2E7D32">Ticketed</b>`], true, "inf");
      await D("pill", 2, "Inferences 1", "#5A6577");
      await D("focus", "#al tr.inf", { maxK: 1.8, pad: 6 });
      await wait(3);
      await D("fly", "Inference #48377", `<div class="kv" style="--kw:130px;display:grid;grid-template-columns:130px 1fr;gap:9px 12px"><span style="color:#68707a">Root cause alert</span><span><b style="color:#B26A00">⚑ RCA</b> VMware Tools heartbeat lost</span><span style="color:#68707a">Grouped</span><span>6 alerts on 2 resources · 2 calls from Haridwar Plant</span><span style="color:#68707a">Site</span><span>HAR Haridwar Plant · shift A running</span><span style="color:#68707a">Incident</span><span><b style="color:#0B63C4">INC0031452</b> · ServiceNow · P2 · Infra / Compute</span></div>`, "Open incident", "Close");
      await wait(0.6); await D("focus", "#fly", { maxK: 1.6, fill: 0.8, pad: 0 });
    });
    // 3 diagnosis across layers in vCenter, written to ServiceNow
    await scene("s3", 13.4, async () => {
      await D("step", 3, "Every layer checked, one cause", ["vCenter", "Mova iO"]);
      await app("page", vc());
      await D("focus", "#blk-gos", { maxK: 1.7, pad: 4 }); await wait(3.2);
      await D("focus", "#blk-hst", { maxK: 1.7, pad: 4 }); await wait(3.6);
      await D("focus", "#blk-cpu", { maxK: 1.6, pad: 4 });
    });
    await scene(null, 6.5, async () => {
      await app("sn", { num: "INC0031452", title: `Guest OS hang on ${VM} (Haridwar Plant)`, prio: "2 - High", state: "In Progress", assigned: "Mova iO NOC Agent", sla: "3h 52m left",
        fields: [["Caller", "Mova iO Integration"], ["Channel", "Monitoring"], ["Category", "Compute"], ["Subcategory", "Virtual machine"], ["Service", "Plant file and print"], ["Configuration item", VM], ["Impact", "2 - Medium"], ["Urgency", "1 - High"], ["Assignment group", "Infra / Compute"], ["Assigned to", "Mova iO NOC Agent"]],
        short: `Guest OS hang on ${VM}: file, print and MES client down at Haridwar Plant` });
      await D("snNote", "Mova iO Triage orchestrator", "#E15AA5", `<b>Root cause: guest OS unresponsive</b> on ${VM}, 93% confidence. CPU pinned at 100% for 15 min; VMware Tools heartbeat lost.<br>Ruled out: host (har-esx-01 CPU 41%, memory 58%) · storage (har-ds-01 62% free) · network (vNIC connected, other VMs on host reachable).<br>Recommended: RB-011 Snapshot and restart VM. Production hours: approval required.`, "Work notes", 0);
      await wait(0.5); await D("focus", "#snact", { maxK: 1.75, fill: 0.86, pad: 0 });
    });
    // 4 approval in Teams
    await scene("s4", 9.6, async () => {
      await D("step", 4, "A person approves the restart", ["Microsoft Teams", "Mova iO"]);
      await app("tms", { agent: "Mova iO NOC Agent", me: "VS", items: [["Mova iO NOC Agent", "Approval needed · INC0031452", 1], ["Plant IT · Haridwar", "Line 3 printer is stuck", 0], ["Infra on-call", "Rota for November", 0]] });
      await D("tmCard", "apcard", "Approval needed · INC0031452", `${VM} at Haridwar Plant is frozen. File, print and the MES client are down for shift A. I recommend a snapshot, then a restart.`, [["Server", `${VM} · Windows Server 2019`], ["Root cause", "Guest OS hang · 93% confidence"], ["Runbook", "RB-011 · Snapshot and restart VM"], ["Credential", "Key Vault · vcenter-noc-svc"], ["Downtime", "About 3 minutes · rollback: snapshot"]], { buttons: ["Approve restart", "Reject", "Open incident"] });
      await wait(0.6); await D("focus", "#apcard", { maxK: 1.75, pad: 10 }); await wait(3.2);
      await click("#apok", 0); await D("tmApproveG", "Vikram Shah (Plant IT lead)", "Running RB-011…"); await wait(1);
    });
    // 5 snapshot, restart, reset in vCenter
    await scene("s5", 12, async () => {
      await D("step", 5, "Snapshot, restart, reset", ["vCenter", "Key Vault"]);
      await app("page", vc());
      await D("focus", "#blk-tasks", { maxK: 1.6, fill: 0.95, pad: 10 });
      await D("act", "snap", "hot"); await D("row", "tasks", ["Create virtual machine snapshot", VM, `<span style="color:#0079B8">Running 40%</span>`, "pre-RB-011 INC0031452", "VSPHERE.LOCAL\\mova-io-noc", "3 ms", "08:01:12", "", "vcsa-01.corp.local"], true); await wait(1.8);
      await D("cell", "tasks", 0, 2, `<span style="color:#1A7F37">✓ Completed</span>`); await D("cell", "tasks", 0, 7, "08:01:15"); await D("act", "snap", "done");
      await D("act", "restart", "hot"); await D("row", "tasks", ["Initiate guest OS reboot", VM, `<span style="color:#C62828">✕ Failed</span>`, "VMware Tools is not running", "VSPHERE.LOCAL\\mova-io-noc", "2 ms", "08:01:17", "08:01:47", "vcsa-01.corp.local"], true); await wait(2.4); await D("act", "restart", null);
      await D("act", "reset", "hot"); await D("row", "tasks", ["Reset virtual machine", VM, `<span style="color:#1A7F37">✓ Completed</span>`, "RB-011 step 3 · approved by Vikram Shah", "VSPHERE.LOCAL\\mova-io-noc", "2 ms", "08:01:49", "08:01:50", "vcsa-01.corp.local"], true); await D("act", "reset", "done");
    });
    // 6 back up, verified
    await scene("s6", 8.4, async () => {
      await D("step", 6, "Back up and verified", ["vCenter", "OpsRamp"]);
      await D("set", "#gos-1", `<b style="color:#1A7F37">Running · heartbeat OK</b>`); await D("set", "#gos-5", "3 minutes"); await D("set", "#hst-5", `<span style="color:#1A7F37">None</span>`);
      await D("chartAfter", "cpu", [64, 31, 18]); await D("pill", 0, "Powered On · healthy", "#1A7F37");
      await D("focus", "#blk-gos", { maxK: 1.7, pad: 4 }); await wait(2.2);
      await D("focus", "#blk-cpu", { maxK: 1.6, pad: 4 }); await wait(1.6);
      const after = JSON.parse(JSON.stringify(ops)); after.pills = [["Critical 0", "#2E7D32"], ["Warning 0", "#2E7D32"], ["Inferences 1", "#5A6577"]];
      const R = ["Ping loss 0%", "VMware Tools heartbeat OK", "File share \\\\har-fs reachable", "VM CPU usage 18%", "Print spooler running", "MES client sessions restored"];
      after.blocks[0].rows = [[`<b>▾</b> ${SEV("Ok")}`, `<b>Inference #48377 · Guest OS hang on ${VM}</b>`, VM, "correlation", "OpsQ · Mova iO", "08:04:02", `<b style="color:#2E7D32">Resolved</b>`], ...R.map((x, i) => [SEV("Ok"), x, i === 5 ? "har-plant-mes-gw" : VM, "", "Agent", "08:03:" + (40 + i * 3), `<span style="color:#2E7D32">Auto-resolved</span>`]), ...ops.blocks[0].rows];
      await app("page", after);
      await D("focus", "#blk-al", { maxK: 1.5, fill: 0.92, pad: 0 });
    });
    await scene(null, 3.2);
    // 7 closed, told, problem opened
    await scene("s7", 10, async () => {
      await D("step", 7, "Closed, told, and a problem record", ["ServiceNow", "Microsoft Teams"]);
      await app("tms", { view: "channel", team: "Plant IT", channel: "Haridwar Plant", channels: ["General", "Haridwar Plant", "Halol Plant", "Shift handover"] });
      await D("tmSay", `<div class="card" id="upd"><div class="hd">File and print are back · INC0031452</div><div style="padding:14px 18px;font-size:14px;line-height:1.55"><b>What happened:</b> the plant application server froze at 07:58.<br><b>What we did:</b> restarted it at 08:01 after Vikram approved. Everything checks out.<br><b>What to do:</b> resend any print jobs from before 08:02.</div></div>`, "Mova iO NOC Agent", 6);
      await wait(0.4); await D("focus", "#upd", { maxK: 1.7, pad: 10 }); await wait(2.4);
      await app("sn", { num: "INC0031452", title: `Guest OS hang on ${VM} (Haridwar Plant)`, prio: "2 - High", state: "In Progress", assigned: "Mova iO NOC Agent", sla: "3h 47m left",
        fields: [["Caller", "Mova iO Integration"], ["Channel", "Monitoring"], ["Category", "Compute"], ["Subcategory", "Virtual machine"], ["Service", "Plant file and print"], ["Configuration item", VM], ["Impact", "2 - Medium"], ["Urgency", "1 - High"], ["Assignment group", "Infra / Compute"], ["Assigned to", "Mova iO NOC Agent"]],
        short: `Guest OS hang on ${VM}: file, print and MES client down at Haridwar Plant`,
        notes: [["Mova iO Triage orchestrator", "#E15AA5", "Root cause: guest OS unresponsive, 93% confidence.", "Work notes", 0], ["Vikram Shah", "#3E8E7E", "Approved RB-011 in Teams.", "Work notes", 2], ["Mova iO Guided resolution assistant", "#E15AA5", "Snapshot taken · guest reboot failed (Tools not running) · VM reset · Tools running · file, print, MES checks pass.", "Work notes", 5]] });
      await D("snNote", "Mova iO Problem agent", "#E15AA5", "<b>Third hang on this VM in 30 days.</b> Opened PRB0004127; pattern points to the print driver leaking memory after the 14 Oct update. Linked 3 incidents.", "Work notes", 6);
      await D("snRes", "Guest OS hang on har-plant-vm-app. Snapshot taken, VM reset under RB-011 (approved by Vikram Shah). Services verified. Problem PRB0004127 opened for repeat hangs.");
      await D("focus", "#snnotes", { maxK: 1.7, fill: 0.86, pad: 6 }); await wait(3.6);
      await D("focus", "#snresbox", { maxK: 1.8, pad: 10 });
    });
    await closing({ close: ["One incident instead of eight signals.", "A frozen server back in under five minutes.", "A problem record, so it does not happen again."], tag: ["Server outages, resolved by", "Mova iO agents."] });
  }
};
