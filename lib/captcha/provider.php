<?php

/**
 * Ai1ec_Captcha_Provider interface.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Captcha
 */

abstract class Ai1ec_Captcha_Provider extends Ai1ec_Base {

	/**
	 * Returns settings array.
	 *
	 * @param bool $enable_rendering Whether setting HTML will be rendered or not.
	 *
	 * @return array Array of settings.
	 */
	abstract public function get_settings( $enable_rendering = true );

	/**
	 * Returns captcha challenge.
	 *
	 * @return mixed
	 */
	abstract public function get_challenge();

	/**
	 * Validates challenge.
	 *
	 * @return mixed
	 */
	abstract public function validate_challenge();

	/**
	 * Returns provider name.
	 *
	 * @return string
	 */
	abstract public function get_name();
}