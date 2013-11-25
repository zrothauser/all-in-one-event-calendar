<?php

/**
 * User meta entries management.
 *
 * Meta entries management based on {@see Ai1ec_Meta} class.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Meta_User extends Ai1ec_Meta {

	/**
	 * Get meta value for current user.
	 *
	 * @param string $meta_key Name of meta entry to get for current user.
	 * @param mixed  $default  Value to return if no entry found.
	 *
	 * @return mixed Current user's option or $default if none found.
	 */
	public function get_current( $meta_key, $default = null ) {
		$user    = wp_get_current_user();
		$user_id = (int)$user->ID;
		unset( $user );
		if ( $user_id < 0 ) {
			return $default;
		}
		return $this->get( $user_id, $meta_key, $default );
	}

}