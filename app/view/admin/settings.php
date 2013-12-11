<?php

/**
 * The Settings page.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
class Ai1ec_View_Admin_Settings extends Ai1ec_View_Admin_Abstract {
	
	/**
	 * @var string The nonce action
	 */
	CONST NONCE_ACTION = 'ai1ec_settings_save';

	/**
	 * @var string The nonce name
	 */
	CONST NONCE_NAME  = 'ai1ec_settings_nonce';

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Abstract::display_page()
	 */
	public function display_page() {
		$settings = $this->_registry->get( 'model.settings' );
		$args = array(
			'title' => Ai1ec_I18n::__(
				'All-in-One Event Calendar: Calendar Feeds'
			),
			'nonce' => array(
				'action'   => self::NONCE_ACTION,
				'name'     => self::NONCE_NAME,
				'referrer' => false,
			),
			'metabox' => array(
				'screen' => $settings->get( 'settings_page' ),
				'action' => 'left',
				'object' => null
			),
			'action' => 
				'?controller=front&action=ai1ec_save_settings&plugin=' . AI1EC_PLUGIN_NAME
			,
			'submit' => array(
				'id'    => 'ai1ec_save_settings',
				'value' => Ai1ec_I18n::__( 'Update Settings' ),
				'args'  => array(
					'class' => 'button button-primary',
				),
			),
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'setting/page.twig', $args, true );
		$file->render();
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Abstract::add_page()
	 */
	public function add_page() {
		$settings      = $this->_registry->get( 'model.settings' );
		$settings_page = add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			Ai1ec_I18n::__( 'Settings' ),
			Ai1ec_I18n::__( 'Settings' ),
			'manage_ai1ec_options',
			AI1EC_PLUGIN_NAME . '-settings',
			array( $this, 'display_page' )
		);
		// Add the 'General Settings' meta box.
		add_meta_box(
			'ai1ec-general-settings',
			Ai1ec_I18n::_x( 'General Settings', 'meta box' ),
			array( $this, 'display_meta_box' ),
			$settings_page,
			'left',
			'default'
		);
		$settings->set( 'settings_page', $settings_page );
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Abstract::handle_post()
	 */
	public function handle_post() {
	}

	/**
	 * Displays the meta box for the settings page.
	 * 
	 * @param mixed $object
	 * @param mixed $box
	 */
	public function display_meta_box( $object, $box )  {
		$tabs = array(
			'viewing-events' => array(
				'name' => Ai1ec_I18n::__( 'Viewing Events' ),
			),
			'editing-events' => array(
				'name' => Ai1ec_I18n::__( 'Adding/Editing Events' ),
			),
			'advanced' => array(
				'name' => Ai1ec_I18n::__( 'Advanced' ),
				'items' => array(
					'advanced' => Ai1ec_I18n::__( 'Advanced Settings' ),
					'email'    => Ai1ec_I18n::__( 'E-mail Templates' ),
					'apis'     => Ai1ec_I18n::__( 'External Services' ),
				),
				'items_active' => array(),
			),
		);

		// let other extensions add tabs.
		$tabs            = apply_filters( 'ai1ec_add_setting_tabs', $tabs );
		$settings        = $this->_registry->get( 'model.settings' );
		$plugin_settings = $settings->get_options();
		$tabs            = $this->_get_tabs_to_show( $plugin_settings, $tabs );
		$loader          = $this->_registry->get( 'theme.loader' );
		$args            = array(
			'tabs' => $tabs,
		);

		$file = $loader->get_file( 'bootstrap_tabs.twig', $args, true );
		$file->render();
	}

	/**
	 * Based on the plugin options, decides what tabs to render.
	 * 
	 * 
	 * 
	 * @param array $plugin_settings
	 * @param array $tabs
	 * 
	 * @return array
	 */
	protected function _get_tabs_to_show( array $plugin_settings, array $tabs ) {
		foreach ( $plugin_settings as $id => $setting ) {
			// if the setting is shown
			if ( isset ( $setting['renderer'] ) ) {
				// check if it's the first one
				if (
					! isset ( $tabs[$setting['renderer']['tab']]['elements'] )
				) {
					$tabs[$setting['renderer']['tab']]['elements'] = array();
				}
				// get the renderer
				$renderer_name = $setting['renderer']['class'];
				$setting['id'] = $id;
				$renderer      = null;
				try {
					$renderer = $this->_registry->get(
						'html.element.setting.' . $renderer_name,
						$setting
					);
				} catch ( Ai1ec_Bootstrap_Exception $exception ) {
					$renderer = $this->_registry->get(
						'html.element.setting.input',
						$setting
					);
				}
				// render the settings
				$tabs[$setting['renderer']['tab']]['elements'][] = array(
					'html' => $renderer->render()
				);
				// if the settings has an item tab, set the item as active.
				if ( isset( $setting['renderer']['item'] ) ) {
					if ( ! isset( $tabs[$setting['renderer']['tab']]['items_active'][$setting['renderer']['item']] ) ) {
						$tabs[$setting['renderer']['tab']]['items_active'][$setting['renderer']['item']] = true;
					}
				}
			}
		}
		$tabs_to_display = array();
		// now let's see what tabs to display.
		foreach ( $tabs as $name => $tab ) {
			// if a tab has more than one item.
			if ( isset( $tab['items'] ) ) {
				// if no item is active, nothing is shown
				if ( empty( $tab['items_active'] ) ) {
					continue;
				}
				// if only one item is active, do not use the dropdown
				if ( count( $tab['items_active'] ) === 1 ) {
					
					$name = key($tab['items_active']);
					$tab['name'] = $tab['items'][$name];
					unset ( $tab['items'] );
				} else {
					// check active items for the dropdown
					foreach ( $tab['items'] as &$item ) {
						if ( ! isset( $tab['items_active'][$item] ) ) {
							unset( $item );
						}
					}
				}
				$tabs_to_display[$name] = $tab;
			} else {
				// no items, just check for any element to display.
				if ( isset( $tab['elements'] ) ) {
					$tabs_to_display[$name] = $tab;
				}
			}
		}
		return $tabs_to_display;
	}

}