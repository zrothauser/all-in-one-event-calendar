<?php


	// ====================
	// = SPECIAL SETTINGS =
	// ====================

	// Enable All-in-One-Event-Calendar to work in debug mode, which means,
	// that cache is ignored, extra output may appear at places, etc.
	// Do not set this to any other value than `false` on production even if
	// you know what you are doing, because you will waste valuable
	// resources - save the Earth, at least.
	if ( ! defined( 'AI1EC_DEBUG' ) ) {
		define( 'AI1EC_DEBUG', true );
	}


