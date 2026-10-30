import base64
def svg(x): return 'data:image/svg+xml;base64,'+base64.b64encode(x.encode()).decode()
SP='<path d="M{cx} {t}l{a} {b} {c} {a} -{c} {a} -{a} {c} -{a} -{c} -{c} -{a} {c} -{a}z" />'
def spark(cx,cy,r):
    return f'<path d="M{cx} {cy-r} L{cx+r*0.26} {cy-r*0.26} L{cx+r} {cy} L{cx+r*0.26} {cy+r*0.26} L{cx} {cy+r} L{cx-r*0.26} {cy+r*0.26} L{cx-r} {cy} L{cx-r*0.26} {cy-r*0.26} Z"/>'
G='<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F6CBD"/><stop offset=".55" stop-color="#5B5FC7"/><stop offset="1" stop-color="#C239B3"/></linearGradient></defs>'
kirby=svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60"><rect x="2" y="8" width="44" height="44" rx="9" fill="#B91C1C"/><text x="24" y="42" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="32" font-weight="800" fill="#fff">K</text><text x="58" y="44" font-family="Segoe UI,Arial,sans-serif" font-size="36" font-weight="700" fill="#2B2F36" letter-spacing="1">Kirby</text></svg>')
kmark=svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect x="4" y="4" width="52" height="52" rx="11" fill="#B91C1C"/><text x="30" y="43" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="36" font-weight="800" fill="#fff">K</text></svg>')
cps_dark=svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 60">'+G+'<g fill="url(#g)">'+spark(28,30,22)+'</g><text x="58" y="41" font-family="Segoe UI,Arial,sans-serif" font-size="29" font-weight="600" fill="#2B2F36">Copilot Studio</text></svg>')
cps_light=svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 60">'+G+'<g fill="url(#g)">'+spark(28,30,22)+'</g><text x="58" y="41" font-family="Segoe UI,Arial,sans-serif" font-size="29" font-weight="600" fill="#FFFFFF">Copilot Studio</text></svg>')
cps_mark=svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">'+G+'<rect x="2" y="2" width="56" height="56" rx="13" fill="url(#g)"/><g fill="#fff">'+spark(30,30,19)+'</g></svg>')
ops=open(os.path.join(D,'..','classic','assets','logos','opsramp.png'),'rb').read()
opsuri='data:image/png;base64,'+base64.b64encode(ops).decode()
MAP={'M_':kirby,'C_':kmark,'u9':cps_dark,'K_':cps_light,'m9':cps_mark,'A9':opsuri,'U_':opsuri,'L_':opsuri,'S_':opsuri}
