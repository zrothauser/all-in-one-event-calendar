<?php
class Ai1ec_Command_Save_Settings extends Ai1ec_Command {
	public function is_this_to_execute() {
		$params = $this->get_parameters();
		if ( false === $params ) {
			return false;
		}
		if ( $params['controller'] === 'front' &&
 			$params['action'] === 'ai1ec_save_settings' ) {
			if ( isset( $_POST['ai1ec_save_settings'] ) ) {
				$pass = wp_verify_nonce( 
					$_POST[Ai1ec_View_Admin_Settings::NONCE_NAME], 
					Ai1ec_View_Admin_Settings::NONCE_ACTION
				);
				if ( ! $pass ) {
					wp_die( "Failed security check" );
				}
				return true;
			}
		}
		return false;
	}
	public function set_render_strategy( Ai1ec_Request_Parser $request ) {
		$this->_render_strategy = $this->_registry->get(
			'http.response.render.strategy.redirect'
		);
	}
	public function do_execute() {
		$settings = $this->_registry->get( 'model.settings' );
		$options = $settings->get_options();
		if( isset( $_POST['default_tags'] ) || 
				isset( $_POST['default_categories'] ) ) {
			$_POST['default_tags_categories'] = true;
		}
		foreach ( $options as $name => $data ) {
			if ( isset( $_POST[$name] ) ) {
				$value = null;
				if ( isset( $data['renderer']['validator'] ) ) {
					$validator = $this->_registry->get(
						'validator.' . $data['renderer']['validator'],
						$_POST[$name]
					);
					try {
						$value = $validator->validate();
					} catch ( Ai1ec_Value_Not_Valid_Exception $e ) {
						fb($e);
						// don't save
						continue;
						die();
					}
				} else {
					switch ( $data['type'] ) {
						case 'bool';
							$value = (bool)$_POST[$name];
							break;
						case 'int';
							$value = (int)$_POST[$name];
							break;
						case 'string';
							$value = (string)$_POST[$name];
							break;
						case 'array';
							$method = '_handle_saving_' . $name;
							$value = $this->$method();
						break;
						case 'mixed';
							$method = '_handle_saving_' . $name;
							$value = $this->$method( $_POST[$name] );
						break;
					}
				}
				if ( null !== $value ) {
					$settings->set( $name, $value );
				}
			}
		}

		return array(
			'url' => admin_url( 
				'edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-settings'
			),
			'query_args' => array(
				'updated' => 1
			)
		);
	}
	protected function _handle_saving_default_tags_categories() {
		return array(
			'tags' => isset( $_POST['default_tags'] ) ? 
				$_POST['default_tags'] : 
				array(),
			'categories' => isset( $_POST['default_categories'] ) ? 
				$_POST['default_categories'] : 
				array(),
		);
	}
	protected function _handle_saving_calendar_page_id( $calendar_page ) {
		if ( ! is_numeric( $calendar_page ) &&
			preg_match( '#^__auto_page:(.*?)$#', $calendar_page, $matches ) 
		) {
			return wp_insert_post(
				array(
					'post_title'     => $matches[1],
					'post_type'      => 'page',
					'post_status'    => 'publish',
					'comment_status' => 'closed'
				)
			);
		} else {
			return (int)$calendar_page;
		}
	}
}

?>