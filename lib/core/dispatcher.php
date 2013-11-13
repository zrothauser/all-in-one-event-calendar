<?php

class Ai1ec_Core_Dispatcher {
    public function register( $hook, Ai1ec_Core_Callback $entity, $priority = 10, $accepted_args = 1 ) {
        if ( !isset( $this->_registered[$hook] ) ) {
            $this->_registered[$hook] = array();
        }
        
        $this->_registered[$hook][] = compact( 'entity', 'priority' );
        add_action( $hook, array( $this, 'execute' ), $priority, $accepted_args );
        return $this;
    }

    public function execute() {
        $hook = current_filter();
        if ( !isset( $this->_registered[$hook] ) ) {
            return null; // consider `return func_get_arg( 1 )` for filters
        }
        
        $argv = func_get_args();
        $response = true; // consider `func_get_arg( 1 )` for filters
        foreach ( $this->_registered[$hook] as $runnable ) {
            $response &= $runnable['entity']->execute( $argv );
            // read filters consideration
        }
        
        return $response;
    }    
}
