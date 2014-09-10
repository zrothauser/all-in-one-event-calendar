<?php

/**
 * The Calendar Add-ons page.
 *
 * @author     Time.ly Network Inc.
 * @since      2.1
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
class Ai1ec_View_Add_Ons extends Ai1ec_View_Admin_Abstract {
	/**
	 * Adds page to the menu.
	 *
	 * @wp_hook admin_menu
	 *
	 * @return void
	 */
	public function add_page() {
		// =======================
		// = Calendar Add Ons Page =
		// =======================
		$addons_list = add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			Ai1ec_I18n::__( 'Add Ons' ),
			Ai1ec_I18n::__( 'Add Ons' ),
			'manage_ai1ec_feeds',
			AI1EC_PLUGIN_NAME . '-add-ons',
			array( $this, 'display_page' )
		);
	}
	/**
	 * Display Add Ons list page.
	 *
	 * @return void
	 */
	public function display_page() {
		wp_enqueue_style(
			'ai1ec_addons.css',
			AI1EC_ADMIN_THEME_CSS_URL . 'addons.css',
			array(),
			AI1EC_VERSION
		);
		ob_start(); ?>
		<div class="wrap" id="ai1ec-add-ons">
			<h2>
				<?php echo Ai1ec_I18n::__( 'Add Ons for All In One Event Calendar' ); ?>
				&nbsp;&mdash;&nbsp;<a href="https://time.ly/downloads/" class="button-primary" title="<?php echo Ai1ec_I18n::__( 'Browse All Extensions' ); ?>" target="_blank"><?php echo Ai1ec_I18n::__( 'Browse All Extensions' ); ?></a>
			</h2>
			<p><?php echo Ai1ec_I18n::__( 'These add-ons extend the functionality of All In One Event Calendar.' ); ?></p>
			<?php
				if ( false === ( $cache = get_transient( 'ai1ec_addons_listxx' ) ) ) {
					$feed = wp_remote_get( 'https://time.ly/?action=addons_list', array( 'sslverify' => false ) );
					if ( ! is_wp_error( $feed ) ) {
						if ( isset( $feed['body'] ) && strlen( $feed['body'] ) > 0 ) {
							$cache = wp_remote_retrieve_body( $feed );
							set_transient( 'ai1ec_addons_list', $cache, 3600 );
						}
					} else {
						$cache = '<div class="error"><p>' . Ai1ec_I18n::__( 'There was an error retrieving the extensions list from the server. Please try again later.' ) . '</div>';
					}
				}
				echo json_decode( $cache );
			?>
		</div>
		<?php
		echo ob_get_clean();
	}

	public function add_meta_box() {
	}

	public function display_meta_box( $object, $box ) {
	}

	public function handle_post() {
	}

}