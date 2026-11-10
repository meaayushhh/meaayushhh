<?php
/**
 * REST API surface.
 *
 * v1 ships only a read-only status endpoint. Game results are NOT accepted or
 * trusted from the client in this release; the architecture is kept ready for
 * authenticated, validated endpoints (account play, cloud history) in a later
 * release. Any such endpoint will use nonces, capability checks and
 * server-side validation.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Registers REST routes under chessbharat/v1.
 */
class Rest_Api {

	const NAMESPACE = 'chessbharat/v1';

	/**
	 * Hook route registration.
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/status',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'status' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Status endpoint - confirms the plugin is active and reports version.
	 *
	 * @return \WP_REST_Response
	 */
	public function status(): \WP_REST_Response {
		return new \WP_REST_Response(
			array(
				'ok'      => true,
				'plugin'  => 'chessbharat-chess-game',
				'version' => CHESSBHARAT_CG_VERSION,
			),
			200
		);
	}
}
