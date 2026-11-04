# Changelog

All notable changes to the ChessBharat Chess Game plugin are documented here.
This project follows a phased build; each phase is kept buildable.

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
