<?php
/**
 * Event Filter.
 *
 * filters must be connected to the remaining statement by AND logics
 * to make any effect. Later filters for distinct filtering types may
 * be joined either using `AND`, or `OR` condition - it is achievable
 * by the use of `ai1ec_filter_distinct_types_logic` WordPress filter
 * later strictly forcing return value of it to either `AND` or `OR`.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.search
 */
class Ai1ec_Filter_Event {

	/**
	 * @var string type of the filter
	 */
	protected $_filter_type = null;

	/**
	 * @var array list of id to filter
	 */
	protected $_filter_ids = null;


	/**
	 * get_join functions
	 *
	 * Return the string containing the join clause for the Ai1ec_Event_Search
	 * get_events_between method
	 *
	 * @return string the SQL clause
	 */
	public function get_join() {

		$filter_join = "";

		if ( $this->_filter_ids && is_array( $this->_filter_ids ) ) {
			switch ( $this->_filter_type ) {
				// Limit by Category IDs
				case 'cat_ids':
					$filter_join .= " LEFT JOIN
						{$this->_dbi->get_table_name( 'term_relationships' )} AS trc
						ON e.post_id = trc.object_id ";

					$filter_join .= " LEFT JOIN {$this->_dbi->get_table_name( 'term_taxonomy' )} ttc
						ON trc.term_taxonomy_id = ttc.term_taxonomy_id
						AND ttc.taxonomy = 'events_categories' ";
					break;
				// Limit by Tag IDs
				case 'tag_ids':
					$filter_join .= " LEFT JOIN {$this->_dbi->get_table_name( 'term_relationships' )} AS trt
						ON e.post_id = trt.object_id ";

					$filter_join .= " LEFT JOIN {$this->_dbi->get_table_name( 'term_taxonomy' )} ttt
						ON trt.term_taxonomy_id = ttt.term_taxonomy_id
						AND ttt.taxonomy = 'events_tags' ";
					break;
			}
		}


		return $filter_join;

	}

	/**
	 * get_where functions
	 *
	 * Return the string containing the where clause for the Ai1ec_Event_Search
	 * get_events_between method
	 *
	 * @return string the SQL clause
	 */
	public function get_where( $where_logic = null) {

		$filter_where = "";

		$inner_logic = strtoupper( trim( (string)apply_filters(
			'ai1ec_filter_distinct_types_logic',
			'AND'
		) ) );
		if ( ! in_array( $inner_logic, array( 'AND', 'OR' ) ) ) {
			$inner_logic = 'AND';
		}

		$inner_logic = ' ' . $inner_logic . ' ';

		if ( NULL === $where_logic ) {
			$where_logic = ' AND (';
		}

		if ( $this->_filter_ids && is_array( $this->_filter_ids ) ) {
			switch ( $this->_filter_type ) {
				// Limit by Category IDs
				case 'cat_ids':
					$filter_where = $where_logic . ' ttc.term_id IN ( ' . join( ',', $this->_filter_ids ) . ' ) ';
					$where_logic  = $inner_logic;
					break;
				// Limit by Tag IDs
				case 'tag_ids':
					$filter_where .= $where_logic . ' ttt.term_id IN ( ' . join( ',', $this->_filter_ids ) . ' ) ';
					$where_logic  = $inner_logic;
					break;
				// Limit by post IDs
				case 'post_ids':
					$filter_where .= $where_logic . ' e.post_id IN ( ' . join( ',', $this->_filter_ids ) . ' ) ';
					$where_logic  = $inner_logic;
					break;
				// Limit by author IDs
				case 'auth_ids':
					$filter_where .= $where_logic . ' p.post_author IN ( ' . join( ',', $this->_filter_ids ) . ' ) ';
					$where_logic  = $inner_logic;
					break;
			}
		}

		return array(
			"filter" => $filter_where,
			"logic"  => $where_logic );

	}

	/**
	 * Object constructor
	 */
	public function __construct( $filter_type, $filter_ids) {

		$this->_filter_type = $filter_type;
		$this->_filter_ids  = $filter_ids;

	}

}