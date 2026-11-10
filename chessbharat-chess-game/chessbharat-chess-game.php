<?php
/**
 * Plugin Name:       ChessBharat Chess Game
 * Plugin URI:        https://chessbharat.org/play-chess/
 * Description:       Play chess online against 11 original computer opponents, each with a distinct personality and playing style. Renders via the [chessbharat_game] shortcode. Bundles the Stockfish 19 Lite engine (GPL-3.0) and runs entirely in the browser.
 * Version:           0.8.1
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            ChessBharat
 * Author URI:        https://chessbharat.org/
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       chessbharat-chess-game
 * Domain Path:       /languages
 *
 * @package ChessBharat\ChessGame
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

define( 'CHESSBHARAT_CG_VERSION', '0.8.1' );
define( 'CHESSBHARAT_CG_FILE', __FILE__ );
define( 'CHESSBHARAT_CG_DIR', plugin_dir_path( __FILE__ ) );
define( 'CHESSBHARAT_CG_URL', plugin_dir_url( __FILE__ ) );

require_once CHESSBHARAT_CG_DIR . 'includes/class-plugin.php';
require_once CHESSBHARAT_CG_DIR . 'includes/class-assets.php';
require_once CHESSBHARAT_CG_DIR . 'includes/class-shortcode.php';
require_once CHESSBHARAT_CG_DIR . 'includes/class-settings.php';
require_once CHESSBHARAT_CG_DIR . 'includes/class-rest-api.php';
require_once CHESSBHARAT_CG_DIR . 'includes/class-game-storage.php';

/**
 * Boot the plugin on plugins_loaded.
 */
function chessbharat_cg_boot() {
	\ChessBharat\ChessGame\Plugin::instance()->init();
}
add_action( 'plugins_loaded', 'chessbharat_cg_boot' );
