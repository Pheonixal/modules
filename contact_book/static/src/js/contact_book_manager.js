odoo.define('contact_book.Manager', function (require) {
"use strict";

/**
 * This service is responsible for anything related to contact_book in JS.
 *
 * when building a new module for call center, we will re-use this service
 * Reference from mail.Manager
 * @example
 *
 * To get all the contacts that have been fetched from the server:
 *
 *      this.call('contact_book_service', 'getContacts');
 *
 */
var AbstractService = require('web.AbstractService');

var Bus = require('web.Bus');
var config = require('web.config');
var core = require('web.core');
var session = require('web.session');

var ContactBookView = require('contact_book.View');
var ContactTab = require('contact_book.ContactTab');
var HistoryTab = require('contact_book.HistoryTab');

var _t = core._t;


var ContactBookManager =  AbstractService.extend({
    dependencies: ['ajax', 'bus_service', 'local_storage'],

    /**
     * @override
     */
    init: function () {
        this._super.apply(this, arguments);
    },
    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._contactBookWindow = false;
        this._contactTab = null;
        this._historyTab = null;
    },

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------
    /**
     * Open a contact book window if not existed
     *
     */
    openContactBookWindow: function () {
        if (!this._contactBookWindow){
            this._contactBookWindow = new ContactBookView(this);
            var def = this._contactBookWindow.appendTo($('body')
                    ).then(_.bind(this._contactBookWindow._doDisplay, this._contactBookWindow));
            def.then(_.bind(this.loadContacts, this)).then(_.bind(this.loadHistories, this));
        }
        else {
            this._contactBookWindow._doDisplay();
        }
        //var def = this.loadContacts();
        //def.then(_.bind(this.loadHistories, this));
        
    },
    /**
     * Load partners for the tab Contact
     *
     */

    loadHistories: function(domain=false, onSearch=false){
        if (!this._historyTab){
            this._historyTab = new HistoryTab(this);
        }
        var def = this._historyTab.getList(domain, onSearch);
        def.then(_.bind(this._historyTab.displayAtBottom, this._historyTab));
        return def;
    },
    addContact: function (contact) {
        if (!this._contactTab){
            this._contactTab = new ContactTab(this);
        }
        this._contactTab._parseLines([contact]);
        this._contactTab.setSelectedLine(contact.id);
        this._contactTab.displayAtTop();
    },
    loadContacts: function (domain=false, onSearch=false) {
        if (!this._contactTab){
            this._contactTab = new ContactTab(this);
        }
        var def = this._contactTab.getList(domain, onSearch);
        def.then(_.bind(this._contactTab.displayAtBottom, this._contactTab));
        return def;
    },
    getSelectedRecord: function(){
        if (!this._contactTab){
            return null;
        }
        return this._contactTab.selectedRecord;
    },
    unsetSelectedRecord: function(){
        if (!this._contactTab){
            return null;
        }
        this._contactTab.selectedRecord = null;
    },
});

return ContactBookManager;

});
