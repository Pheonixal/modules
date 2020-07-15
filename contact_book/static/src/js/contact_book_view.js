odoo.define('contact_book.View', function (require) {
"use strict";

var Widget = require('web.Widget');
var contact_book_view = null;
var core = require('web.core');
var Dialog = require('web.Dialog');
var session = require('web.session');

var _t = core._t;

var ContactBookMainView = Widget.extend({
    template: "contact_book.main_view",
    events:{
        "click .btn-search-contact-name": "_onSearchContactName",
        "keyup .o_contact_book_partner_info_name_input > input": "_enterSearchContactName",
        "click .o_contact_book_partner_info_email_input > span": "_onSearchEmail",
        "keyup .o_contact_book_partner_info_email_input > input": "_enterSearchEmail",
        "click .o_contact_book_partner_info_phone_input > span": "_onSearchPhone",
        "keyup .o_contact_book_partner_info_phone_input > input": "_enterSearchPhone",
        "click .o_contact_book_partner_info_comment_input > span": "_onSearchNote",
        "keyup .o_contact_book_partner_info_comment_input > input": "_enterSearchNote",
        'click .o_contact_book_window_close': '_onClickClose',
        'click .o_contact_book_window_title': '_onClickCollapseToggle',
        'click .btn-new-customer': '_onClickNewCustomer',
        'click .btn-new-opportunity': '_onClickNewOpportunity',
        'click .btn-send-email': '_onClickSendMail',
        'click .btn-new-activity': '_onClickNewActivity',
        'click .btn-remove-input': '_onClickRemoveInput',
    },
    FOLD_ANIMATION_DURATION: 200, // duration in ms for collapsing / expanding transition
    HEIGHT_OPEN: '700px', // height in px of contact book window when expanded
    HEIGHT_FOLDED: '34px', // height, in px, of contact book window when collapsed
    /**
     * @constructor
     */
    init: function (parent, options) {
        if (contact_book_view) {
            return contact_book_view;
        }
        if (!options){
            options = {'has_contact_call': false, 'has_contact_sms': false}
        }
        this._super(parent, _.extend({}, {
            title: _t("Contact book"),
        }, options));

        // Check if installed contact_call
        this.hasCall = options.has_contact_call;
        // Check if installed contact_sms
        this.hasSMS = options.has_contact_sms;

        //this._super.apply(this, arguments);
        contact_book_view = this;
        this.default_tab = 'contact';
    },
    /**
     * @override
     * this._displayStatus has 4 possible values (0, 1, 2, 3)
     * 0 is not created yet
     * 1 is displayed
     * 2 is collapsed 
     * 3 is closed
     */
    start: function () {
        var self = this;
        //this.$el.hide();
        this._displayStatus = 0;
        this.$searchInputName = this.$('.o_contact_book_partner_info_name_input > input');
        this.$searchInputPhone = this.$('.o_contact_book_partner_info_phone_input > input');
        this.$searchInputEmail = this.$('.o_contact_book_partner_info_email_input > input');
        this.$searchInputComment = this.$('.o_contact_book_partner_info_comment_input > input');
    },
    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------
    _onClickRemoveInput: function () {
        this.$searchInputName.val('');
        this.$searchInputPhone.val('');
        this.$searchInputEmail.val('');
        this.$searchInputComment.val('');
        this.call('contact_book_service', 'unsetSelectedRecord');
        // this.do_show();
    },
    _onClickNewActivity: function () {
        var currentRec = this.call('contact_book_service', 'getSelectedRecord');
        var recId = currentRec ? currentRec.id: '';
        if (!recId){
            Dialog.alert(self, _t("Please select a contact first!"), {
                confirm_callback: function() {
                    return;
                },
                title: _t('Warning'),
            });
            return;
        }
        var ctx = {};
        ctx.default_res_id = recId;
        ctx.default_res_model = 'res.partner';
        this.do_action({
            type: 'ir.actions.act_window',
            res_model: 'mail.activity',
            res_id: false,
            target: 'new',
            view_mode: 'form',
            view_type: 'form',
            views: [[false, 'form']],
            context: ctx,
        });
    },
    _onClickSendMail: function () {
        var currentRec = this.call('contact_book_service', 'getSelectedRecord');
        var recId = currentRec ? currentRec.id: '';
        var ctx = {
            'default_model': 'res.partner',
            'default_use_template': true,
            'default_composition_mode': 'mass_mail'
        };
        if (recId){
            ctx.active_ids = [recId];
            ctx.default_partner_ids = [recId];
            ctx.default_res_id = recId;
        }
        this.do_action({
            type: 'ir.actions.act_window',
            res_model: 'mail.compose.message',
            src_model: 'res.partner',
            target: 'new',
            key2: 'client_action_multi',
            multi: "True",
            views: [[false, 'form']],
            context: ctx,
        });
    },
    _onClickNewOpportunity: function () {
        var currentRec = this.call('contact_book_service', 'getSelectedRecord');
        var recId = currentRec ? currentRec.id: '';
        var ctx = {'default_type': 'opportunity',
                'search_default_assigned_to_me': 1 } 
        if (recId){
            ctx.default_partner_id = recId;
        }
        if (this.$searchInputName.val()){
            ctx.default_name = this.$searchInputName.val();
        }
        if (this.$searchInputPhone.val()){
            ctx.default_phone = this.$searchInputPhone.val();
        }
        if (this.$searchInputEmail.val()){
            ctx.default_email_from = this.$searchInputEmail.val();
        }
        if (this.$searchInputComment.val()){
            ctx.default_description = this.$searchInputComment.val();
        }
        this.do_action({
            name: 'Leads',
            res_model: 'crm.lead',
            views: [[false, 'form']],
            type: 'ir.actions.act_window',
            view_type: 'form',
            view_mode: 'form',
            context: ctx
        });
    },
    _onClickNewCustomer: function(){
        var ctx = session.user_context;
        ctx.default_customer = 1;
        ctx.search_default_customer= 1;
        if (this.$searchInputName.val()){
            ctx.default_name = this.$searchInputName.val();
        }
        if (this.$searchInputPhone.val()){
            ctx.default_phone = this.$searchInputPhone.val();
        }
        if (this.$searchInputEmail.val()){
            ctx.default_email = this.$searchInputEmail.val();
        }
        if (this.$searchInputComment.val()){
            ctx.default_comment = this.$searchInputComment.val();
        }
        this.do_action({
            name: 'Contact',
            res_model: 'res.partner',
            views: [[false, 'form']],
            type: 'ir.actions.act_window',
            view_type: 'form',
            view_mode: 'form',
            context: ctx
        });
    },
            
    /**
     * Close the thread window.
     * Mark the thread as read if the thread window was open.
     *
     * @private
     * @param {MouseEvent} ev
     */
    _onClickClose: function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (this._displayStatus in [1, 2]){
            this.$el.hide();
            this._displayStatus = 3;
        }
        // this.do_show();
    },

    /**
     * Fold/unfold the thread window.
     * Also mark the thread as read.
     *
     * @private
     */
    _onClickCollapseToggle: function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (this._displayStatus == 1){
            this.scrollToBottom();
            this._displayStatus = 2;
        } else if (this._displayStatus == 2){
            this._displayStatus = 1;
        }
        this._animateFold();
    },
    /**
     * @private
     */
    _doDisplay: function () {
        if (this._displayStatus == 1){
            return;
        }
        if (this._displayStatus == 2){
            this._displayStatus = 1;
            this._autofocus();
            this._animateFold();
            return ;
        }
        // this.do_show();
        if (this.$el){
            console.log('_doDisplay');
            this.$el.show();
        }
        this._displayStatus = 1;
        this._autofocus();
    },
    /**
     * Called when there is a change of the fold state of the thread window.
     * This method animates the change of fold state of this thread window.
     *
     * @private
     */
    _animateFold: function () {
        this.$el.animate({
            height: this.isCollapsed() ? this.HEIGHT_FOLDED : this.HEIGHT_OPEN
        }, this.FOLD_ANIMATION_DURATION);
    },

    /**
     * Focus on the search input
     *
     * @private
     */
    _autofocus: function (){
        //this.$searchInput.focus();
    },

    /**
     * 
     *
     * @private
     */
    _onSearchContactName: function (event) {
        this._btnSearch(event, 'display_name');
    },
    _enterSearchContactName: function (event) {
        this._enterSearch(event, 'display_name');
    },
    _onSearchPhone: function (event) {
        this._btnSearch(event, 'phone');
    },
    _enterSearchPhone: function (event) {
        this._enterSearch(event, 'phone');
    },
    _onSearchEmail: function (event) {
       this._btnSearch(event, 'email');
    },
    _enterSearchEmail: function (event) {
        this._enterSearch(event, 'email');
    },
    _onSearchNote: function (event) {
        this._btnSearch(event, 'comment');
    },
    _enterSearchNote: function (event) {
        this._enterSearch(event, 'comment');
    },
    _btnSearch: function(event, column){
        var $input = $(event.currentTarget).parent().find('input');
        if (!$input){
            return;
        }
        var searchStr = $input.val();
        this._searchBy(column, searchStr);
    },
    _enterSearch: function(event, column){
        if(event.keyCode == 13) // Enter
        {
            var searchStr = $(event.currentTarget).val();
            this._searchBy(column, searchStr);
        }
    },
    _searchBy: function(column, searchStr){
        var domain = false
        if (searchStr && column){
            domain = [
                [column, 'ilike', searchStr],
            ];
        }
        this.call('contact_book_service', 'loadContacts', domain, true);
    },

    //--------------------------------------------------------------------------
    // Tools
    //--------------------------------------------------------------------------

    isCollapsed: function () {
        return this._displayStatus == 2;
    },
    //--------------------------------------------------------------------------
    // Tools
    //--------------------------------------------------------------------------

    scrollToBottom: function () {
        this.$el.scrollTop(this.el.scrollHeight);
    },
});

return ContactBookMainView;
});