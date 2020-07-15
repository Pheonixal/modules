odoo.define('contact_book.ResPartner', function (require) {
"use strict";

var BasicWidget = require('contact_book.BasicWidget');


var ResPartner = BasicWidget.extend({
    events:{
    },
    
    /**
     * @constructor
     */
    init: function (parent, options) {
        this._super.apply(this, arguments);
        this.model = 'res.partner';
        this.id = options.id;
        this.display_name = options.display_name;
        this.phone = options.phone;
        this.mobile = options.mobile;
        this.email = options.email;
        this.image_small = options.image_small || this.setImage();
        this.comment = options.comment;
    },
    /**
     * @override
     */
    setImage: function () {
        var src = '/web/image?model=' + this.model + '&id=' + this.id + '&field=image_128&unique=' + $.now();
        return src;
    },

});

return ResPartner;
});