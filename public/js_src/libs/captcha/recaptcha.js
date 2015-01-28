define(
	[
		"jquery_timely",
		"//www.google.com/recaptcha/api/js/recaptcha_ajax.js"
	],
	function( $ ) {

		var initialized = false;

		var is_ready = function() {
			return ! ( 'undefined' === typeof Recaptcha );
		};

		var init = function( $params ) {
			Recaptcha.create(
				$params.key,
				$params.object,
				{
					theme : 'white',
					callback : function() {
						$( get_field_name(), $params.captcha_object )
							.attr( 'placeholder', $params.placeholder );
						$params.captcha_object
							.removeClass( 'ai1ec-initializing' )
							.addClass( 'ai1ec-initialized' );
						initialized = true;
					}
				}
			);
			$params.captcha_object.addClass( 'ai1ec-initializing' );
		};

		var get_field_name = function() {
			return '#recaptcha_response_field';
		};

		var reload = function( $form ) {
			if (
				$( get_field_name(), $form ).length &&
				is_ready()
			) {
				Recaptcha.reload();
			}
		};

		var destroy = function( $form ) {
			$( '.ai1ec-recaptcha', $form ).removeClass(
				'ai1ec-initializing ai1ec-initialized'
			);
			Recaptcha.destroy();
		};

		var check_field = function() {
			if ( ! initialized ) {
				return true;
			}
			var $field = $( get_field_name() );
			return $field.val().length > 0;
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
