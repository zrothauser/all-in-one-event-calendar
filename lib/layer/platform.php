<?php

/**
 * Class for platform layer
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Layer
 */
class Ai1ec_Layer_Platform {

	/**
	 * Modifies default role permissions.
	 *
	 * @return void
	 */
	public function modify_roles() {
		$ai1ec_settings = $this->_registry->get( 'model.settings' );

		// Modify capabilities of most roles; remove roles if in platform mode,
		// or add them back if not.
		$action    = $ai1ec_settings->get( 'event_platform_active' )
		             ? 'remove_cap'
		             : 'add_cap';
		$role_list = array(
			'administrator',
			'editor',
			'author',
			'contributor'
		);
		foreach ( $role_list as $role_name ) {
			$role = get_role( $role_name );

			if ( NULL === $role || ! ( $role instanceof WP_Role ) ) {
				continue;
			}

			switch( $role_name ) {
				case 'administrator':
					$role->$action( 'activate_plugins' );
					$role->$action( 'delete_plugins' );
					$role->$action( 'delete_themes' );
					$role->$action( 'edit_dashboard' );
					$role->$action( 'edit_plugins' );
					$role->$action( 'edit_theme_options' );
					$role->$action( 'edit_themes' );
					$role->$action( 'export' );
					$role->$action( 'import' );
					$role->$action( 'install_plugins' );
					// The admin must always be able to update themes
					$role->add_cap( 'install_themes' );
					$role->$action( 'manage_options' );
					$role->$action( 'switch_themes' );

				case 'editor':
					$role->$action( 'delete_others_pages' );
					$role->$action( 'delete_others_posts' );
					$role->$action( 'delete_pages' );
					$role->$action( 'delete_private_pages' );
					$role->$action( 'delete_private_posts' );
					$role->$action( 'delete_published_pages' );
					$role->$action( 'edit_others_posts' );
					$role->$action( 'edit_pages' );
					$role->$action( 'edit_others_pages' );
					$role->$action( 'edit_private_pages' );
					$role->$action( 'edit_private_posts' );
					$role->$action( 'edit_published_pages' );
					$role->$action( 'manage_categories' );
					$role->$action( 'manage_links' );
					$role->$action( 'publish_pages' );
					$role->$action( 'read_private_pages' );
					$role->$action( 'read_private_posts' );

				case 'author':
					$role->$action( 'delete_published_posts' );
					$role->$action( 'edit_published_posts' );
					$role->$action( 'publish_posts' );

				case 'contributor':
					$role->$action( 'edit_posts' );
					$role->$action( 'delete_posts' );
			}
		}
	}

	/**
	 * Makes sure several calendar settings are set properly for Event Platform
	 * mode.
	 */
	public function check_settings() {
		$ai1ec_settings = $this->_registry->get( 'model.settings' );

		// Make sure a calendar page has been defined.
		if( ! $ai1ec_settings->get( 'calendar_page_id' ) ) {
			// Auto-create the page.
			$ai1ec_settings->set( 'calendar_page_id', $ai1ec_settings->auto_add_page( __( 'Calendar', AI1EC_PLUGIN_NAME ) ) );
		}

		// Make sure the defined calendar page is the default WordPress front page.
		update_option( 'page_on_front', $ai1ec_settings->get( 'calendar_page_id' ) );
	}

	/**
	 * Change meta boxes dashboard screen for Event Platform mode.
	 *
	 * @return  void
	 */
	public function modify_dashboard() {
		// Do not modify dashboard for super admins.
		if( current_user_can( 'super_admin' ) ) {
			return;
		}

		// Replace "Right Now" widget with our own.
		remove_meta_box( 'dashboard_right_now', 'dashboard', 'normal' );
		add_meta_box(
			'dashboard_right_now',
			__( 'Right Now' ),
			array( $this, 'dashboard_right_now' ),
			'dashboard',
			'side',
			'high'
		);

		// Remove other widgets.
		remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
		remove_meta_box( 'dashboard_incoming_links', 'dashboard', 'normal' );
		remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
		remove_meta_box( 'dashboard_recent_drafts', 'dashboard', 'side' );

		// Add "Calendar Tasks" widget.
		add_meta_box(
			'ai1ec-calendar-tasks',
			_x( 'Calendar Tasks', 'meta box', AI1EC_PLUGIN_NAME ),
			array( $this, 'calendar_tasks_meta_box' ),
			'dashboard',
			'normal',
			'high'
		);
	}

