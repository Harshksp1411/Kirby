// Brand-free wording for the generic demo build (any client): no client name anywhere on screen.
module.exports = [
  ['Thanks for calling the Kirby service desk', 'Thanks for calling the IT service desk'], ['Thank you for calling Kirby IT support', 'Thank you for calling IT support'], ['Thank you for calling Kirby IT.', 'Thank you for calling IT.'],
  ['Kirby IT Help', 'IT Help'], ['Kirby IT Operations', 'IT Operations'], ['Kirby IT operations', 'IT operations'], ['Kirby IT · SMS', 'IT · SMS'], ['Kirby Service Desk', 'Service Desk'], ['Kirby Ops Monthly', 'IT Ops Monthly'], ['Kirby — Observability', 'Observability'],
  ['Kirby Network Engineering', 'Network Engineering'], ['Kirby engineering profile', 'engineering profile'], ['Kirby data center', 'company data center'], ["Kirby's own", "the company's own"], ['Kirby kit', 'standard kit'], ['Kirby systems', 'company systems'],
  ['Kirby field technician', 'field technician'], ['Kirby technician', 'field technician'], ['Kirby workers', 'employees'], ['Kirby device', 'company device'], ['Kirby sign-in', 'company sign-in'], ['Kirby pool', 'company pool'], ['Kirby ranges', 'company ranges'], ['Kirby accounts', 'company accounts'], ['Kirby mailbox', 'company mailbox'], ['Kirby network', 'company network'],
  ['Staff joining Kirby', 'Staff joining'], ['left Kirby', 'left the company'], ['for Kirby', 'for this tenant'], ['outside Kirby', 'outside the company'], ['across Kirby', 'across the company'], ['tools Kirby already has', 'tools you already have'],
  ['Kirby IT', 'IT'], ['Kirby-Site-', 'Site-'], ['Get-Kirby', 'Get-'], ['Save-Kirby', 'Save-'], ['kirby_ops', 'ops'], ['kirby-', 'corp-'], ['kirby.', 'ops.'],
  [/^Kirby pays/, 'The company pays'], [/\bKirby pays/g, 'the company pays'], [/\bKirby does not/g, 'the company does not'], [/^Kirby$/, 'Enterprise'], [/\bKirby\b/g, 'the company']
];
