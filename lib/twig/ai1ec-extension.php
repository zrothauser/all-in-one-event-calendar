<?php

/**
 * The extension class used by twig..
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Validator
 */
class Ai1ec_Twig_Ai1ec_Extension extends Twig_Extension {

	/* (non-PHPdoc)
	 * @see Twig_Extension::getFunctions()
	 */
	public function getFunctions() {
		return array(
			'screen_icon' => new Twig_Function_Method( $this, 'screen_icon' ),
			'wp_nonce_field' => new Twig_Function_Method( $this, 'wp_nonce_field' ),
			'do_meta_boxes' => new Twig_Function_Method( $this, 'do_meta_boxes' ),

		);
	}

	/**
	 * Displays a screen icon.
	 *
	 * @uses get_screen_icon()
	 * @since 2.7.0
	 *
	 * @param string|WP_Screen $screen Optional. Accepts a screen object (and defaults to the current screen object)
	 * 	which it uses to determine an icon HTML ID. Or, if a string is provided, it is used to form the icon HTML ID.
	 */
	public function screen_icon( $screen = '' ){
		return screen_icon( $screen );
	}

	/**
	 * Meta-Box template function
	 *
	 * @since 2.5.0
	 *
	 * @param string|object $screen Screen identifier
	 * @param string $context box context
	 * @param mixed $object gets passed to the box callback function as first parameter
	 * @return int number of meta_boxes
	 */
	public function do_meta_boxes( $screen, $context, $object ) {
		do_meta_boxes( $screen, $context, $object );
	}

	/**
	 * Retrieve or display nonce hidden field for forms.
	 *
	 * The nonce field is used to validate that the contents of the form came from
	 * the location on the current site and not somewhere else. The nonce does not
	 * offer absolute protection, but should protect against most cases. It is very
	 * important to use nonce field in forms.
	 *
	 * The $action and $name are optional, but if you want to have better security,
	 * it is strongly suggested to set those two parameters. It is easier to just
	 * call the function without any parameters, because validation of the nonce
	 * doesn't require any parameters, but since crackers know what the default is
	 * it won't be difficult for them to find a way around your nonce and cause
	 * damage.
	 *
	 * The input name will be whatever $name value you gave. The input value will be
	 * the nonce creation value.
	 *
	 * @package WordPress
	 * @subpackage Security
	 * @since 2.0.4
	 *
	 * @param string $action Optional. Action name.
	 * @param string $name Optional. Nonce name.
	 * @param bool $referer Optional, default true. Whether to set the referer field for validation.
	 * @param bool $echo Optional, default true. Whether to display or return hidden form field.
	 * @return string Nonce field.
	 */
	public function wp_nonce_field( $action = -1, $name = "_wpnonce", $referer = true , $echo = true ) {
		wp_nonce_field( $action, $name, $referer, $echo );
	}

	/* (non-PHPdoc)
	 * @see Twig_ExtensionInterface::getName()
	 */
	public function getName() {
		return 'ai1ec';
	}
}