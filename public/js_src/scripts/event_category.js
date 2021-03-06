define(
	[
		"jquery_timely",
		"ai1ec_config",
		"domReady",
		"external_libs/colorpicker"
	],
	function( $, ai1ec_config, domReady ) {

		"use strict"; // jshint ;_;

		var category_custom_uploader;

		var category_image_uploader = function( event ) {
			event.preventDefault();

			if ( typeof category_custom_uploader == 'undefined' ) {
				category_custom_uploader = wp.media.frames.file_frame = wp.media({
					title   : ai1ec_config.choose_image_message,
					button  : {
						text: ai1ec_config.choose_image_message
					},
					multiple: false
				});
				category_custom_uploader.on('select', function() {
					var attachment = category_custom_uploader.state().get('selection').first().toJSON();
					$('#ai1ec_category_imag_preview').attr('src', attachment.url);
					$('#ai1ec_category_image_url').val(attachment.url);
				});
            }

			// Open the uploader dialog
			category_custom_uploader.open();
		};


		$( '#tag-color' ).click( function() {
			var
				fs_offset   = $( '#tag-color' ).offset(),
				top         = fs_offset.top + $( '#tag-color' ).height(),
				left        = fs_offset.left + 1,
				$ul_el      = $( '<ul class="timely colorpicker-list"></ul>'),
				$more_color = $(
					'<li class="ai1ec-btn ai1ec-btn-xs ai1ec-btn-default ' +
					'ai1ec-btn-block"><i class="ai1ec-fa ai1ec-fa-ellipsis-h ai1ec-fa-lg"></i></li>'
				),
				$li_els     = '',
				i;

			for ( i = 1; i <= 32; i++ ) {
				$li_els += '<li class="color-' + i + '"></li>';
			}
			$li_els = $( $li_els );

			$more_color.ColorPicker({
				onSubmit: function( hsb, hex, rgb, el ) {
					$( '#tag-color-background' ).css( 'background-color', '#' + hex );
					$( '#tag-color-value' ).val( '#' + hex );
					$( el ).ColorPickerHide();
					$ul_el.remove();
				},
				onBeforeShow: function () {
					$ul_el.hide();
					$( document ).unbind( 'mousedown', hide_color_selector );
					var color = $( '#tag-color-value' ).val();
					color = color.length > 0 ? color : '#ffffff';
					$( this ).ColorPickerSetColor( color );
				}
			});

			// Add click event for each color swatch.
			$li_els.click( function() {
				var color = $( this ).css( 'background-color' );
				color = 'rgba(0, 0, 0, 0)' === color ? '' : rgb2hex( color );
				$( '#tag-color-background' ).css( 'background-color', color );
				$( '#tag-color-value' ).val( color );
				$ul_el.remove();
			} );

			// Append li elements to the ul container.
			$ul_el.append( $li_els ).append( $more_color );

			// Append ul container to the body.
			$ul_el
				.appendTo( 'body' )
				.css( {
					top: top + 'px',
					left: left + 'px'
				} );
			$( document ).bind( 'mousedown', { ls: $ul_el }, hide_color_selector );
		} );

		// remove category color click
		$( "#tag-color-value-remove" ).click(function(){
			$( "#tag-color-background" ).css( "background-color","" );
			$( "#tag-color-value" ).val("");
		});

		var rgb2hex = function( rgb ) {
			rgb = rgb.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );
			return "#" + hex( rgb[1] ) + hex( rgb[2] ) + hex( rgb[3] );
		};

		var hex = function( x ) {
			return ( "0" + parseInt( x, 10 ).toString( 16 ) ).slice( -2 );
		};

		var hide_color_selector = function( ev ) {
			if( ! is_child_of( ev.data.ls.get( 0 ), ev.target, ev.data.ls.get( 0 ) ) ) {
				$( ev.data.ls.get(0) ).remove();
				$( document ).unbind( 'mousedown', hide_color_selector );
			}
		};
		var is_child_of = function( parentEl, el, container ) {
			/*jshint bitwise: false */
			if( parentEl === el ){
				return true;
			}

			if( parentEl.contains ) {
				return parentEl.contains( el );
			}

			if ( parentEl.compareDocumentPosition ) {
				return !!(parentEl.compareDocumentPosition(el) & 16);
			}

			var prEl = el.parentNode;
			while ( prEl && prEl !== container ) {
				if( prEl === parentEl ) {
					return true;
				}
				prEl = prEl.parentNode;
			}
			return false;
		};

		var start = function() {
			domReady( function() {
				$( '#ai1ec_category_image_uploader' ).click( category_image_uploader );

				var img = $( '#ai1ec_category_imag_preview' ).attr('src');
				if ( img && img.length > 0 ) {
					$( '#ai1ec_category_image_url' ).val( img );
				}
			} );
		};

		return {
			start: start
		};

});
