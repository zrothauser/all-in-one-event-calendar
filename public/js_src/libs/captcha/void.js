define(
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

		return {
			is_ready : is_ready,
			init : init,
			get_field_name : get_field_name,
			reload : reload,
			destroy : destroy
		}
	}
);
