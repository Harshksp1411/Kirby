function HO(e11, t) {
  const g = (id) => e11.find((f) => f.id === id), s = (f, V, A, E, I) => {
    f.status = V, f.issue = { kind: A, text: E || _r[A].label, incident: I || null };
  };
  const kw = ["0611", "0415"].map(g);
  kw.forEach((f) => { f.seg = "KEM-SEG-KWT-01"; });
  const mpls = ["0577", "0614", "0658", "0745", "0788", "0826", "0869"].map(g);
  mpls.forEach((f) => { f.seg = "AIR-SEG-MPLS-IN"; });
  const south = ["0703", "0826", "0869", "0912"].map(g);
  south.forEach((f, V) => {
    f.seg = "AIR-SEG-MPLS-SOUTH", V < 1 ? s(f, "down", "carrier-down", "Airtel MPLS fibre fault; no 4G backup on site", "INC0048201") : (s(f, "degraded", "onlte", "Airtel MPLS fibre fault; running on 4G backup", "INC0048201"), f.path = "lte");
  });
  const guj = ["0117", "0342"].map(g);
  guj.forEach((f) => s(f, "down", "power", "Utility grid outage (Gujarat industrial estate)", "INC0048204"));
  const edge = ["0752", "0526"].map(g);
  edge.forEach((f, V) => s(f, "down", "edge-hw", V === 0 ? "VeloCloud Edge 510 not booting" : "VeloCloud Edge 620-N power module fault", V === 0 ? "INC0048206" : "INC0048207"));
  const esx = [g("1032")];
  esx.forEach((f) => s(f, "down", "esxi", "Plant ESXi host hung; local file and print VM offline", "INC0048209"));
  kw.forEach((f) => s(f, "degraded", "jitter", "KEMS MPLS L01 at 92% of 60 Mbps; jitter on SAP sessions", "INC0048211"));
  const vmd = [g("0301")];
  vmd.forEach((f) => s(f, "degraded", "vmdisk", "VM disk at 93% (vm-" + f.id + "-app)", "INC0048212"));
  s(g("0533"), "degraded", "switch", "Meraki MS120 port flapping (uplink to edge)");
  s(g("0389"), "degraded", "psu", "Plant server PSU redundancy lost");
  s(g("0468"), "degraded", "ws", "Workstation experience low after Teams update");
  g("0904").status = "maintenance";
  g("0904").issue = { kind: "maint", text: "Scheduled maintenance (OpsRamp maintenance window) \xB7 CHG0031878" }, g("0904").maintUntil = Qw + 55 * 6e4;
  const N = [["VM disk cleanup", "RB-012", "vcenter"], ["4G backup modem reset and re-test", "RB-021", "velo"], ["Print spooler restart", "RB-014", "nanoheal"], ["Workstation performance fix", "RB-015", "nanoheal"], ["Site VM restart outside hours", "RB-007", "vcenter"], ["NetWorker save set re-run", "RB-011", "qnap"], ["Switch port bounce (approved standard change)", "RB-006", "switches"]];
  e11.filter((f) => f.status === "healthy" && f.wave0630).forEach((f, V) => {
    const A = N[V % N.length];
    f.fixedOvernight = { t: C0 + (22 + V * 37) * 6e4, text: A[0], rb: A[1], tool: A[2] };
  });
  g("0248").fixedOvernight = { t: C0 + 220 * 6e4, text: "Jio case JQ-55088 resolved, path back to primary", rb: "RB-004", tool: "zayo" };
  ["0301", "0342"].forEach((id) => { g(id).openingWave = "Wave 13"; });
  e11.forEach((f) => {
    delete f.reserved, f.health = Hk(f);
  });
  const ids = (a) => a.filter(Boolean).map((f) => f.id);
  return { heroSeg: ids(kw), s1: ids(mpls), s7: ids(e11.filter((f) => !f.named)), s8: ids(e11.filter((f) => f.tz === "PT")), atl: ids(south), tampa: ids(guj), edge: ids(edge), esx: ids(esx), austin: ids(kw), vmd: ids(vmd) };
}