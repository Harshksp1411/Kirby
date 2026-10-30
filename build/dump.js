const fs=require('fs');const acorn=require('acorn');const walk=require('acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module',locations:true});
const re=new RegExp(process.argv[3],'i');const out=[];
walk.full(ast,n=>{let v=null;if(n.type==='Literal'&&typeof n.value==='string')v=n.value;else if(n.type==='TemplateElement')v=n.value.cooked;if(v&&re.test(v)&&(process.argv[4]||/\s/.test(v)))out.push(n.loc.start.line+': '+v.slice(0,260));});
console.log(out.join('\n'));
