<?php

/**
 * Helper for recurrence rules.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Recurrence
 */
class Ai1ec_Recurrence_Rule extends Ai1ec_Base {

	/**
	 * Parse a `recurrence rule' into an array that can be used to calculate
	 * recurrence instances.
	 *
	 * @see http://kigkonsult.se/iCalcreator/docs/using.html#EXRULE
	 *
	 * @param string $rule
	 * @return array
	 */
	public function build_recurrence_rules_array( $rule ) {
		$rules     = array();
		$rule_list = explode( ';', $rule );
		foreach ( $rule_list as $single_rule ) {
			if ( false === strpos( $single_rule, '=' ) ) {
				continue;
			}
			list( $key, $val ) = explode( '=', $single_rule );
			$key               = strtoupper( $key );
			switch ( $key ) {
				case 'BYDAY':
					$rules['BYDAY'] = array();
					foreach ( explode( ',', $val ) as $day ) {
						$rule_map = $this->create_byday_array( $day );
						$rules['BYDAY'][] = $rule_map;
						if (
							preg_match( '/FREQ=(MONTH|YEAR)LY/i', $rule ) &&
							1 === count( $rule_map )
						) {
							// monthly/yearly "last" recurrences need day name
							$rules['BYDAY']['DAY'] = substr(
								$rule_map['DAY'],
								-2
							);
						}
					}
					break;

				case 'BYMONTHDAY':
				case 'BYMONTH':
					if ( false === strpos( $val, ',' ) ) {
						$rules[$key] = $val;
					} else {
						$rules[$key] = explode( ',', $val );
					}
					break;

				default:
					$rules[$key] = $val;
			}
		}
		return $rules;
	}

	/**
	 * when using BYday you need an array of arrays.
	 * This function create valid arrays that keep into account the presence
	 * of a week number beofre the day
	 *
	 * @param string $val
	 * @return array
	 */
	protected function create_byday_array( $val ) {
		$week = substr( $val, 0, 1 );
		if ( is_numeric( $week ) ) {
			return array( $week, 'DAY' => substr( $val, 1 ) );
		}
		return array( 'DAY' => $val );
	}
}