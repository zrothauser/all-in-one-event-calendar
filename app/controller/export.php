<?php

class Ai1ec_Export_Controller extends Ai1ec_Base {

	/**
	 * export_location function
	 *
	 * @param array $data
	 * @param bool $update
	 *
	 * @return void
	 **/
	function export_location( $data, $update = false ) {
		// if there is no data to send, return
		if (
			empty( $data['venue'] ) &&
			empty( $data['country'] ) &&
			empty( $data['address'] ) &&
			empty( $data['city'] ) &&
			empty( $data['province'] ) &&
			empty( $data['postal_code'] ) &&
			empty( $data['latitude'] ) &&
			empty( $data['longitude'] )
		) {
			return;
		}

		// For this remote call we need to remove cUrl, because the minimum timeout
		// of cUrl is 1 second. This causes Facebook import to fail when importing
		// many events (even from just a few friends). A timeout greater than 0.05s
		// will be a great hindrance to performance.
		add_filter( 'use_curl_transport', array( $this, 'remove_curl' ) );

		// Send data using post to locations API.
		wp_remote_post( AI1EC_LOCATIONS_API,
			array(
				'body' => array(
					'venue'       => $data['venue'],
					'country'     => $data['country'],
					'address'     => $data['address'],
					'city'        => $data['city'],
					'province'    => $data['province'],
					'postal_code' => $data['postal_code'],
					'latitude'    => $data['latitude'],
					'longitude'   => $data['longitude'],
					'update'      => $update,
				),
				'timeout'  => 0.01,
				'blocking' => false,
			)
		);

		// Revert cUrl setting to what it was.
		remove_filter( 'use_curl_transport', array( $this, 'remove_curl' ) );
	}

	/**
	 * Simple function that returns false, intended for the use_curl_transport
	 * filter to disable the use of cUrl.
	 *
	 * @return boolean
	 */
	public function remove_curl() {
		return false;
	}

	/**
	 * n_cron function
	 *
	 * @return void
	 **/
	function n_cron() {

		$dbi            = $this->_registry->get( 'dbi.dbi' );
		$ai1ec_settings = $this->_registry->get( 'model.settings' );

		$query = "SELECT COUNT( ID ) as num_events " .
			"FROM {$dbi->get_table_name( 'posts' )} " .
			"WHERE post_type = '" . AI1EC_POST_TYPE . "' AND " .
			"post_status = 'publish'";
		$n_events = $dbi->get_var( $query );

		$query   = "SELECT COUNT( ID ) FROM " . $dbi->get_table_name( 'users' );
		$n_users = $dbi->get_var( $query );

		$categories = $tags = array();
		foreach ( get_terms( 'events_categories', array( 'hide_empty' => false ) )
			as $term
		) {
			if( isset( $term->name ) )
				$categories[] = $term->name;
		}
		foreach ( get_terms( 'events_tags', array( 'hide_empty' => false ) )
			as $term
		) {
			if( isset( $term->name ) )
				$tags[] = $term->name;
		}
		$data = array(
			'n_users'        => $n_users,
			'n_events'       => $n_events,
			'categories'     => $categories,
			'tags'           => $tags,
			'blog_name'      => get_bloginfo( 'name' ),
			'cal_url'        => get_permalink( $ai1ec_settings
				->get( 'calendar_page_id' ) ),
			'ics_url'        => AI1EC_EXPORT_URL,
			'php_version'    => phpversion(),
			'wp_version'     => get_bloginfo( 'version' ),
			'wp_lang'        => get_bloginfo( 'language' ),
			'wp_url'         => home_url(),
			'timezone'       => $this->_registry->get('model.option')->get(
				'timezone_string',
				'America/Los_Angeles'
			),
			'privacy'        => $this->_registry->get('model.option')
				->get( 'blog_public' ),
			'plugin_version' => AI1EC_VERSION,
			'active_theme'   => $this->_registry->get('model.option')->get(
				'ai1ec_template',
				AI1EC_DEFAULT_THEME_NAME
			),
		);
		// send request
		wp_remote_post( AI1EC_STATS_API,
			array(
				'body' => $data
			)
		);

	}

}