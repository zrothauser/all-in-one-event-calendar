<?php
/**
 * Helper for template links.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Template.Link
 */
class Ai1ec_Template_Link_Helper {

	/**
	 * Retrieve the permalink for current page or page ID.
	 *
	 * Respects page_on_front. Use this one.
	 *
	 * @param int|object $post      Optional. Post ID or object.
	 * @param bool       $leavename Optional, defaults to false.
	 *                              Whether to keep page name.
	 * @param bool       $sample    Optional, defaults to false.
	 *                              Is it a sample permalink.
	 *
	 * @return string
	 */
	public function get_page_link( $post = false, $leavename = false, $sample = false ) {
		return get_page_link( $post, $leavename, $sample );
	}

	/**
	 * Get the home url respecting FORCE_SSL_ADMIN
	 *
	 * @return string URL.
	 */
	public function get_site_url() {
		if (
			is_admin() &&
			$this->_is_ssl_forced()
		) {
			return get_site_url( null, '', 'https' );
		}
		return get_site_url();
	}

	/**
	 * Get the admin url respecting FORCE_SSL_ADMIN using get_admin_url.
	 *
	 * @return string URL.
	 */
	public function get_admin_url( $blog_id = null, $path = '', $scheme = 'admin' ) {
		if ( $this->_is_ssl_forced() ) {
			$scheme = 'https';
		}
		return get_admin_url( $blog_id, $path, $scheme );
	}

	/**
	 * Get the admin url respecting FORCE_SSL_ADMIN using admin_url.
	 *
	 * @return string URL.
	 */
	public function admin_url( $blog_id = null, $path = '', $scheme = 'admin' ) {
		if ( $this->_is_ssl_forced() ) {
			$scheme = 'https';
		}
		return admin_url( $blog_id, $path, $scheme );
	}

	/**
	 * Get the network admin url respecting FORCE_SSL_ADMIN.
	 *
	 * @return string URL.
	 */
	public function network_admin_url( $path = '', $scheme = 'admin' ) {
		if ( $this->_is_ssl_forced() ) {
			$scheme = 'https';
		}
		return network_admin_url( $path, $scheme );
	}

	/**
	 * Retrieve full permalink for current post or post ID.
	 *
	 * @since 1.0.0
	 *
	 * @param int $id Optional. Post ID.
	 * @param bool $leavename Optional, defaults to false. Whether to keep post name or page name.
	 * @return string
	 */
	public function get_permalink( $id = 0, $leavename = false ) {
		return get_permalink( $id, $leavename );
	}

	/**
	 * Checks whether FORCE_SSL_ADMIN is enabled or WordPress HTTP plugin.
	 *
	 * @return bool
	 */
	protected function _is_ssl_forced() {
		return ( defined( 'FORCE_SSL_ADMIN' ) && true === FORCE_SSL_ADMIN ) ||
			class_exists( 'WordPressHTTPS' );
	}
}