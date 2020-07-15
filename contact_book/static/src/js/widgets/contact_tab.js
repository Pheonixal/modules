odoo.define('contact_book.ContactTab', function (require) {
"use strict";

var BasicWidget = require('contact_book.BasicWidget');
var ResPartner = require('contact_book.ResPartner');
var core = require('web.core');
var Dialog = require('web.Dialog');
var session = require('web.session');

var _t = core._t;


var ContactTab = BasicWidget.extend({
    template: "contact_book.tab_contact",
    events:{
        'click .contact-tab-contact-item': '_onClickContact',
        'dblclick .contact-tab-contact-item': '_onDbClickContact',
        'click .btn-view-line': '_onClickViewLine',
        'click .btn-call-phone': '_onClickCallPhone',
        'click .btn-send-sms': '_onClickSendSMS',
    },
    
    /**
     * @constructor
     */
    init: function (parent, options) {
        var _fields = ['id', 'display_name', 'phone', 'mobile', 'email',
            'comment'];
        var LineWidget = ResPartner;
        var _model = 'res.partner';
        var _method = 'search_read';
        var containerEle = $('#o_mmm_contact_book_tab_contact');
        options = options || {};
        options._fields = _fields;
        options.LineWidget = LineWidget;
        options._model = _model;
        options._method = _method;
        options.containerEle = containerEle;
        /*
        options.forceDomain = [
            ['parent_id', '=', false],
        ];
        */
        console.log('options');
        console.log(options);
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
    /**
     * @private
     */
    _onClickViewLine: function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        // Open contact form
        this._openContact();
    },
    _onClickCallPhone: function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        Dialog.alert(self, _t("Please buy the module 'Contact Book Phone'!"), {
            confirm_callback: function() {
                return;
            },
            title: _t('Warning'),
        });
    },
    _onClickSendSMS: function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        Dialog.alert(self, _t("Please buy the module 'Contact Book SMS'!"), {
            confirm_callback: function() {
                return;
            },
            title: _t('Warning'),
        });        
    },
    _onClickContact: function(event){
        var $item = $(event.currentTarget);
        var $currentActive = $item.parent().find('li.active');
        if ($currentActive){
            $currentActive.removeClass('active');
        }
        var itemId = $item.attr('oe-contact-id');
        $item.addClass('active');
        this.setSelectedLine(itemId);
    },
    _onDbClickContact: function(event){
        this._onClickContact(event);
        // Open contact form
        this._openContact();
    },
    _openContact: function(){
        if (this.selectedRecord){
            var ctx = session.user_context;
            ctx.default_customer = 1;
            ctx.search_default_customer= 1;
            this.do_action({
                name: 'Contact',
                res_model: 'res.partner',
                views: [[false, 'form']],
                type: 'ir.actions.act_window',
                view_type: 'form',
                view_mode: 'form',
                res_id: this.selectedRecord.id || false,
                context: ctx
            });
        }
    },
    //--------------------------------------------------------------------------
    // Tools
    //--------------------------------------------------------------------------

});

return ContactTab;
});