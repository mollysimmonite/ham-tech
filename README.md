# Technician exam, in plain English

A study page for the US amateur radio Technician exam (2026–2030 question pool), with a plain-English explanation for every question and a mock exam mode. Works offline and can be added to a phone's home screen.

Live at GitHub Pages once enabled (Settings → Pages → Deploy from a branch → main, / (root)).

## Layout

- `index.html`: page structure
- `css/style.css`: all styling, with light and dark colour tokens at the top
- `js/app.js`: study mode, saved progress and mock exam logic
- `data/t1.js` … `data/t0.js`: questions and explanations, one file per section (format described at the top of `t1.js`)
- `img/`: the three official exam figures and the app icons
- `manifest.webmanifest`: name and icon for "Add to Home Screen"
- `sw.js`: offline support. It keeps a saved copy of the site, so after a deploy the change shows on the second visit. If you add a file the page loads, add it to the `FILES` list there.

Open `index.html` directly in a browser to test locally; no build step or server needed. (Offline support only runs when served over http(s), e.g. `python3 -m http.server`.)

## Sources

Question text, answer key and figures come from the NCVEC 2026–2030 Technician question pool (public domain, February 2026 revision): https://ncvec.org/index.php/2026-2030-technician-question-pool. Explanations are informal study notes, not the legal text of FCC Part 97.

Progress is stored in the browser's localStorage, so it is per device.
