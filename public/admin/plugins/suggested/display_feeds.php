<div class="ai1ec-suggested-view-selector"> 
	<a href="#" data-ai1ec-view="map">
		<?php _e( 'Map', AI1EC_PLUGIN_NAME ); ?>
	</a> | 
	<a href="#" data-ai1ec-view="both" class="ai1ec-active">
		<?php _e( 'Both', AI1EC_PLUGIN_NAME ); ?>
	</a> |
		<a href="#" data-ai1ec-view="list">
		<?php _e( 'List', AI1EC_PLUGIN_NAME ); ?>
	</a>
</div>
<div class="ai1ec-suggested-map-container" data-ai1ec-show="both map">
	<div id="ai1ec_events_extra_details" data-ai1ec-show="both"></div>
	<div id="ai1ec_events_map_canvas"></div>
</div>
<div class="ai1ec-feeds-list-container">
	<?php echo $feeds_list;?>
</div>
<div class="ai1ec-feeds-pagination">
<?php
$page_links = paginate_links( array(
    'base' => add_query_arg( 'pagenum', '%#%' ),
    'format' => '',
    'prev_text' => __( '&laquo;', 'text-domain' ),
    'next_text' => __( '&raquo;', 'text-domain' ),
    'total' => 65,
    'current' => 1
) );

if ( $page_links ) {
    echo '<div class="tablenav"><div class="tablenav-pages">'
    	. $page_links
    . '</div></div>';
}
?>
</div>
<div class="ai1ec-suggested-events-actions-template ai1ec-hidden">
	<?php echo $event_actions; ?>
</div>
