<?php

/**
 * The Acces Control Object class.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.acl
 */
class Ai1ec_Acl_Aco {
	

	/**
	 * Whether the current request is for a network or blog admin page
	 *
	 * Does not inform on whether the user is an admin! Use capability checks to
	 * tell if the user should be accessing a section or not.
	 *
	 * @return bool True if inside WordPress administration pages.
	 */
	public function is_admin() {
		return is_admin();
	}

	/**
	 * Is the query for an existing single page?
	 *
	 * If the $page parameter is specified, this function will additionally
	 * check if the query is for one of the pages specified.
	 *
	 * @param mixed $page Page ID, title, slug, or array of such.
	 * 
	 * @return bool
	 */
	public function is_page( $page = '' ) {
		return is_page( $page );
	}

	/**
	 * Whether post requires password and correct password has been provided.
	 * 
	 * @param int|WP_Post $post An optional post. Global $post used if not provided.
	 * 
	 * @return bool false if a password is not required or the correct password cookie is present, true otherwise.
	 */
	public function post_password_required( $post = null ) {
		return post_password_required( $post );
	}
	
	/**
	 * Check if it's our own custom post type.
	 * 
	 * @param int|object $post Optional. Post ID or post object.
	 * Default is the current post from the loop.
	 * 
	 * @return boolean
	 */
	public function is_our_post_type( $post = null ) {
		return get_post_type( $post ) === AI1EC_POST_TYPE;
	}
}

