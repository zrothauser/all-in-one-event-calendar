define(
	[
		"jquery_timely",
		"//www.google.com/recaptcha/api.js"
	],
	function( $ ) {

		var is_ready = function() {
			return ! ( 'undefined' === typeof grecaptcha );
		};

		var init = function( $params ) {

		};

		var get_field_name = function() {
			return '#recaptcha_response_field';
		};

		var reload = function( $form ) {

		};

		var destroy = function( $form ) {

		};

		var check_field = function() {
			return false;
		};

		return {
			is_ready : is_ready,
			init : init,
			get_field_name : get_field_name,
			reload : reload,
			destroy : destroy,
			check_field : check_field
		}
	}
);
