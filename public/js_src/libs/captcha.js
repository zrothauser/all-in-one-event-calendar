define(
	[
		"jquery_timely",
		"libs/captcha/recaptcha",
		"libs/captcha/nocaptcha"
	],
	function( $, $recaptcha, $nocaptcha ) {

		var $provider = {
			is_ready : function() {
				return false;
			}
		};

		var get_provider = function( $provider_name ) {
			if ( 'recaptcha' === $provider_name ) {
				return $recaptcha;
			}
			if ( 'nocaptcha' === $provider_name ) {
				return $nocaptcha;
			}
		};

		var init_captcha = function( $form ) {
			var $captcha = $( '.ai1ec-captcha', $form );
			if ( $captcha.length === 0 ) {
				return;
			}
			$provider = get_provider( $captcha.data( 'provider' ) );
			if (
				! $provider.is_ready() ||
				$captcha.is( '.ai1ec-initializing, .ai1ec-initialized' )
			) {
				return;
			}
			$provider.init(
				{
					key : $captcha.data( 'captchaKey' ),
					object : $captcha[0],
					placeholder : $captcha.data( 'placeholder' ),
					captcha_object : $captcha
				}
			);
		};

		var destroy = function( $form ) {
			$provider.destroy( $form );
		};

		var reload = function( $form ) {
			$provider.reload( $form );
		};

		var get_field_name = function() {
			return $provider.get_field_name();
		}

		return {
			init_captcha : init_captcha,
			destroy : destroy,
			reload : reload,
			get_field_name : get_field_name
		}
	}
);
