=== ChessBharat Chess Game ===
Contributors: chessbharat
Tags: chess, game, stockfish, board game, play chess
Requires at least: 6.2
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 0.8.0
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Play chess online against 11 original computer opponents, each with a distinct
personality and playing style. Runs entirely in the browser.

== Description ==

ChessBharat Chess Game adds a premium, self-contained chess experience to any
page via the `[chessbharat_game]` shortcode. Visitors choose from 11 original
opponents - from the Absolute Beginner to the ChessBharat Ultimate Bot - set a
time control, and play a full game.

* 11 opponents with distinct personalities, repertoires and target ratings
* Custom board and piece rendering (no externally hosted images)
* Stockfish 19 Lite (single-threaded WebAssembly) runs locally in a Web Worker
* No cross-origin isolation headers required
* Assets load only on pages that use the shortcode
* Styles scoped under `.chessbharat-game` - your theme is never modified
* Guest play with local preferences and PGN export

This build is under active development; see CHANGELOG.md for phase status.

== Installation ==

1. Upload the plugin ZIP via Plugins → Add New → Upload Plugin, or extract it
   into `wp-content/plugins/`.
2. Activate "ChessBharat Chess Game".
3. Add the shortcode `[chessbharat_game]` to a page (for example, /play-chess/).
4. Optionally adjust defaults under Settings → ChessBharat Chess.

No build tools (Node.js, npm) are required on the WordPress server - the plugin
ships compiled assets in `assets/dist`.

== Third-party software ==

This plugin bundles the Stockfish chess engine (Stockfish 19 Lite, WebAssembly),
which is licensed under the GNU General Public License v3.0. See
THIRD-PARTY-LICENSES.md for full notices and source information.

== Changelog ==

= 0.8.0 =
* Tekken-style front end: title screen, fighter roster with a live bio panel,
  VS match setup and a round-start banner into the arena.

= 0.7.0 =
* Identity and feel: League Spartan + Barlow typography (bundled, no CDN); a
  grounded tricolour palette (deep green primary, saffron accent) with the neon
  accents and gradient background removed; human-like opponent move pacing;
  a narrative intro; opponent lines now appear only after the game starts;
  distinct portraits for the beginner opponents; em dashes removed from copy.

= 0.6.1 =
* Brand & board polish: ChessBharat horse-head logo in the header; physical,
  slightly-3D board with a stone frame, grounded piece shadows and a restrained
  warm glow; realistic move-slide and state animations (reduced-motion aware).
  Fixed bundled asset paths for subdirectory plugin installs.

= 0.6.0 =
* Phase 6: QA and packaging. Installable plugin ZIP (no server build step),
  Cowork install guide, deployment checklist, known-limitations/SEO doc, and a
  full green test pass.

= 0.5.0 =
* Phase 5: 11 original opponent portraits (consistent art direction, WebP,
  lazy-loaded, with fallback), wired into the lobby, game header and results.
  Fixed a top-bar overlap on the game screen.

= 0.4.0 =
* Phase 4: personality-based opponents. MultiPV candidate evaluation plus a
  per-opponent selection policy and a controlled beginner mistake model, so the
  11 opponents play differently. Includes a measured calibration harness.

= 0.3.0 =
* Phase 3: bundled Stockfish 19 Lite (single-threaded WASM) running in a Web
  Worker over UCI, lazy-loaded with graceful failure fallback. Opponents now
  play real engine moves (skill level + search time per opponent).

= 0.2.0 =
* Phase 2: full chess rules via chess.js (castling, en passant, promotion,
  check/mate, all draws), click + drag moves, promotion panel, live move
  history, clocks, captures, PGN export and a result screen. A temporary
  random opponent is in place until the Stockfish engine lands in Phase 3.

= 0.1.0 =
* Phase 1: plugin foundation, design system, opponent lobby and game-screen
  prototype.
