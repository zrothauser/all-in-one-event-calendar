<?php
/**
* Wrapper for WPDB (WordPress DB Class)
*
* Thic class wrap the access to Wordpress DB class ($wpdb) and
* allows us to abstract from the wordpress code and to expand it
* with convenience method specific for ai1ec
*
* @author     Time.ly Network, Inc.
* @since      2.0
* @package    Ai1EC
* @subpackage Ai1EC.Dbi
*/
class Ai1ec_Dbi
{

	/**
	 * @var wpdb Instance of database interface object
	 */
	protected $_dbi = NULL;

	/**
	 * @var Ai1ec_Dbi Singleton instance of self
	 */
	static protected $_instance = NULL;

	/**
	 * Return an instance of the class to be used
	 *
	 * More about the singleton pattern: http://www.oodesign.com/singleton-pattern.html
	 *
	 * @return Ai1ec_Dbi an instance of the class
	 */
	static public function instance() {
		if ( ! self::$_instance instanceof self ) {
			global $wpdb;
			self::$_instance = new self( $wpdb );
		}
		return self::$_instance;
	}

	/**
	 * Constructor assigns injected database access object to class variable
	 *
	 * @param wpdb $dbi Injected database access object
	 *
	 * @return void Constructor does not return
	 */
	public function __construct( $dbi ) {
		$this->_dbi = $dbi;
	}

	/**
	 * Perform a MySQL database query, using current database connection.
	 *
	 * @param string $query Database query
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
	 *	 *
	 * @param string|null $query Optional. SQL query. Defaults to previous query.
	 * @param int $x Optional. Column to return. Indexed from 0.
	 * @return array Database query result. Array indexed from 0 by SQL result row number.
	 */
	public function get_col( $query = null , $x = 0 ) {
		return $this->_dbi->get_col( $query, $x );
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
	 * @return null|false|string Sanitized query string, null if there is no query, false if there is an error and string
	 * 	if there was something to prepare
	 */
	public function prepare( $sql_query, $args ){

		if ( NULL === $query ) {
			return NULL;
		}

		$args = func_get_args();
		array_shift( $args );
		// If args were passed as an array (as in vsprintf), move them up
		if ( isset( $args[0] ) && is_array( $args[0] ) ) {
			$args = $args[0];
		}
		$query = str_replace( "'%s'", '%s', $query ); // in case someone mistakenly already singlequoted it
		$query = str_replace( '"%s"', '%s', $query ); // doublequote unquoting
		$query = preg_replace( '|(?<!%)%f|' , '%F', $query ); // Force floats to be locale unaware
		$query = preg_replace( '|(?<!%)%s|', "'%s'", $query ); // quote the strings, avoiding escaped strings like %%s
		array_walk( $args, array( $this, 'escape_by_ref' ) );
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
	 * @return mixed Database query results
	 */
	public function get_results( $query, $output  )
		return $this->_dbi->get_results( $query, $output );
	}
	
	/**
	 * Retrieve one variable from the database.
	 *
	 * Executes a SQL query and returns the value from the SQL result.
	 * If the SQL result contains more than one column and/or more than one row, this function returns the value in the column and row specified.
	 * If $query is null, this function returns the value in the specified column and row from the previous SQL result.
	 *
	 * @param string|null $query Optional. SQL query. Defaults to null, use the result from the previous query.
	 * @param int $x Optional. Column of value to return. Indexed from 0.
	 * @param int $y Optional. Row of value to return. Indexed from 0.
	 * @return string|null Database query result (as string), or null on failure
	 */
	public function get_var( $query = null, $x = 0, $y = 0 ) {
		return $this->_dbi->get_var( $query, $x, $y );
	}

	/**
	 * Retrieve one row from the database.
	 *
	 * Executes a SQL query and returns the row from the SQL result
	 *
	 * @param string|null $query SQL query.
	 * @param string $output Optional. one of ARRAY_A | ARRAY_N | OBJECT constants. Return an associative array (column => value, ...),
	 * 	a numerically indexed array (0 => value, ...) or an object ( ->column = value ), respectively.
	 * @param int $y Optional. Row to return. Indexed from 0.
	 * @return mixed Database query result in format specified by $output or null on failure
	 */
	public function get_row( $query = null, $output = OBJECT, $y = 0 ) {
		return $this->_dbi->get_row( $query, $output, $y );
	}

	/**
	 * Insert a row into a table.
	 *
	 * @param string $table table name
	 * @param array $data Data to insert (in column => value pairs). Both $data columns and $data values should be "raw" (neither should be SQL escaped).
	 * @param array|string $format Optional. An array of formats to be mapped to each of the value in $data. If string, that format will be used for all of the values in $data.
	 * 	A format is one of '%d', '%f', '%s' (integer, float, string). If omitted, all values in $data will be treated as strings unless otherwise specified in wpdb::$field_types.
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
	public function db_version( ) {
		return $this->_dbi->db_version();
	}

	/**
	* @param string $table table name
	* @return string the full table name for the requested table
	*/
	public function get_table_name( $table ) {
		if ( ! isset( $this->_dbi->{$table} ) ){
			return $this->getPrefix() . $table;
		}
		return $this->_dbi->{$table};
	}

}

