<?php

/** 
 * @author nicola
 * 
 */
interface Ai1ec_Registry_Interface {
	
	/**
	 * @param string $key
	 */
	public function get( $key );

	/**
	 * @param string $key
	 * @param mixed $val
	 */
	public function set( $key, $val );
}

?>