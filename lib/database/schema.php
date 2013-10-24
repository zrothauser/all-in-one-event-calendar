<?php

/**
 * Manage database schema updates
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Database
 */
class Ai1ec_Database_Schema {

	/**
	 * @var wpdb Instance of wpdb class
	 */
	protected $_db       = NULL;

	/**
	 * @var Ai1ec_Database Instance of Ai1ec_Database class
	 */
	protected $_ai1ec_db = NULL;

	/**
	 * Constructor
	 *
	 * @return void Constructor does not return
	 */
	public function __construct() {
		global $wpdb;
		$this->_db       = $wpdb;
		$this->_ai1ec_db = Ai1ec_Database::instance();
	}

	/**
	 * upgrade method
	 *
	 * Using reflection API retrieve list of methods, that have `@since` comment
	 * set to value no lower than requested version and call these methods.
	 *
	 * @param int $target_ver Target version, to upgrade to
	 *
	 * @return bool Success
	 */
	public function upgrade( $target_ver = NULL ) {
		if ( NULL === $target_ver ) {
			$target_ver = AI1EC_DB_VERSION;
		}
		$target_ver  = (int)$target_ver;
		$curr_class  = get_class( $this );
		$reflection  = new ReflectionClass( $this );
		$method_list = $reflection->getMethods( ReflectionMethod::IS_PUBLIC );
		$since_regex = '#@since\s+(\d+)[^\d]#sx';
		foreach ( $method_list as $method ) {
			if (
				$method->getDeclaringClass()->getName() !== $curr_class ||
				( $name = $method->getName() ) === __FUNCTION__
			) {
				continue;
			}
			$doc_comment = $method->getDocComment();
			if ( ! preg_match( $since_regex, $doc_comment, $matches ) ) {
				continue;
			}
			$since       = (int)$matches[1];
			try {
				if (
					$since <= $target_ver &&
					! $this->{$name}()
				) {
					return false;
				}
			} catch ( Ai1ec_Database_Schema_Exception $exception ) {
				pr( (string)$exception );
				return false;
			}
		}
		return true;
	}

	/**
	 * get_columns method
	 *
	 * Get map of columns defined for table.
	 *
	 * @NOTICE: no optimization will be performed here, and response will not
	 * be cached, to allow checking result of DDL statements.
	 *
	 * @param string $table Name of table to retrieve column names for
	 *
	 * @return array Map of column names and their representation
	 *
	 * @throws Ai1ec_Database_Schema_Exception If an error occurs
	 */
	public function get_columns( $table ) {
		$sql_query = 'SHOW FULL COLUMNS FROM ' .
			$this->_ai1ec_db->table( $table );
		$result    = $this->_db->get_results( $sql_query );
		$columns   = array();
		foreach ( $result as $column ) {
			$columns[$column->Field] = array(
				'name' => $column->Field,
				'type' => preg_replace(
					'#\s+#',
					' ',
					strtolower( $column->Type )
				),
				'null' => $column->Null,
			);
		}
		return $columns;
	}

