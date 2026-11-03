<?php
/**
 * Game storage (stub).
 *
 * The initial release is guest-play only: preferences and optional recent-game
 * history live in the browser (localStorage), and PGN export is client-side.
 * No custom database tables are created in v1. This class is a deliberate seam
 * for a future WordPress-account + cloud-history integration.
 *
 * @package ChessBharat\ChessGame
 */

namespace ChessBharat\ChessGame;

defined( 'ABSPATH' ) || exit;

/**
 * Placeholder for future server-side persistence. Intentionally inert in v1.
 */
class Game_Storage {

	/**
	 * Whether server-side storage is enabled. Always false in v1.
	 */
	public function is_enabled(): bool {
		return false;
	}
}
