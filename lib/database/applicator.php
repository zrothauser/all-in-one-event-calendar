<?php

/**
 * A model to manage database changes
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Database
 */
class Ai1ec_Database_Applicator extends Ai1ec_Base {

	/**
	 * @var Ai1ec_Dbi Instance of wpdb object
	 */
	protected $_db = NULL;

	/**
	 * @var Ai1ec_Database Instance of Ai1ec_Database object
	 */
	protected $_database = NULL;

	/**
	 * Constructor
	 *
	 * Initialize object, by storing instance of `wpdb` in local variable
	 *
	 * @return void Constructor does not return
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$this->_db       = $registry->get( 'dbi.dbi' );
		$this->_database = $registry->get( 'database.helper' );
	}

	/**
	 * remove_instance_duplicates method
	 *
	 * Remove duplicate instances, from `event_instances` table
	 *
	 * @param int $depth Private argument, denoting number of iterations to
	 *                   try, before reverting to slow approach
	 *
	 * @return bool Success
	 */
	public function remove_instance_duplicates( $depth = 5 ) {
		$use_field  = 'id';
		if ( $depth < 0 ) {
			$use_field = 'post_id';
		}
		$table      = $this->_table( 'event_instances' );
		if ( false === $this->_database->table_exists( $table ) ) {
			return true;
		}
		$duplicates = $this->find_duplicates(
				$table,
				$use_field,
				array( 'post_id', 'start' )
		);
		$count      = count( $duplicates );
		if ( $count > 0 ) {
			$sql_query  = 'DELETE FROM ' . $table .
			' WHERE ' . $use_field . ' IN ( ' .
			implode( ', ', $duplicates ) . ' )';
			$this->_db->query( $sql_query );
		}
		if ( 'post_id' === $use_field ) { // slow branch
			$event_instance_model = $this->_registry->get(
				'model.event.instance'
			);
			foreach ( $duplicates as $post_id ) {
				try {
					$event_instance_model->recreate(
						$this->_registry->get( 'model.event', $post_id )
					);
				} catch ( Ai1ec_Exception $excpt ) {
					// discard any internal errors
				}
			}
		} else if ( $count > 0 ) { // retry
			return $this->remove_instance_duplicates( --$depth );
		}
		return true;
	}

	/**
	 * find_duplicates method
	 *
	 * Find a list of duplicates in table, given search key and groupping fields
	 *
	 * @param string $table   Name of table, to search duplicates in
	 * @param string $primary Column, to return values for
	 * @param array  $group   List of fields, to group values on
	 *
	 * @return array List of primary field values
	 */
	public function find_duplicates( $table, $primary, array $group ) {
		$sql_query = '
			SELECT
				MIN( {{primary}} ) AS dup_primary -- pop oldest
			FROM {{table}}
			GROUP BY {{group}}
			HAVING COUNT( {{primary}} ) > 1
		';
		$sql_query = str_replace(
				array(
					'{{table}}',
					'{{primary}}',
					'{{group}}',
				),
				array(
					$this->_table( $table ),
					$this->_escape_column( $primary ),
					implode(
							', ',
							array_map( array( $this, '_escape_column' ), $group )
					),
				),
				$sql_query
		);
		$result = $this->_db->get_col( $sql_query );
		return $result;
	}
	
	/**
	 * check_db_consistency_for_date_migration method
	 * 
	 * Checks if plugin tables are ready for update and start and end columns
	 * have the same type (datetime or unsigned int)
	 * 
	 * @param array $info Optional param to return details by reference
	 * 
	 * @return bool Success
	 */
	public function check_db_consistency_for_date_migration( 
		array &$info = null 
	) {
		$db_migration = $this->_registry->get( 'database.datetime-migration' );
		/* @var $db_migration Ai1ecdm_Datetime_Migration */
		$tables       = $db_migration->get_tables();
		if ( ! is_array( $tables ) ) {
			return true;
		}
		
		// for date migration purposes we can assume
		// that all columns need to be the same type
		$result = true;
		foreach( $tables as $t_name => $t_columns ) {
			if ( count( $t_columns ) < 2 ) {
				continue;
			}
			$db_cols = $db_migration->get_columns( $t_name );
			if ( ! $this->_check_single_table( 
					$t_name, 
					$db_cols, 
					$t_columns, 
					$info 
					)
				) {
					$result = false;
			}
		}
		return $result;
	}
	
	/**
	 * check_single_table method
	 * 
	 * Check if single table columns are the same type
	 * 
	 * @param string $t_name Table name for details purposes
	 * 
	 * @param array $db_cols Columns from database
	 * 
	 * @param array $t_columns Columns to check from DDL
	 * 
	 * @param array $info Check details
	 * 
	 * @return bool Success
	 */
	protected function _check_single_table( 
		$t_name, 
		array $db_cols, 
		array $t_columns, 
		array &$info = null 
	) {
		$type   = null;
		$result = true;
		
		foreach ( $db_cols as $c_field => $c_type ) {
			if ( ! in_array( $c_field, $t_columns ) ) {
				continue;
			}
			if ( null === $type ) {
				// first check so we need something to compare with
				// strtolower for sure
				$type = strlower( $c_type );
			} else {
				// compare types
				// strtolower for sure
				if ( strtolower( $c_type ) !== $type ) {
					$result = false;
					if ( null !== $info ) {
						$info[] = sprintf(
							Ai1ec_I18n::__(	
							'Date columns in table %s have different types.' ),
							$t_name
						);
					}
					break;
				} 
			}
		}
		return $result;
	}

	/**
	 * _table method
	 *
	 * Get fully qualified table name, to use in queries
	 *
	 * @param string $table Name of table, to convert
	 *
	 * @return string Qualified table name
	 */
	protected function _table( $table ) {
		$prefix = $this->_db->get_table_name( 'ai1ec_' );
		if ( substr( $table, 0, strlen( $prefix ) ) !== $prefix ) {
			$table = $prefix . $table;
		}
		return $table;
	}

	/**
	 * _escape_column method
	 *
	 * Escape column, enquoting it in MySQL specific characters
	 *
	 * @param string $name Name of column to quote
	 *
	 * @return string Escaped column name
	 */
	protected function _escape_column( $name ) {
		return '`' . $name . '`';
	}

}