	/**
	 * convert_instance_times_to_uint method
	 *
	 * Make event_instances `start` and `end` fields INT(10) UNSIGNED
	 * instead of previous - DATE.
	 *
	 * @since 118
	 *
	 * @return bool Success
	 *
	 * @throws Ai1ec_Database_Schema_Exception On failure
	 */
	public function convert_instance_times_to_uint() {
		try {
			$this->_ai1ec_db->table( 'events' );
			$table   = $this->_ai1ec_db->table( 'event_instances' );
		} catch ( Ai1ec_Database_Schema_Exception $exception ) {
			return true; // it will be created - no need to convert
		}
		$columns   = array( 'start', 'end' );
		$target    = 'int(10) unsigned';
		$method    = 'UNIX_TIMESTAMP';

		if ( ! $this->_check_column_types( $table, $columns, $target ) ) {
			$tmp_table = $table . '_tmp';
			if (
				! $this->_clean_out_of_bound_dates( $table, $columns ) ||
				! $this->_clone_table( $table, $tmp_table ) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_ai1ec_db->drop_indices(
					$tmp_table,
					'evt_instance'
				) ||
				! $this->_change_column_type(
					$tmp_table,
					$columns,
					$target,
					$method
				) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_ai1ec_db->create_indices(
					$tmp_table,
					array(
						 'evt_instance' => array(
							'unique'  => true,
							'columns' => array( 'post_id', 'start' ),
							'name'    => 'evt_instance',
						),
					)
				) ||
				! $this->_replace_and_keep( $table, $tmp_table )
			) {
				return false;
			}
		}

		$table     = $this->_ai1ec_db->table( 'events' );
		if ( ! $this->_check_column_types( $table, $columns, $target ) ) {
			$tmp_table = $table . '_tmp';
			if (
				! $this->_clean_out_of_bound_dates( $table, $columns ) ||
				! $this->_clone_table( $table, $tmp_table ) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_change_column_type(
					$tmp_table,
					$columns,
					$target,
					$method
				) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_replace_and_keep( $table, $tmp_table )
			) {
				return false;
			}
		}

		try {
			$table   = $this->_ai1ec_db->table( 'facebook_users_events' );
		} catch ( Ai1ec_Database_Schema_Exception $exception ) {
			return true; // it will be created - no need to convert
		}
		$columns = array( 'start' );
		if ( ! $this->_check_column_types( $table, $columns, $target ) ) {
			$tmp_table = $table . '_tmp';
			if (
				! $this->_clean_out_of_bound_dates( $table, $columns ) ||
				! $this->_clone_table( $table, $tmp_table ) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_change_column_type(
					$tmp_table,
					$columns,
					$target,
					$method
				) ||
				$this->_has_zeroed_columns( $tmp_table, $columns ) ||
				! $this->_replace_and_keep( $table, $tmp_table )
			) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check for columns having zeroed value
	 *
	 * Note, that 'column = 0' returns true for both int( 0 ) and
	 * date( '0000-00-00' ) column values
	 *
	 * @param string $table   Name of table to check for zeroed values
	 * @param array  $columns List of columns to check for zeroed values
	 *
	 * @return bool True if table has zeroed columns
	 */
	protected function _has_zeroed_columns( $table, array $columns ) {
		$sql_query = 'SELECT COUNT(*) FROM ' . $table . ' WHERE ';
		foreach ( $columns as $name ) {
			$sql_query .= ' OR ' . $name . ' = 0';
		}
		$count     = $this->_db->get_var( $sql_query );
		if ( false !== $count && $count > 0 ) {
			return true;
		}
		return false;
	}

	/**
	 * Remove entries from tables, that have dates outside UNIX time range
	 *
	 * Dates in DATETIME format are expected in columns listed under
	 * {@see $columns}. The DELETE with WHERE is performed to remove
	 * indicating full UNIX range explicitly and using INSTR to make
	 * sure that operations are not carried out against INT fields.
	 *
	 * @param string $table   Name of table to delete entries from
	 * @param array  $columns List of columns to check for dates
	 *
	 * @return bool Success
	 */
	protected function _clean_out_of_bound_dates( $table, array $columns ) {
		if ( empty( $columns ) ) {
			return false;
		}
		$conditions = array();
		foreach ( $columns as $name ) {
			$conditions[] = '( ' .
				'`' . $name . '` < "1970-01-01 03:00:00" OR ' .
				'`' . $name . '` > "2038-01-19 03:14:08" ' .
				') AND INSTR( `' . $name . '`, "-" ) > 0';
		}
		$sql_query  = 'DELETE FROM ' . $table . ' WHERE (' .
			implode( ') OR (', $conditions ) . ')';
		return ( false !== $this->_dry_query( $sql_query ) );
	}

	/**
	 * Replace old table with new table while keeping a copy of old table
	 *
	 * @param string $old_table Old table name
	 * @param string $new_table New table name
	 * @param string $suffix    Suffix to add to kept old table
	 *
	 * @return bool Success
	 */
	protected function _replace_and_keep(
		$old_table,
		$new_table,
		$suffix = '_restore'
	) {
		$restore_name = $old_table . $suffix;
		if ( ! $this->_dry_query( 'DROP TABLE IF EXISTS ' . $restore_name ) ) {
			return false;
		}
		$this->_dry_query(
			'RENAME TABLE ' . $old_table . ' TO ' . $restore_name .
			', ' . $new_table . ' TO ' . $old_table
		);
		try {
			$this->_ai1ec_db->table( $restore_name );
		} catch ( Ai1ec_Database_Schema_Exception $exception ) {
			return false;
		}
		return true;
	}

	/**
	 * Clone a table (structure and data)
	 *
	 * @param string $existing  Table to be cloned
	 * @param string $new_table Target table name
	 *
	 * @return bool Success
	 *
	 * @throws Ai1ec_Database_Schema_Exception If an unexpected is encountered
	 */
	protected function _clone_table( $existing, $new_table ) {
		$existing  = $this->_ai1ec_db->table( $existing );
		$new_table = $this->_ai1ec_db->table( $new_table, true );
		$drop      = 'DROP TABLE IF EXISTS ' . $new_table;
		$create    = 'CREATE TABLE ' . $new_table . ' LIKE ' . $existing;
		if (
			! $this->_dry_query( $drop ) ||
			! $this->_dry_query( $create )
		) {
			return false;
		}
		$query     = 'INSERT INTO ' . $new_table .
			' SELECT * FROM ' . $existing;
		if ( false === $this->_dry_query( $query ) ) {
			return false;
		}
		$count_new = $this->_db->get_var(
			'SELECT COUNT(*) FROM ' . $new_table
		);
		$count_old = $this->_db->get_var(
			'SELECT COUNT(*) FROM ' . $existing
		);
		// check if difference between tables records doesn't exceed
		// several least significant bits of old table entries count
		if ( absint( $count_new - $count_old ) > ( $count_old >> 4 ) ) {
			return false;
		}
		return true;
	}

	/**
	 * _dry_query method
	 *
	 * Perform query, unless `dry_run` is selected. In later case just output
	 * the final query and return true.
	 *
	 * @param string $query SQL Query to execute
	 *
	 * @return mixed Query state, or true in dry run mode
	 */
	protected function _dry_query( $query ) {
		return $this->_ai1ec_db->_dry_query( $query );
	}

	/**
	 * _check_column_types method
	 *
	 * Check types of given columns in requested table.
	 *
	 * @param string $table        Name of table to perform checks against
	 * @param array  $column_names List of columns to validate
	 * @param string $target_type  Expected column type
	 * @param bool   $return_count Set to true, to return count of matching
	 *                             columns, otherwise returns true on match
	 *
	 * @return bool|int True if columns matches, false otherwise, or match count
	 */
	protected function _check_column_types(
		$table,
		array $column_names,
		$target_type,
		$return_count = false
	) {
		$columns = array();
		try {
			$columns   = $this->get_columns( $table );
		} catch ( Ai1ec_Database_Schema_Exception $exception ) {
			return true;
		}
		$converted = 0;
		foreach ( $column_names as $name ) {
			if ( ! isset( $columns[$name] ) ) {
				throw new Ai1ec_Database_Schema_Exception(
					'Column ' . $name . ' is expected on ' .
					$table . ' but does not exist'
				);
			}
			if ( $target_type === $columns[$name]['type'] ) {
				++$converted;
			}
		}
		if ( $return_count ) {
			return $converted;
		}
		if ( $converted !== count( $column_names ) ) {
			return false;
		}
		return true;
	}

	/**
	 * _change_column_type method
	 *
	 * Convert requested columns to other type
	 *
	 * @param string $table        Name of table to perform conversion against
	 * @param array  $column_names List of columns to convert
	 * @param string $target_type  Type to convert to
	 * @param string $converter    MySQL function to use for data conversion
	 *
	 * @return bool Success
	 *
	 * @throws Ai1ec_Database_Schema_Exception If unrecoverable error occurs
	 */
	protected function _change_column_type(
		$table,
		array $column_names,
		$target_type,
		$converter
	) {
		$suffix    = '_intermediate';
		$col_extra = ' NOT NULL';
		$columns   = $this->get_columns( $table );

		$converted = $this->_check_column_types(
			$table,
			$column_names,
			$target_type,
			true
		);
		if ( $converted === count( $column_names ) ) {
			return true;
		} elseif ( $converted > 0 ) {
			throw new Ai1ec_Database_Schema_Exception(
				'Some columns on ' . $table . ' not converted to ' .
				$target_type
			);
		}

		$sql_query = 'ALTER TABLE ' . $table;
		$perform   = false;
		foreach ( $column_names as $name ) {
			$new_name = $name . $suffix;
			if ( ! isset( $columns[$new_name] ) ) {
				if ( $perform ) {
					$sql_query .= ', ';
				}
				$sql_query .= ' ADD COLUMN ' . $new_name . ' ' .
					$target_type . $col_extra;
				$perform    = true;
			}
		}
		if ( $perform && ! $this->_dry_query( $sql_query ) ) {
			throw new Ai1ec_Database_Schema_Exception(
				'Failed to add intermediate columns for ' .
				implode( ',', $column_names ) . ' to ' . $table
			);
		}

		$sql_query = 'UPDATE ' . $table . ' SET ';
		$not_first = false;
		foreach ( $column_names as $name ) {
			if ( $not_first ) {
				$sql_query .= ', ';
			}
			$sql_query .= $name . $suffix . ' = ' . $converter .
				'(' . $name . ')';
			$not_first = true;
		}
		$this->_dry_query( $sql_query );

		$sql_query = 'ALTER TABLE ' . $table;
		$not_first = false;
		foreach ( $column_names as $name ) {
			if ( $not_first ) {
				$sql_query .= ', ';
			}
			$sql_query .= ' DROP COLUMN ' . $name
				. ', CHANGE COLUMN ' . $name . $suffix . ' ' .
				$name . ' ' . $target_type . $col_extra;
			$not_first = true;
		}

		if ( ! $this->_dry_query( $sql_query ) ) {
			throw new Ai1ec_Database_Schema_Exception(
				'Failed to restore table ' . $table . ' to correct order'
			);
		}

		return true;
	}

}
