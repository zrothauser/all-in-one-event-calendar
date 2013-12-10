<?php

/**
 * The Theem options page.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Less
 */
class Ai1ec_View_Theme_Options extends Ai1ec_View_Admin_Abstract {

	/**
	 * @var string The nonce action
	 */
	CONST NONCE_ACTION = 'ai1ec_theme_options_save';
	
	/**
	 * @var string The nonce name
	 */
	CONST NONCE_NAME  = 'ai1ec_theme_options_nonce';

	const SUBMIT_ID = 'ai1ec_save_themes_options';
	
	const RESET_ID = 'ai1ec_reset_themes_options';

	/**
	 * @var string
	 */
	public $title;

	/**
	 * @var string
	 */
	public $meta_box_id;

	/**
	 * Adds the page to the correct menu.
	 */
	public function add_page() {

		$settings      = $this->_registry->get( 'model.settings' );

		$theme_options_page = add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			__( 'Theme Options', AI1EC_PLUGIN_NAME ),
			__( 'Theme Options', AI1EC_PLUGIN_NAME ),
			'manage_ai1ec_options',
			AI1EC_PLUGIN_NAME . '-edit-css',
			array( $this, 'display_page' )
		);

		if ( false !== $settings->get( 'less_variables_page' ) ) {
			// Make copy of Theme Options page at its old location.
			$submenu['themes.php'][] = array(
				__( 'Calendar Theme Options', AI1EC_PLUGIN_NAME ),
				'manage_ai1ec_options',
				AI1EC_THEME_OPTIONS_BASE_URL,
			);
		};

		// Add the 'General Settings' meta box.
		add_meta_box(
			'ai1ec-less-variables-tabs',
			Ai1ec_I18n::_x( 'Calendar Theme Options', 'meta box' ),
			array( $this, 'display_meta_box' ),
			$theme_options_page,
			'left',
			'default'
		);

		$settings->set( 'less_variables_page', $theme_options_page );
	}

	/**
	 * Display the page html
	 */
	public function display_page() {

		$settings = $this->_registry->get( 'model.settings' );

		$args = array(
			'title' => Ai1ec_I18n::__(
				'Calendar Theme Options'
			),
			'nonce' => array(
				'action'   => self::NONCE_ACTION,
				'name'     => self::NONCE_NAME,
				'referrer' => false,
			),
			'metabox' => array(
				'screen' => $settings->get( 'themes_option_page' ),
				'action' => 'left',
				'object' => null
			),
			'action' =>
				'?controller=front&action=ai1ec_save_theme_options&plugin=' . AI1EC_PLUGIN_NAME
		);


		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'theme-options/page.twig', $args, true );
		return $file->render();

	}

	/**
	 * Displays the meta box for the settings page.
	 *
	 * @param mixed $object
	 * @param mixed $box
	 */
	public function display_meta_box( $object, $box )  {

		$tabs = array(
			'general' => array(
				'name' => Ai1ec_I18n::__( 'General' ),
			),
			'table' => array(
				'name' => Ai1ec_I18n::__( 'Tables' ),
			),
			'buttons' => array(
				'name' => Ai1ec_I18n::__( 'Buttons' ),
			),
			'forms' => array(
				'name' => Ai1ec_I18n::__( 'Forms' ),
			),
			'calendar' => array(
				'name' => Ai1ec_I18n::__( 'Calendar general' ),
			),
			'posterboard' => array(
				'name' => Ai1ec_I18n::__( 'Posterboard view' ),
			),
			'stream' => array(
				'name' => Ai1ec_I18n::__( 'Stream view' ),
			),
			'month' => array(
				'name' => Ai1ec_I18n::__( 'Month/week/day view' ),
			),
			'agenda' => array(
				'name' => Ai1ec_I18n::__( 'Agenda view' ),
			),
		);

		$lessc           = $this->_registry->get( 'lessc' );

		$this->_registry
			->get( 'less.lessphp', $lessc  )
			->update_less_variables_on_theme_update();

		$less_variables  = $this->_registry
			->get( 'less.lessphp' )->get_saved_variables();
		$tabs            = $this->_get_tabs_to_show( $less_variables, $tabs );
		$loader          = $this->_registry->get( 'theme.loader' );
		$args            = array(
			'class' => 'tabs-left form-horizontal',
			'tabs'  => $tabs,
			'hide_name' => true,
			'submit' => array(
				'id'    => self::SUBMIT_ID,
				'value' => Ai1ec_I18n::__( 'Save Options' ),
				'args'  => array(
					'class' => 'button button-primary',
				),
			),
			'reset' => array(
				'id'    => self::RESET_ID,
				'value' => Ai1ec_I18n::__( 'Reset to defaults' ),
				'args'  => array(
					'class' => 'button',
				),
			),
		);
		$file = $loader->get_file( 'theme-options/bootstrap_tabs.twig', $args, true );
		$file->render();

	}

	/**
	 * Return the theme options tabs
	 *
	 * @param array $less_variables
	 * @param array $tabs list of tabs
	 *
	 * @return array the array of tabs to display
	 */
	protected function _get_tabs_to_show( array $less_variables, array $tabs) {

		// Inizialize the array of tabs that will be added to the layout
		$bootstrap_tabs_to_add = array();

		foreach( $tabs as $id => $tab ){
			$tab['elements'] = array();
			$bootstrap_tabs_to_add[$id] = $tab;
		}
		foreach ( $less_variables as $variable_id => $variable_attributes ) {
			$variable_attributes['id'] = $variable_id;
			$renderable = $this->_registry->get( 'less.variable.' . $variable_attributes['type'], $variable_attributes );
			$bootstrap_tabs_to_add[$variable_attributes['tab']]['elements'][] = array(
				'html' => $renderable->render()
			);

		}

		return $bootstrap_tabs_to_add;
	}

	/**
	 * Handle post, likely to be deprecated to use commands.
	 */
	public function handle_post()  {

	}
}