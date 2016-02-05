<?php

class FeedsTests extends BaseTestCase {
	
	/**
	 * @group feeds
	 */
	function testImportFeed() {				
		global $ai1ec_registry;

		//save the feed inside the table event_feeds
		$feed = array(
			'feed_url'             => 'http://www.calendarwiz.com/CalendarWiz_iCal.php?crd=uufh',
			'feed_name'            => '',
			'feed_category'        => '',
			'feed_tags'            => '',
			'comments_enabled'     => Ai1ec_Primitive_Int::db_bool( false ),
			'map_display_enabled'  => Ai1ec_Primitive_Int::db_bool( false ),
			'keep_tags_categories' => Ai1ec_Primitive_Int::db_bool( false ),
			'keep_old_events'      => Ai1ec_Primitive_Int::db_bool( false ),
			'import_timezone'      => Ai1ec_Primitive_Int::db_bool( false )
		);
		$feed = apply_filters( 'ai1ec_ics_feed_entry', $feed );
		
		$db         = $ai1ec_registry->get( 'dbi.dbi' );		
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		$format     = array( '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%d', '%d' );
		$res        = $db->insert( $table_name, $feed, $format );
		$feed_id    = $db->get_insert_id();
		
		//sigign api to donwload the ics feed
		$this->api_sign();

		//process the feed
		$con        = $ai1ec_registry->get( 'calendar-feed.ics' );
		$con->process_ics_feed_update( false, $feed_id );

	
		$db         = $ai1ec_registry->get( 'dbi.dbi' );
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		$feed_after = $db->get_row(
			$db->prepare(
				'SELECT * FROM ' . $table_name . ' WHERE feed_id = %d', $feed_id
			)
		);

		$this->assertNotNull( $feed_after, "Feed id: $feed_id was not found. It should exists at this point" );
		$this->assertNotBlank( $feed_after->feed_status, sprintf( 'The URL %s  was not processed. For tests we should use an existent feed', $feed['feed_url'] ) );		
		$this->assertNotBlank( $feed_after->feed_name, sprintf( 'The URL %s  was not processed. For tests we should use an existent feed', $feed['feed_url'] ) );

		//TODO Improve the assert
		//get the event from another endpoint and check with the event saved inside the WP db
	}
}

