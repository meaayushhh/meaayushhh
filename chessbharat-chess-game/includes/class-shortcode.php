<?php
/**
 * The [chessbharat_game] shortcode.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Registers and renders the game shortcode.
 */
class Shortcode {

	const TAG = 'chessbharat_game';

	/**
	 * @var Assets
	 */
	private $assets;

	public function __construct( Assets $assets ) {
		$this->assets = $assets;
	}

	/**
	 * Hook the shortcode.
	 */
	public function register(): void {
		add_shortcode( self::TAG, array( $this, 'render' ) );
	}

	/**
	 * Render the shortcode output.
	 *
	 * @param array|string $atts Shortcode attributes.
	 * @return string
	 */
	public function render( $atts ): string {
		$atts = shortcode_atts(
			array(
				'coordinates' => '', // '', 'on' or 'off' - overrides the setting.
			),
			$atts,
			self::TAG
		);

		// Loading the game's assets only happens here, when the shortcode runs.
		$this->assets->enqueue();

		if ( ! $this->assets->bundle_exists() ) {
			if ( current_user_can( 'manage_options' ) ) {
				return '<div class="chessbharat-game-error" style="padding:1rem;border:1px solid #d0d0d0;border-radius:8px">'
					. esc_html__( 'ChessBharat Chess Game: compiled assets were not found in assets/dist. Build the frontend before deploying.', 'chessbharat-chess-game' )
					. '</div>';
			}
			return '';
		}

		/**
		 * Short, crawlable introduction rendered server-side so the page is not
		 * entirely dependent on JavaScript-rendered text (good for SEO). Filterable.
		 */
		$intro = apply_filters(
			'chessbharat_cg_intro_html',
			'<p class="chessbharat-game-intro">'
			. esc_html__( 'Play chess online against 11 unique computer opponents. Choose your difficulty, challenge different playing styles and improve your chess skills - right here in your browser, free.', 'chessbharat-chess-game' )
			. '</p>'
		);

		ob_start();
		?>
		<div class="chessbharat-game-outer">
			<?php echo wp_kses_post( $intro ); ?>
			<div class="chessbharat-game" data-chessbharat-root>
				<noscript><?php echo esc_html__( 'This chess game needs JavaScript enabled in your browser to play.', 'chessbharat-chess-game' ); ?></noscript>
				<div class="chessbharat-game-loading" aria-live="polite">
					<?php echo esc_html__( 'Loading the board…', 'chessbharat-chess-game' ); ?>
				</div>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
