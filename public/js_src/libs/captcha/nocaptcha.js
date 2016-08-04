define(
	[
		"jquery_timely",
		"//www.google.com/recaptcha/api.js"
	],
	function( $ ) {

		var challenge_completed = false;
		var initialized = false;
		var params = {};

		var is_ready = function() {
			return ! ( 'undefined' === typeof grecaptcha );
		};

		var init = function( $params ) {
			if ( initialized ) {
				return;
			}
			params = $params;
			$( $params.object ).html( '' );
			try {
				grecaptcha.render(
					$params.object,
					{
						sitekey : $params.key,
						theme : 'white',
						callback : function( response ) {
							challenge_completed = true;
						}
					}
				);
			} catch( e ) {
				grecaptcha.reset();
			}				
			initialized = true;
		};

		var get_field_name = function() {
			return '#g-recaptcha-response';
		};

		var reload = function( $form ) {
			challenge_completed = false;
			initialized = false;
			init( params );
		};

		var destroy = function( $form ) {
			challenge_completed = false;
			initialized = false;
		};

		var check_field = function() {
			return challenge_completed;
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
