/**
 * Runtime configuration injected by WordPress via wp_localize_script as
 * window.ChessBharatConfig. In dev (Vite) the object is absent, so we fall
 * back to sensible defaults and empty asset bases (which makes Portrait render
 * its placeholder).
 */
export interface ChessBharatConfig {
  /** URL of assets/ inside the plugin, with trailing slash. */
  assetsBase: string;
  /** URL of assets/portraits/, with trailing slash. */
  portraitsBase: string;
  /** URL of assets/engine/, with trailing slash. */
  engineBase: string;
  /** REST root + nonce for future server features. */
  restUrl: string;
  nonce: string;
  /** Default board-coordinate setting from plugin settings. */
  showCoordinates: boolean;
  /** Plugin version, for cache-busting / display. */
  version: string;
}

declare global {
  interface Window {
    ChessBharatConfig?: Partial<ChessBharatConfig>;
  }
}

const DEFAULTS: ChessBharatConfig = {
  assetsBase: '',
  portraitsBase: '',
  engineBase: '',
  restUrl: '',
  nonce: '',
  showCoordinates: true,
  version: '0.1.0-dev',
};

export function getConfig(): ChessBharatConfig {
  const injected = (typeof window !== 'undefined' && window.ChessBharatConfig) || {};
  return { ...DEFAULTS, ...injected };
}
