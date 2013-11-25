<?php
/**
 * Render the request as ical.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http.Response.Render.Strategy
 */
class Ai1ec_Render_Strategy_Ical extends Ai1ec_Http_Response_Render_Strategy {
	public function render( array $params ) {
		header( 'Content-type: text/calendar; charset=utf-8' );
		echo $params['data'];
		return Ai1ec_Http_Response_Helper::stop( 0 );
	}
}