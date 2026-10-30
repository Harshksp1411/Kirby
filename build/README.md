# Build

The hub is the PDS Intelligent Operations Hub, rebuilt for Kirby. `pds-base.js` is the PDS application code (voice recordings removed). The `k_*` files hold Kirby's data: sites, regions, hubs and links, seeded incidents and requests, carriers, tools, the map and the site cutover pipeline. `patch.py` splices them in, `vocab.js` rewrites on-screen wording in string literals only, using `k_story.js` for Kirby's storylines (sites, people, plant-floor language, scale), and widens the text-matching patterns so the Ask panel and command bar understand Kirby's words. `theme.py` applies the Movate colours, and `build.py` writes the single-file page.

    npm i acorn acorn-walk
    python3 patch.py            # -> app.k0.js
    node vocab.js app.k0.js app.k1.js
    python3 build.py app.k1.js ../index.html
