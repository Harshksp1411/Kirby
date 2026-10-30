import sys
js=open(sys.argv[1]).read()
css=open('app.css').read()
html='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Kirby Operations Hub</title>\n<script type="module" crossorigin>'+js+'</script>\n<style>'+css+'</style>\n</head>\n<body>\n<div id="root"></div>\n</body>\n</html>\n'
open(sys.argv[2],'w').write(html);print(len(html))
