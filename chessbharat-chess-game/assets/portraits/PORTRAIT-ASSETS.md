# Opponent Portrait Assets

11 original character portraits for the ChessBharat opponents, generated with a
single, consistent art direction and optimised to WebP. Each is lazy-loaded;
if an image fails to load, the UI falls back to a neutral initials placeholder.

## Art direction (shared across all 11)

> Editorial character portrait, head and shoulders, painterly digital
> illustration, warm cinematic lighting, dark teal background with a subtle
> saffron rim light, chess pieces softly in the foreground, consistent
> chess-club art direction, expressive readable face, no text, no logos, no
> watermark.

This matches the ChessBharat brand (deep teal/night base, saffron accent). No
real-person likenesses, celebrity references or copyrighted characters are
used. The cast is intentionally varied in age and gender.

## Files & prompts

| # | File | Character prompt (appended to the shared art direction) |
|---|---|---|
| 1 | `portrait-01-absolute-beginner.webp` | young absolute-beginner, curious and slightly confused, approachable |
| 2 | `portrait-02-beginner.webp` | earnest young beginner, quietly optimistic, just learned the rules |
| 3 | `portrait-03-rookie.webp` | enthusiastic improver, alert and bright-eyed, starting to see patterns |
| 4 | `portrait-04-casual-player.webp` | relaxed confident woman, plays for fun, playful competitive smile |
| 5 | `portrait-05-club-player.webp` | focused serious amateur, man in his forties with glasses, methodical |
| 6 | `portrait-06-trickster.webp` | mischievous clever woman, sly knowing smirk, sets traps and gambits |
| 7 | `portrait-07-aggressor.webp` | intense fearless young man leaning forward, all offense and initiative |
| 8 | `portrait-08-positional-master.webp` | calm distinguished South Asian man, fifties, wise and strategic |
| 9 | `portrait-09-endgame-specialist.webp` | patient experienced woman, sixties, serene and technical |
| 10 | `portrait-10-calculator.webp` | sharp East Asian man with glasses, cool and precise, deep calculation |
| 11 | `portrait-11-ultimate-bot.webp` | formidable composed champion, calm commanding presence, the final boss |

## Production notes

- **Generated with:** Canva image generation (Adobe Firefly-class). Reusable
  Canva media ids are recorded in version control history for regeneration.
- **Format:** WebP, quality 82, centre-cropped to square and sized for the card
  (4:3, `object-fit: cover`) and the circular header/result avatars.
- **Resolution caveat:** the image connector returns ~200 px source previews,
  which are crisp at header/avatar size and good on cards. Higher-resolution
  masters can be regenerated from the same prompts if larger displays are added.
- **Fallback:** `Portrait.tsx` renders a neutral initials placeholder if an
  image is missing or fails to load.
