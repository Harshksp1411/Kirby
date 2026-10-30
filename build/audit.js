const fs=require('fs');const acorn=require('acorn');const walk=require('acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
const re=new RegExp(process.argv[3],'i');const seen=new Map();
walk.full(ast,n=>{let v=null;if(n.type==='Literal'&&typeof n.value==='string')v=n.value;else if(n.type==='TemplateElement')v=n.value.cooked;if(v&&re.test(v)){const m=v.match(re)[0].toLowerCase();seen.set(m,(seen.get(m)||0)+1);}});
console.log([...seen.entries()].sort((a,b)=>b[1]-a[1]).map(e=>e.join(':')).join('  '));
