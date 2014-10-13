<?php

/**
 * Widget creator class interface.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Model
 */
interface Ai1ec_Widget_Creator {

	/**
	 * Returns widget name.
	 *
	 * @return string Widget name.
	 */
	public function get_name();

	/**
	 * Returns configurable info for widget creation.
	 *
	 * @return array Info.
	 */
	public function get_configurable_for_widget_creation();
}
