
timely.define('libs/captcha/recaptcha',
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

timely.define('libs/captcha/nocaptcha',
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

timely.define('libs/captcha/void',
	[],
	function() {

		var is_ready = function() {
			return false;
		};

		var init = function( $params ) {
			// do nothing
		};

		var get_field_name = function() {
			return '';
		};

		var reload = function( $form ) {
			// do nothing
		};

		var destroy = function( $form ) {
			// do nothing
		};

		var check_field = function() {
			return true;
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

timely.define('libs/captcha',
	[
		"jquery_timely",
		"libs/captcha/recaptcha",
		"libs/captcha/nocaptcha",
		"libs/captcha/void"
	],
	function( $, $recaptcha, $nocaptcha, $void ) {

		// initialize provider with void provider.
		var $provider = $void;

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
			// Handle external plugin's provider constructor.
			// Provider should export functions like defined in
			// libs/captcha/void.js
			if ( $captcha.data( 'providerConstructor' ) ) {
				var $callback = $captcha.data( 'providerConstructor' );
				$provider = eval( $callback )();
			}
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
		};

		var check_field = function() {
			return $provider.check_field();
		};

		return {
			init_captcha : init_captcha,
			destroy : destroy,
			reload : reload,
			get_field_name : get_field_name,
			check_field : check_field
		}
	}
);
