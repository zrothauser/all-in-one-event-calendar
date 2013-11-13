<?php
interface Ai1ec_Import_Export_Engine {

	/**
	 * This methods allow for importing of events.
	 * 
	 * @param array $arguments An array of arguments needed for parsing.
	 * 
	 * @throws Ai1ec_Parse_Exception When the data passed is not parsable
	 * 
	 * @return int The number of imported events.
	 */
	public function import( array $arguments );
	public function export( array $arguments );
}