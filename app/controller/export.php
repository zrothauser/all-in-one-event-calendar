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
		wp_remote_post( AI1EC_LOCATIONS_API, array(
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
		) );

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
}