	/**
	 * Custom "Right Now" dashboard widget for Calendar Administrators.
	 *
	 * @return  void
	 */
	public function dashboard_right_now() {
		$title    = null;
		$content  = null;
		$num_comm = wp_count_comments();

		// Check if search engines are blocked.
		if (
				! is_network_admin() &&
				! is_user_admin() &&
				current_user_can('manage_options') &&
				'1' != Ai1ec_Meta::get_option( 'blog_public' )
		) {
				$title   = apply_filters('privacy_on_link_title', __('Your site is asking search engines not to index its content') );
				$content = apply_filters('privacy_on_link_text', __('Search Engines Blocked') );
		}

		// Get Output buffering
		$ob = $this->_registry->get( 'compatibility.ob' );

		$ob->start();
		do_action( 'right_now_content_table_end' );
		$right_now_content_table_end = $ob->get_clean();

		$ob->start();
        do_action( 'right_now_table_end' );
		$right_now_table_end = $ob->get_clean();

		$ob->start();
        do_action( 'right_now_discussion_table_end' );
		$right_now_discussion_table_end = $ob->get_clean();

		$ob->start();
		do_action( 'ai1ec_rightnow_end' );
		$ai1ec_rightnow_end = $ob->get_clean();

		$ob->start();
		do_action( 'activity_box_end' );
		$activity_box_end = $ob->get_clean();

		$args = array(
			'user_can'                       => current_user_can( 'moderate_comments' ),
			'total_comments'                 => number_format_i18n( $num_comm->total_comments ),
			'total_comments_label'           => _n( 'Comment', 'Comments', $num_comm->total_comments ),
			'approved_comments'              => number_format_i18n( $num_comm->approved ),
			'approved_comments_label'        => _nx( 'Approved', 'Approved', $num_comm->approved, 'Right Now' ),
			'moderated_comments'             => number_format_i18n( $num_comm->moderated ) . '</span>',
			'moderated_comments_label'       => _n( 'Pending', 'Pending', $num_comm->moderated ),
			'spam_comments'                  => number_format_i18n( $num_comm->spam ),
			'spam_comments_label'            => _nx( 'Spam', 'Spam', $num_comm->spam, 'comment' ),
			'sub_label'                      => _( 'Content' ),
			'discussion_label'               => _( 'Discussion' ),
			'message'                        => sprintf( __('You are using <span class="b">All-in-One Event Calendar %s</span>.'), AI1EC_VERSION ),
			'title'                          => $title,
			'content'                        => $content,
			'right_now_content_table_end'    => $right_now_content_table_end,
			'right_now_table_end'            => $right_now_table_end,
			'right_now_discussion_table_end' => $right_now_discussion_table_end,
			'ai1ec_rightnow_end'             => $ai1ec_rightnow_end,
			'activity_box_end'               => $activity_box_end,
		);

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/dashboard_right_now.twig',
			$args,
			false
		);

		echo $template->get_content();
	}

	/**
	 * Renders the contents of the Calendar Tasks meta box.
	 *
	 * @return void
	 */
	public function calendar_tasks_meta_box( $object, $box ) {
		$args = array(
			'welcome'                 => _( 'Welcome', AI1EC_PLUGIN_NAME ),
			'description'		      => _( 'to the All-in-One Event Calendar by <a href="http://time.ly/" target="_blank">Timely</a>', AI1EC_PLUGIN_NAME ),
			'post_event_label'        => _( 'Post Your Event', AI1EC_PLUGIN_NAME ),
			'add_event_label'         => _( 'Add a new event to the calendar.', AI1EC_PLUGIN_NAME ),
			'manage_event_label'      => _( 'Manage Events', AI1EC_PLUGIN_NAME ),
			'view_events_label'       => _( 'View and edit all your events.', AI1EC_PLUGIN_NAME ),
			'manage_categories_label' => _( 'Manage Event Categories', AI1EC_PLUGIN_NAME ),
			'organize_events_label'   => _( 'Organize and color-code your events.', AI1EC_PLUGIN_NAME ),
			'choose_theme_label'      => _( 'Choose Your Theme', AI1EC_PLUGIN_NAME ),
			'change_theme_label'      => _( 'Change the look and feel.', AI1EC_PLUGIN_NAME ),
			'manage_feeds_label'      => _( 'Manage Calendar Feeds', AI1EC_PLUGIN_NAME ),
			'subscribe_label'         => _( 'Subscribe to other calendars.', AI1EC_PLUGIN_NAME ),
			'edit_settings_label'     => _( 'Edit Calendar Settings', AI1EC_PLUGIN_NAME ),
			'calendar_label'          => _( 'Make this calendar your own.', AI1EC_PLUGIN_NAME ),
			'add_allowed'             => current_user_can( 'edit_ai1ec_events' ),
			'edit_allowed'            => current_user_can( 'edit_ai1ec_events' ),
			'categories_allowed'      => current_user_can( 'manage_events_categories' ),
			'themes_allowed'          => current_user_can( 'manage_ai1ec_options' ),
			'feeds_allowed'           => current_user_can( 'manage_ai1ec_options' ),
			'settings_allowed'        => current_user_can( 'manage_ai1ec_options' ),
			'add_url'                 => admin_url( 'post-new.php?post_type=' . AI1EC_POST_TYPE ),
			'edit_url'                => admin_url( AI1EC_ADMIN_BASE_URL ),
			'categories_url'          => admin_url( 'edit-tags.php?taxonomy=events_categories&post_type=' . AI1EC_POST_TYPE ),
			'themes_url'              => admin_url( AI1EC_THEME_SELECTION_BASE_URL ),
			'feeds_url'               => admin_url( AI1EC_FEED_SETTINGS_BASE_URL ),
			'settings_url'            => admin_url( AI1EC_SETTINGS_BASE_URL ),
		);

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/calendar-tasks.twig',
			$args,
			false
		);

		echo $template->get_content();
	}

	/**
	 * Adds "Site Title" option to Ai1ec general settings.
	 *
	 * @return void
	 */
	public function ai1ec_general_settings_before() {
		$site_title = _( 'Site Title' );
		$blog_name = get_option( 'blogname' );

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/general-settings.twig',
			compact( 'site_title', 'blog_name' ),
			false
		);

		echo $template->get_content();
	}

	/**
	 * Saves the "Site Title" option.
	 *
	 * @param string $settings_page 'settings' or 'feeds'; refers to corresponding saved page.
	 * @param array  $params         Settings that were saved in key => value structure
	 */
	public function ai1ec_save_settings( $settings_page, $params ) {
		// When you activate the platfrom mode for the first time, the field is not present so do not save.
		if( $settings_page === 'settings' && isset( $_POST['blogname'] ) ) {
			// Do essentially the same thing WP does when it saves the blog name.
			$value = trim($params['blogname']);
			$value = stripslashes_deep($value);
			update_option( 'blogname', $value );
		}
	}
}
