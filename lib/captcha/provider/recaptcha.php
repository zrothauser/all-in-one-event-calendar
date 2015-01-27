<?php

/**
 * ReCaptcha provider.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Captcha.Provider
 */
class Ai1ec_Captcha_Recaptcha_Provider extends Ai1ec_Captcha_Provider {

	/**
	 * Whether provider is configured or not.
	 *
	 * @var bool
	 */
	protected $_is_configured;

	/**
	 * Returns settings array.
	 *
	 * @param bool $enable_rendering Whether setting HTML will be rendered or not.
	 *
	 * @return array Array of settings.
	 */
	public function get_settings( $enable_rendering = true ) {

		return array(
			'google_recaptcha_public_key'  => array(
				'type'     => 'string',
				'version'  => AI1ECFS_PLUGIN_NAME,
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'extensions',
					'item'      => 'interactive',
					'type'      => 'normal',
					'label'     => __(
						'reCAPTCHA public key:',
						AI1ECFS_PLUGIN_NAME
					),
					'condition' => $enable_rendering,
				),
				'value'    => '',
			),
			'google_recaptcha_private_key' => array(
				'type'     => 'string',
				'version'  => AI1ECFS_PLUGIN_NAME,
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'extensions',
					'item'      => 'interactive',
					'type'      => 'normal',
					'label'     => __(
						'reCAPTCHA private key:',
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
		$args = array(
			'verification_words' => Ai1ec_I18n::__( 'Verification words' ),
			'loading_recaptcha'  => Ai1ec_I18n::__( 'Loading reCAPTCHA...' ),
			'recaptcha_key'      => $this->_settings->get(
				'google_recaptcha_public_key'
			),
		);

		return $this->_theme_loader->get_file(
			'captcha/recaptcha/challenge.twig',
			$args,
			false
		)->get_content();
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
		return 'Google ReCaptcha';
	}
}