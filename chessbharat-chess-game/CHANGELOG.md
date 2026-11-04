# Changelog

All notable changes to the ChessBharat Chess Game plugin are documented here.
This project follows a phased build; each phase is kept buildable.

## [0.7.0] — Identity, pacing & copy

### Changed
- **Typography:** the game now uses **League Spartan** (display) and **Barlow**
  (text) only, bundled locally as woff2 (SIL OFL) with no font-CDN dependency.
- **Colour system reworked** to a grounded tricolour identity: deep green is the
  primary action colour, burnt saffron is a restrained accent, on a warm
  charcoal base. Removed the gradient "mesh" background and all neon cyan/violet
  accents for a less generic, non-AI look.
- **Opponent pacing:** opponents now take a human-like amount of time to move,
  driven by each one's thinking-time profile (beginners no longer reply
  instantly; stronger opponents deliberate longer), capped by the clock in timed
  games.
- **Copy:** new narrative lobby introduction; an opponent's spoken line now
  appears only **after the game starts**, not on the selection screen.
- **Portraits:** regenerated the three beginner portraits so the full cast is
  visually distinct (a child, a middle-aged woman, a young man, and the existing
  varied set).

### Removed
- Em dashes removed from all in-game copy (and source), per house style; the
  unlimited clock now shows an infinity symbol.

## [0.6.1] — Brand & board polish

### Changed
- **Brand logo:** the header now uses the ChessBharat tricolour horse-head logo
  (bundled via Vite; resolves correctly under the plugin path).
- **Board presentation:** physical, slightly-3D look — a beveled stone frame, a
  recessed playing well, subtle per-square shading, grounded contact shadows
  under pieces, and a restrained warm ambient glow (brand palette, not neon).
- **Realistic animations:** pieces slide from origin to destination on each move
  (Web Animations, natural easing); subtle hover-lift on draggable pieces,
  last-move fade-in, legal-move dot pop, and a gentle king-in-check pulse. All
  respect `prefers-reduced-motion`.

### Fixed
- Bundled asset URLs now use relative resolution (`base: './'`) so images load
  correctly when the plugin is served from `/wp-content/plugins/...` rather than
  the site root.

## [0.6.0] — Phase 6: QA & packaging

### Added
- **Installable plugin ZIP** (`chessbharat-chess-game.zip`) — standard
  WordPress upload, no build tools required on the server. Excludes
  `node_modules` and dev-only files; includes compiled assets, engine,
  portraits and human-readable source.
- `INSTALLATION-FOR-CLAUDE-COWORK.md` — 12-step install & verify guide with
  troubleshooting.
- `DEPLOYMENT-CHECKLIST.md` — pre-flight, environment, functional and isolation
  checks.
- `KNOWN-LIMITATIONS.md` — limitations, prioritised future recommendations, and
  the documented SEO metadata (not auto-applied).

### QA
- Full suite green: production build clean, `tsc` typecheck passes, 34 Vitest
  tests pass, PHP `php -l` passes on all files.
- Engine, personality, gameplay and failure paths verified in a real browser
  (Playwright). See TEST-REPORT.md.

## [0.5.0] — Phase 5: Full experience (portraits, polish)

### Added
- **11 original opponent portraits** generated with one consistent art
  direction (painterly, teal/saffron, chess-club), optimised to WebP
  (~18 KB each, 232 KB total), lazy-loaded, with a neutral initials fallback.
  Prompts and production notes in `assets/portraits/PORTRAIT-ASSETS.md`.
- Portraits wired into the lobby cards, the in-game opponent header, and the
  result screen.

### Fixed
- The top bar no longer overlaps the in-game opponent header when the board
  view scrolls (top bar is now static rather than sticky).

### Notes
- Opponent selection, full gameplay, clocks, controls, results and PGN export
  were completed in Phases 1–4; this phase adds the final artwork and polish.

## [0.4.0] — Phase 4: Opponents (personality move selection)

### Added
- **MultiPV search** in the engine wrapper: ranked candidate moves with
  centipawn/mate scores, so a personality layer can choose among reasonable
  options.
- **Personality selection layer** (`opponents/selection.ts`): per-candidate
  feature enrichment (capture, captured value, check, castle, promotion,
  centrality, development) via chess.js; game-phase classification; and a
  move-selection policy driven by each opponent's config (aggression,
  tactical/positional/sacrifice/endgame preferences, risk tolerance). Strong
  players play objectively; others weight the engine's eval against personality
  appeal within a risk-scaled eval window.
- **Beginner mistake model** (200–900): controlled, plausible errors drawn from
  the ranked candidate list (never random moves), with frequency and severity
  scaled per opponent.
- Opponent moves now flow through MultiPV + selection + Stockfish Skill Level,
  so the 11 opponents differ in behaviour, not just name/portrait/dialogue.
- Contextual dialogue extended with an endgame trigger.

### Tested
- 8 new unit tests for the selection layer (34 total, all pass).
- **Calibration harness** (`calibration/`): measured eval-loss (ACPL) and
  blunder rate per opponent over fixed positions. Results show a clear
  monotonic trend (beginners ACPL ≈ 44 cp, experts ≈ 0 cp). See TEST-REPORT.md
  for the table, method, sample sizes and honest caveats (proxy, not Elo).

### Known limitations
- Ratings are **target labels**, refined with larger samples in Phase 6.
- Opening repertoires influence play via style bias + engine, not yet a full
  named-opening book.

## [0.3.0] — Phase 3: Stockfish engine

### Added
- Bundled **Stockfish 19 Lite (single-threaded WASM)** in `assets/engine/`
  (`stockfish-19-lite-single.{js,wasm}`, ~1.85 MB) with its full GPL-3.0
  license text and upstream README. No cross-origin isolation headers required.
