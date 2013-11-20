<?php

/**
* Wrapper for WPDB (WordPress DB Class)
*
* Thic class wrap the access to WordPress DB class ($wpdb) and
* allows us to abstract from the WordPress code and to expand it
* with convenience method specific for ai1ec
*
* @author     Time.ly Network, Inc.
* @since      2.0
* @package    Ai1EC
* @subpackage Ai1EC.Dbi
*/
class Ai1ec_Dbi {

	/**
	 * @var wpdb Instance of database interface object
	 */
	protected $_dbi = null;

	/**
	 * Constructor assigns injected database access object to class variable
	 *
	 * @param wpdb $dbi Injected database access object
	 *
	 * @return void Constructor does not return
	 */
	public function __construct( $dbi = null ) {
		if ( null === $dbi ) {
			global $wpdb;
			$dbi = $wpdb;
		}
		$this->_dbi = $dbi;
	}

	/**
	 * Perform a MySQL database query, using current database connection.
	 *
	 * @param string $sql_query Database query
	 *
	 * @return int|false Number of rows affected/selected or false on error
	 */
	public function query( $sql_query ) {
		return $this->_dbi->query( $sql_query );
	}

	/**
	 * Retrieve one column from the database.
	 *
	 * Executes a SQL query and returns the column from the SQL result.
	 * If the SQL result contains more than one column, this function returns the column specified.
	 * If $query is null, this function returns the specified column from the previous SQL result.
	 *
	 * @param string|null $query Optional. SQL query. Defaults to previous query.
	 * @param int         $col   Optional. Column to return. Indexed from 0.
	 *
	 * @return array Database query result. Array indexed from 0 by SQL result row number.
	 */
	public function get_col( $query = null , $col = 0 ) {
		return $this->_dbi->get_col( $query, $col );
	}

	/**
	 * Prepares a SQL query for safe execution. Uses sprintf()-like syntax.
	 *
	 * The following directives can be used in the query format string:
	 *   %d (integer)
	 *   %f (float)
	 *   %s (string)
	 *   %% (literal percentage sign - no argument needed)
	 *
	 * All of %d, %f, and %s are to be left unquoted in the query string and they need an argument passed for them.
	 * Literals (%) as parts of the query must be properly written as %%.
	 *
	 * This function only supports a small subset of the sprintf syntax; it only supports %d (integer), %f (float), and %s (string).
	 * Does not support sign, padding, alignment, width or precision specifiers.
	 * Does not support argument numbering/swapping.
	 *
	 * May be called like {@link http://php.net/sprintf sprintf()} or like {@link http://php.net/vsprintf vsprintf()}.
	 *
	 * Both %d and %s should be left unquoted in the query string.
	 *
	 * @param string $query Query statement with sprintf()-like placeholders
	 * @param array|mixed $args The array of variables to substitute into the query's placeholders if being called like
	 * 	{@link http://php.net/vsprintf vsprintf()}, or the first variable to substitute into the query's placeholders if
	 * 	being called like {@link http://php.net/sprintf sprintf()}.
	 * @param mixed $args,... further variables to substitute into the query's placeholders if being called like
	 * 	{@link http://php.net/sprintf sprintf()}.
	 *
	 * @return null|false|string Sanitized query string, null if there is no query, false if there is an error and string
	 * 	if there was something to prepare
	 */
	public function prepare( $query, $args ) {

		if ( null === $query ) {
			return null;
		}

		$args = func_get_args();
		array_shift( $args );
		// If args were passed as an array (as in vsprintf), move them up
		if ( isset( $args[0] ) && is_array( $args[0] ) ) {
			$args = $args[0];
		}
		$query = str_replace( "'%s'", '%s', $query ); // in case someone mistakenly already singlequoted it
		$query = str_replace( '"%s"', '%s', $query ); // doublequote unquoting
		$query = preg_replace( '|(?<!%)%f|', '%F', $query ); // Force floats to be locale unaware
		$query = preg_replace( '|(?<!%)%s|', "'%s'", $query ); // quote the strings, avoiding escaped strings like %%s
		array_walk( $args, array( $this->_dbi, 'escape_by_ref' ) );
		return @vsprintf( $query, $args );
	}

