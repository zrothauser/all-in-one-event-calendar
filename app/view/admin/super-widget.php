<?php

/**
 * The SuperWidget creator page.
 *
 * @author     Time.ly Network Inc.
 * @since      2.1
 *
 * @package    AI1ECSW
 * @subpackage AI1ECSW.View
 */
class Ai1ecsw_View_SuperWidget extends Ai1ec_View_Admin_Abstract {

	/**
	 * Adds page to the menu.
	 *
	 * @wp_hook admin_menu
	 *
	 * @return void
	 */
	public function add_page() {
		add_submenu_page(
			AI1EC_ADMIN_BASE_URL,
			__( 'Widget Creator', AI1ECSW_PLUGIN_NAME ),
			__( 'Widget Creator', AI1ECSW_PLUGIN_NAME ),
			'manage_ai1ec_feeds',
			AI1EC_PLUGIN_NAME . '-widget-creator',
			array( $this, 'display_page' )
		);
	}

	/**
	 * Display this plugin's feeds page in the admin.
	 *
	 * @return void
	 */
	public function display_page() {
		$this->_registry->get( 'css.admin' )->admin_enqueue_scripts(
			'ai1ec_event_page_all-in-one-event-calendar-settings'
		);
		$this->_registry->get( 'css.admin.super-widget' )->process_enqueue(
			array(
				array( 'style', 'super-widget.css', ),
			)
		);
		$args = array(
			'title' => __(
				'Widget Creator',
				AI1ECSW_PLUGIN_NAME
			),
			'metabox' => array(
				'screen' => 'ai1ec-super-widget',
				'action' => 'left',
				'object' => null
			),
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'widget-creator/page.twig', $args, true );
		$file->render();
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Settings::handle_post()
	 */
	public function handle_post() {
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Settings::add_meta_box()
	 */
	public function add_meta_box() {
		add_meta_box(
			'ai1ec-widget-creator',
			_x( 'Widget Creator', 'meta box', AI1ECSW_PLUGIN_NAME ),
			array( $this, 'display_meta_box' ),
			'ai1ec-super-widget',
			'left',
			'default'
		);
	}

	public function get_html_from_settings( array $settings ) {
		$named_elements = array();
		foreach ( $settings as $id => $setting ) {
			$named_elements[$id] = $this->_registry->get(
				'html.element.setting.' . $setting['renderer']['class'],
				array(
					'id'       => $id,
					'value'    => $setting['value'],
					'renderer' => $setting['renderer'],
				)
			)->render();
		}
		return $named_elements;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_View_Admin_Settings::display_meta_box()
	 */
	public function display_meta_box( $object, $box )  {
		$widgets = $this->_registry->get( 'controller.javascript-widget' )
			->get_widgets();
		$tabs = array();
		foreach ( $widgets as $widget_id => $widget_class ) {
			$widget = $this->_registry->get( $widget_class );
			$tabs[$widget_id] = array( 
				'name' => $widget->get_name(),
				'elements' => $this->get_html_from_settings(
					$widget->get_configurable_for_widget_creation()
				)
			);
		}
		$tabs['ai1ec-superwidget'] = array(
			'name' => 'Full Calendar',
			'elements' => $this->get_html_from_settings(
				$this->_get_additional_settings()
			)
		);



		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file(
			'widget-creator/super-widget-contents.twig',
			array(
				'tabs'            => $tabs,
				'siteurl'             => trailingslashit( get_site_url() ),
				'common_info'         => __( 'Use this tool to generate code snippets you can place on your site to embed the calendar and widgets.', AI1ECSW_PLUGIN_NAME ),
				'preview'             => __( 'Preview:', AI1ECSW_PLUGIN_NAME ),
				'full_calendar_title' => __( 'Full Calendar', AI1ECSW_PLUGIN_NAME ),
				'full_calendar_text'  => __( 'Use this option to embed this widget into a remote webpage (for example, a static HTML page hosted on a different server).', AI1ECSW_PLUGIN_NAME ),
				'paste_text'          => __( 'Paste this code onto your site:', AI1ECSW_PLUGIN_NAME ),
				'updated_code_text'   => __( 'Code will update when you change settings below. Learn more <a href="%s">here</a>.', AI1ECSW_PLUGIN_NAME )
			),
			true
		);
		$file->render();
	}

	/**
	 * Returns additional settings which are not settings but are used for
	 * rendering purposes.
	 *
	 * @return array Settings.
	 */
	protected function _get_additional_settings() {
		return array(
			'no_navigation' => array(
				'renderer' => array(
					'class'   => 'select',
					'label'   => __(
						'Navigation bar',
						AI1ECSW_PLUGIN_NAME
					),
					'options' => array(
						array(
							'text'  => __(
								'With Calendar',
								AI1ECSW_PLUGIN_NAME
							),
							'value' => ''
						),
						array(
							'text'  => __(
								'No navigation bar',
								AI1ECSW_PLUGIN_NAME
							),
							'value' => 'true'
						),
					),
				),
				'value' => 'calendar',
			),
			'display_filters' => array(
				'renderer' => array(
					'class' => 'select',
					'label' => __(
						'Filter bar',
						AI1ECSW_PLUGIN_NAME
					),
					'options' => array(
						array(
							'text'  => __(
								'With Calendar',
								AI1ECSW_PLUGIN_NAME
							),
							'value' => 'true'
						),
						array(
							'text'  => __(
								'No filter bar',
								AI1ECSW_PLUGIN_NAME
							),
							'value' => ''
						),
					),
				),
				'value' => '',
			),
			'superwidget_display_type' => array(
				'renderer' => array(
					'class' => 'select',
					'label' => Ai1ec_I18n::__(
						'Display type'
					),
					'options' => array(
						array(
							'text'  => __( 'Default', AI1ECSW_PLUGIN_NAME ),
							'value' => ''
						),
						array(
							'text'  => __( 'Agenda', AI1ECSW_PLUGIN_NAME ),
							'value' => 'agenda'
						),
						array(
							'text'  => __( 'Day', AI1ECSW_PLUGIN_NAME ),
							'value' => 'oneday'
						),
						array(
							'text'  => __( 'Month', AI1ECSW_PLUGIN_NAME ),
							'value' => 'month'
						),
						array(
							'text'  => __( 'Week', AI1ECSW_PLUGIN_NAME ),
							'value' => 'week'
						),
					),
				),
				'value' => '',
			),
			'action' => array(
				'renderer' => array(
					'class' => 'tags-categories',
					'label' => __(
						'Preselected calendar filters',
						AI1ECSW_PLUGIN_NAME
					),
					'help'  => __(
						'To clear, hold &#8984;/<abbr class="initialism">CTRL</abbr> and click selection.',
						AI1ECSW_PLUGIN_NAME
					)
				),
				'value' => array(
					'categories' => array(),
					'tags'       => array(),
				),
			),
		);
	}

}