odoo.define('contact_book.BasicWidget', function (require) {
"use strict";

var Widget = require('web.Widget');
var core = require('web.core');

var _t = core._t;

var BaseWidget = Widget.extend({
    //template: "contact_book.main_view",
    events:{
    },
    
    /**
     * @constructor
     */
    _setInit: function(options={}){
        this.lines = options.lines || []
        this.limit = options.limit || 10;
        this.selectedRecord = options.selectedRecord || null;
        this.offset = options.offset || 0;
    },
    init: function (parent, options) {
        this._setInit(options);
        this._model = options._model || null;
        this._method = options._method || null;
        this._fields = options._fields || [];
        this.LineWidget = options.LineWidget || null;
        this.maxLimit = options.maxLimit || 1000;
        this.containerEle = options.containerEle || null;
        this.enableLazyLoad = options.enableLazyLoad || true;
        this.searchDomain = false;
        this.forceDomain = options.forceDomain || false;
        this._super(parent, _.extend({}, {}, options));
    },
    /**
     * @override
     */
    start: function () {
        var self = this;
        var lazyLoading = false;
        if (this.enableLazyLoad){
            this.containerEle.scroll(function(){
                if (self.lines.length >= self.maxLimit){
                    return;
                }
                // Check if at the 1/4 of bottom
                if(($(this).scrollTop() / (self.$el.outerHeight() - $(this).height())) >= 0.9) {
                    self.lazyLoadContacts();
                }
            });
        }
    },
    /**
     * @override
     */
    getList: function (domain=false, onSearch=false) {
        if (!this._fields || !this._model || !this._method){
            return;
        }
        if (onSearch){
            if (domain){
                if (domain == this.searchDomain){
                    return;
                }
                // reset offset, limit
                this._setInit();
                this.searchDomain = domain;
            }
            else if (this.searchDomain){
                // reset offset, limit
                this._setInit();
                this.searchDomain = false;
            }
        }

        var offset = this.offset;
        this.offset = offset + this.limit;
        var searchDomain = this.searchDomain || this.forceDomain;
        if (this.forceDomain && searchDomain){
            searchDomain = searchDomain.concat(this.forceDomain)
        }
        return this._rpc({
            model: this._model,
            method: this._method,
            fields: this._fields,
            offset: offset,
            domain: searchDomain || false,
            limit: this.limit,
        }).then(_.bind(this._parseLines, this));
    },
    lazyLoadContacts: function () {
        if (!this.enableLazyLoad || this.lazyLoading){
            return;
        }
        self = this;
        this.lazyLoading = true;
        this.getList().then(function(){
            self.lazyLoading = false;
            self.displayAtBottom();
        });
    },
    /**
    * @override
    */
    displayAtTop: function () {
        if (!this.containerEle || !this.lines){
            return;
        }
        var self = this;
        this.prependTo(this.containerEle).then(function(d){
            console.log('displayAtTop');
            self.$el.show();
        });
        this.selectedRecord = null;
    },
    displayAtBottom: function () {
        if (!this.containerEle || !this.lines){
            return;
        }
        var self = this;
        this.appendTo(this.containerEle).then(function(d){
            console.log('displayAtBottom');
            self.$el.show();
        });
        this.selectedRecord = null;
    },
    getLineById: function(itemId){
        var returnLine = null;
        $.each(this.lines, function(idx, line){
            if (line.id == itemId){
                returnLine = line;
                return;
            }
        });
        return returnLine;
    },
    setSelectedLine: function(itemId){
        var def = new $.Deferred();
        if (itemId && this.lines){
            this.selectedRecord = this.getLineById(itemId);
        }
        def.resolve();
        return def;
    },
    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     *
     * @private
     * @param {MouseEvent} ev
     */
    _parseLines: function(recs){
        if (!this.LineWidget){
            return;
        }
        var self = this;
        _.each(recs, function (rec) {
            var line = new self.LineWidget(this, rec);
            self.lines.push(line);
        });
    },
    
    //--------------------------------------------------------------------------
    // Tools
    //--------------------------------------------------------------------------

});

return BaseWidget;
});