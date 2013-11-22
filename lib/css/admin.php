<?php

/**
 * The class which handles Admin CSS.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Css
 */
class Ai1ec_Css_Admin  extends Ai1ec_Base {

	/**
	 * admin_enqueue_scripts function
	 *
	 * Enqueue any scripts and styles in the admin side, depending on context.
	 * 
	 * @wp-hook admin_enqueue_scripts
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts( $hook_suffix ) {
		$aco = $this->_registry->get( 'acl.aco' );
		$settings = $this->_registry->get( 'model.settings' );
		switch( $hook_suffix ) {
			// Event lists.
			// Widgets screen.
			case 'widgets.php':
				// Styles.
				wp_enqueue_style(
					'ai1ec-widget',
					AI1EC_ADMIN_THEME_CSS_URL . 'widget.css',
					array(),
					AI1EC_VERSION
				);
				break;

				// Calendar settings & feeds screens.
			case $settings->get( 'settings_page' ):
				// Scripts.
				wp_enqueue_script( 'common' );
				wp_enqueue_script( 'wp-lists' );
				wp_enqueue_script( 'postbox' );
				// Styles.
				wp_enqueue_style(
					'ai1ec-settings',
					AI1EC_ADMIN_THEME_CSS_URL . 'settings.css',
					array(),
					AI1EC_VERSION
				);
				wp_enqueue_style(
					'timely-bootstrap',
					AI1EC_ADMIN_THEME_CSS_URL . 'bootstrap.min.css',
					array(),
					AI1EC_VERSION
				);
				wp_enqueue_style(
					'timely-boootstrap-datepicker',
					AI1EC_ADMIN_THEME_CSS_URL . 'bootstrap_datepicker.css',
					array(),
					AI1EC_VERSION
				 );
				break;

			case $settings->get( 'feeds_page' ):
				// Scripts.
				wp_enqueue_script( 'common' );
				wp_enqueue_script( 'wp-lists' );
				wp_enqueue_script( 'postbox' );
				// Styles.
				wp_enqueue_style(
					'ai1ec-settings',
					AI1EC_ADMIN_THEME_CSS_URL . 'settings.css',
					array(),
					AI1EC_VERSION
				);
				wp_enqueue_style(
					'timely-bootstrap',
					AI1EC_ADMIN_THEME_CSS_URL . 'bootstrap.min.css',
					array(),
					AI1EC_VERSION
				);
				// include plugins style
				wp_enqueue_style(
					'ai1ec_plugins_common',
					AI1EC_ADMIN_THEME_CSS_URL . 'plugins/plugins-common.css',
					array(),
					AI1EC_VERSION
				);
				break;

			case "post.php":
			case "post-new.php":
				if( $aco->are_we_editing_our_post() ) {
					wp_enqueue_style(
						'timely-bootstrap',
						AI1EC_ADMIN_THEME_CSS_URL . 'bootstrap.min.css',
						array(),
						AI1EC_VERSION
					);
					// include add new event style
					wp_enqueue_style(
						'ai1ec_add_new_event',
						AI1EC_ADMIN_THEME_CSS_URL . 'add_new_event.css',
						array(),
						AI1EC_VERSION
					);
					// include datepicker style
					wp_enqueue_style(
						'ai1ec_datepicker',
						AI1EC_ADMIN_THEME_CSS_URL . 'datepicker.css',
						array(),
						AI1EC_VERSION
					);
				}
				break;

			case "edit-tags.php":
				wp_enqueue_style(
					'timely-bootstrap-colorpicker',
					AI1EC_ADMIN_THEME_CSS_URL . 'colorpicker.css',
					array(),
					AI1EC_VERSION
				);
				break;
		}
	}
}