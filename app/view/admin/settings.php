<?php
class Ai1ec_View_Admin_Settings extends Ai1ec_View_Admin_Abstract {
	public function display_page() {
		$settings = $this->_registry->get( 'model.settings' );
		$args = array(
				'title'             => __(
					'All-in-One Event Calendar: Calendar Feeds',
					AI1EC_PLUGIN_NAME
				),
				'nonce' => array(
					'action' => 'meta-box-order',
					'name' => 'meta-box-order-nonce',
					'referrer' => false,
				),
				'metabox' => array(
					'screen' => $settings->get( 'settings_page' ),
					'action' => 'left',
					'object' => null
				
				),
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file = $loader->get_file( 'base_page.twig', $args, true );
		$file->render();
	}

	public function add_page() {
		$settings = $this->_registry->get( 'model.settings' );
		$settings_page = add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			__( 'Settings', AI1EC_PLUGIN_NAME ),
			__( 'Settings', AI1EC_PLUGIN_NAME ),
			'manage_ai1ec_options',
			AI1EC_PLUGIN_NAME . '-settings',
			array( $this, 'display_page' )
		);
		// Add the 'General Settings' meta box.
		add_meta_box(
			'ai1ec-general-settings',
			_x( 'General Settings', 'meta box', AI1EC_PLUGIN_NAME ),
			array( $this, 'display_meta_box' ),
			$settings_page,
			'left',
			'default'
		);
		$settings->set( 'settings_page', $settings_page );

	}
	public function handle_post() {
	}
	public function display_meta_box( $object, $box ) {
		echo 'meta!';
	}
}

?>