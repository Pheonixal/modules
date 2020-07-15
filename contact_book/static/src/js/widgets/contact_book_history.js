odoo.define('contact_book.ContactBookHistory', function (require) {
"use strict";

var time = require('web.time');
var BasicWidget = require('contact_book.BasicWidget');


var ContactBookHistory = BasicWidget.extend({
    events:{
    },
    
    /**
     * @constructor
     */
    init: function (parent, options) {
        this._super.apply(this, arguments);
        this.model = 'contact.book.history';
        this.id = options.id;
        this.date = options.date;
        this.type = options.type;
        this.user_id = options.user_id;
        this.contact_name = options.contact_name;
        this.phone = options.phone;
        this.fa_icon = options.fa_icon;
        this.res_id = options.res_id;
        this.res_model = options.res_model;
        this.date_display = this.date ? moment(time.str_to_datetime(this.date)) : null;
    },
    /**
     * @override
     */
    

});

return ContactBookHistory;
});