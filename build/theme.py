"""Movate brand theme: plum chrome, magenta primary actions, red-orange-yellow-pink accents.
Status colours (green, amber, red) and Microsoft brand colours (Teams, Copilot) are left alone."""
import re
# old hex -> Movate hex
HEX = {
    '3A3C41': '3F2639',  # sidebar / navy chrome -> deep plum
    '22252B': '2E1A2A', '26292F': '33202F', '2A2E35': '38243A',  # sidebar hover and panels
    '513346': '4E3047',  # violet -> Movate plum (wordmark)
    '3A2438': '3A2236',
    '0A72A3': 'B83A80',  # primary action blue -> Movate magenta
    '0A6690': '962E68',
    '1F8FC9': '8E4A86',  # info / series 1 -> mauve
    '2A63B8': 'E15AA5',  # series 5 -> Movate pink
    '23A7DD': 'F39237',  # sky -> Movate orange
    '7FCDF0': 'FBC58A', 'E6F5FC': 'FDF0E4',
    'B7820F': 'D9A21B',  # series 4 -> Movate yellow (deepened for contrast)
}
def rgb(h): return ' '.join(str(int(h[i:i+2], 16)) for i in (0, 2, 4))
def apply(text, css=False):
    for o, n in HEX.items():
        text = re.sub('#' + o, '#' + n, text, flags=re.I)
        if css: text = text.replace('rgb(' + rgb(o) + ' ', 'rgb(' + rgb(n) + ' ')
    if css:
        text = text.replace('rgb(230 245 252 ', 'rgb(253 240 228 ')
        # Movate gradient strip across the top of the app
        text += 'body::before{content:"";position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;pointer-events:none;background:linear-gradient(90deg,#EE3B33 0%,#F15A4A 22%,#F7A541 45%,#FFE14D 60%,#F29A7A 78%,#E15AA5 100%)}'
    return text
