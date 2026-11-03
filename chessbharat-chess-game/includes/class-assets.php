<?php
/**
 * Asset registration and conditional enqueueing.
 *
 * Assets are REGISTERED on wp_enqueue_scripts but only ENQUEUED when the
 * [chessbharat_game] shortcode actually renders — so ordinary ChessBharat
 * pages never load the game's script, styles or engine.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Handles the compiled frontend bundle in assets/dist.
 */
class Assets {

	const HANDLE = 'chessbharat-chess-game';

	/**
	 * @var Settings
	 */
	private $settings;

	/**
	 * @var bool Guard so we enqueue once even with multiple shortcodes.
	 */
	private $enqueued = false;

	public function __construct( Settings $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Register (not enqueue) the bundle.
	 */
	public function register(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
	}

	/**
	 * Register script + style handles with filemtime-based versions.
	 */
	public function register_assets(): void {
		$js_path  = CHESSBHARAT_CG_DIR . 'assets/dist/chessbharat.js';
		$css_path = CHESSBHARAT_CG_DIR . 'assets/dist/chessbharat.css';

		$js_ver  = file_exists( $js_path ) ? (string) filemtime( $js_path ) : CHESSBHARAT_CG_VERSION;
		$css_ver = file_exists( $css_path ) ? (string) filemtime( $css_path ) : CHESSBHARAT_CG_VERSION;

		wp_register_script(
			self::HANDLE,
			CHESSBHARAT_CG_URL . 'assets/dist/chessbharat.js',
			array(),
			$js_ver,
			true // in footer
		);
		// The compiled bundle is an ES module; emit type="module" on its tag.
		add_filter( 'script_loader_tag', array( $this, 'module_type_attr' ), 10, 3 );

		wp_register_style(
			self::HANDLE,
			CHESSBHARAT_CG_URL . 'assets/dist/chessbharat.css',
			array(),
			$css_ver
		);
	}

	/**
	 * Enqueue the bundle and inject runtime config. Called by the shortcode.
	 */
	public function enqueue(): void {
		if ( $this->enqueued ) {
			return;
		}
		$this->enqueued = true;

		wp_enqueue_style( self::HANDLE );
		wp_enqueue_script( self::HANDLE );

		wp_localize_script(
			self::HANDLE,
			'ChessBharatConfig',
			array(
				'assetsBase'      => esc_url_raw( CHESSBHARAT_CG_URL . 'assets/' ),
				'portraitsBase'   => esc_url_raw( CHESSBHARAT_CG_URL . 'assets/portraits/' ),
				'engineBase'      => esc_url_raw( CHESSBHARAT_CG_URL . 'assets/engine/' ),
				'restUrl'         => esc_url_raw( rest_url( 'chessbharat/v1/' ) ),
				'nonce'           => wp_create_nonce( 'wp_rest' ),
				'showCoordinates' => (bool) $this->settings->get( 'show_coordinates', true ),
				'version'         => CHESSBHARAT_CG_VERSION,
			)
		);
	}

	/**
	 * Add type="module" to our script tag (and only ours).
	 *
	 * @param string $tag    The full <script> tag.
	 * @param string $handle Script handle.
	 * @param string $src    Script source URL.
	 * @return string
	 */
	public function module_type_attr( $tag, $handle, $src ): string {
		if ( self::HANDLE !== $handle ) {
			return $tag;
		}
		// Rebuild the tag cleanly as a module script.
		return sprintf(
			'<script type="module" src="%s" id="%s-js"></script>' . "\n",
			esc_url( $src ),
			esc_attr( $handle )
		);
	}

	/**
	 * Whether the compiled bundle exists (used for a graceful admin notice).
	 */
	public function bundle_exists(): bool {
		return file_exists( CHESSBHARAT_CG_DIR . 'assets/dist/chessbharat.js' );
	}
}
