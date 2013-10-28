({
	appDir: "../",
	baseUrl: "./",                // This is relative to appDir
	dir: "../../js",              // This is relative to this file's dir
	keepBuildDir: false,
	fileExclusionRegExp: /(jasmine|build|jshintr|^\.|.bat|.sh$)/,
	mainConfigFile: '../main.js', // This is relative to this file's dir
	// optimize: "none",          // Uncomment this line if you need to debug
	modules: [ {
				name: "pages/calendar"
			},
			{
				name: "pages/event"
			},
			{
				name: "pages/admin_settings"
			},
			{
				name: "pages/add_new_event"
			},
			{
				name: "pages/event_category"
			},
			{
				name: "pages/common_backend"
			},
			{
				name: "pages/common_frontend"
			}
	],
	namespace: 'timely', // Set the namespace.
	paths: {
		"ai1ec_calendar" : "empty:", // This modules are created dynamically in WP
		"ai1ec_config"   : "empty:",
		"jquery_timely"  : "empty:"
	},
	wrap: false,
	removeCombined: true
})
