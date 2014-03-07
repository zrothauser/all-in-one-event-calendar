<?php

/**
 * Execution guard.
 *
 * Guards process execution for multiple runs at the same moment of time.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Compatibility
 */
class Ai1ec_Compatibility_Xguard {

	/**
	 * Return time of last acquisition.
	 *
	 * If execution guard with that name was never acquired it returns 0 (zero).
	 * If acquisition fails it returns false.
	 *
	 * @param string $name Name of guard to be acquired.
	 *
	 * @return int|bool Timestamp of last acquisition or false.
	 */
	public function acquire( $name ) {
		$name = $this->safe_name( $name );
		$path = AI1EC_PATH . DIRECTORY_SEPARATOR . 'xguard_' . $name . '.log';
		$handle = fopen( $path, 'r+' );
		if ( ! $handle ) {
			return false;
		}
		$last = false;
		if ( flock( $handle, LOCK_EX ) ) {
			$last = (int)fread( $handle, 100 );
			$success = ftruncate( $handle, 0 );
			$success &= fwrite( $handle, time() );
			$success &= fflush( $handle );
			$success &= flock( $handle, LOCK_UN );
			if ( ! $success ) {
				$last = false;
			}
		}
		if ( ! fclose( $handle ) ) {
			return false;
		}
		return $last;
	}

	/**
	 * Method release logs execution guard release phase.
	 *
	 * @param string $name Name of acquisition.
	 *
	 * @return bool Not expected to fail.
	 */
	public function release( $name ) {
		$this->acquire( $name );
		return true;
	}

	/**
	 * Prepare safe file names.
	 *
	 * @param  string  $name Name of acquisition
	 * @return string
	 */
	protected function safe_name( $name ) {
		return sanitize_file_name( $name );
	}

}