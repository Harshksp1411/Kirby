import re,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
css=open('_css_base.html').read(); body=open('_body.html').read(); js=open('_js_base.js').read(); v=open('_vendor.css').read(); kit=open('_kit.js').read()
tc=open('_tc.js').read().strip()
js=re.sub(r'const TC = \{[^\n]*\};', tc, js).replace('const SITES = [', 'const SITES0 = [')
open('../kit.html','w').write(css.replace('</style></head>','')+v+'</style></head>\n'+body+js+kit+'</script></body></html>\n')
print('kit ok')
