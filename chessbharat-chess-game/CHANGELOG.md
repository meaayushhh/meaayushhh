# Changelog

All notable changes to the ChessBharat Chess Game plugin are documented here.
This project follows a phased build; each phase is kept buildable.

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
