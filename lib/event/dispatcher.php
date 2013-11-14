<?php

class Ai1ec_Event_Dispatcher {
    public function register( $hook, Ai1ec_Event_Callback $entity, $priority = 10, $accepted_args = 1 ) {
        if ( !isset( $this->_registered[$hook] ) ) {
            $this->_registered[$hook] = array();
        }
        
        $this->_registered[$hook][] = compact( 'entity', 'priority', 'accepted_args' );
        add_action( $hook, array( $this, 'execute' ), $priority, $accepted_args );
        return $this;
    }

    public function execute() {
        $hook = current_filter();
        if ( !isset( $this->_registered[$hook] ) ) {
            return null;
        }
        
        $argv = func_get_args();
        $response = null;
        foreach ( $this->_registered[$hook] as $runnable ) {
            $response = $runnable['entity']->execute( $argv );
        }
        
        return $response;
    }    
}
