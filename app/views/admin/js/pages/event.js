
/**
 * @license RequireJS domReady 2.0.0 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


timely.define('domReady',[],function () {
    

    var isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [],
        isTop, testDiv, scrollIntervalId;

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i++) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch(e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        if (document.readyState === "complete" ||
            document.readyState === "interactive") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.0';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

timely.define('scripts/event/gmaps_helper',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
	 // jshint ;_;
	var init_gmaps = function() {
		var options = {
				zoom      : 14,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map( document.getElementById( 'ai1ec-gmap-canvas' ), options );
			var marker = new google.maps.Marker( { map: map } );
			var geocoder = new google.maps.Geocoder();

			geocoder.geocode(
				{
					'address': document.getElementById( 'ai1ec-gmap-address' ).value
				},
				function( results, status ) {
					if( status === google.maps.GeocoderStatus.OK ) {
						map.setCenter( results[0].geometry.location );
						marker.setPosition( results[0].geometry.location );
					}
				}
			);
	};
	var handle_show_map_when_clicking_on_placeholder = function() {
		var map_el = $( '.ai1ec-gmap-container-hidden:first');
		// delete placeholder
		$( this ).remove();
		// hide map
		map_el.hide();
		map_el.removeClass( 'ai1ec-gmap-container-hidden' );
		map_el.fadeIn();
	};
	return {
		handle_show_map_when_clicking_on_placeholder : handle_show_map_when_clicking_on_placeholder,
		init_gmaps                                   : init_gmaps
	};
} );
timely.define('external_libs/bootstrap_tab', ["jquery_timely"],
		function( $ ) {
	   // jshint ;_;


	 /* TAB CLASS DEFINITION
	  * ==================== */

	  var Tab = function ( element ) {
	    this.element = $(element)
	  }

	  Tab.prototype = {

	    constructor: Tab

	  , show: function () {
	      var $this = this.element
	        , $ul = $this.closest('ul:not(.dropdown-menu)')
	        , selector = $this.attr('data-target')
	        , previous
	        , $target
	        , e

	      if (!selector) {
	        selector = $this.attr('href')
	        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
	      }

	      if ( $this.parent('li').hasClass('active') ) return

	      previous = $ul.find('.active a').last()[0]

	      e = $.Event('show', {
	        relatedTarget: previous
	      })

	      $this.trigger(e)

	      if (e.isDefaultPrevented()) return

	      $target = $(selector)

	      this.activate($this.parent('li'), $ul)
	      this.activate($target, $target.parent(), function () {
	        $this.trigger({
	          type: 'shown'
	        , relatedTarget: previous
	        })
	      })
	    }

	  , activate: function ( element, container, callback) {
	      var $active = container.find('> .active')
	        , transition = callback
	            && $.support.transition
	            && $active.hasClass('fade')

	      function next() {
	        $active
	          .removeClass('active')
	          .find('> .dropdown-menu > .active')
	          .removeClass('active')

	        element.addClass('active')

	        if (transition) {
	          element[0].offsetWidth // reflow for transition
	          element.addClass('in')
	        } else {
	          element.removeClass('fade')
	        }

	        if ( element.parent('.dropdown-menu') ) {
	          element.closest('li.dropdown').addClass('active')
	        }

	        callback && callback()
	      }

	      transition ?
	        $active.one($.support.transition.end, next) :
	        next()

	      $active.removeClass('in')
	    }
	  }


	 /* TAB PLUGIN DEFINITION
	  * ===================== */

	  $.fn.tab = function ( option ) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('tab')
	      if (!data) $this.data('tab', (data = new Tab(this)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  $.fn.tab.Constructor = Tab


	 /* TAB DATA-API
	  * ============ */

	  $(function () {
	    $('body').on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
	      e.preventDefault()
	      $(this).tab('show')
	    })
	  })
} );
timely.define('libs/utils',
		[
		 "jquery_timely",
		 "external_libs/bootstrap_tab"
		 ],
		 function( $ ) {
	 // jshint ;_;
	var AI1EC_UTILS = function() {
			// We just return an object. This is useful if we ever need to define some private variables.
			return {
				/**
				 * check if a number is float
				 *
				 * @param the value to check
				 *
				 * @return boolean true if the value is float, false if it's not
				 */
				"is_float": function( n ) {
					return ! isNaN( parseFloat( n ) );
				},
				/**
				 * check if the value is a valid coordinate
				 *
				 * @param mixed the value to check
				 *
				 * @param boolean true if we are validating latitude
				 *
				 * @return boolean true if the value is a valid coordinate
				 */
				"is_valid_coordinate": function( n, is_latitude ) {
					// Longitude is valid between +180 and -180 while Latitude is valid between +90 an -90
					var max_value = is_latitude ? 90 : 180;
					return this.is_float( n ) && Math.abs( n ) < max_value;
				},
				/**
				 * Converts all the commas to dots so that the value can be used as a float
				 */
				"convert_comma_to_dot": function( value ) {
					return value.replace( ',', '.' );
				},
				/**
				 * Check if a field has a value.
				 *
				 * @param string id, the id of the element to check
				 *
				 * @return boolean Whether the fields has a value or not
				 */
				"field_has_value": function( id ) {
					var selector = '#' + id;
					var $field = $( selector );
					var has_value = false;
					// Check if the field was found. If it's not found we treat it as having no value.
					if( $field.length === 1 ) {
						has_value = $.trim( $field.val() ) !== '';
					}
					return has_value;
				},
				/**
				 * Create a twitter bootstrap aler
				 *
				 * @param text the text of the message
				 *
				 * @param type the type of the message
				 *
				 * @return the alert, ready to be inserted in the DOM
				 *
				 */
				"make_alert": function( text, type, hide_close_button ) {
					var alert_class = '';
					switch (type) {
						case 'error'  : alert_class = 'alert alert-error';
							break;
						case 'success': alert_class = 'alert alert-success';
							break;
						default: alert_class = 'alert';
							break;
					}
					// Create the alert
					var $alert = $( '<div />', {
						"class" : alert_class,
						"html"  : text
					} );
					if ( ! hide_close_button ) {
						// Create the close button
						var $close = $( '<a />', {
							"class"        : "close",
							"data-dismiss" : "alert",
							"href"         : "#",
							"text"         : "x"
						} );
						// Prepend the close button to the alert.
						$alert.prepend( $close );
					}
					return $alert;
				},
				/**
				 * Define the ajax url. If undefined we hardcode a value. This is needed for testing purpose only because in the testing environment the variable ajaxurl is undefined.
				 */
				"get_ajax_url": function() {
					if( typeof window.ajaxurl === "undefined" ) {
						return "http://localhost/wordpress/wp-admin/admin-ajax.php";
					} else {
						return window.ajaxurl;
					}
				},
				/**
				 * isUrl checks to see if the passed parameter is a valid url
				 * and returns true on access and false on failure
				 *
				 * @param String s String to validate
				 *
				 * @return boolean True if the string is a valid url, false otherwise
				 */
				 "isUrl" : function( s ) {
					var regexp = /(http|https|webcal):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
					return regexp.test(s);
				},
				/**
				 * isValidEmail checks if the mail passed is valid.
				 *
				 * @param email string
				 * @returns boolean
				 */
				"isValidEmail" : function( email ) {
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test( email );
				},
				/**
				 * activates the passed tab or the first one if no tab is passed.
				 * 
				 * @param active_tab
				 * @returns
				 */
				activate_saved_tab_on_page_load : function( active_tab ) {
					if ( null === active_tab || undefined === active_tab ){
						// Activate the first tab
						$( 'ul.nav-tabs a:first' ).tab( 'show' );
					} else {
						// Activate the correct tab
						$( 'ul.nav-tabs a[href=' + active_tab + ']' ).tab( 'show' );
					}
				}
			};
	}();
	return AI1EC_UTILS;
} );

