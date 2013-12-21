<?php

/**
 * Dashboard view elements.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
class Ai1ec_View_Admin_Dashboard extends Ai1ec_Base {

	/**
	 * Renders the contents of the Calendar Tasks meta box.
	 *
	 * @return void
	 */
	public function platform_calendar_tasks_meta_box( $object, $box ) {
		$tasks = array(
			'add_event' => array(
				'url'        => admin_url(
					'post-new.php?post_type=' . AI1EC_POST_TYPE
				),
				'allowed'    => current_user_can( 'edit_ai1ec_events' ),
				'title'      => Ai1ec_I18n::__( 'Post Your Event' ),
				'help'       => Ai1ec_I18n::__( 'Add a new event to the calendar.' ),
				'link_class' => 'btn-primary btn-large',
				'icon'       => 'icon-plus',
			),
			'edit_event' => array(
				'url'        => admin_url( AI1EC_ADMIN_BASE_URL ),
				'allowed'    => current_user_can( 'edit_ai1ec_events' ),
				'title'      => Ai1ec_I18n::__( 'Manage Events' ),
				'help'       => Ai1ec_I18n::__( 'View and edit all your events.' ),
				'link_class' => 'btn-primary btn-large',
				'icon'       => 'icon-pencil',
			),
			'manage_categories' => array(
				'url'     => admin_url(
					'edit-tags.php?taxonomy=events_categories&post_type=' .
					AI1EC_POST_TYPE
				),
				'allowed' => current_user_can( 'manage_events_categories' ),
				'title'   => Ai1ec_I18n::__( 'Manage Event Categories' ),
				'help'    => Ai1ec_I18n::__( 'Organize and color-code your events.' ),
				'icon'    => 'icon-tags icon-large',
			),
			'choose_themes' => array(
				'url'     => admin_url( AI1EC_THEME_SELECTION_BASE_URL ),
				'allowed' => current_user_can( 'manage_ai1ec_options' ),
				'title'   => Ai1ec_I18n::__( 'Choose Your Theme' ),
				'help'    => Ai1ec_I18n::__( 'Change the look and feel.' ),
				'icon'    => 'icon-leaf icon-large',
			),
			'modify_settings' => array(
				'url'     => admin_url( AI1EC_SETTINGS_BASE_URL ),
				'allowed' => current_user_can( 'manage_ai1ec_options' ),
				'title'   => Ai1ec_I18n::__( 'Edit Calendar Settings' ),
				'help'    => Ai1ec_I18n::__( 'Make this calendar your own.' ),
				'icon'    => 'icon-cog icon-large',
			),
		);

		$tasks = apply_filters( 'ai1ec_platform_tasks_list', $tasks );

		$argv = array(
			'tasks' => array(),
		);
		foreach ( $tasks as $task ) {
			if ( $task['allowed'] ) {
				$argv['tasks'][] = $task;
			}
		}

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'calendar_tasks.twig',
			$argv,
			true
		);

		echo $template->get_content();
	}

	/**
	 * Custom "Right Now" dashboard widget for Calendar Administrators.
	 *
	 * @return  void
	 */
	public function platform_dashboard_right_now() {
		$title    = null;
		$content  = null;
		$num_comm = wp_count_comments();
		$option = $this->_registry->get( 'model.option' );

		// Check if search engines are blocked.
		if (
			! is_network_admin() &&
			! is_user_admin() &&
			current_user_can('manage_options') &&
			'1' != $option->get( 'blog_public' )
		) {
			$title   = apply_filters(
				'privacy_on_link_title',
				__( 'Your site is asking search engines not to index its content' )
			);
			$content = apply_filters(
				'privacy_on_link_text',
				__( 'Search Engines Blocked' )
			);
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
			'message'                        => sprintf(
				Ai1ec_I18n::__(
					'You are using <span class="b">All-in-One Event Calendar %s</span>.'
				),
				AI1EC_VERSION
			),
			'title'                          => $title,
			'content'                        => $content,
			'right_now_content_table_end'    => $right_now_content_table_end,
			'right_now_table_end'            => $right_now_table_end,
			'right_now_discussion_table_end' => $right_now_discussion_table_end,
			'ai1ec_rightnow_end'             => $ai1ec_rightnow_end,
			'activity_box_end'               => $activity_box_end,
		);

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'dashboard_right_now.twig',
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
	public function platform_general_settings_before() {
		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'general-settings.twig',
			array( 'blog_name' => get_option( 'blogname' ), ),
			false
		);
		echo $template->get_content();
	}

	/**
	 * Change meta boxes dashboard screen for Event Platform mode.
	 *
	 * @return  void
	 */
	public function platform_dashboard() {
		// Do not modify dashboard for super admins.
		if ( current_user_can( 'super_admin' ) ) {
			return;
		}

		// Replace "Right Now" widget with our own.
		remove_meta_box( 'dashboard_right_now', 'dashboard', 'normal' );
		add_meta_box(
			'dashboard_right_now',
			__( 'Right Now' ),
			array( $this, 'platform_dashboard_right_now' ),
			'dashboard',
			'side',
			'high'
		);

		// Remove other widgets.
		remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
		remove_meta_box( 'dashboard_incoming_links',  'dashboard', 'normal' );
		remove_meta_box( 'dashboard_quick_press',     'dashboard', 'side' );
		remove_meta_box( 'dashboard_recent_drafts',   'dashboard', 'side' );

		// Add "Calendar Tasks" widget.
		add_meta_box(
			'ai1ec-calendar-tasks',
			Ai1ec_I18n::_x( 'Calendar Tasks', 'meta box' ),
			array( $this, 'platform_calendar_tasks_meta_box' ),
			'dashboard',
			'normal',
			'high'
		);
	}

	/**
	 * Add Events items to "Right Now" widget in Dashboard.
	 *
	 * @return  void
	 */
	public function right_now_content_table_end() {
		$num_events = wp_count_posts( AI1EC_POST_TYPE );
		$num_cats   = wp_count_terms( 'events_categories' );
		$num_tags   = wp_count_terms( 'events_tags' );

		// Events.
		$num  = number_format_i18n( $num_events->publish );
		$text = _n( 'Event', 'Events', $num_events->publish );
		if ( current_user_can( 'edit_ai1ec_events' ) ) {
			$num = '<a href="' . AI1EC_ADMIN_BASE_URL . '">' . $num . '</a>';
			$text = '<a href="' . AI1EC_ADMIN_BASE_URL . '">' . $text . '</a>';
		}
		echo '<td class="first b b-ai1ec-event">' . $num . '</td>';
		echo '<td class="t ai1ec-event">' . $text . '</td>';

		echo '</tr><tr>';

		// Event categories.
		$num = number_format_i18n( $num_cats );
		$text = _n( 'Event Category', 'Event Categories', $num_cats );
		if ( current_user_can( 'manage_events_categories' ) ) {
			$num = "<a href='edit-tags.php?taxonomy=events_categories'>$num</a>";
			$text = "<a href='edit-tags.php?taxonomy=events_categories'>$text</a>";
		}
		echo '<td class="first b b-events-categories">' . $num . '</td>';
		echo '<td class="t events-categories">' . $text . '</td>';

		echo '</tr><tr>';

		// Event tags.
		$num = number_format_i18n( $num_tags );
		$text = _n( 'Event Tag', 'Event Tags', $num_tags );
		if ( current_user_can( 'manage_events_categories' ) ) {
			$num = "<a href='edit-tags.php?taxonomy=events_tags'>$num</a>";
			$text = "<a href='edit-tags.php?taxonomy=events_tags'>$text</a>";
		}
		echo '<td class="first b b-events-tags">' . $num . '</td>';
		echo '<td class="t events-tags">' . $text . '</td>';
	}

}