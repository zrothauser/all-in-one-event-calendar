<?php
/**
 * Helper for post related wp functions.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Script
 */
class Ai1ec_Post_Helper {

	/**
	 * Retrieves post data given a post ID or post object.
	 *
	 * See {@link sanitize_post()} for optional $filter values. Also, the parameter
	 * $post, must be given as a variable, since it is passed by reference.
	 *
	 * @since 1.5.1
	 * @uses $wpdb
	 * @link http://codex.wordpress.org/Function_Reference/get_post
	 *
	 * @param int|object $post Post ID or post object. Optional, default is the current post from the loop.
	 * @param string $output Optional, default is Object. Either OBJECT, ARRAY_A, or ARRAY_N.
	 * @param string $filter Optional, default is raw.
	 * @return WP_Post|null WP_Post on success or null on failure
	 */
	public function get_post( $post = null, $output = OBJECT, $filter = 'raw' ) {
		return get_post( $post, $output, $filter );
	}
	/**
	 * Retrieve the post type of the current post or of a given post.
	 *
	 * @since 2.1.0
	 *
	 * @param int|object $post Optional. Post ID or post object. Default is the current post from the loop.
	 * @return string|bool Post type on success, false on failure.
	*/
	function get_post_type( $post = null ) {
		return get_post_type( $post );
	}

	/**
	 * Proxy to the shared $post object from wordpress
	 *
	 * @param $value string value to get
	 * @return array|mixed the value in the $post object
	 */
	function get_post_object_value( $value ) {
		global $post;
		return $post->{$value};
	}

}