timely.define('external_libs/jquery_cookie', ["jquery_timely"],
		function( $ ) {
	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	function converted(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			return config.json ? JSON.parse(s) : s;
		} catch(er) {}
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				config.raw ? key : encodeURIComponent(key),
				'=',
				config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		var result = key ? undefined : {};
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = decode(parts.join('='));

			if (key && key === name) {
				result = converted(cookie);
				break;
			}

			if (!key) {
				result[name] = converted(cookie);
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== undefined) {
			// Must not alter options, thus extending a fresh object...
			$.cookie(key, '', $.extend({}, options, { expires: -1 }));
			return true;
		}
		return false;
	};

} );

// Bootstrap Modals, manually namespaced
// Important: Whenever updating this file from Bootstrap, replace all
// occurrences as follows:
// 	data-dismiss="modal" => data-dismiss="ai1ec_modal"
// 	data-toggle="modal" => data-toggle="ai1ec_modal"
// 	modal-backdrop => ai1ec-modal-backdrop
// 	modal-body => ai1ec-modal-body

timely.define('external_libs/bootstrap_modal', ["jquery_timely"],
		function( $ ) {

	/* =========================================================
	 * bootstrap-modal.js v2.2.2
	 * http://twitter.github.com/bootstrap/javascript.html#modals
	 * =========================================================
	 * Copyright 2012 Twitter, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 * ========================================================= */




	   // jshint ;_;


	 /* MODAL CLASS DEFINITION
	  * ====================== */

	  var Modal = function (element, options) {
	    this.options = options
	    this.$element = $(element)
	      .delegate('[data-dismiss="ai1ec_modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
	    this.options.remote && this.$element.find('.ai1ec-modal-body').load(this.options.remote)
	  }

	  Modal.prototype = {

	      constructor: Modal

	    , toggle: function () {
	        return this[!this.isShown ? 'show' : 'hide']()
	      }

	    , show: function () {
	        var that = this
	          , e = $.Event('show')

	        this.$element.trigger(e)

	        if (this.isShown || e.isDefaultPrevented()) return

	        this.isShown = true

	        this.escape()

	        this.backdrop(function () {
	          var transition = $.support.transition && that.$element.hasClass('fade')

	          if (!that.$element.parent().length) {
	            that.$element.appendTo(document.body) //don't move modals dom position
	          }

	          that.$element
	            .show()

	          if (transition) {
	            that.$element[0].offsetWidth // force reflow
	          }

	          that.$element
	            .addClass('in')
	            .attr('aria-hidden', false)

	          that.enforceFocus()

	          transition ?
	            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
	            that.$element.focus().trigger('shown')

	        })
	      }

	    , hide: function (e) {
	        e && e.preventDefault()

	        var that = this

	        e = $.Event('hide')

	        this.$element.trigger(e)

	        if (!this.isShown || e.isDefaultPrevented()) return

	        this.isShown = false

	        this.escape()

	        $(document).off('focusin.modal')

	        this.$element
	          .removeClass('in')
	          .attr('aria-hidden', true)

	        $.support.transition && this.$element.hasClass('fade') ?
	          this.hideWithTransition() :
	          this.hideModal()
	      }

	    , enforceFocus: function () {
	        var that = this
	        $(document).on('focusin.modal', function (e) {
	          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
	            that.$element.focus()
	          }
	        })
	      }

	    , escape: function () {
	        var that = this
	        if (this.isShown && this.options.keyboard) {
	          this.$element.on('keyup.dismiss.modal', function ( e ) {
	            e.which == 27 && that.hide()
	          })
	        } else if (!this.isShown) {
	          this.$element.off('keyup.dismiss.modal')
	        }
	      }

	    , hideWithTransition: function () {
	        var that = this
	          , timeout = setTimeout(function () {
	              that.$element.off($.support.transition.end)
	              that.hideModal()
	            }, 500)

	        this.$element.one($.support.transition.end, function () {
	          clearTimeout(timeout)
	          that.hideModal()
	        })
	      }

	    , hideModal: function (that) {
	        this.$element
	          .hide()
	          .trigger('hidden')

	        this.backdrop()
	      }

	    , removeBackdrop: function () {
	        this.$backdrop.remove()
	        this.$backdrop = null
	      }

	    , backdrop: function (callback) {
	        var that = this
	          , animate = this.$element.hasClass('fade') ? 'fade' : ''

	        if (this.isShown && this.options.backdrop) {
	          var doAnimate = $.support.transition && animate

	          this.$backdrop = $('<div class="ai1ec-modal-backdrop ' + animate + '" />')
	            .appendTo(document.body)

	          this.$backdrop.click(
	            this.options.backdrop == 'static' ?
	              $.proxy(this.$element[0].focus, this.$element[0])
	            : $.proxy(this.hide, this)
	          )

	          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

	          this.$backdrop.addClass('in')

	          doAnimate ?
	            this.$backdrop.one($.support.transition.end, callback) :
	            callback()

	        } else if (!this.isShown && this.$backdrop) {
	          this.$backdrop.removeClass('in')

	          $.support.transition && this.$element.hasClass('fade')?
	            this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
	            this.removeBackdrop()

	        } else if (callback) {
	          callback()
	        }
	      }
	  }


	 /* MODAL PLUGIN DEFINITION
	  * ======================= */

	  var old = $.fn.modal

	  $.fn.modal = function (option) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('modal')
	        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
	      if (!data) $this.data('modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option]()
	      else if (options.show) data.show()
	    })
	  }

	  $.fn.modal.defaults = {
	      backdrop: true
	    , keyboard: true
	    , show: true
	  }

	  $.fn.modal.Constructor = Modal


	 /* MODAL NO CONFLICT
	  * ================= */

	  $.fn.modal.noConflict = function () {
	    $.fn.modal = old
	    return this
	  }


	 /* MODAL DATA-API
	  * ============== */

	  $(document).on('click.modal.data-api', '[data-toggle="ai1ec_modal"]', function (e) {
	    var $this = $(this)
	      , href = $this.attr('href')
	      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
	      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

	    e.preventDefault()

	    $target
	      .modal(option)
	      .one('hide', function () {
	        $this.focus()
	      })
	  })


} );

