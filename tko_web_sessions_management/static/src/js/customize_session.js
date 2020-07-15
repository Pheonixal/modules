odoo.define( 'web_session_mgt.web_session_mgt', function () {
    'use strict';

    /* ---------------------------------------------------------
     * Odoo Session Expired
     *---------------------------------------------------------*/

    $( document ).ready(function () {
        $("body").click(function () {
            $.getJSON("/ajax/session/", function ( data ) {
                if (data) {
                    if (data.result === 'true') {
                        location.reload();
                    }
                }
            });
        });
    });
});
