<?php

/**
 * Nocaptcha provider.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.
 */

class Ai1ec_Captcha_Nocaptcha_Provider extends Ai1ec_Captcha_Provider {

	/**
	 * Returns settings array.
	 *
	 * @param bool $enable_rendering Whether setting HTML will be rendered or not.
	 *
	 * @return array Array of settings.
	 */
	public function get_settings( $enable_rendering = true ) {
		return array(
			'google_nocaptcha_public_key'  => array(
				'type'     => 'string',
				'version'  => AI1ECFS_PLUGIN_NAME,
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'extensions',
					'item'      => 'interactive',
					'type'      => 'normal',
					'label'     => __(
						'noCAPTCHA public key:',
						AI1ECFS_PLUGIN_NAME
					),
					'condition' => $enable_rendering,
				),
				'value'    => '',
			),
			'google_nocaptcha_private_key' => array(
				'type'     => 'string',
				'version'  => AI1ECFS_PLUGIN_NAME,
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'extensions',
					'item'      => 'interactive',
					'type'      => 'normal',
					'label'     => __(
						'noCAPTCHA private key:',
						AI1ECFS_PLUGIN_NAME
					),
					'condition' => $enable_rendering,
				),
				'value'    => '',
			),
		);
	}

	/**
	 * Returns captcha challenge.
	 *
	 * @return mixed
	 */
	public function get_challenge() {
		// TODO: Implement get_challenge() method.
	}

	/**
	 * Validates challenge.
	 *
	 * @return mixed
	 */
	public function validate_challenge() {
		// TODO: Implement validate_challenge() method.
	}

	/**
	 * Returns provider name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Google Nocaptcha';
	}
}