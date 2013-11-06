<?php

/**
 * Define required constants, if these have not been defined already.
 *
 * @param string $ai1ec_base_dir Sanitized, absolute, path to Ai1EC base dir
 *
 * @uses plugin_basename To determine plug-in folder+file name
 * @uses plugins_url     To determine absolute URI to plug-ins' folder
 * @uses get_option      To fetch 'home' URI value
 *
 * @return void Method does not return
 */
function ai1ec_initiate_constants( $ai1ec_base_dir ) {

	// ===============
	// = Plugin Path =
	// ===============
	if ( ! defined( 'AI1EC_PATH' ) ) {
		define( 'AI1EC_PATH', 				$ai1ec_base_dir );
	}

	// ===============
	// = Plugin Name =
	// ===============
	if ( ! defined( 'AI1EC_PLUGIN_NAME' ) ) {
		define( 'AI1EC_PLUGIN_NAME',        'all-in-one-event-calendar' );
	}

	// ===================
	// = Plugin Basename =
	// ===================
	if ( ! defined( 'AI1EC_PLUGIN_BASENAME' ) ) {
		$plugin = AI1EC_PATH . DIRECTORY_SEPARATOR . AI1EC_PLUGIN_NAME . '.php';
		define( 'AI1EC_PLUGIN_BASENAME',    plugin_basename( $plugin ) );
		unset( $plugin );
	}

	// ==================
	// = Plugin Version =
	// ==================
	if ( ! defined( 'AI1EC_VERSION' ) ) {
		define( 'AI1EC_VERSION',            '2.0.0-alpha' );
	}

	// ====================
	// = Database Version =
	// ====================
	if ( ! defined( 'AI1EC_DB_VERSION' ) ) {
		define( 'AI1EC_DB_VERSION',         AI1EC_VERSION );
	}

	// =================
	// = Language Path =
	// =================
	if ( ! defined( 'AI1EC_LANGUAGE_PATH' ) ) {
		define( 'AI1EC_LANGUAGE_PATH',      AI1EC_PLUGIN_NAME . DIRECTORY_SEPARATOR . 'language' );
	}
	// ================
	// = Cron Version =
	// ================
	if ( ! defined( 'AI1EC_CRON_VERSION' ) ) {
		define( 'AI1EC_CRON_VERSION',       AI1EC_VERSION );
	}
	if ( ! defined( 'AI1EC_N_CRON_VERSION' ) ) {
		define( 'AI1EC_N_CRON_VERSION',     AI1EC_VERSION );
	}
	if ( ! defined( 'AI1EC_N_CRON_FREQ' ) ) {
		define( 'AI1EC_N_CRON_FREQ',        'daily' );
	}
	if ( ! defined( 'AI1EC_U_CRON_VERSION' ) ) {
		define( 'AI1EC_U_CRON_VERSION',     AI1EC_VERSION );
	}
	if ( ! defined( 'AI1EC_U_CRON_FREQ' ) ) {
		define( 'AI1EC_U_CRON_FREQ',        'hourly' );
	}
	if ( ! defined( 'AI1EC_UPDATES_URL' ) ) {
		define( 'AI1EC_UPDATES_URL',        'http://api.time.ly/plugin/pro/latest' );
	}

	// ===============
	// = PLUGIN PATH =
	// ===============
	if ( ! defined( 'AI1EC_PATH' ) ) {
		define( 'AI1EC_PATH',               dirname( __FILE__ ) );
	}

	// ===============
	// = ADMIN PATH  =
	// ===============
	if ( ! defined( 'AI1EC_ADMIN_PATH' ) ) {
		define( 
			'AI1EC_ADMIN_PATH',
			AI1EC_PATH . DIRECTORY_SEPARATOR . 'public' . 
				DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR
		);
	}

	// ================
	// = THEME FOLDER =
	// ================
	if ( ! defined( 'AI1EC_THEME_FOLDER' ) ) {
		define( 'AI1EC_THEME_FOLDER',        'themes-ai1ec' );
	}

	// =======================
	// = DEFAULT THEME PATH  =
	// =======================
	if ( ! defined( 'AI1EC_DEFAULT_THEME_PATH' ) ) {
		define(
			'AI1EC_DEFAULT_THEME_PATH',
			AI1EC_PATH . DIRECTORY_SEPARATOR . 'public' .
				DIRECTORY_SEPARATOR . AI1EC_THEME_FOLDER . DIRECTORY_SEPARATOR
		);
	}
	
	// =============
	// = POST TYPE =
	// =============
	if ( ! defined( 'AI1EC_POST_TYPE' ) ) {
		define( 'AI1EC_POST_TYPE',           'ai1ec_event' );
	}

	// ==============
	// = SCRIPT URL =
	// ==============
	if ( ! defined( 'AI1EC_SCRIPT_URL' ) ) {
		define( 'AI1EC_SCRIPT_URL',         get_option( 'home' ) . '/?plugin=' . AI1EC_PLUGIN_NAME );
	}

	// ==============
	// = EXPORT URL =
	// ==============
	if ( ! defined( 'AI1EC_EXPORT_URL' ) ) {
		// ====================================================
		// = Convert http:// to webcal:// in AI1EC_SCRIPT_URL =
		// =  (webcal:// protocol does not support https://)  =
		// ====================================================
		$webcal_url = str_replace( 'http://', 'webcal://', AI1EC_SCRIPT_URL );
		define( 'AI1EC_EXPORT_URL',         $webcal_url . '&controller=ai1ec_exporter_controller&action=export_events&cb=' . rand() );
	}

	// =================
	// = LOCATIONS API =
	// =================
	if ( ! defined( 'AI1EC_LOCATIONS_API' ) ) {
		define( 'AI1EC_LOCATIONS_API', 'http://api.time.ly:32000' );
	}

	// =============
	// = STATS API =
	// =============
	if ( ! defined( 'AI1EC_STATS_API' ) ) {
		define( 'AI1EC_STATS_API', 'http://api.time.ly:31000' );
	}

	if ( ! defined( 'AI1EC_CA_ROOT_PEM' ) ) {
		define(
			'AI1EC_CA_ROOT_PEM',
			AI1EC_PATH . DIRECTORY_SEPARATOR . 'ca_cert' .
				DIRECTORY_SEPARATOR . 'ca_cert.pem'
		);
	}

	// ====================
	// = SPECIAL SETTINGS =
	// ====================

	// Set AI1EC_EVENT_PLATFORM to TRUE to turn WordPress into an events-only
	// platform. For a multi-site install, setting this to TRUE is equivalent to a
	// super-administrator selecting the
	//   "Turn this blog into an events-only platform" checkbox
	// on the Calendar Settings page of every blog on the network.
	// This mode, when enabled on blogs where this plugin is active, hides all
	// administrative functions unrelated to events and the calendar (except to
	// super-administrators), and sets default WordPress settings appropriate for
	// pure event management.
	if ( ! defined( 'AI1EC_EVENT_PLATFORM' ) ) {
		define( 'AI1EC_EVENT_PLATFORM',     FALSE );
	}

	// If i choose to use the calendar url as the base for events permalinks,
	// i must specify another name for the events archive.
	if ( ! defined( 'AI1EC_ALTERNATIVE_ARCHIVE_URL' ) ) {
		define( 'AI1EC_ALTERNATIVE_ARCHIVE_URL', 'ai1ec_events_archive' );
	}

	// ===============================
	// = Time.ly redirection service =
	// ===============================
	if ( ! defined( 'AI1EC_REDIRECTION_SERVICE' ) ) {
		define( 'AI1EC_REDIRECTION_SERVICE', 'http://aggregator.time.ly/ticket_redirect/' );
	}

	// Enable All-in-One-Event-Calendar to work in debug mode, which means,
	// that cache is ignored, extra output may appear at places, etc.
	// Do not set this to any other value than `false` on production even if
	// you know what you are doing, because you will waste valuable
	// resources - save the Earth, at least.
	if ( ! defined( 'AI1EC_DEBUG' ) ) {
		define( 'AI1EC_DEBUG', false );
	}

	// Enable Ai1EC cache functionality. If you set this to false, only cache
	// that is based on request, will remain active.
	// This is pointless in any case other than development, where literary
	// every second refresh needs to take fresh copy of everything.
	if ( ! defined( 'AI1EC_CACHE' ) ) {
		define( 'AI1EC_CACHE', true );
	}

}
