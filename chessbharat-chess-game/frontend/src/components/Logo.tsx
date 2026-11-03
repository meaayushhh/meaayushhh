/**
 * ChessBharat knight mark — the tricolour (saffron / white / green) swept-back
 * mane behind a knight's head, taken from the canonical landing-page brand.
 */
export function Logo({ size = 40, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="cb-brand">
      <svg
        className="cb-mark"
        viewBox="0 0 140 128"
        width={(size * 140) / 128}
        height={size}
        aria-hidden="true"
      >
        <g className="cb-mane">
          <path fill="var(--cb-saffron)" d="M78 24C57 22 40 34 31 55c-5 11-7 23-6 34 6-9 13-16 22-20-8 11-12 23-11 36 8-13 18-22 31-28-7-15-5-34 11-53z" />
          <path fill="var(--cb-white-flag)" d="M83 30C65 30 50 41 42 60c-4 10-6 20-5 30 6-9 13-15 21-19-6 10-9 20-8 31 8-12 17-20 29-26-6-13-3-29 4-46z" />
          <path fill="var(--cb-green)" d="M88 38C73 39 60 49 53 66c-4 9-5 18-4 27 6-8 12-13 19-17-5 9-7 18-6 27 7-10 16-17 27-22-5-12-2-25-1-40z" />
        </g>
        <path
          className="cb-head"
          fill="#c3cad3"
          stroke="rgba(10,14,22,.55)"
          strokeWidth="2"
          d="M86 20c-10 1-16 8-20 18-3 8-8 12-16 18-2 2-3 5-2 8 4 0 8-2 11-5-2 5-3 9-2 14 3 1 6 0 8-2l2 10c1 5 2 10 2 15h34c1-16-2-30-9-42 3 2 7 3 10 2 2-4 0-8-4-11 3-3 3-8 0-12-4-6-10-11-18-13-2-1-4-1-6 0z"
        />
        <circle className="cb-eye" cx="92" cy="42" r="3.2" fill="#10151f" />
      </svg>
      {withWordmark && (
        <span className="cb-wordmark" aria-label="ChessBharat">
          <span>CHESS</span>
          <b>BHARAT</b>
        </span>
      )}
    </span>
  );
}
