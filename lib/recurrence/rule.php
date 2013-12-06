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
	 * Return given recurrence data as text.
	 *
	 * @param  string  $rrule   Recurrence rule
	 *
	 * @return string
	 */
	public function rrule_to_text( $rrule = '' ) {
		$txt = '';
		$rc  = new SG_iCal_Recurrence( new SG_iCal_Line( 'RRULE:' . $rrule ) );
		switch( $rc->getFreq() ) {
			case 'DAILY':
				$this->_get_interval( $txt, 'daily', $rc->getInterval() );
				$this->_ending_sentence( $txt, $rc );
				break;
			case 'WEEKLY':
				$this->_get_interval( $txt, 'weekly', $rc->getInterval() );
				$this->_get_sentence_by( $txt, 'weekly', $rc );
				$this->_ending_sentence( $txt, $rc );
				break;
			case 'MONTHLY':
				$this->_get_interval( $txt, 'monthly', $rc->getInterval() );
				$this->_get_sentence_by( $txt, 'monthly', $rc );
				$this->_ending_sentence( $txt, $rc );
				break;
			case 'YEARLY':
				$this->_get_interval( $txt, 'yearly', $rc->getInterval() );
				$this->_get_sentence_by( $txt, 'yearly', $rc );
				$this->_ending_sentence( $txt, $rc );
				break;
			default:
				$txt = $rrule;
		}
		return $txt;
	}

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

	/**
	 * _merge_exrule method
	 *
	 * Merge RRULE values to EXRULE, to ensure, that it matches the according
	 * repetition values, it is meant to exclude.
	 *
	 * NOTE: one shall ensure, that RRULE values are placed in between EXRULE
	 * keys, so that wording in UI would remain the same after mangling.
	 *
	 * @param string $exrule Value for EXRULE provided by user
	 * @param string $rrule  Value for RRULE provided by user
	 *
	 * @return string Modified value to use for EXRULE
	 */
	public function merge_exrule( $exrule, $rrule ) {
		$list_exrule = explode( ';', $exrule );
		$list_rrule  = explode( ';', $rrule  );
		$map_exrule  = $map_rrule   = array();
		foreach ( $list_rrule as $entry ) {
			if ( empty( $entry ) ) {
				continue;
			}
			list( $key, $value ) = explode( '=', $entry );
			$map_rrule[$key] = $value;
		}
		foreach ( $list_exrule as $entry ) {
			if ( empty( $entry ) ) {
				continue;
			}
			list( $key, $value ) = explode( '=', $entry );
			$map_exrule[$key] = $value;
		}

		$resulting_map = array_merge( $map_rrule, $map_exrule );
		$result_rule   = array();
		foreach ( $resulting_map as $key => $value ) {
			$result_rule[] = $key . '=' . $value;
		}
		$result_rule = implode( ';', $result_rule );
		return $result_rule;
	}
}