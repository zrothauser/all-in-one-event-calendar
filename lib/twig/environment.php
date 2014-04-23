<?php

/**
 * Wrapper for Twig_Environment
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Twig
 */
class Ai1ec_Twig_Environment extends Twig_Environment {

    /**
     * Loads a template by name.
     *
     * @param string  $name  The template name
     * @param integer $index The index if it is an embedded template
     *
     * @return Twig_TemplateInterface A template instance representing the given template name
     *
     * @throws Twig_Error_Loader When the template cannot be found
     * @throws Twig_Error_Syntax When an error occurred during compilation
     */
    public function loadTemplate( $name, $index = null ) {
        $cls = $this->getTemplateClass( $name, $index );

        if ( isset( $this->loadedTemplates[$cls] ) ) {
            return $this->loadedTemplates[$cls];
        }

        if ( ! class_exists( $cls, false ) ) {
            if ( false === $cache = $this->getCacheFilename( $name ) ) {
                eval( '?>' . $this->compileSource( $this->getLoader()->getSource( $name ), $name ) );
            } else {
                try {
                    if ( !is_file( $cache ) || ( $this->isAutoReload() && !$this->isTemplateFresh( $name, filemtime( $cache ) ) ) ) {
                        $this->writeCacheFile( $cache, $this->compileSource( $this->getLoader()->getSource( $name ), $name ) );
                    }
                    require_once $cache;
                } catch ( Exception $e ) {
                    // compile source if any exception is thrown
                    // this approach is to let plugin works even if there is no pre-compiled template or it needs to be recompiled
                    // if some error occurs
                    eval( '?>' . $this->compileSource( $this->getLoader()->getSource( $name ), $name ) );
                }
            }
        }

        if ( !$this->runtimeInitialized ) {
            $this->initRuntime();
        }

        return $this->loadedTemplates[$cls] = new $cls( $this );
    }

}