timely.define('external_libs/bootstrap_transition', ["jquery_timely"],
		function( $ ) {

	   // jshint ;_;

	  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
	   * ======================================================= */

	  $(function () {

	    $.support.transition = (function () {

	      var transitionEnd = (function () {

	        var el = document.createElement('bootstrap')
	          , transEndEventNames = {
	               'WebkitTransition' : 'webkitTransitionEnd'
	            ,  'MozTransition'    : 'transitionend'
	            ,  'OTransition'      : 'oTransitionEnd otransitionend'
	            ,  'transition'       : 'transitionend'
	            }
	          , name

	        for (name in transEndEventNames){
	          if (el.style[name] !== undefined) {
	            return transEndEventNames[name]
	          }
	        }

	      }())

	      return transitionEnd && {
	        end: transitionEnd
	      }

	    })()

	  })

} );

timely.define('external_libs/bootstrap_alert', ["jquery_timely"],
		function( $ ) {

	   // jshint ;_;


	 /* ALERT CLASS DEFINITION
	  * ====================== */

	  var dismiss = '[data-dismiss="alert"]'
	    , Alert = function (el) {
	        $(el).on('click', dismiss, this.close)
	      }

	  Alert.prototype.close = function (e) {
	    var $this = $(this)
	      , selector = $this.attr('data-target')
	      , $parent

	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
	    }

	    $parent = $(selector)

	    e && e.preventDefault()

	    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

	    $parent.trigger(e = $.Event('close'))

	    if (e.isDefaultPrevented()) return

	    $parent.removeClass('in')

	    function removeElement() {
	      $parent
	        .trigger('closed')
	        .remove()
	    }

	    $.support.transition && $parent.hasClass('fade') ?
	      $parent.on($.support.transition.end, removeElement) :
	      removeElement()
	  }


	 /* ALERT PLUGIN DEFINITION
	  * ======================= */

	  $.fn.alert = function (option) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('alert')
	      if (!data) $this.data('alert', (data = new Alert(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }

	  $.fn.alert.Constructor = Alert


	 /* ALERT DATA-API
	  * ============== */

	  $(function () {
	    $('body').on('click.alert.data-api', dismiss, Alert.prototype.close)
	  })
} );
timely.define('libs/modal_helper',
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap_modal"
	],
	function( $, domReady ) {
	

	domReady( function() {
		// Reproduce old Bootstrap behaviour of adding "modal-open" class to body
		// element while modal is open.
		var $body = $( 'body' );
		$body
			.on( 'shown', '.ai1ec-modal', function () {
				$body.addClass( 'ai1ec-modal-open' )
			} )
			.on( 'hidden', '.ai1ec-modal', function () {
				$body.removeClass( 'ai1ec-modal-open' )
			} );
	} );
} );

