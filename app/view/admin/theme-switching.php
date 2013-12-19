<?php
class Ai1ec_View_Admin_Theme_Switching extends Ai1ec_View_Admin_Abstract {
	
	public function display_page() {
		global $ct;
		// defaults
		$activated = false;
		$deleted   = false;
		
		// check if action is set
		if( isset( $_GET['action'] ) && ! empty( $_GET['action'] ) ) {
			// action can activate or delete a theme
			switch( $_GET['action'] ) {
				// activate theme
				case 'activate':
					$activated = $this->activate_theme();
					break;
					// delete theme
				case 'delete':
					$deleted = $this->delete_theme();
					break;
			}
		}

		$_list_table = $this->_registry->get( 'theme.list' );
		$_list_table->prepare_items();
		
		$args = array(
			'activated'     => $activated,
			'deleted'       => $deleted,
			'ct'            => $ct,
			'wp_list_table' => $_list_table,
			'page_title'    =>
			__( 'All-in-One Event Calendar: Themes', AI1EC_PLUGIN_NAME ),
		);
		
		add_thickbox();
		wp_enqueue_script( 'theme-preview' );
		$loader = $this->_registry->get( 'theme.loader' );
		
		$file   = $loader->get_file( 'themes.php', $args, true );
		
		return $file->render();
	}


	/**
	 * activate_theme function
	 *
	 * @return bool
	 **/
	public function activate_theme() {
		check_admin_referer( 'switch-ai1ec_theme_' . $_GET['ai1ec_stylesheet'] );
		// Invalidate the cached data so that the next request recompiles the css
		$css_controller = $this->_registry->get( 'css.frontend' );
		$css_controller->invalidate_cache( null, false );
		update_option( 
			'ai1ec_current_theme',
			array( 
				'theme_dir'  => $_GET['ai1ec_theme_dir'],
				'theme_root' => $_GET['ai1ec_theme_root'],
				'legacy'     => $_GET['ai1ec_legacy'],
				'stylesheet' => $_GET['ai1ec_stylesheet'],
			)
		 );
		return true;
	}

	/**
	 * delete_theme function
	 *
	 * @return bool
	 **/
	public function delete_theme() {
		check_admin_referer( 'delete-ai1ec_theme_' . $_GET['ai1ec_template'] );
		if( ! current_user_can( 'delete_themes' ) )
			wp_die( __( 'Cheatin&#8217; uh?' ) );
	
		$this->remove_theme( $_GET['ai1ec_template'] );
		return true;
	}

	/**
	 * remove_theme function
	 *
	 * @return void
	 **/
	public function remove_theme( $template ) {
		global $wp_filesystem;
	
		if ( empty($template) )
			return false;
	
		ob_start();
		$redirect = wp_nonce_url(
			admin_url( AI1EC_THEME_SELECTION_BASE_URL ) .
			"&amp;action=delete&amp;ai1ec_template=$template", 'delete-ai1ec_theme_' . $template
		);
		if ( false === ($credentials = request_filesystem_credentials($redirect)) ) {
			$data = ob_get_contents();
			ob_end_clean();
			if ( ! empty($data) ){
				include_once( ABSPATH . 'wp-admin/admin-header.php');
				echo $data;
				include( ABSPATH . 'wp-admin/admin-footer.php');
				exit;
			}
			return;
		}
	
		if ( ! WP_Filesystem($credentials) ) {
			request_filesystem_credentials($redirect, '', true); // Failed to connect, Error and request again
			$data = ob_get_contents();
			ob_end_clean();
			if ( ! empty($data) ) {
				include_once( ABSPATH . 'wp-admin/admin-header.php');
				echo $data;
				include( ABSPATH . 'wp-admin/admin-footer.php');
				exit;
			}
			return;
		}
	
		if ( ! is_object($wp_filesystem) )
			return new WP_Error('fs_unavailable', __('Could not access filesystem.'));
	
		if ( is_wp_error($wp_filesystem->errors) && $wp_filesystem->errors->get_error_code() )
			return new WP_Error('fs_error', __('Filesystem error.'), $wp_filesystem->errors);
	
		// Get the base plugin folder
		$themes_dir = $wp_filesystem->wp_content_dir() . AI1EC_THEMES_FOLDER . '/';
		if ( empty($themes_dir) )
			return new WP_Error('fs_no_themes_dir', __('Unable to locate WordPress theme directory.'));
	
		$themes_dir = trailingslashit( $themes_dir );
		$theme_dir = trailingslashit( $themes_dir . $template );
	
		$deleted = $wp_filesystem->delete($theme_dir, true);
	
		if ( ! $deleted )
			return new WP_Error('could_not_remove_theme', sprintf(__('Could not fully remove the theme %s.'), $template) );
	
		return true;
	}

	public function add_page() {
		global $submenu;
		// ===============
		// = Themes Page =
		// ===============
		$themes_page = add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			__( 'Calendar Themes', AI1EC_PLUGIN_NAME ),
			__( 'Calendar Themes', AI1EC_PLUGIN_NAME ),
			'switch_ai1ec_themes',
			AI1EC_PLUGIN_NAME . '-themes',
			array( $this, 'display_page' )
		);
		if ( false !== $themes_page ) {
			// Make copy of Themes page at its old location.
			$submenu['themes.php'][] = array(
				__( 'Calendar Themes', AI1EC_PLUGIN_NAME ),
				'switch_ai1ec_themes',
				AI1EC_THEME_SELECTION_BASE_URL,
			);
		}
	}
	public function handle_post() {
	}
}

?>