- `StockfishEngine` wrapper: classic Web Worker, UCI protocol, lazy-init with
  handshake, fail-fast on worker error, search with movetime/skill, stale-search
  supersession guard, `stop()`, `terminate()`, and bestmove validation/parsing.
- `useEngine` hook: lifecycle management, `idle/loading/ready/error` status,
  automatic restart of a crashed worker, worker teardown on unmount.
- Game loop now uses the engine for opponent moves (search time and Stockfish
  skill level driven per opponent), with the engine's move validated against the
  live position before it is applied.
- Graceful degradation: if the engine fails to load, a clear banner is shown and
  the opponent falls back to legal moves so play never stalls. A "Loading
  engine…" state shows during lazy init.

### Tested
- Unit: `parseBestMove` (normal, promotion, `(none)`/`0000`, malformed) — 4 new
  tests (26 total, all pass).
- Browser (Playwright): the engine loads in a real Web Worker and plays coherent
  legal chess (e.g. 1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4), responding in ~700 ms at The
  Club Player's configured search time; first move ~1.3 s including lazy load.
- Failure path (Playwright): a bad engine URL fails fast (~230 ms, no 15 s hang),
  shows the error banner, and the game continues via the fallback. Zero console
  errors in both paths.

### Known limitations / next
- Opponents currently differ by Stockfish **skill level + search time** only.
  Full per-personality move selection (MultiPV candidate scoring, openings,
  beginner mistake models, contextual dialogue) is **Phase 4**.
- Mobile hardware benchmarking is recorded on desktop Chromium here; on-device
  Android timing is gathered in Phase 4/6.

## [0.2.0] — Phase 2: Chessboard & rules

### Added
- Integrated `chess.js` as the single rules engine via a `useChessGame` hook:
  legal-move generation, castling, en passant, promotion, check, checkmate,
  stalemate, and all draw conditions (insufficient material, threefold
  repetition, fifty-move), plus SAN, PGN and FEN.
- Pure, tested rules module (`rules.ts`): structured outcome detection, move
  pairing, king location.
- Full board interaction: **click-to-move and drag-and-drop**, legal-target
  dots/rings, selected + last-move + check highlights, board flip.
- Accessible **promotion panel** (Q/R/B/N) overlaid on the board.
- Live **move history** (SAN, current move highlighted, auto-scroll), captured
  pieces and material balance computed from the position.
- **Clocks** with increment and flag-on-time (timestamp-based, drift-resistant),
  active-side highlight; unlimited mode disables the clock.
- **Result screen**: win/loss/draw with reason, move count, duration, PGN
  download, play again, choose another opponent.
- Working controls: New Game, Resign, Offer Draw, Undo (casual only), Flip,
  Sound (synthesized move/capture/check/end cues), Settings — all confirmed
  for destructive actions; no dead buttons.
- Temporary random-legal opponent so a full game is playable end-to-end for
  rules verification. **This is a placeholder**, replaced by Stockfish
  (Phase 3) and per-personality selection (Phase 4); it is not the mistake
  model for the real opponents.

### Tested
- 22 automated tests (Vitest) covering castling, en passant, promotion,
  checkmate/stalemate/insufficient-material/threefold detection, move pairing,
  FEN/PGN, material counting, clock formatting and PGN result tokens.
- End-to-end (Playwright): legal moves apply, illegal moves are rejected, the
  opponent replies, flip/resign/result/play-again all work, zero console
  errors.

### Known limitations
- The opponent is still random (Phase 3 brings the real engine).
- Draw offers are auto-accepted by the placeholder opponent (personality-based
  decisions arrive in Phase 4).
- Clock accuracy during backgrounded tabs / device sleep is hardened in Phase 5.

## [0.1.0] — Phase 1: Foundation & visual prototype

### Added
- WordPress plugin scaffold: bootstrap, `Plugin` orchestrator, `Assets`
  (conditional enqueue, `type="module"`, filemtime versioning), `Shortcode`
  (`[chessbharat_game]`, crawlable intro, `<noscript>` fallback, graceful
  missing-bundle notice), `Settings` (Settings API, board-coordinate default),
  `Rest_Api` (read-only `chessbharat/v1/status`), and a `Game_Storage` seam
  (no DB tables in v1).
- React + TypeScript + Vite frontend building to `assets/dist/chessbharat.js`
  and `chessbharat.css` with stable filenames (no build step required in
  production). Pinned dependencies and committed lockfile.
- Design system derived from the canonical ChessBharat brand (dark, saffron,
  tricolour knight): tokens, scoped base styles, and shared UI primitives,
  all namespaced under `.chessbharat-game` so the host theme is untouched.
- Opponent data model and all 11 opponents with personality configuration,
  repertoires, learning objectives, weaknesses and contextual dialogue.
- Opponent lobby: heading/intro, difficulty filters, responsive card grid,
  selected state, detail + setup dialog, time-control selection (with the
  Calculator's classical-only restriction), and colour choice.
- Custom SVG/CSS chessboard with one cohesive piece set, coordinates, and
  last-move / selected / check / legal-move visual states — no externally
  hosted images.
- Game-screen prototype: opponent header, player/opponent bars with clocks and
  captured pieces, move history, grouped controls, and confirm dialogs for
  destructive actions (resign, new game).
- Accessibility foundations: visible focus, skip link, reduced-motion support,
  semantic roles and labels, SR-only helpers.

### Notes
- This release is a visual prototype. Live play (chess.js rules) arrives in
  Phase 2 and the Stockfish engine in Phase 3. Sample positions and move lists
  on the game screen are clearly labelled as such.

[0.1.0]: #