	/**
	 * Retrieve an entire SQL result set from the database (i.e., many rows)
	 *
	 * Executes a SQL query and returns the entire SQL result.
	 *
	 * @param string $query SQL query.
	 * @param string $output Optional. Any of ARRAY_A | ARRAY_N | OBJECT | OBJECT_K constants. With one of the first three, return an array of rows indexed from 0 by SQL result row number.
	 * 	Each row is an associative array (column => value, ...), a numerically indexed array (0 => value, ...), or an object. ( ->column = value ), respectively.
	 * 	With OBJECT_K, return an associative array of row objects keyed by the value of each row's first column's value. Duplicate keys are discarded.
	 *
	 * @return mixed Database query results
	 */
	public function get_results( $query, $output = OBJECT ){
		return $this->_dbi->get_results( $query, $output );
	}

	/**
	 * Retrieve one variable from the database.
	 *
	 * Executes a SQL query and returns the value from the SQL result.
	 * If the SQL result contains more than one column and/or more than one row, this function returns the value in the column and row specified.
	 * If $query is null, this function returns the value in the specified column and row from the previous SQL result.
	 *
	 * @param string|null $query SQL query. Defaults to null, use the result from the previous query.
	 * @param int         $col   Column of value to return. Indexed from 0.
	 * @param int         $row   Row of value to return. Indexed from 0.
	 *
	 * @return string|null Database query result (as string), or null on failure
	 */
	public function get_var( $query = null, $col = 0, $row = 0 ) {
		return $this->_dbi->get_var( $query, $col, $row );
	}

	/**
	 * Retrieve one row from the database.
	 *
	 * Executes a SQL query and returns the row from the SQL result
	 *
	 * @param string|null $query SQL query.
	 * @param string $output Optional. one of ARRAY_A | ARRAY_N | OBJECT constants. Return an associative array (column => value, ...),
	 * 	a numerically indexed array (0 => value, ...) or an object ( ->column = value ), respectively.
	 * @param int $row Optional. Row to return. Indexed from 0.
	 *
	 * @return mixed Database query result in format specified by $output or null on failure
	 */
	public function get_row( $query = null, $output = OBJECT, $row = 0 ) {
		return $this->_dbi->get_row( $query, $output, $row );
	}

	/**
	 * Insert a row into a table.
	 *
	 * @param string $table table name
	 * @param array $data Data to insert (in column => value pairs). Both $data columns and $data values should be "raw" (neither should be SQL escaped).
	 * @param array|string $format Optional. An array of formats to be mapped to each of the value in $data. If string, that format will be used for all of the values in $data.
	 * 	A format is one of '%d', '%f', '%s' (integer, float, string). If omitted, all values in $data will be treated as strings unless otherwise specified in wpdb::$field_types.
	 *
	 * @return int|false The number of rows inserted, or false on error.
	 */
	public function insert( $table, $data, $format = null ) {
		return $this->_dbi->insert( $table, $data, $format );
	}

	/**
	 * Update a row in the table
	 *
	 * @param string $table table name
	 * @param array $data Data to update (in column => value pairs). Both $data columns and $data values should be "raw" (neither should be SQL escaped).
	 * @param array $where A named array of WHERE clauses (in column => value pairs). Multiple clauses will be joined with ANDs. Both $where columns and $where values should be "raw".
	 * @param array|string $format Optional. An array of formats to be mapped to each of the values in $data. If string, that format will be used for all of the values in $data.
	 * 	A format is one of '%d', '%f', '%s' (integer, float, string). If omitted, all values in $data will be treated as strings unless otherwise specified in wpdb::$field_types.
	 * @param array|string $where_format Optional. An array of formats to be mapped to each of the values in $where. If string, that format will be used for all of the items in $where. A format is one of '%d', '%f', '%s' (integer, float, string). If omitted, all values in $where will be treated as strings.
	 *
	 * @return int|false The number of rows updated, or false on error.
	 */
	public function update( $table, $data, $where, $format = null, $where_format = null ) {
		return $this->_dbi->update( $table, $data, $where, $format, $where_format );
	}

	/**
	 * The database version number.
	 *
	 * @return false|string false on failure, version number on success
	 */
	public function db_version() {
		return $this->_dbi->db_version();
	}

	/**
	 * Return the id of last `insert` operation.
	 *
	 * @return int Returns integer optionally zero when no insert was performed.
	 */
	public function get_insert_id() {
		return $this->_dbi->insert_id;
	}

	/**
	 * Return the full name for the table.
	 *
	 * @param string $table Table name.
	 *
	 * @return string Full table name for the table requested.
	 */
	public function get_table_name( $table = '' ) {
		if ( ! isset( $this->_dbi->{$table} ) ) {
			return $this->_dbi->prefix . $table;
		}
		return $this->_dbi->{$table};
	}

}