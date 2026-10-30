// Rewrites on-screen text in string literals and template text only. Identifiers and data keys are never touched.
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const [, , inp, outp] = process.argv;
const src = fs.readFileSync(inp, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', ranges: false });
const spans = [];
const rxs = [];
walk.full(ast, (n) => {
  if (n.type === 'Literal' && n.regex) rxs.push([n.start, n.end]);
  if (n.type === 'Literal' && typeof n.value === 'string') spans.push([n.start + 1, n.end - 1]);
  else if (n.type === 'TemplateElement') spans.push([n.start, n.end]);
});
// regex literals that read on-screen words accept the Kirby words too
const RX = [[/\\bepic\\b/g, '\\b(?:epic|sap)\\b'], [/\^epic-/g, '^(?:epic|avs)-'], [/\\bEpic\\b/g, '\\b(?:Epic|SAP)\\b'], [/(?<![(:\\])\bepic\b(?!-)/g, '(?:epic|sap)'],
  [/(?<![(:\\])\bclinics\b/g, '(?:clinics|sites)'], [/(?<![(:\\])\bclinic\b/g, '(?:clinic|site)'], [/\bcitrix\b/g, '(?:citrix|sap gui)'], [/\^\(Epic\|Citrix\|/g, '^(Epic|Citrix|SAP|'], [/\bzayo\b/g, '(?:zayo|airtel|jio|tata|kems)'], [/\bmova\b/g, '(?:mova|copilot)'],
  [/patient record/g, 'patient record|production order|drawing'], [/x-ray\|imaging\|sensor/g, 'x-ray|imaging|sensor|cad|scanner|drawing'], [/check-in\|scheduling/g, 'check-in|scheduling|gate entry|biotime|attendance'],
  [/\\bcard\\b\|payment/g, '\\bcard\\b|payment|invoice|weighbridge'], [/card\|payment\|terminal/g, 'card|payment|terminal|invoice|weighbridge'], [/\^Mova iO /g, '^(?:Mova iO|Copilot Studio) '], [/to\\s\+lte/g, 'to\\s+(?:lte|backup)'], [/\(clinic\|office\)/g, '(clinic|site|office)']];
spans.sort((a, b) => a[0] - b[0]);

// rules applied to every string (brands, tools, carriers, ids)
const ALL = [
  [/PDS Health Medical/g, 'Kirby'], [/PDS Health Technologies/g, 'Kirby'], [/PDS Health/g, 'Kirby'], [/Smile Generation/g, 'Kirby'], [/PDS Clinic/g, 'Kirby site'], [/PDS Ops/g, 'Kirby Ops'], [/\bPDS\b/g, 'Kirby'], [/\bpds-/g, 'kirby-'],
  [/Mova iO DEX/g, 'Endpoint Analytics'], [/Mova iO/g, 'Copilot Studio'], [/\bmova iO\b/g, 'Copilot Studio'], [/Mova(?=[A-Z])/g, 'Kirby'], [/\bmova\./g, 'kirby.'], [/\bMova\b/g, 'Copilot'], [/\bMIO-/g, 'KX-'],
  [/LogicMonitor/g, 'OpsRamp'], [/\bLM SDT\b/g, 'OpsRamp maintenance window'], [/\(Grafana\)/g, '(OpsRamp)'], [/Grafana/g, 'OpsRamp dashboards'],
  [/PolyAI/g, 'Voice agent'], [/CyberArk/g, 'Key Vault'], [/\bCA-SESSION/g, 'KV-SESSION'],
  [/Zayo QoS portal/g, 'carrier portal'], [/Zayo QoS/g, 'Carrier portal'], [/Zayo/g, 'Airtel'], [/\bZAY-/g, 'AIR-'], [/\bZQ-/g, 'AQ-'], [/Carrier B/g, 'Tata Tele'], [/Carrier C/g, 'Jio'], [/\bCB-SEG/g, 'TAT-SEG'], [/\bCB-CKT/g, 'TAT-CKT'], [/\bCB-2/g, 'TQ-2'],
  [/QNAP/g, 'NetWorker'], [/Juniper \/ Aruba/g, 'Cisco / Huawei / Meraki'], [/Juniper/g, 'Cisco'], [/Aruba/g, 'Huawei'], [/Prisma Access/g, 'GlobalProtect'], [/Prisma/g, 'GlobalProtect'],
  [/Imprivata OneSign/g, 'Windows Hello'], [/Imprivata/g, 'Windows Hello'], [/Citrix Workspace app/g, 'SAP GUI'], [/Citrix Workspace/g, 'SAP GUI'], [/Citrix Virtual Apps/g, 'SAP GUI and Portal'], [/Citrix Director/g, 'SAP Solution Manager'], [/Citrix/g, 'SAP GUI'], [/HDX/g, 'SAP GUI'],
  [/Epic Verona/g, 'AVS primary'], [/Epic Rochester/g, 'AVS DR'], [/\bVerona\b/g, 'AVS primary'], [/\bRochester\b/g, 'AVS DR'], [/Epic Experience/g, 'SAP Experience'], [/Epic ODBA/g, 'SAP Basis'], [/Hyperspace/g, 'SAP GUI'], [/Chronicles/g, 'Oracle 19c'], [/System Pulse/g, 'SAP Solution Manager'], [/Epic Wisdom/g, 'SAP Portal'], [/\bWisdom\b/g, 'SAP Portal'], [/SmartPhrases/g, 'SAP transactions'], [/Epic's/g, "SAP's"], [/\bEpic\b/g, 'SAP ERP'],
  [/Clinic-in-a-Box/g, 'Site Cutover'], [/^Clinicians$/g, 'Engineers'], [/^Imaging$/g, 'Engineering CAD'], [/^Appointments$/g, 'Orders'], [/^Appointment$/g, 'Order'], [/\bprisma-tun-/g, 'gp-tun-'], [/^Patient care$/g, 'Business operations'], [/^Acquired$/g, 'Separated'], [/^Clinician$/g, 'Engineer'], [/^Clinics$/g, 'Sites'], [/^Clinic$/g, 'Site'], [/^Patients$/g, 'Customers'], [/^Dentist$/g, 'Engineer'], [/^Hygienist$/g, 'Planner'], [/us-west-2/g, 'ap-south-1'], [/us-east-1/g, 'ap-southeast-1'], [/\busw2\b/g, 'aps1'], [/\buse1\b/g, 'apse1'], [/Pacific and Arizona/g, 'India and UAE'], [/^US Map$/g, 'Region map'], [/Scheduling and check-in/g, 'BioTime attendance'], [/Check-in p95/g, 'Punch-in p95'], [/Check-in under 2 seconds/g, 'SAP logon under 2 seconds'], [/Card payments/g, 'E-Invoice'], [/Card terminals/g, 'E-Invoice gateway'], [/Card terminal/g, 'Weighbridge PC'], [/card terminal/g, 'weighbridge PC'], [/card machines/g, 'weighbridge PCs'], [/card machine/g, 'weighbridge PC'], [/^Payments$/g, 'E-Invoice'], [/^Phones$/g, 'Voice'], [/drawings and CAD/g, 'Engineering CAD'], [/\bdc2-/g, 'hyd-'], [/\bdc1-/g, 'kwt-'], [/X-ray sensor bridge/g, 'barcode scanner'], [/sensor bridge/g, 'scanner bridge'],
  [/Dentrix|Eaglesoft|Open Dental/g, 'parent systems'], [/Workday/g, 'HR system'], [/Nanoheal/g, 'Endpoint Analytics'], [/CrowdStrike/g, 'Defender'], [/Megaport/g, 'site-to-site VPN'], [/Oregon/g, 'Mumbai'], [/US-West/g, 'ap-south-1'], [/US-East/g, 'ap-southeast-1']
];
// rules applied only to prose (text with a space)
const PROSE = [
  [/Clinic-in-a-Box/g, 'Site Cutover'], [/Clinic Opening Readiness/g, 'Shift Readiness'], [/Clinic Readiness/g, 'Shift Readiness'], [/clinic opening readiness/g, 'shift readiness'], [/opening readiness/g, 'shift readiness'], [/Opening readiness/g, 'Shift readiness'],
  [/Front Desk Coordinator/g, 'Shift Coordinator'], [/front-desk coordinator/g, 'shift coordinator'], [/Office Manager/g, 'Site IT Coordinator'], [/office managers/g, 'site IT coordinators'], [/office manager/g, 'site IT coordinator'], [/Dental Assistant/g, 'Production Assistant'], [/Billing Specialist/g, 'Finance Executive'],
  [/[Dd]entists/g, (m) => m[0] === 'D' ? 'Engineers' : 'engineers'], [/[Dd]entist/g, (m) => m[0] === 'D' ? 'Engineer' : 'engineer'], [/[Hh]ygienists/g, (m) => m[0] === 'H' ? 'Planners' : 'planners'], [/[Hh]ygienist/g, (m) => m[0] === 'H' ? 'Planner' : 'planner'], [/[Dd]ental/g, (m) => m[0] === 'D' ? 'Production' : 'production'],
  [/clinicians and staff/g, 'people'], [/[Cc]linicians/g, (m) => m[0] === 'C' ? 'Engineers' : 'engineers'], [/[Cc]linician/g, (m) => m[0] === 'C' ? 'Engineer' : 'engineer'],
  [/Clinics/g, 'Sites'], [/clinics/g, 'sites'], [/Clinic/g, 'Site'], [/clinic/g, 'site'],
  [/patient guidance/g, 'user guidance'], [/Patient guidance/g, 'User guidance'], [/[Pp]atients/g, (m) => m[0] === 'P' ? 'Customers' : 'customers'], [/[Pp]atient/g, (m) => m[0] === 'P' ? 'Customer' : 'customer'],
  [/[Aa]ppointments/g, (m) => m[0] === 'A' ? 'Orders' : 'orders'], [/[Aa]ppointment/g, (m) => m[0] === 'A' ? 'Order' : 'order'],
  [/[Oo]peratories/g, (m) => m[0] === 'O' ? 'Shop-floor bays' : 'shop-floor bays'], [/[Oo]peratory/g, (m) => m[0] === 'O' ? 'Shop-floor bay' : 'shop-floor bay'],
  [/X-ray sensors/g, 'barcode scanners'], [/X-ray sensor/g, 'barcode scanner'], [/X-rays/g, 'drawings'], [/X-ray/g, 'drawing'], [/x-ray/g, 'drawing'], [/CBCT/g, 'plotter'], [/[Pp]anoramic/g, 'plotter'], [/Imaging station/g, 'CAD workstation'], [/imaging station/g, 'CAD workstation'], [/Imaging/g, 'CAD'], [/imaging/g, 'CAD'], [/DICOM/g, 'drawing'], [/PACS/g, 'file server'],
  [/front desks/g, 'shift offices'], [/front desk/g, 'shift office'], [/Front desks/g, 'Shift offices'], [/Front desk/g, 'Shift office'], [/front-desk/g, 'shift-office'], [/check-in screen/g, 'shift entry screen'], [/treatment plans/g, 'work orders'], [/treatment plan/g, 'work order'],
  [/Practice Management/g, 'SmartBOM'], [/practice-management/g, 'SmartBOM'], [/practice management/g, 'SmartBOM'], [/practice software/g, 'local software'],
  [/de novo/g, 'full cutover'], [/Patient care/g, 'Business operations'], [/[Aa]cquired sites/g, (m) => m[0] === 'A' ? 'Separated sites' : 'separated sites'], [/, (\d+) acquired/g, ', $1 separated'], [/Full cutover and acquired/g, 'Full cutover and separated'], [/^Acquired \xB7/g, 'Separated \xB7'], [/De Novo/g, 'Full cutover'], [/DSOs/g, 'groups'], [/\bDSO\b/g, 'group'],
  [/\bDC2\b/g, 'Hub'], [/\bDC1\b/g, 'Kuwait DC'], [/EPIC-VER/g, 'AVS-PRI'], [/EPIC-ROC/g, 'AVS-DR'], [/ Pacific\b/g, ' IST'], [/ PT\b/g, ' IST'], [/\bPT\)/g, 'IST)'], [/Southwest/g, 'Middle East'], [/Atlanta/g, 'Chennai']
];
const esc = (x) => x.replace(/[^\x00-\x7f]/g, (c) => { const n = c.charCodeAt(0); return n < 256 ? '\\x' + n.toString(16).toUpperCase().padStart(2, '0') : '\\u' + n.toString(16).toUpperCase().padStart(4, '0'); });
const STORY = require('./k_story.js').map(([a, r]) => [typeof a === 'string' ? esc(a) : a, esc(r)]); const hits = new Array(STORY.length).fill(0);
let out = '', last = 0, changed = 0;
for (const [a, b] of spans) {
  if (a < last) continue;
  let t = src.slice(a, b);
  if (t.length > 200000) { continue; }
  const o = t;
  const masks = []; t = t.replace(/\{[A-Za-z_]+\}|\$\{[^}]*\}/g, (m) => { masks.push(m); return '\u0000' + (masks.length - 1) + '\u0000'; });
  for (const [re, r] of ALL) t = t.replace(re, r);
  if (/\s/.test(t) && !/^data:/.test(t)) for (const [re, r] of PROSE) t = t.replace(re, r);
  t = t.replace(/\u0000(\d+)\u0000/g, (m, k) => masks[+k]);
  const prose = /\s/.test(t);
  if (!/^data:|dataKey|width\(%s\)/.test(t)) STORY.forEach(([a, r], k) => { if (!prose && (typeof a !== 'string' || !/[-_.]/.test(a))) return; const n = typeof a === 'string' ? t.split(a).join(r) : t.replace(a, r); if (n !== t) { hits[k]++; t = n; } });
  if (t !== o) changed++;
  out += src.slice(last, a) + t; last = b;
}
out += src.slice(last);
{ let o2 = '', l2 = 0, nrx = 0; const rs = rxs.sort((a, b) => a[0] - b[0]); const s2 = out; const ast2 = acorn.parse(s2, { ecmaVersion: 'latest', sourceType: 'module' }); const r2 = []; walk.full(ast2, (n) => { if (n.type === 'Literal' && n.regex) r2.push([n.start, n.end]); }); r2.sort((a, b) => a[0] - b[0]);
  for (const [a, b] of r2) { let t = s2.slice(a, b); if (/\\\{clinic/.test(t)) continue; const o = t; for (const [re, r] of RX) t = t.replace(re, r); if (t !== o) nrx++; o2 += s2.slice(l2, a) + t; l2 = b; }
  o2 += s2.slice(l2); out = o2; console.log('regexes widened', nrx); }
fs.writeFileSync(outp, out);
console.log('strings changed', changed, 'of', spans.length);
STORY.forEach(([a], k) => { if (!hits[k]) console.log('story rule unused:', String(a).slice(0, 80)); });
