<?php

/**
 * The concrete command that save settings.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Command
 */
class Ai1ec_Ticketing_Invitation_Save extends Ai1ec_Command_Save_Abstract
{

    /* (non-PHPdoc)
     * @see Ai1ec_Command::do_execute()
     */
    public function do_execute()
    {
        $api_settings = $this->_registry->get('helper.api-settings');
        $api_settings->ai1ec_setting_up_api_flags((isset($_POST['ai1ec_ticketing']) ? true : false));

        return array(
            'url' => ai1ec_admin_url(
                'edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-invitation'
            ),
            'query_args' => array(
                'updated' => 1
            )
        );
    }
}