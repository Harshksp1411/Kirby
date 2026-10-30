#!/usr/bin/env python3
"""Turn the PDS Intelligent Operations Hub into the Kirby Operations Hub.
Reads app.pretty.js (the reformatted PDS bundle), applies Kirby data modules and wording, writes app.k.js."""
import re, json, sys, os
D = os.path.dirname(os.path.abspath(__file__))
P = lambda f: os.path.join(D, f)
s = open(P('pds-base.js') if os.path.exists(P('pds-base.js')) else P('app.pretty.js')).read()
rd = lambda f: open(P(f)).read().strip()

def end_of_literal(t, i):
    """index just after the bracketed literal that starts at the first [ { or ( at/after i"""
    j = i
    while t[j] not in '[{(':
        j += 1
    pairs = {'[': ']', '{': '}', '(': ')'}
    stack = []; k = j; q = None; tmpl = []
    while k < len(t):
        c = t[k]
        if q:
            if c == '\\': k += 2; continue
            if q == '`' and c == '$' and t[k+1] == '{':
                stack.append('${'); k += 2; q = None; continue
            if c == q: q = None
        elif c in '"\'`':
            q = c
        elif c in '[{(':
            stack.append(c)
        elif c in ']})':
            top = stack.pop()
            if top == '${':
                q = '`'
            if not stack:
                return k + 1
        k += 1
    raise ValueError('unterminated')

