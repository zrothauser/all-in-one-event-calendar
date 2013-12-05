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
class Ai1ec_View_Admin_Theme_Options extends Ai1ec_View_Admin_Abstract {

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

		$settings->set( 'themes_option_page', $theme_options_page );
	}

	/**
	 * Display the page html
	 */
	public function display_page() {

		/*
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
		*/
		$settings = $this->_registry->get( 'model.settings' );
		$args = array(
			'title' => Ai1ec_I18n::__(
				'Calendar Theme Options'
			),
			'metabox' => array(
				'screen' => $settings->get( 'themes_option_page' ),
				'action' => 'tabs-left',
				'object' => null
			),
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
		$less_variables  = $this->_registry
			->get( 'controller.lessphp', $lessc  )->get_saved_variables();
		$tabs            = $this->_get_tabs_to_show( $less_variables, $tabs );
		$loader          = $this->_registry->get( 'theme.loader' );
		$args            = array(
			'class' => "left",
			'tabs'  => $tabs,
		);
		$file = $loader->get_file( 'bootstrap_tabs.twig', $args, true );
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

		foreach($tabs as $id => $tab){
			$tab['elements'] = array();
			$tab['elements'][] = array('html' => "TEST");
			$bootstrap_tabs_to_add[$id] = $tab;
		}

		/*
		// initialize the array of tab bodyes that will be added to the tabs
		$tabs_bodies = array();
		foreach ( $tabs as $id => $description ) {

			$bootstrap_tabs_to_add['ai1ec-' . $id] =
				Ai1ec_Helper_Factory::create_bootstrap_tab_instance(
					$id,
					$description
				);
			$bootstrap_tabs_to_add['ai1ec-' . $id]
				->add_class( 'form-horizontal' );
			// create the main div that will hold all the variables
			$div = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
			$tabs_bodies['ai1ec-' . $id] = $div;
		}
		foreach ( $less_variables as $variable_id => $variable_attributes ) {
			$variable_attributes['id'] = $variable_id;
			$less_variable = Ai1ec_Less_Factory::create_less_variable(
				$variable_attributes['type'],
				$variable_attributes
			);
			$tabs_bodies['ai1ec-' . $variable_attributes['tab']]
				->add_renderable_children( $less_variable );
		}
		foreach ( $tabs_bodies as $tab => $div ) {
			$bootstrap_tabs_to_add[$tab]->add_renderable_children( $div );
		}
		foreach ( $bootstrap_tabs_to_add as $tab ) {
			$bootstrap_tabs_layout->add_renderable_children( $tab );
		}
		$this->add_renderable_children( $bootstrap_tabs_layout );

		$input = Ai1ec_Helper_Factory::create_input_instance();
		$input->set_type( 'submit' );
		$input->set_value( __( 'Save Options', AI1EC_PLUGIN_NAME ) );
		$input->set_name( Ai1ec_Less_Variables_Editing_Page::FORM_SUBMIT_NAME );
		$input->add_class( 'button-primary' );
		$reset_theme = Ai1ec_Helper_Factory::create_input_instance();
		$reset_theme->set_type( 'submit' );
		$reset_theme->set_value( __( 'Reset to defaults', AI1EC_PLUGIN_NAME ) );
		$reset_theme->set_name(
			Ai1ec_Less_Variables_Editing_Page::FORM_SUBMIT_RESET_THEME
		);
		$reset_theme->add_class( 'button' );
		$reset_theme->set_id( 'ai1ec-reset-variables' );
		$this->add_renderable_children( $input );
		$this->add_renderable_children( $reset_theme );
		*/
		return $bootstrap_tabs_to_add;
	}

	/**
	 * Handle post, likely to be deprecated to use commands.
	 */
	public function handle_post()  {

	}
}