odoo.define('contact_book.Service', function (require) {
"use strict";

var core = require('web.core');

var ContactBookManager = require('contact_book.Manager');

core.serviceRegistry.add('contact_book_service', ContactBookManager);

return ContactBookManager;

});
