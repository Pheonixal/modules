odoo.define('contact_book.SystrayItem', function (require) {
"use strict";

var Widget = require('web.Widget');
var SystrayMenu = require('web.SystrayMenu');
var Session = require('web.session');


var ContactBookSystrayItem = Widget.extend({
    template:'contact_book.systray_item',
    events: {
        "click": "_onOpenContactBook",
    },

    /**
     * Method called between @see init and @see start. Performs asynchronous
     * calls required by the rendering and the start method.
     *
     * This method should return a Deferred which is resolved when start can be
     * executed.
     *
     * @returns {Deferred}
     */
    willStart: function () {
        var self = this;
        return this._super.apply(this, arguments).then(function () {
            return Session.user_has_group('contact_book.group_contact_user').then(function (has_group) {
                self.group_incharge = has_group;
            });
        });
    },

    /**
     * @private
     * @param  {MouseEvent} ev
     */
    _onOpenContactBook: function (ev) {
        ev.preventDefault();
        this.call('contact_book_service', 'openContactBookWindow');
    },
});

SystrayMenu.Items.push(ContactBookSystrayItem);

return ContactBookSystrayItem;

});