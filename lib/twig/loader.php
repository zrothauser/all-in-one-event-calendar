<?php

/**
 * Wrapper for Twig_Loader_Filesystem
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Twig
 */
class Ai1ec_Twig_Loader_Filesystem extends Twig_Loader_Filesystem {
    public function getCacheKey( $name ) {
        $cache_key = $this->findTemplate( $name );
        $cache_key = str_replace( AI1EC_PATH, '', $cache_key ); // remove part of path and make it relative
        $cache_key = str_replace( '/', '\\', $cache_key ); // make it namespace style (to avoid problems with Windows / Linux directory separator)
        return $cache_key;
    }
}