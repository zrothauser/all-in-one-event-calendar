<?php

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}
/**
 * The front controller of the plugin.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 * @instantiator new
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Theme_List extends WP_List_Table {

	/**
	 * @var array List of search terms
	 */
	public $search = array();

	/**
	 * @var array List of features
	 */
	public $features = array();

	/**
	 * @var Ai1ec_Registry_Object
	 */
	protected $_registry;

	/**
	 * Constructor
	 *
	 * Overriding constructor to allow inhibiting parents startup sequence.
	 * If in some wild case you need to inhibit startup sequence of parent
	 * class - pass `array( 'inhibit' => true )` as argument to this one.
	 *
	 * @param array $args Options to pass to parent constructor
	 *
	 * @return void Constructor does not return
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry,
		$args = array()
	) {
		$this->_registry = $registry;
		if ( ! isset( $args['inhibit'] ) ) {
			parent::__construct( $args );
		}
	}

	/**
	 * Get the available themes
	 * 
	 * @return array The available themese
	 */
	public function get_themes() {
		static $themes;
		if ( ! isset( $themes ) ) {
			$themes = $this->_registry->get( 'theme.search' )
				->filter_themes();
		}
		return $themes;
	}

	/**
	 * get_broken_themes method
	 *
	 * Convenient wrapper to `wp_get_themes( [errors:=true] )`
	 * or `get_broken_themes`, to avoid WP version deprecation conflicts.
	 *
	 * @return array Map of broken themes
	 */
	public function get_broken_themes() {
		return $this->get_themes( false, array( 'errors' => true ) );
	}

	/**
	 * prepare_items function
	 *
	 * Prepares themes for display, applies search filters if available
	 *
	 * @return void
	 **/
	public function prepare_items() {
		global $ct;

		// setting wp_themes to null in case
		// other plugins have changed its value
		unset( $GLOBALS['wp_themes'] );

		// get available themes
		$ct     = $this->current_theme_info();

		// handles theme searching by keyword
		if ( ! empty( $_REQUEST['s'] ) ) {
			$search       = explode(
				',',
				strtolower( stripslashes( $_REQUEST['s'] ) )
			);
			$this->search = array_merge(
				$this->search,
				array_filter( array_map( 'trim', $search ) )
			);
			$this->search = array_unique( $this->search );
		}

		// handles theme search by features (tags, one column, widget etc)
		if ( !empty( $_REQUEST['features'] ) ) {
			$this->features = (array)$_REQUEST['features'];
			$this->features = array_map( 'trim', $this->features );
			$this->features = array_map(
				'sanitize_title_with_dashes',
				$this->features
			);
			$this->features = array_unique( $this->features );
		}

		$themes = $this->_registry->get( 'theme.search' )
			->filter_themes(
				$this->search,
				$this->features
			);

		if( isset( $ct->name ) && isset( $themes[$ct->name] ) ) {
			unset( $themes[$ct->name] );
		}

		// sort themes using strnatcasecmp function
		uksort( $themes, 'strnatcasecmp' );

		// themes per page
		$per_page = 24;

		// get current page
		$page  = $this->get_pagenum();
		$start = ( $page - 1 ) * $per_page;

		$this->items = array_slice( $themes, $start, $per_page );

		// set total themes and themes per page
		$this->set_pagination_args( array(
			'total_items' => count( $themes ),
			'per_page'    => $per_page,
		) );
	}

	/**
	 * Returns html display of themes table
	 *
	 * @return string
	 */
	public function display() {
		$this->tablenav( 'top' );
		echo '<div id="availablethemes">',
			$this->display_rows_or_placeholder(),
			'</div>';
		$this->tablenav( 'bottom' );
	}

	/**
	 * tablenav function
	 *
	 * @return void
	 */
	public function tablenav( $which = 'top' ) {
		if ( $this->get_pagination_arg( 'total_pages' ) <= 1 )
			return;
		?>
		<div class="tablenav themes <?php echo $which; ?>">
			<?php $this->pagination( $which ); ?>
		   <img src="<?php echo esc_url( admin_url( 'images/wpspin_light.gif' ) ); ?>"
				class="ajax-loading list-ajax-loading"
				alt="" />
		  <br class="clear" />
		</div>
		<?php
	}

	/**
	 * ajax_user_can function
	 *
	 * @return bool
	 */
	public function ajax_user_can() {
		// Do not check edit_theme_options here.
		// AJAX calls for available themes require switch_themes.
		return current_user_can('switch_themes');
	}

	/**
	 * no_items function
	 *
	 * @return void
	 **/
	public function no_items() {
		if ( $this->search || $this->features ) {
			_e( 'No themes found.', AI1EC_PLUGIN_NAME );
			return;
		}

		if ( is_multisite() ) {
			if (
				current_user_can( 'install_themes' ) &&
				current_user_can( 'manage_network_themes' )
			) {
				printf(
					Ai1ec_I18n::__(
						'You only have one theme enabled for this site right now. Visit the Network Admin to <a href="%1$s">enable</a> or <a href="%2$s">install</a> more themes.'
					),
					network_admin_url(
						'site-themes.php?id=' . $GLOBALS['blog_id']
					),
					network_admin_url( 'theme-install.php' )
				);

				return;
			} elseif ( current_user_can( 'manage_network_themes' ) ) {
				printf(
					Ai1ec_I18n::__(
						'You only have one theme enabled for this site right now. Visit the Network Admin to <a href="%1$s">enable</a> more themes.'
					),
					network_admin_url(
						'site-themes.php?id=' . $GLOBALS['blog_id']
					)
				);

				return;
			}
			// else, fallthrough. install_themes doesn't help if you
			// can't enable it.
		} else {
			if ( current_user_can( 'install_themes' ) ) {
				printf(
					Ai1ec_I18n::__(
						'You only have one theme installed right now. You can choose from many free themes in the Timely Theme Directory at any time: just click on the <a href="%s">Install Themes</a> tab above.'
					),
					admin_url( AI1EC_THEME_SELECTION_BASE_URL )
				);

				return;
			}
		}
		// Fallthrough.
		printf(
			Ai1ec_I18n::__(
				'Only the active theme is available to you. Contact the <em>%s</em> administrator to add more themes.'
			),
            get_site_option( 'site_name' )
		);
	}

	/**
	 * get_columns function
	 *
	 * @return array
	 **/
	public function get_columns() {
		return array();
	}

	/**
	 * display_rows function
	 *
	 * @return void
	 **/
	function display_rows() {
		$themes = $this->items;
		$theme_names = array_keys( $themes );
		natcasesort( $theme_names );

		foreach ( $theme_names as $theme_name ) {
			$class = array( 'available-theme' );
			?>
			<div class="<?php echo join( ' ', $class ); ?>">
			<?php
			if ( !empty( $theme_name ) ) :
				$template       = $themes[$theme_name]['Template'];
				$stylesheet     = $themes[$theme_name]['Stylesheet'];
				$title          = $themes[$theme_name]['Title'];
				$version        = $themes[$theme_name]['Version'];
				$description    = $themes[$theme_name]['Description'];
				$author         = $themes[$theme_name]['Author'];
				$screenshot     = $themes[$theme_name]['Screenshot'];
				$stylesheet_dir = $themes[$theme_name]['Stylesheet Dir'];
				$template_dir   = $themes[$theme_name]['Template Dir'];
				$parent_theme   = $themes[$theme_name]['Parent Theme'];
				$theme_root     = $themes[$theme_name]['Theme Root'];
				$theme_dir      = $themes[$theme_name]->get_stylesheet_directory();
				$legacy         = ! is_dir( $theme_dir . '/twig' );
				$theme_root_uri = esc_url( $themes[$theme_name]['Theme Root URI'] );
				$preview_link   = esc_url(
					$this->_registry->get( 'model.option' )->get( 'home' ) . '/'
				);

				if ( is_ssl() )
					$preview_link = str_replace( 'http://', 'https://', $preview_link );

				$preview_link = htmlspecialchars(
					add_query_arg(
						array(
							'preview'          => 1,
							'ai1ec_template'   => $template,
							'ai1ec_stylesheet' => $stylesheet,
							'preview_iframe'   => true,
							'TB_iframe'        => 'true'
						),
						$preview_link
					)
				);

				$preview_text   = esc_attr( sprintf( __( 'Preview of &#8220;%s&#8221;', AI1EC_PLUGIN_NAME ), $title ) );
				$tags           = $themes[$theme_name]['Tags'];
				$thickbox_class = 'thickbox thickbox-preview';
				$legacy         = $legacy ? '1' : '0';
				$activate_link  = wp_nonce_url(
					admin_url( AI1EC_THEME_SELECTION_BASE_URL ) .
					"&amp;action=activate&amp;ai1ec_theme_dir=" .
					urlencode( $theme_dir ) .
					"&amp;ai1ec_legacy=" .
					urlencode( $legacy ) .
					"&amp;ai1ec_stylesheet=" .
					urlencode( $stylesheet ) .
					"&amp;ai1ec_theme_root=" .
					urlencode( $theme_root ),
					'switch-ai1ec_theme_' . $template
				);
				$activate_text  = esc_attr( sprintf( __( 'Activate &#8220;%s&#8221;', AI1EC_PLUGIN_NAME ), $title ) );
				$actions        = array();
				$actions[]      = '<a href="' . $activate_link .  '" class="activatelink" title="' . $activate_text . '">' .
				                  __( 'Activate', AI1EC_PLUGIN_NAME ) . '</a>';
				$actions[]      = '<a href="' . $preview_link . '" class="thickbox thickbox-preview" title="' .
				                  esc_attr( sprintf( __( 'Preview &#8220;%s&#8221;', AI1EC_PLUGIN_NAME ), $theme_name ) ) . '">' .
				                  __( 'Preview', AI1EC_PLUGIN_NAME ) . '</a>';

				if( ! is_multisite() && current_user_can( 'delete_themes' ) ) {
					$delete_link = wp_nonce_url(
						admin_url( AI1EC_THEME_SELECTION_BASE_URL ) .
						"&amp;action=delete&amp;ai1ec_template=$stylesheet", 'delete-ai1ec_theme_' . $stylesheet
					);
					$actions[] = '<a class="submitdelete deletion" href="' .
					             $delete_link .
					             '" onclick="' . "return confirm( '" .
					             esc_js( sprintf(
						             __( "You are about to delete this theme '%s'\n  'Cancel' to stop, 'OK' to delete.", AI1EC_PLUGIN_NAME ),
						             $theme_name
					             ) ) .
					             "' );" . '">' . __( 'Delete', AI1EC_PLUGIN_NAME ) . '</a>';
				}

				$actions = apply_filters( 'theme_action_links', $actions, $themes[$theme_name] );

				$actions = implode ( ' | ', $actions );
			?>
				<a href="<?php echo $preview_link; ?>" class="<?php echo $thickbox_class; ?> screenshot">
				<?php if ( $screenshot ) : ?>
					<img src="<?php echo $theme_root_uri . '/' . $stylesheet . '/' . $screenshot; ?>" alt="" />
				<?php endif; ?>
				</a>
				<h3>
			<?php
				/* translators: 1: theme title, 2: theme version, 3: theme author */
				printf( __( '%1$s %2$s by %3$s', AI1EC_PLUGIN_NAME ), $title, $version, $author ) ; ?></h3>
				<p class="description"><?php echo $description; ?></p>
				<span class='action-links'><?php echo $actions ?></span>
				<?php if ( current_user_can( 'edit_themes' ) && $parent_theme ) {
					/* translators: 1: theme title, 2:  template dir, 3: stylesheet_dir, 4: theme title, 5: parent_theme */ ?>
					<p>
						<?php
						printf(
							__( 'The template files are located in <code>%2$s</code>. The stylesheet files are located in <code>%3$s</code>. ' .
							    '<strong>%4$s</strong> uses templates from <strong>%5$s</strong>. Changes made to the templates will affect ' .
							    'both themes.', AI1EC_PLUGIN_NAME
							),
							$title,
							str_replace( WP_CONTENT_DIR, '', $template_dir ),
							str_replace( WP_CONTENT_DIR, '', $stylesheet_dir ),
							$title,
							$parent_theme );
						?>
					</p>
			<?php } else { ?>
				<p>
					<?php
					printf(
						__( 'All of this theme&#8217;s files are located in <code>%2$s</code>.', AI1EC_PLUGIN_NAME ),
						$title,
						str_replace( WP_CONTENT_DIR, '', $template_dir ),
						str_replace( WP_CONTENT_DIR, '', $stylesheet_dir )
					);
					?>
				</p>
			<?php } ?>
			<?php if ( $tags ) : ?>
				<p>
					<?php _e( 'Tags:', AI1EC_PLUGIN_NAME ); ?> <?php echo join( ', ', $tags ); ?>
				</p>
			<?php endif; ?>
			<?php theme_update_available( $themes[$theme_name] ); ?>
		<?php endif; // end if not empty theme_name ?>
			</div>
		<?php
		} // end foreach $theme_names
	}

	/**
	 * {@internal Missing Short Description}}
	 *
	 * @since 2.0.0
	 *
	 * @return unknown
	 */
	function current_theme_info() {
		$themes        = $this->get_themes();
		$current_theme = $this->get_current_ai1ec_theme();
		if ( ! $themes ) {
			$ct       = new stdClass;
			$ct->name = $current_theme;
			return $ct;
		}

		if ( ! isset( $themes[$current_theme] ) ) {
			delete_option( 'ai1ec_current_theme' );
			$current_theme = $this->get_current_ai1ec_theme();
		}

		$ct                 = new stdClass;
		$ct->name           = $current_theme;
		$ct->title          = $themes[$current_theme]['Title'];
		$ct->version        = $themes[$current_theme]['Version'];
		$ct->parent_theme   = $themes[$current_theme]['Parent Theme'];
		$ct->template_dir   = $themes[$current_theme]['Template Dir'];
		$ct->stylesheet_dir = $themes[$current_theme]['Stylesheet Dir'];
		$ct->template       = $themes[$current_theme]['Template'];
		$ct->stylesheet     = $themes[$current_theme]['Stylesheet'];
		$ct->screenshot     = $themes[$current_theme]['Screenshot'];
		$ct->description    = $themes[$current_theme]['Description'];
		$ct->author         = $themes[$current_theme]['Author'];
		$ct->tags           = $themes[$current_theme]['Tags'];
		$ct->theme_root     = $themes[$current_theme]['Theme Root'];
		$ct->theme_root_uri = esc_url( $themes[$current_theme]['Theme Root URI'] );
		return $ct;
	}
	/**
	 * Retrieve current theme display name.
	 *
	 * If the 'current_theme' option has already been set, then it will be returned
	 * instead. If it is not set, then each theme will be iterated over until both
	 * the current stylesheet and current template name.
	 *
	 * @since 1.5.0
	 *
	 * @return string
	 */
	public function get_current_ai1ec_theme() {
		$option = $this->_registry->get( 'model.option' );
		$theme = $option->get( 'ai1ec_current_theme', array() );
		return $theme['stylesheet'];
	}

	/**
	 * Retrieve list of WordPress theme features (aka theme tags)
	 *
	 * @since 3.1.0
	 *
	 * @return array  Array of features keyed by category with translations keyed by slug.
	 */
	public function get_theme_feature_list() {
		// Hard-coded list is used if api not accessible.
		$features = array(
				__('Colors') => array(
					'black'   => __( 'Black' ),
					'blue'    => __( 'Blue' ),
					'brown'   => __( 'Brown' ),
					'gray'    => __( 'Gray' ),
					'green'   => __( 'Green' ),
					'orange'  => __( 'Orange' ),
					'pink'    => __( 'Pink' ),
					'purple'  => __( 'Purple' ),
					'red'     => __( 'Red' ),
					'silver'  => __( 'Silver' ),
					'tan'     => __( 'Tan' ),
					'white'   => __( 'White' ),
					'yellow'  => __( 'Yellow' ),
					'dark'    => __( 'Dark' ),
					'light'   => __( 'Light ')
				),

			__('Width') => array(
				'fixed-width'    => __( 'Fixed Width' ),
				'flexible-width' => __( 'Flexible Width' )
			),

			__( 'Features' ) => array(
				'featured-images'       => __( 'Featured Images' ),
				'front-page-post-form'  => __( 'Front Page Posting' ),
				'full-width-template'   => __( 'Full Width Template' ),
				'rtl-language-support'  => __( 'RTL Language Support' ),
				'threaded-comments'     => __( 'Threaded Comments' ),
				'translation-ready'     => __( 'Translation Ready' )
			),

			__( 'Subject' )  => array(
				'holiday'       => __( 'Holiday' ),
				'photoblogging' => __( 'Photoblogging' ),
				'seasonal'      => __( 'Seasonal' )
			)
		);

		return $features;
	}

}