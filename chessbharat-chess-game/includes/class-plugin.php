<?php
/**
 * Core plugin orchestrator.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Singleton that wires the plugin's pieces together.
 */
final class Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * @var Assets
	 */
	public $assets;

	/**
	 * @var Shortcode
	 */
	public $shortcode;

	/**
	 * @var Settings
	 */
	public $settings;

	/**
	 * @var Rest_Api
	 */
	public $rest_api;

	/**
	 * Get the singleton.
	 */
	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Private constructor.
	 */
	private function __construct() {
		$this->settings  = new Settings();
		$this->assets    = new Assets( $this->settings );
		$this->shortcode = new Shortcode( $this->assets );
		$this->rest_api  = new Rest_Api();
	}

	/**
	 * Register all hooks.
	 */
	public function init(): void {
		load_plugin_textdomain(
			'chessbharat-chess-game',
			false,
			dirname( plugin_basename( CHESSBHARAT_CG_FILE ) ) . '/languages'
		);

		$this->assets->register();
		$this->shortcode->register();
		$this->settings->register();
		$this->rest_api->register();
	}
}
