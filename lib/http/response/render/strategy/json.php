<?php
class Ai1ec_Render_Strategy_Json extends Ai1ec_Http_Response_Render_Strategy {
	
	public function render( array $params ) {
		$this->_dump_buffers();
		header( 'HTTP/1.1 200 OK' );
		header( 'Cache-Control: no-cache, must-revalidate' );
		header( 'Pragma: no-cache' );
		header( 'Content-Type: application/json; charset=UTF-8' );
		$data = $params['data'];
		// Output JSON-encoded result and quit
		echo json_encode( ai1ec_utf8( $data ) );
		return Ai1ec_Http_Response_Helper::ai1ec_stop( 0 );
	}


}