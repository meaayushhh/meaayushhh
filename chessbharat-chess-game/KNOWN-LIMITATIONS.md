# Known Limitations & Future Recommendations

## Known limitations (v0.5.0)

1. **Opponent ratings are target labels, not measured Elo.** The calibration
   harness (see TEST-REPORT.md) shows a clear, monotonic strength trend between
   opponents, but exact Elo is not claimed. Low-rated opponents are weakened by
   Stockfish Skill Level + short search in addition to the selection policy.
2. **Opening repertoires** influence play through a personality style bias plus
   Stockfish, not yet a full named-opening book. The repertoire names in each
   opponent's config are the intended direction for that enhancement.
3. **Portrait resolution.** Portraits are ~200 px source images (crisp at
   header/avatar size, good on cards). Higher-resolution masters can be
   regenerated from the documented prompts if larger displays are added.
4. **Clock accuracy under backgrounded tabs / device sleep.** Clocks are
   timestamp-based and accurate while the tab is focused; browser throttling of
   background tabs limits perfect accuracy for casual play. This is a browser
   limitation, surfaced for players rather than hidden.
5. **Game review** is limited to move navigation + PGN export. Per-move
   accuracy/blunder annotations are intentionally **not** shown, because we do
   not display analysis numbers we have not genuinely computed and tested.
6. **Persistence** is guest-only (local browser storage for preferences, PGN
   export). No accounts or cloud history in this release (architecture is ready
   for it; no DB tables are created in v1).

## Future recommendations (priority order)

1. **Full opening book** per opponent repertoire (ECO lines), so opening
   character is explicit and varied.
2. **Larger-sample rating calibration** via automated self-play, to turn target
   labels into measured ranges with confidence intervals.
3. **Higher-resolution portraits** and an optional animated "thinking" portrait
   state.
4. **Genuine post-game review** (engine evaluation graph + honest accuracy
   stats) once implemented and tested end-to-end.
5. **WordPress account integration** + cloud game history (REST endpoints are
   scaffolded; add tables + nonce/capability-checked routes).
6. **On-device Android performance pass** and optional engine-strength auto-tune
   for low-end hardware.
7. **Bespoke vector piece set** as an alternative to the current cohesive
   Unicode-glyph set.

## SEO metadata (document only - do NOT apply automatically)

Provide these to the site administrator / Cowork to set via the existing SEO
plugin (e.g. Rank Math). The plugin itself does not modify SEO settings.

- **SEO title:** `Play Chess Online Against Computer - ChessBharat`
- **H1:** `Play Chess Online Against Computer | ChessBharat`
- **Meta description:** `Play chess online against 11 unique computer opponents.
  Choose your difficulty, challenge different playing styles and improve your
  chess skills.`

Also recommended: keep crawlable intro copy around the shortcode (the plugin
already emits a short server-rendered intro), and do not add `noindex` to the
`/play-chess/` page.
