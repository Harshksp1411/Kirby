// Writes the brand-free build: client name out of every on-screen string, Movate logo in the header.
const fs = require('fs'), acorn = require('acorn'), walk = require('acorn-walk');
const [, , inp, outp] = process.argv; const src = fs.readFileSync(inp, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' }); const spans = [];
walk.full(ast, (n) => { if (n.type === 'Literal' && typeof n.value === 'string') spans.push([n.start + 1, n.end - 1]); else if (n.type === 'TemplateElement') spans.push([n.start, n.end]); });
spans.sort((a, b) => a[0] - b[0]);
const R = require('./k_generic.js'); let out = '', last = 0, n = 0;
for (const [a, b] of spans) { if (a < last) continue; let t = src.slice(a, b); if (t.length > 200000 || /^data:/.test(t)) continue; const o = t; for (const [x, y] of R) t = typeof x === 'string' ? t.split(x).join(y) : t.replace(x, y); if (t !== o) n++; out += src.slice(last, a) + t; last = b; }
out += src.slice(last);
// header logos: Movate instead of the client
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const swap = (name, uri) => { const re = new RegExp('(?<![\\w$])' + name.replace('$', '\\$') + ' = "data:image/[^"]+"'); if (!re.test(out)) throw new Error('logo ' + name); out = out.replace(re, name + ' = "' + uri + '"'); };
swap('M_', b64(process.env.MOVATE_FULL)); swap('C_', b64(process.env.MOVATE_MARK));
fs.writeFileSync(outp, out); console.log('generic strings changed', n);