timely.define('scripts/event',
		[
		 "jquery_timely",
		 'domReady',
		 'ai1ec_config',
		 'scripts/event/gmaps_helper',
		 'libs/utils',
		 'external_libs/jquery_cookie',
		 'external_libs/bootstrap_modal',
		 'external_libs/bootstrap_transition',
		 'external_libs/bootstrap_alert',
		 'libs/modal_helper'
		 ],
		 function( $, domReady, ai1ec_config, gmaps_helper, utils ) {
	 // jshint ;_;
	var cookie_name = 'ai1ec_event_subscribed';
	$.cookie.json = true;
	// Perform all initialization functions required on the page.
	var init = function() {
		if( $( '#ai1ec-gmap-canvas' ).length > 0 ) {
			timely.require( ['libs/gmaps' ], function( gMapsLoader ) {
				gMapsLoader( gmaps_helper.init_gmaps );
			} );
		}
	};
	var subscribe_to_event = function( e ) {
		e.preventDefault();
		var mail = $( '#ai1ec_email_subscribe' ).val();
		if( ! utils.isValidEmail( mail ) ) {
			window.alert( ai1ec_config.invalid_email_message );
			$( '#ai1ec_email_subscribe' ).focus();
			return;
		}
		var event = $( '.ai1ec_email_container' ).data( 'event_id' );
		var event_instance = $( '.ai1ec_email_container' ).data( 'event_instance' );
		var data = {
			action : 'ai1ec_subscribe_to_event',
			mail : mail,
			event : event,
			event_instance : event_instance
		};
		$.post(
			ai1ec_config.ajax_url,
			data,
			function( data ) {
				var alert = utils.make_alert( data.message, data.type );
				$modal = $( '#ai1ec_subscribe_email_modal' );
				$( '.alerts', $modal ).append( alert );
				if( data.type === 'success' ) {
					var saved_cookie = $.cookie( cookie_name );
					if( undefined === saved_cookie ) {
						saved_cookie = [];
					}
					saved_cookie.push( event_instance );
					// if the user has subscribed, set a cookie to avoid showing the button again
					$.cookie( cookie_name, saved_cookie, { expires : 365 } );
					// remove the button
					$( '.ai1ec-subscribe-mail' ).remove();
				}
				$( '.btn-danger', $modal ).show();
				$( '.btn-primary', $modal ).hide();
				$( '.ai1ec_email_container', $modal ).hide();
			},
			'json'
		);
	};
	var attach_event_handlers = function() {
		$modal = $( '#ai1ec_subscribe_email_modal' );
		// handle showing the maps when clicking on the placeholder
		$( '.ai1ec-gmap-placeholder:first' ).click( gmaps_helper.handle_show_map_when_clicking_on_placeholder );
		$modal
			.modal( { show: false } )
			.on( 'hidden', function() {
				// remove the backdrop since firefox has problems with transitionend
				$( '.ai1ec-modal-backdrop' ).remove();
			} );
		$modal.on( 'click', '.btn-primary', subscribe_to_event );
		$modal.on( 'click', '.btn-danger', function() {
			$modal.modal( 'hide' );
		} );
	};
	var start = function() {
		domReady( function() {
			// Initialize the page.
			// We wait for the DOM to be loaded so we load gMaps only when needed
			init();
			attach_event_handlers();
		} );
	};
	return {
		start: start
	};
} );

timely.require(
		[ "scripts/event" ],
		function( page ) {
		 // jshint ;_;
			page.start();
		}
);
timely.define("pages/event", function(){});
