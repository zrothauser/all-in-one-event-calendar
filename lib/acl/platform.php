<?php

/**
 * Platform-specific access control settings.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.acl
 */
class Ai1ec_Acl_Platform extends Ai1ec_Base {

	/**
	 * Modifies default role permissions.
	 *
	 * @return void
	 */
	public function modify_roles() {
		// Modify capabilities of most roles; remove roles if in platform mode,
		// or add them back if not.
		$ai1ec_settings = $this->_registry->get( 'model.settings' );
		$action         = 'add_cap';
		if ( $ai1ec_settings->get( 'event_platform_active' ) ) {
			$action = 'remove_cap';
		}

		$role_list      = array(
			'contributor',
			'author',
			'editor',
			'administrator',
		);
		$capabilities   = array();
		foreach ( $role_list as $role_name ) {
			$role = $this->get_role( $role_name );
			if ( null === $role ) {
				continue;
			}

			$capabilities = array_merge(
				$capabilities,
				$this->{'get_' . $role_name . 'capabilities'}()
			);
			foreach ( $capabilities as $capability ) {
				$role->{$action}( $capability );
			}
			// The admin must always be able to update themes
			if ( 'administrator' === $role_name ) {
				$role->add_cap( 'install_themes' );
			}
		}
	}

	public function get_role( $role_name ) {
		$role = get_role( $role_name );
		if ( null === $role || ! ( $role instanceof WP_Role ) ) {
			return null;
		}
		return $role;
	}

	public function get_administrator_capabilities() {
		return array(
			'activate_plugins',
			'delete_plugins',
			'delete_themes',
			'edit_dashboard',
			'edit_plugins',
			'edit_theme_options',
			'edit_themes',
			'export',
			'import',
			'install_plugins',
			'manage_options',
			'switch_themes',
		);
	}

	public function get_editor_capabilities() {
		return array(
			'delete_others_pages',
			'delete_others_posts',
			'delete_pages',
			'delete_private_pages',
			'delete_private_posts',
			'delete_published_pages',
			'edit_others_posts',
			'edit_pages',
			'edit_others_pages',
			'edit_private_pages',
			'edit_private_posts',
			'edit_published_pages',
			'manage_categories',
			'manage_links',
			'publish_pages',
			'read_private_pages',
			'read_private_posts',
		);
	}

	public function get_author_capabilities() {
		return array(
			'delete_published_posts',
			'edit_published_posts',
			'publish_posts',
		);
	}

	public function get_contributor_capabilities() {
		return array(
			'edit_posts',
			'delete_posts',
		);
	}

}