odoo.define('contact_book.HistoryTab', function (require) {
"use strict";

var BasicWidget = require('contact_book.BasicWidget');
var ContactBookHistory = require('contact_book.ContactBookHistory');
var session = require('web.session');


var HistoryTab = BasicWidget.extend({
    template: "contact_book.tab_history",
    events:{
        //'click .contact-tab-contact-item': '_onClickContact',
       // 'dblclick .contact-tab-contact-item': '_onDbClickContact',
    },
    
    /**
     * @constructor
     */
    init: function (parent, options) {
        var _fields = ['id', 'date', 'type', 'user_id', 'contact_name',
            'phone', 'email', 'fa_icon', 'res_id', 'res_model'];
        var LineWidget = ContactBookHistory;
        var _model = 'contact.book.history';
        var _method = 'search_read';
        var containerEle = $('#o_mmm_contact_book_tab_history');
        options = options || {};
        options._fields = _fields;
        options.LineWidget = LineWidget;
        options._model = _model;
        options._method = _method;
        options.containerEle = containerEle;
        this._super(parent, _.extend({}, {}, options));
    },
    /**
     * @override
     */
    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------
    /**
     *
     * @private
     * @param {MouseEvent} ev
     */

});

return HistoryTab;
});