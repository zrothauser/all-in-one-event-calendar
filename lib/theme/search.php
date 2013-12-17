<?php

class Ai1ec_Theme_Search extends Ai1ec_Base {

	protected $_restore = array();

	public function __construct() {
	}

	public function get_themes() {
		$this->_pre_search( $this->get_theme_dirs() );

		$options    = array(
			'errors'  => null, // null -> all
			'allowed' => null, // null -> all
		);
		$theme_map = null;
		if ( function_exists( 'wp_get_themes' ) ) {
			$theme_map = wp_get_themes( $options );
		} else {
			$theme_map = get_themes() + get_broken_themes();
		}
		foreach ( $theme_map as $theme ) {
			$theme->get_theme_root_uri();
		}

		$this->_post_search();
		return $theme_map;
	}

	public function get_theme_dirs() {
		$theme_dirs = array(
			AI1EC_DEFAULT_THEME_PATH,
			WP_CONTENT_DIR . DIRECTORY_SEPARATOR . AI1EC_THEME_FOLDER,
		);
		$theme_dirs = apply_filters( 'ai1ec_register_theme', $theme_dirs );
		return $theme_dirs;
	}

	protected function _replace_search_globals( array $variables_map ) {
		foreach ( $variables_map as $key => $current_value ) {
			global $$key;
			$variables_map[$key] = $$key;
			$$key                = $current_value;
		}
		search_theme_directories( true );
		return $variables_map;
	}

	protected function _pre_search( array $directories ) {
		$this->_restore = $this->_replace_search_globals(
			array(
				'wp_theme_directories' => $directories,
				'wp_broken_themes'     => array(),
			)
		);
		add_filter(
			'wp_cache_themes_persistently',
			'__return_false',
			1
		);
	}

	protected function _post_search() {
		remove_filter(
			'wp_cache_themes_persistently',
			'__return_false',
			1
		);
		$this->_replace_search_globals( $this->_restore );
	}

	public function filter_themes(
		array $terms    = null,
		array $features = array(),
		$broken         = false
	) {
		static $theme_list = null;
		if ( null === $theme_list ) {
			$theme_list = $this->get_themes();
		}

		foreach ( $theme_list as $key => $theme ) {
			if (
				( ! $broken && false !== $theme->errors() ) ||
				! $this->theme_matches( $theme, $terms, $features )
			) {
				unset( $theme_list[$key] );
				continue;
			}
		}

		return $theme_list;
	}

	public function theme_matches( $theme, array $search, array $features ) {
		static $fields = array(
			'Name',
			'Title',
			'Description',
			'Author',
			'Template',
			'Stylesheet',
		);

		$tags = array_map(
			'sanitize_title_with_dashes',
			$theme->get( 'tags' )
		);

		// Match all phrases
		if ( count( $search ) > 0 ) {
			foreach ( $search as $word ) {

				// In a tag?
				if ( ! in_array( $word, $tags ) ) {
					return false;
				}

				// In one of the fields?
				foreach ( $fields as $field ) {
					if ( false === stripos( $theme->get( $field ), $word ) ) {
						return false;
					}
				}

			}
		}

		// Now search the features
		if ( count( $features ) > 0 ) {
			foreach ( $features as $word ) {
				// In a tag?
				if ( ! in_array( $word, $tags ) ) {
					return false;
				}
			}
		}

		// Only get here if each word exists in the tags or one of the fields
		return true;
	}

}