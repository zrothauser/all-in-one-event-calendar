define(
	[
		"jquery_timely",
		"//www.google.com/recaptcha/api/js/recaptcha_ajax.js"
	],
	function( $ ) {

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
						$( '#recaptcha_response_field', $recaptcha )
							.attr( 'placeholder', $params.placeholder );
						$params.captcha_object
							.removeClass( 'ai1ec-initializing' )
							.addClass( 'ai1ec-initialized' );
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
				$( '#recaptcha_response_field', $form ).length &&
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

		return {
			is_ready : is_ready,
			init : init,
			get_field_name : get_field_name,
			reload : reload,
			destroy : destroy
		}
	}
);
