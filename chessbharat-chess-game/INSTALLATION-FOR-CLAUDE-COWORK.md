# Installation Guide — for Claude Cowork

This guide is for **installing and verifying** the packaged ChessBharat Chess
Game plugin on the live WordPress site. **Do not rewrite the plugin's code or
make unreviewed changes** — install the packaged ZIP and verify it.

The plugin is self-contained: it ships compiled frontend assets and the chess
engine, so **no Node.js, npm, or build step is required on the server.**

**Target page:** `https://chessbharat.org/play-chess/`
**Shortcode:** `[chessbharat_game]`

---

## 0. Before you start

- You need a WordPress admin login with the `install_plugins` capability.
- Have the plugin ZIP ready: `chessbharat-chess-game.zip`.
- Prefer a staging site first if one exists.

## 1. Inspect the environment

- WordPress version **6.2+** and PHP **7.4+** (check Tools → Site Health → Info).
- Confirm the active theme and other plugins (note them, so you can verify later
  that nothing changed).

## 2. Confirm compatibility & disk space

- Confirm at least ~10 MB free for the plugin (engine WASM is ~1.85 MB).
- Confirm the server serves `.wasm` as `application/wasm` and allows Web Workers.
  Most modern hosts do. If the engine fails to load after install (see step 8),
  this is the likely cause — see **Troubleshooting**.

## 3. Back up the website & database

- Take a full backup (files + database) using the site's backup tool before
  installing. Record how to restore it.

## 4. Install the plugin ZIP

- WordPress admin → **Plugins → Add New → Upload Plugin**.
- Choose `chessbharat-chess-game.zip` → **Install Now**.

## 5. Activate the plugin

- Click **Activate**. Confirm "ChessBharat Chess Game" appears active with no
  activation errors.
- A settings page appears at **Settings → ChessBharat Chess** (optional board
  coordinate default).

## 6. Create or configure `/play-chess/`

- Pages → find or create a page with the slug `play-chess`.
- Keep the existing theme/template. Do **not** add `noindex`.

## 7. Insert the shortcode

- In the page content, add the shortcode block / text:

  ```
  [chessbharat_game]
  ```

- Publish/update the page.

## 8. Verify assets & engine load

- Open `https://chessbharat.org/play-chess/` in a normal browser tab.
- The opponent lobby should render with 11 portraits.
- Open the browser **DevTools → Network**, start a game, and confirm:
  - `chessbharat.js` and `chessbharat.css` load (200).
  - On game start, `stockfish-19-lite-single.js` and `.wasm` load (200), with
    the `.wasm` served as `application/wasm`.
- **DevTools → Console** should show no errors.

## 9. Play and complete a test game

- Choose an opponent (e.g. The Club Player), pick a time control, start a game.
- Make a few moves; confirm the opponent responds within ~1–2 seconds.
- Resign or play to a result; confirm the result screen appears and **Download
  PGN** produces a file.

## 10. Check browser console & PHP errors

- Re-check the browser console on the page.
- Check the server PHP error log (or Site Health) for new warnings/errors
  mentioning `chessbharat`.

## 11. Confirm unrelated pages still work

- Visit the home page and 2–3 other pages. Confirm:
  - They look unchanged (the plugin scopes all CSS under `.chessbharat-game`).
  - **View Source / Network**: `chessbharat.js`/`.css` and the engine files do
    **not** load on pages without the shortcode.
- Confirm the site's SEO plugin (e.g. Rank Math) settings are unchanged.

## 12. Roll back safely if anything fails

- If the page breaks or assets don't load and can't be fixed quickly:
  - **Plugins → Deactivate** "ChessBharat Chess Game" (the page falls back to
    plain content), then **Delete** if needed.
  - Restore from the step-3 backup only if deactivation doesn't resolve it.
- Report exactly what failed (console errors, network status codes, PHP log
  lines) rather than editing plugin code.

---

## Troubleshooting

**The board loads but the opponent never moves / "engine couldn't load" banner.**
- The engine files failed to load or `.wasm` MIME is wrong. In DevTools → Network,
  check `stockfish-19-lite-single.wasm`: it must return 200 with
  `Content-Type: application/wasm`. If a security plugin or host blocks `.wasm`
  or worker files, allow them (host/CDN rule), then start a new game. The game
  still works with a basic fallback opponent in the meantime.

**Portraits don't appear.**
- Confirm `assets/portraits/*.webp` returns 200. The UI falls back to neutral
  initials if an image is missing — not fatal.

**Styling looks off only inside the game.**
- Confirm `chessbharat.css` loaded. All game styles are scoped under
  `.chessbharat-game`; the plugin does not modify theme styles.

**Nothing renders, only "This chess game needs JavaScript…".**
- JavaScript is disabled or blocked; the game requires JS (this is expected and
  the crawlable intro text still shows for SEO).
