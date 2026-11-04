# Deployment Checklist

A compact pre-flight and post-deploy checklist for the ChessBharat Chess Game
plugin. Full step-by-step instructions are in
`INSTALLATION-FOR-CLAUDE-COWORK.md`.

## Pre-flight (build/package — already done for the shipped ZIP)

- [x] Production frontend build committed to `assets/dist/`
      (`chessbharat.js`, `chessbharat.css`).
- [x] Engine files present in `assets/engine/`
      (`stockfish-19-lite-single.js` + `.wasm`) with GPL-3.0 text.
- [x] 11 portraits present in `assets/portraits/` (+ fallback behaviour).
- [x] `tsc` typecheck passes; `npm test` (34 tests) passes.
- [x] PHP `php -l` passes on all files.
- [x] Versions aligned (plugin header, `readme.txt`, `package.json`).
- [x] No `node_modules` / dev-only files in the ZIP.

## Environment requirements

- [ ] WordPress ≥ 6.2, PHP ≥ 7.4.
- [ ] Server serves `.wasm` as `application/wasm`.
- [ ] Web Workers allowed (not blocked by a security plugin/CDN rule).
- [ ] ~10 MB free disk for the plugin.

## Install & activate

- [ ] Full site + database backup taken.
- [ ] Plugin installed via Plugins → Add New → Upload Plugin.
- [ ] Plugin activated with no errors.

## Page setup

- [ ] `/play-chess/` page exists with `[chessbharat_game]`.
- [ ] No `noindex` added; SEO plugin settings unchanged.

## Functional verification (on `/play-chess/`)

- [ ] Lobby renders with 11 portraits, no console errors.
- [ ] `chessbharat.js` / `.css` load (200).
- [ ] On game start, engine `.js` + `.wasm` load (200, correct MIME).
- [ ] Opponent responds to moves within ~1–2 s.
- [ ] Special moves work (castling, en passant, promotion panel).
- [ ] Clocks run and flag; result screen shows; **Download PGN** works.
- [ ] Mobile (≤ 430 px): board is square, no horizontal scroll, controls reachable.

## Isolation verification

- [ ] Home page and other pages look unchanged.
- [ ] Game `.js` / `.css` / engine do **not** load on pages without the shortcode.

## Rollback

- [ ] Deactivation plan confirmed (deactivate → page falls back to plain content).
- [ ] Backup restore path confirmed.

## Sign-off

- [ ] Date / environment / WordPress + PHP versions recorded.
- [ ] Any console/PHP warnings recorded (even if non-fatal).
