# Universal Game Analyzer

A static, browser-only statistical history viewer for Aviator multipliers, colour outcomes, and manually recorded sports results.

## GitHub Pages deployment
1. Create a new public GitHub repository named `universal-game-analyzer`.
2. Upload `index.html`, `style.css`, `app.js`, and this README to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Wait for the Pages deployment and open the URL shown there.

## Features
- START LIVE / STOP controls a browser-side refresh of the displayed analysis. It does not connect to a game's private feed.
- Manually record Aviator multipliers, colour outcomes (RED/GREEN/VIOLET), or sports result labels.
- Separate history for each supported platform/category, stored in this browser's localStorage.
- Historical distribution, mean/median and multiplier buckets; colour/result frequencies and adjacent transitions.
- Import/export JSON backups.

## Important limitations
GitHub Pages serves static files. This project does not run a server, Python process, background job, or 24/7 service. Keep the page open to use its START LIVE session. Results must be entered by the user or imported from a data source the user is authorized to use. Past outcomes do not establish the next outcome of an independent/random game. The statistics are descriptive, not betting advice or guaranteed predictions.

Data is stored in the current browser profile. Clearing browser site data can erase it; export JSON backups regularly. Do not enter account passwords, API keys, or private credentials.
