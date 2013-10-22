<?php
class Ai1ec_Render_Strategy_Jsonp extends Ai1ec_Http_Response_Render_Strategy {
	public function render( array $params ) {
		$this->_dump_buffers();
		header( 'HTTP/1.1 200 OK' );
		header( 'Content-Type: application/json; charset=UTF-8' );
		$data = $params['data'];
		$callback = $params['callback'];
		// Output JSONP-encoded result and quit
		echo $callback . '(' . json_encode( ai1ec_utf8( $data ) ) . ')';
		return ai1ec_stop( 0 );
	}
}