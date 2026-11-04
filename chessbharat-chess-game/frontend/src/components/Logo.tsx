import logoUrl from '../assets/chessbharat-logo.webp';

/**
 * ChessBharat brand mark - the tricolour horse-head logo. Bundled via Vite so
 * it resolves in both development and the production WordPress build without
 * depending on a configured asset path.
 */
export function Logo({ size = 40, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  // Native logo aspect ratio is 648 × 458 (≈ 1.415:1).
  const height = size;
  const width = Math.round((size * 648) / 458);
  return (
    <span className="cb-brand">
      <img
        className="cb-mark"
        src={logoUrl}
        width={width}
        height={height}
        alt="ChessBharat"
        decoding="async"
      />
      {withWordmark && (
        <span className="cb-wordmark" aria-hidden="true">
          <span>CHESS</span>
          <b>BHARAT</b>
        </span>
      )}
    </span>
  );
}
