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

open(P('app.k0.js'), 'w').write(s)
print('ok', len(s))
