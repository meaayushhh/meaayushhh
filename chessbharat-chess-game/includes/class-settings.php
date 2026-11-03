<?php
/**
 * Plugin settings (admin) and typed accessor.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Minimal, secure settings using the WordPress Settings API.
 */
class Settings {

	const OPTION = 'chessbharat_cg_settings';

	/**
	 * Cached options.
	 *
	 * @var array|null
	 */
	private $cache = null;

	/**
	 * Register admin hooks.
	 */
	public function register(): void {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
	}

	/**
	 * Defaults.
	 *
	 * @return array
	 */
	private function defaults(): array {
		return array(
			'show_coordinates' => true,
		);
	}

	/**
	 * Get a single setting value.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Fallback.
	 * @return mixed
	 */
	public function get( string $key, $default = null ) {
		if ( null === $this->cache ) {
			$stored      = get_option( self::OPTION, array() );
			$this->cache = wp_parse_args( is_array( $stored ) ? $stored : array(), $this->defaults() );
		}
		return array_key_exists( $key, $this->cache ) ? $this->cache[ $key ] : $default;
	}

	/**
	 * Register the setting and its sanitizer.
	 */
	public function register_settings(): void {
		register_setting(
			'chessbharat_cg',
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
				'default'           => $this->defaults(),
			)
		);

		add_settings_section( 'chessbharat_cg_main', '', '__return_false', 'chessbharat_cg' );

		add_settings_field(
			'show_coordinates',
			__( 'Show board coordinates', 'chessbharat-chess-game' ),
			array( $this, 'field_show_coordinates' ),
			'chessbharat_cg',
			'chessbharat_cg_main'
		);
	}

	/**
	 * Sanitize incoming settings.
	 *
	 * @param array $input Raw input.
	 * @return array
	 */
	public function sanitize( $input ): array {
		return array(
			'show_coordinates' => ! empty( $input['show_coordinates'] ),
		);
	}

	/**
	 * Checkbox field.
	 */
	public function field_show_coordinates(): void {
		$value = (bool) $this->get( 'show_coordinates', true );
		printf(
			'<label><input type="checkbox" name="%1$s[show_coordinates]" value="1" %2$s /> %3$s</label>',
			esc_attr( self::OPTION ),
			checked( $value, true, false ),
			esc_html__( 'Display file/rank labels on the board by default.', 'chessbharat-chess-game' )
		);
	}

	/**
	 * Add the settings page under the Settings menu.
	 */
	public function add_menu(): void {
		add_options_page(
			__( 'ChessBharat Chess Game', 'chessbharat-chess-game' ),
			__( 'ChessBharat Chess', 'chessbharat-chess-game' ),
			'manage_options',
			'chessbharat-chess-game',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the settings page.
	 */
	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'ChessBharat Chess Game', 'chessbharat-chess-game' ); ?></h1>
			<p><?php echo esc_html__( 'Add the game to any page or post with the shortcode:', 'chessbharat-chess-game' ); ?>
				<code>[chessbharat_game]</code></p>
			<form action="options.php" method="post">
				<?php
				settings_fields( 'chessbharat_cg' );
				do_settings_sections( 'chessbharat_cg' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