def rep_exact(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        raise SystemExit(f'expected {cnt} got {n}: {a[:90]!r}')
    s = s.replace(a, b)

def rep_literal(anchor, new, keep_anchor_prefix=''):
    """replace from anchor through the end of the literal that follows it"""
    global s
    i = s.find(anchor)
    if i < 0: raise SystemExit('anchor not found: ' + anchor[:80])
    e = end_of_literal(s, i + len(anchor) - 1 if anchor.endswith(('[', '{', '(')) else i + len(anchor))
    s = s[:i] + new + s[e:]

def rep_function(name, new):
    global s
    i = s.find('function ' + name + '(')
    if i < 0: raise SystemExit('function not found ' + name)
    j = s.find('{', s.find(')', i))
    e = end_of_literal(s, j)
    s = s[:i] + new + s[e:]

# ---- time and zones
rep_exact('const Qw = Date.UTC(2026, 9, 12, 14, 40, 0), C0 = Date.UTC(2026, 9, 12, 7, 0, 0), lN = { PT: -7, AZ: -7, MT: -6, CT: -5, ET: -4 }, Tk = { PT: "PT", AZ: "MST", MT: "MT", CT: "CT", ET: "ET" };', rd('k_time.js'))

# ---- regions and sites: Dd + the state->region line, then EO/VU/IO in the long chain
i = s.find('const Dd = [["CA"'); j = s.find('const EO = [', i)
sites = rd('k_sites.js')
dd_part, rest = sites.split('const KIRBY_SITES = ', 1)
ks_part, eo_part = rest.split('const EO = ', 1)
s = s[:i] + dd_part + 'const KIRBY_SITES = ' + ks_part + '\n' + s[j:]
i = s.find('const EO = ['); j = s.find(', yO = [', i)
s = s[:i] + 'const EO = ' + eo_part.rstrip(';') + s[j:]

# ---- projection: India, Middle East and Vietnam on the 975 x 610 canvas
rep_exact('const DO = qO().scale(1300).translate([487.5, 305]), iM = (e11, t) => DO([e11, t]) || [0, 0]', 'const DO = null, iM = (e11, t) => [12 + (e11 - 30) / 82 * 951, 10 + (38 - t) / 38 * 590]')

# ---- builders and seeds
rep_function('TO', rd('k_to.js'))
rep_function('HO', rd('k_ho.js'))
rep_literal('const PO = [', rd('k_po.js').rstrip(';') + '')
rep_literal('const zO = [', rd('k_zo.js').rstrip(';'))

# ---- world initialisation: incidents, approvals, changes, problems, dispatches, carrier cases, calls, Teams, overnight
i = s.find('A = [f({ number: "INC0048201"'); e = end_of_literal(s, i + 4)
s = s[:i] + rd('k_jw_inc.js') + s[e:]
i = s.find('const E = [{ id: "APR-1041"'); j = s.find(';\n  I.forEach', i)
s = s[:i] + rd('k_jw_rest.js').rstrip(';') + s[j:]
i = s.find('const M = [{ number: "PRB0004409"'); j = s.find(', L = F.map(', i)
s = s[:i] + rd('k_jw_rest2.js') + s[j:]
rep_exact('lastAction: ["Tagged caller to clinic and intent", "Rolled 3 warnings to digest", "Grouped 17 signals on ZAY-SEG-AUS-02", "Recomputed blast radius for INC0048201", "Ruled out clinic LAN for INC0048211", "RB-012 cleanup complete", "Verified recovery on prn-0904-01", "Merged 2 tickets into INC0048204", "Updated ZQ-55097 with new evidence", "Sent 30-minute update for INC0048201", "WO-2208 scheduled for 10:30 PT", "Flagged 22 VM disks filling within 14 days", "Proposed 14 CIs from discovery", "Checked 686 clinics before opening"][ne], lastTs: o - (ne * 97 + 30) * 1e3, actionsToday: [118, 348, 64, 41, 38, 27, 29, 46, 5, 33, 4, 12, 31, 686][ne]',
          'lastAction: ["Tagged caller to site and intent", "Rolled 3 warnings to digest", "Grouped 17 signals on KEM-SEG-KWT-01", "Recomputed blast radius for INC0048201", "Ruled out site LAN for INC0048211", "RB-012 cleanup complete", "Verified recovery on prn-0904-01", "Merged 2 tickets into INC0048204", "Updated KQ-55097 with new evidence", "Sent 30-minute update for INC0048201", "WO-2208 scheduled for 12:30 EET", "Flagged 6 VM disks filling within 14 days", "Proposed 14 CIs from discovery", "Checked 12 sites before shift start"][ne], lastTs: o - (ne * 97 + 30) * 1e3, actionsToday: [64, 148, 31, 22, 19, 27, 21, 18, 5, 26, 4, 12, 14, 12][ne]')

# site cutover pipeline (separation from the parent's shared IT)
i = s.find('Z = Cx(Wd + 99), j = [["Mesa", "AZ"]'); j2 = s.find('  t.filter((Y) => Y.openingWave === "Wave 13")', i)
s = s[:i] + rd('k_pipeline.js') + '\n' + s[j2:]

# map
i = s.find('const XUe = 975, $Ue = 610, _Ue = ['); j = s.find(', UK = { open: "Open"', i)
s = s[:i] + rd('k_mapdecl.js') + s[j:]
rep_literal('nSe = {', 'nSe = { TS: "India", UK: "India", DL: "India", GJ: "India", MP: "India", MH: "India", KA: "India", WB: "India", TN: "India", AP: "India", KW: "Kuwait", AE: "United Arab Emirates", SA: "Saudi Arabia", EG: "Egypt", VN: "Vietnam" }')

# tool registry
rep_literal('kn = {', rd('k_kn.js'))

# drop the PDS voice recordings; the voice agent falls back to on-screen text and browser speech
rep_literal('aD = {', 'aD = {}') if 'aD = {}' not in s else None

# logos: Kirby wordmark and mark, Copilot Studio wordmarks and mark, OpsRamp for LogicMonitor and Grafana
exec(open(P('k_logos.py')).read())
for name, uri in MAP.items():
    m = re.search(r'(?<![\w$])' + re.escape(name) + r' = "data:image/[^"]+"', s)
    if not m: raise SystemExit('logo not found ' + name)
    s = s[:m.start()] + name + ' = "' + uri + '"' + s[m.end():]

rep_exact('children: "PT" })', 'children: "IST" })', s.count('children: "PT" })'))
# names, addresses and the shift-start groups
rep_literal('dN = [', 'dN = ["Priya", "Rahul", "Anita", "Karthik", "Meera", "Arjun", "Sneha", "Vikram", "Deepa", "Rohan", "Kavya", "Suresh", "Lakshmi", "Imran", "Pooja", "Ravi", "Divya", "Manoj", "Nisha", "Sanjay", "Fatima", "Ahmed", "Mariam", "Khalid", "Noura", "Faisal", "Huda", "Omar", "Layla", "Yousef", "Aisha", "Hassan", "Reem", "Tariq", "Salma", "Karim", "Mona", "Mostafa", "Nour", "Amr", "Linh", "Minh", "Thao", "Duc", "Huong", "Quang", "Mai", "Tuan", "Hoa", "Nam", "Ritu", "Ajay", "Farah", "Bilal", "Sara", "Hamza", "Dina", "Tan", "Nikhil", "Zoya"]')
rep_literal('const cV = [', 'const cV = ["Industrial Development Area", "GIDC Industrial Estate", "SIDCUL Industrial Area", "Shuaiba Industrial Area", "Al Hamra Industrial Zone", "Industrial City Phase 3", "HITEC City", "MIDC", "Ring Road", "Free Zone", "Binh Duong Industrial Park", "District 7"]')
rep_literal('W2 = [', 'W2 = [{ id: "pt", label: "India and UAE", at: "06:30 local", tzs: ["PT", "AZ"] }, { id: "mt", label: "Kuwait and Saudi Arabia", at: "06:30 local", tzs: ["MT"] }, { id: "ct", label: "Egypt", at: "06:30 local", tzs: ["CT"] }, { id: "et", label: "Vietnam", at: "06:30 local", tzs: ["ET"] }]')


# ---- stage 2: Kirby storyline wiring
# hero runs on Jio, the primary circuit at Hyderabad City Office, with Palo Alto SD-WAN at the edge
i = s.find('const $S = ['); j = s.find('function dee()', i)
hero = s[i:j]
hero = hero.replace('Zayo QoS Network Services portal', 'Jio enterprise portal').replace('Zayo', 'Jio').replace('ZAY-SEG-PHX-04', 'JIO-SEG-GUJ-01').replace('ZAY-', 'JIO-').replace('ZQ-', 'JQ-')
hero = hero.replace('"VeloCloud Status", source: "VeloCloud"', '"Palo Alto SD-WAN", source: "VeloCloud"').replace('"VeloCloud Status", "VeloCloud"', '"Palo Alto SD-WAN", "VeloCloud"')
s = s[:i] + hero + s[j:]
# event sources renamed on screen still resolve to their tool icons
rep_exact('NN = { LogicMonitor: "lm",', 'NN = { OpsRamp: "lm", Airtel: "zayo", Jio: "zayo", "Tata Tele": "zayo", KEMS: "zayo", STC: "zayo", NetWorker: "qnap", "Voice agent": "polyai", "Key Vault": "cyberark", "OpsRamp dashboards": "grafana", GlobalProtect: "prisma", "SAP ERP": "epic", "SAP GUI": "citrix", "Windows Hello": "imprivata", "Endpoint Analytics": "nanoheal", "Copilot Studio": "mova", LogicMonitor: "lm",')
# S7 runs on 8 site VMs: 6 cleaned autonomously, 2 extended by change
i = s.find('function mee()'); j = s.find('function Aee()', i)
s = s[:i] + s[i:j].replace('e11.slice(0, 18)', 'e11.slice(0, 6)').replace('.sets.s7.slice(18)', '.sets.s7.slice(6)') + s[j:]
# voice calls come from the right Kirby sites
rep_exact('handoff: { name: "Hand-off to a person", icon: "UserCheck", clinicId: "0752"', 'handoff: { name: "Hand-off to a person", icon: "UserCheck", clinicId: "0301"')
rep_exact('known: { name: "Known outage: no duplicate ticket", icon: "Radio", clinicId: "0314"', 'known: { name: "Known outage: no duplicate ticket", icon: "Radio", clinicId: "0826"')
rep_exact('starter: { name: "New starter request", icon: "UserPlus", clinicId: "0117"', 'starter: { name: "New starter request", icon: "UserPlus", clinicId: "0248"')
rep_exact('payments: { name: "Card terminal back online", icon: "CreditCard"', 'payments: { name: "Weighbridge PC back online", icon: "Truck"')
# NOC shifts and field engineers
rep_literal('Bw = {', 'Bw = { noc: [{ name: "Priya R.", shift: "06:00\\u201314:00 IST", on: true }, { name: "Arjun M.", shift: "06:00\\u201314:00 IST", on: true }, { name: "Sofia L.", shift: "06:00\\u201314:00 IST", on: true }, { name: "Daniel K.", shift: "14:00\\u201322:00 IST", on: false }, { name: "Mei T.", shift: "14:00\\u201322:00 IST", on: false }, { name: "Omar H.", shift: "22:00\\u201306:00 IST", on: false }, { name: "Grace W.", shift: "Float", on: true }], field: [{ name: "Luis G.", skills: ["Network", "Server"], base: "Hyderabad" }, { name: "Tanya W.", skills: ["Network", "CCTV"], base: "Haridwar" }, { name: "Ben K.", skills: ["Server", "CAD"], base: "Halol" }, { name: "Rosa M.", skills: ["CAD", "Printers"], base: "Vadodara" }, { name: "Derek S.", skills: ["Network", "Server"], base: "Chennai" }, { name: "Nina P.", skills: ["CCTV", "Printers"], base: "Mumbai" }, { name: "Omar T.", skills: ["Network", "CAD"], base: "Kuwait (Shuaiba)" }, { name: "Jill C.", skills: ["Server", "Printers"], base: "Ras Al Khaimah" }, { name: "Sam H.", skills: ["Network", "Server", "CCTV"], base: "Jeddah" }, { name: "Ivy L.", skills: ["CAD", "CCTV"], base: "Sudair" }, { name: "Pete R.", skills: ["Network", "Printers"], base: "Cairo (partner)" }, { name: "Kara D.", skills: ["Server", "CAD"], base: "Binh Duong" }] }')
# Wave 16: the next sites to separate from the parent's shared IT
rep_literal('const mbe = [', 'const mbe = [["Pune", "MH"], ["Kolkata", "WB"], ["Indore", "MP"], ["Ras Al Khaimah", "AE"], ["Jeddah", "SA"], ["Ghazali", "KW"], ["Binh Duong", "VN"], ["Cairo", "EG"]]')
rep_exact('name: r ? `${["Riverbend", "Oak Hollow"][Math.floor(s / 4)]} Dental Care \\u2013 ${n}` : `${s % 2 ? "PDS Clinic #" + Qt(1199 + s, 4) : "Smile Generation"} \\u2013 ${n} ${["Gateway", "Commons", "Marketplace", "Crossing"][s % 4]}`',
          'name: r ? `Kirby ${n} ${["Service Centre", "Warehouse"][Math.floor(s / 4)]}` : `Kirby ${n} ${["Sales Office", "Project Office", "Erection Yard", "Spares Depot"][s % 4]}`')

# each site's real edge device
rep_exact('[i(`vc-edge-${n}-01`, "edge", "VeloCloud edge", "VeloCloud")', '[i(`vc-edge-${n}-01`, "edge", KX_EDGE(n), /^Palo/.test(KX_EDGE(n)) ? "Palo Alto" : KX_EDGE(n).split(" ")[0])')


i = s.find('payments: { name: "Weighbridge PC back online"'); j = s.find('starter: { name: "New starter request"', i)
s = s[:i] + s[i:j].replace('"Billing Specialist"', '"Logistics Executive"') + s[j:]

# Site 360 people mix: mostly production staff, a few shift coordinators and finance
rep_exact('role: o % 5 === 3 ? "Billing Specialist" : o % 2 === 0 ? "Dental Assistant" : "Front Desk Coordinator"', 'role: o % 9 === 4 ? "Front Desk Coordinator" : o % 4 === 3 ? "Billing Specialist" : "Dental Assistant"')
rep_exact('children: ["Office manager: ", a.jsx("span"', 'children: ["Site IT coordinator: ", a.jsx("span"')
# Site Cutover is the separation of 22 sites from the parent's shared IT
rep_exact('sub: `${Kr.newClinicsPerYear}+ new clinics a year, around 1,600 over 10 years. One standard kit and one board for De Novo builds and acquired practices.`', 'sub: "22 sites moving off the parent\'s shared IT onto Kirby\'s own network, identity and SAP. One standard kit and one board for full cutovers and separations."')
rep_exact('children: ["Same kit, same checks, every clinic: ", Kr.newClinicsPerYear, "+ new clinics a year without matching headcount growth."', 'children: ["Same kit, same checks, every site: 22 sites cut over in four waves without adding headcount."')

# unit labels that are plain words
s = s.replace('sub: "clinics"', 'sub: "sites"').replace('children: "clinics" })', 'children: "sites" })').replace('sub: "clinic"', 'sub: "site"')

# entity pickers read the renamed ids
rep_exact(r"/\b(dc2-[\w-]+|(?:ws|img|qnap|srv|prn|sw|vm)-\d{4}-?\w*|prisma-tun-\d+|eks-[\w-]+)/", r"/\b(hyd-[\w-]+|(?:ws|img|nas|srv|prn|sw|vm|edge)-\d{4}-?\w*|gp-tun-\d+|eks-[\w-]+)/")
rep_exact(r"/(dc2-[\w-]+|prisma-tun-\d+|dx-dc2-01|Ring-2 Clinics|aws-\w+)/", r"/(hyd-[\w-]+|gp-tun-\d+|dx-hyd-01|Ring-2 Sites|aws-\w+)/")

# command bar: carriers and regions by their Kirby names
rep_exact(r'if (i = n.match(/^show\s+clinics\s+on\s+(zayo|carrier b|carrier c)(?:\s+in\s+(west|southwest|central|southeast|east))?$/)) {' + '\n' + r'      const r = i[1] === "zayo" ? "Zayo" : i[1] === "carrier b" ? "Carrier B" : "Carrier C", o = i[2] ? i[2].charAt(0).toUpperCase() + i[2].slice(1) : "All";',
          r'if (i = n.match(/^show\s+(?:clinics|sites)\s+on\s+(airtel|jio|tata tele|kems|stc|etisalat|vnpt|fpt|vodafone|moc)(?:\s+in\s+(.+))?$/)) {' + '\n' + r'      const r = { airtel: "Airtel", jio: "Jio", "tata tele": "Tata Tele", kems: "KEMS", stc: "STC", etisalat: "Etisalat", vnpt: "VNPT", fpt: "FPT", vodafone: "Vodafone", moc: "MOC" }[i[1]], o = i[2] ? wa.find((x) => x.toLowerCase().startsWith(i[2].toLowerCase())) || "All" : "All";')
rep_exact(r"/(vm|prn|ws|qnap)-\d{4}[-\w]*|ZAY-CKT-\d+|#\d{4}/", r"/(vm|prn|ws|nas|edge)-\d{4}[-\w]*|[A-Z]{3}-CKT-\d+|#\d{4}/")

# ---- focus on infrastructure, digital workplace and security: no SAP or business-app screens
rep_exact('const rV = [...ps.filter((e11) => e11.id !== "servicedesk").map(', 'const rV = [...ps.filter((e11) => e11.id !== "servicedesk" && e11.id !== "databases").map(')
rep_exact(', { id: "epic", name: "Epic", icon: "Stethoscope", note: "Every demo about Epic, from all towers" }, { id: "ciab"', ', { id: "ciab"')
rep_exact(', { id: "epic", label: "Epic Experience", icon: "Stethoscope" }', '')
rep_exact('{ id: "tower-databases", label: "Databases", icon: "Database" }, ', '')
rep_exact('const BCe = [{ id: "epic", name: "Epic", kpi: "Citrix logon", unit: " s", dp: 1, kinds: ["epic"], page: "epic" }', 'const BCe = [{ id: "epic", name: "Microsoft 365 and Teams", kpi: "Sign-in time", unit: " s", dp: 1, kinds: ["epic"], page: "dex" }')
rep_exact('{ id: "checkin", name: "Scheduling and check-in", kpi: "Check-in p95", unit: " s", dp: 2, kinds: [], page: "tower-cloud" }', '{ id: "checkin", name: "Identity (AD and Entra ID)", kpi: "Sign-in p95", unit: " s", dp: 2, kinds: [], page: "tower-security" }')
rep_exact('{ id: "imaging", name: "X-rays and imaging", kpi: "Test X-ray fetch", unit: " s", dp: 1, kinds: ["qnap", "vmdisk"], page: "tower-storage" }', '{ id: "imaging", name: "File and print", kpi: "File open time", unit: " s", dp: 1, kinds: ["qnap", "vmdisk", "spooler"], page: "tower-storage" }')
rep_exact('{ id: "payments", name: "Card payments",', '{ id: "payments", name: "Internet breakout",')
rep_exact('epic: { label: "Epic availability", value: e11.epicAvail.toFixed(2) + "%", sub: `Path: ${e11.epicPath === "verona" ? "Verona" : "Rochester"}`', 'epic: { label: "Core services availability", value: e11.epicAvail.toFixed(2) + "%", sub: `Hub path: ${e11.epicPath === "verona" ? "AVS primary" : "AVS DR"}`')
# business service tiles at Kirby scale
rep_exact('return 9.4 + qe("svE", s, 40) * 0.5 +', 'return 2.2 + qe("svE", s, 40) * 0.3 +')
rep_exact('return Math.max(20, 182 * ha(n) + qe("svP", s, 20) * 14);', 'return Math.max(6, 11 * ha(n) + qe("svP", s, 20) * 3);')
rep_exact('kpi: "Approvals per minute", unit: ""', 'kpi: "Latency to Microsoft 365", unit: " ms"')
# site icon: a building, not a stethoscope
rep_exact('Stethoscope: t_', 'Stethoscope: Pz')

# drill-down from anywhere
s += '\n' + rd('k_drill.js') + '\n'

open(P('app.k0.js'), 'w').write(s)
print('ok', len(s))
