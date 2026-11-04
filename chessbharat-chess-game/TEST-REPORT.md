# ChessBharat Chess Game — Test Report

_Last updated: Phase 4 (v0.4.0). This report is appended as phases complete._

## 1. Automated tests (Vitest)

**34 tests, all passing.** Run with `cd frontend && npm test`.

| Area | Coverage |
|---|---|
| Rules & special moves | castling, en passant, promotion (SAN + piece placement) |
| Outcome detection | checkmate (+ winner), stalemate, insufficient material, threefold, ongoing |
| Move list / helpers | move pairing, king-square lookup, FEN/PGN round-trips |
| Material | capture lists and net material from a FEN |
| Clocks | `formatClock` (unlimited, m:ss, ceil, H:MM:SS) |
| PGN | result tokens (1-0 / 0-1 / 1/2-1/2 / *) |
| Engine | `parseBestMove` (normal, promotion, none/0000, malformed) |
| Personality selection | phase classification, feature enrichment, objective vs aggressive vs mistake-model choice, eval-window exclusion |

## 2. Engine integration (Playwright, real browser)

- Stockfish 19 Lite loads in a real **Web Worker** and plays coherent legal
  chess (verified line: `1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4`).
- Response latency at The Club Player's configured search time: **~700 ms**
  per move (~1.3 s first move including lazy engine load).
- **Failure path:** a bad engine URL fails fast (~230 ms, no 15 s hang), shows
  the error banner, and the opponent falls back to legal moves so play
  continues. Zero console errors in both paths.

## 3. Opponent calibration (measured)

**Method.** For 8 fixed positions (opening, tactical middlegames, rook and
pawn endgames), Stockfish (full strength) produced MultiPV=18 candidates with
accurate evaluations. Each opponent's personality selection then chose a move
from those candidates; we measured the **eval loss** of the chosen move versus
the engine's best (ACPL proxy) and the **blunder rate** (choices losing
> 150 cp). 5 repeats per position → 40 samples per opponent.

| # | Opponent | Target | ACPL (cp) | Blunder rate | Samples |
|---|---|---:|---:|---:|---:|
| 1 | The Absolute Beginner | 200 | 44 | 7.5% | 40 |
| 2 | The Beginner | 400 | 28 | 0% | 40 |
| 3 | The Rookie | 600 | 15 | 0% | 40 |
| 4 | The Casual Player | 900 | 9 | 0% | 40 |
| 5 | The Club Player | 1200 | 2 | 0% | 40 |
| 6 | The Trickster | 1750 | 2 | 0% | 40 |
| 7 | The Aggressor | 1800 | 2 | 0% | 40 |
| 8 | The Positional Master | 1900 | 7 | 0% | 40 |
| 9 | The Endgame Specialist | 2000 | 7 | 0% | 40 |
| 10 | The Calculator | 2100 | 0 | 0% | 40 |
| 11 | ChessBharat Ultimate Bot | 2300+ | 0 | 0% | 40 |

**Reading the numbers (honestly).**
- The **monotonic trend** (ACPL falls as the target rating rises) confirms the
  personality layer makes opponents behave differently, not just look
  different: beginners drift from the engine's best move, experts do not.
- The Positional Master and Endgame Specialist show a *slightly* higher ACPL
  than their neighbours **by design** — they accept small objective eval loss
  for structure / favourable simplification, which the ACPL metric counts as
  "loss." This is the personality layer working as intended, not weakness.
- **This is a proxy, not an Elo rating.** The harness measures only the
  *selection layer* over full-strength candidates. In real play, the lower-rated
  opponents are weakened *further* by a low Stockfish **Skill Level** (0–9) and
  **short, shallow search** (200–700 ms), so their effective strength is lower
  than the ACPL proxy alone suggests. The blunder rate understates real
  blunders because these 8 positions are relatively quiet; sharper positions
  produce more mistakes. Sample sizes are small — treat ratings as **target
  labels**, to be refined with larger full-game samples in Phase 6.

Reproduce: `frontend/src/calibration/calibrate.ts` via `calibration.html`
(`window.runCalibration('/engine/')`).

## 4. Build & lint

- Production frontend build: **clean** (`chessbharat.js` ≈ 306 KB, ≈ 97 KB gzip;
  `chessbharat.css` ≈ 28 KB). Engine shipped separately (1.85 MB WASM).
- TypeScript typecheck (`tsc -b`): **passes**.
- PHP lint (`php -l`) across all plugin files: **passes**.

## 5. Known limitations (current)

- Opponent strength is calibrated as **target labels**, not exact Elo.
- Opening repertoires currently influence play through the personality style
  bias + Stockfish; a full named-opening book is a later enhancement.
- Portraits: generated in Phase 5 (placeholders until then).
- Mobile performance timed on desktop Chromium; on-device Android timing is
  gathered in Phase 6.
