<?php

/**
 * The Saas Infrastructure news feed importer.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.News
 */
class Ai1ec_News_Feed extends Ai1ec_Base {

	/**
	 * Imports feed from Time.ly website.
	 *
	 * @return array Results.
	 */
	public function import_feed( $limit = 5 ) {
		try {
			include_once(
					ABSPATH . WPINC . DIRECTORY_SEPARATOR . 'class-simplepie.php'
				);
			include_once(
				ABSPATH . WPINC . DIRECTORY_SEPARATOR .'SimplePie'
				. DIRECTORY_SEPARATOR .'File.php'
			);
			$result = get_transient( 'ai1ec_rss_feed' );
			if (
				false === $result ||
				(
					defined( 'AI1EC_DEBUG' ) &&
					AI1EC_DEBUG
				)
			) {
				$file = new SimplePie_File( AI1EC_RSS_FEED );
				$feed = new SimplePie();
				$feed->set_raw_data($file->body);
				$feed->init();
				$result = is_wp_error( $feed )
					? array()
					: $feed->get_items( 0, $limit );
				$expiration = apply_filters(
					'wp_feed_cache_transient_lifetime',
					12 * HOUR_IN_SECONDS,
					AI1EC_RSS_FEED
				);
				if ( empty( $result ) ) {
					$expiration = 1 * HOUR_IN_SECONDS;
				}
				set_transient( 'ai1ec_rss_feed', $result, $expiration );
			}
			return $result;
		} catch ( Exception $exc ) {
			return array();
		}
	}
}