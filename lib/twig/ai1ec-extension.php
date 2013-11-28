<?php
class Ai1ec_Twig_Ai1ec_Extension extends Twig_Extension {
	public function getFunctions() {
		return array(
			'screen_icon' => new Twig_Function_Method( $this, 'screen_icon' ),
			'wp_nonce_field' => new Twig_Function_Method( $this, 'wp_nonce_field' ),
			'do_meta_boxes' => new Twig_Function_Method( $this, 'do_meta_boxes' ),

		);
	}

	public function screen_icon( $screen = '' ){
		return screen_icon( $screen );
	}

	public function do_meta_boxes( $screen, $context, $object ) {
		do_meta_boxes( $screen, $context, $object );
	}
	public function wp_nonce_field( $action = -1, $name = "_wpnonce", $referer = true , $echo = true ) {
		wp_nonce_field( $action, $name, $referer, $echo );
	}

	public function getName() {
		return 'ai1ec';
	}
}