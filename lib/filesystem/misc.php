<?php
/**
 * Miscelanous file systen related functions.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib.Filesystem
 */
class Ai1ec_Filesystem_Misc extends Ai1ec_Base {

	/**
	 * Builds directory hashmap.
	 *
	 * @param string $path Initial path.
	 *
	 * @return array Hashmap.
	 */
	public function build_dir_hashmap( $path ) {
		$hashmap = array();
		$directory	= opendir( $path );
		while ( false !== ( $entry = readdir( $directory ) ) ) {
			if ( '.' === $entry{0} ) {
				continue; // ignore hidden files
			}
			$local_path = $path . DIRECTORY_SEPARATOR . $entry;

			if ( is_dir( $local_path ) ) {
				$hashmap += $this->build_dir_hashmap( $local_path );
			} else {
				$hashmap[$local_path] = sha1( file_get_contents( $local_path ) );
			}
		}
		closedir( $directory );
		return $hashmap;
	}
}
