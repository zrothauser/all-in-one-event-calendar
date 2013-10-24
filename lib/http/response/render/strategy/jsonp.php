<?php
/**
 * Render the request as jsonp.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http.Response.Render.Strategy
 */
class Ai1ec_Render_Strategy_Jsonp extends Ai1ec_Http_Response_Render_Strategy {

	/* (non-PHPdoc)
	 * @see Ai1ec_Http_Response_Render_Strategy::render()
	 */
	public function render( array $params ) {
		$this->_dump_buffers();
		header( 'HTTP/1.1 200 OK' );
		header( 'Content-Type: application/json; charset=UTF-8' );
		$data = ai1ec_utf8( $params['data'] );
		$callback = $params['callback'];
		if ( ! empty( $params['callback'] ) ) {
			// Output JSONP-encoded result and quit
			echo $params['callback'] . '(' . json_encode( $data ) . ')';
		} else {
			echo json_encode( $data );
		}
		return ai1ec_stop( 0 );
	}
}