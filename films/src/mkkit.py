s=open('apps.html').read()
css=open('kit_add.css').read(); js=open('kit_add.js').read().replace('" class="pg" id="snl"','" id="snl"')
s=s.replace('</style></head>',css+'</style></head>',1)
end='  cpAck() {'
i=s.index(end); j=s.index('\n};\n</script>',i)
s=s[:j]+',\n'+js.rstrip().rstrip(',')+'\n};\n</script>'+s[j+len('\n};\n</script>'):]
s=s.replace('<span>Mova iO NOC Agent</span><span style="margin-left:auto;border','<span id="csag">Mova iO NOC Agent</span><span style="margin-left:auto;border',1)
s=s.replace('<b>Automated · ServiceNow incident INC0024817</b>','<b id="csrun">Automated · ServiceNow incident INC0024817</b>',1)
s=s.replace('''    $(".cs .hd span:nth-child(3)", W()).textContent = c.agent;
    $(".cs b", W()).parentElement.querySelectorAll("b")[1].textContent = c.run;''','''    $("#csag", W()).textContent = c.agent; $("#csrun", W()).textContent = c.run;''')
s=s.replace('"Mova iO": "#E15AA5" };','"Mova iO": "#E15AA5", vCenter: "#0079B8", "Microsoft Defender": "#0F6CBD", "Defender for Office 365": "#0F6CBD", "Defender for Endpoint": "#0F6CBD", "Defender Vulnerability Mgmt": "#0F6CBD", "Microsoft Sentinel": "#0078D4", "Entra ID": "#0F6CBD", Intune: "#0F6CBD", Purview: "#038387", Veeam: "#00B336", Outlook: "#0F6CBD", "Exchange Online": "#0F6CBD", "Field Service": "#2F5B4F", "Virtual Agent": "#2F5B4F", "Email": "#0F6CBD" };',1)
s=s.replace('$("#snnotes", W()).prepend(n); $("#snupd", W()).textContent = "just now";','$("#snnotes", W()).prepend(n); const u = $("#snupd", W()); if (u) u.textContent = "just now";')
s=s.replace('el.textContent = pre + Math.round(to * e) + suf;','el.textContent = pre + (Number.isInteger(to) ? Math.round(to * e) : (to * e).toFixed(2)) + suf;')
open('kit.html','w').write(s)
print('ok', len(s))
