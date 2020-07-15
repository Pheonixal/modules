odoo.define('web.EinfoOrgChart', function (require) {
    "use strict";
    
    var AbstractField = require('web.AbstractField');
    var concurrency = require('web.concurrency');
    var core = require('web.core');
    var field_registry = require('web.field_registry');
    
    var QWeb = core.qweb;
    var _t = core._t;
    
    var FieldOrgChart = AbstractField.extend({
    
        events: {
            "click .o_employee_redirect": "_onEmployeeRedirect",
            "click .o_employee_sub_redirect": "_onEmployeeSubRedirect",
            "click .e_button":"_onbutton",
            "click .e_setting":"_onSetting",
        },
        /**
         * @constructor
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.dm = new concurrency.DropMisordered();
        },
    
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
    
        /**
         * Get the chart data through a rpc call.
         *
         * @private
         * @param {integer} employee_id
         * @returns {Deferred}
         */
        _getOrgData: function (employee_id,model,model_id) {
            var self = this;
            return this.dm.add(this._rpc({
                route: '/einfo_hr/get_org_chart',
                params: {
                    employee_id: employee_id,
                    model:model,
                    model_id:model_id,
                },
            })).then(function (data) {
                self.orgData = data;
            });
        },
        /**
         * @override
         * @private
         */
        _render: function () {
            // console.log(this)
            console.log(this.recordData)
            console.log(this.model)
            console.log(this.res_id)
            if (typeof(this.res_id) == "undefined")
            {
                return this.$el.html(QWeb.render("einfo_hr_org_chart", {
                    managers: [],
                    children: [],
                }));
            }

            else if(this.recordData['start_approval_employee_id'].res_id){
                var res_id = this.recordData['start_approval_employee_id'].res_id
                var self = this;
                return this._getOrgData(res_id,this.model,this.res_id).then(function () {
                    self.$el.html(QWeb.render("einfo_hr_org_chart", self.orgData));
                    // self.$('[data-toggle="popover"]').each(function () {
                    //     $(this).popover({
                    //         html: true,
                    //         title: function () {
                    //             var $title = $(QWeb.render('einfo_hr_orgchart_emp_popover_title', {
                    //                 employee: {
                    //                     name: $(this).data('emp-name'),
                    //                     id: $(this).data('emp-id'),
                    //                 },
                    //             }));
                    //             $title.on('click',
                    //                 '.o_employee_redirect', _.bind(self._onEmployeeRedirect, self));
                    //             return $title;
                    //         },
                    //         container: 'body',
                    //         placement: 'left',
                    //         trigger: 'focus',
                    //         content: function () {
                    //             var $content = $(QWeb.render('einfo_hr_orgchart_emp_popover_content', {
                    //                 employee: {
                    //                     id: $(this).data('emp-id'),
                    //                     name: $(this).data('emp-name'),
                    //                     direct_sub_count: parseInt($(this).data('emp-dir-subs')),
                    //                     indirect_sub_count: parseInt($(this).data('emp-ind-subs')),
                    //                 },
                    //             }));
                    //             $content.on('click',
                    //                 '.o_employee_sub_redirect', _.bind(self._onEmployeeSubRedirect, self));
                    //             return $content;
                    //         },
                    //         template: QWeb.render('einfo_hr_orgchart_emp_popover', {}),
                    //     });
                    // });
                });
            }else{
                return this.$el.html(QWeb.render("einfo_hr_org_chart", {
                    managers: [],
                    children: [],
                }));
            }
        },
    
        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------
    

        _onbutton:function(event){
            event.preventDefault();
            var employee_id = parseInt($(event.currentTarget).data('employee-id'));
            var approval = parseInt($(event.currentTarget).data('approval'));
            var self = this
            this._rpc({
                route: '/einfo_hr/do_approval',
                params: {
                    employee_id: employee_id,
                    approval:approval,
                    model:this.model,
                    model_id:this.res_id,
                },
            }).then(function (data) {
                // self.orgData = data;
                self._render()
            });
        },
        _onSetting:function(event){
            var self =  this
            this._rpc({
                route: '/einfo_hr/on_setting',
                params: {
                    model:this.model,
                },
            }).then(function (data) {
                console.log(data)
                // self.orgData = data;
                self.do_action({
                    type: 'ir.actions.act_window',
                    view_type: 'list',
                    view_mode: 'list',
                    views: [[false, 'list']],
                    target: 'current',
                    res_model: 'einfo.approval.node',
                    res_id: 0,
                    domain:[["id", "in",data]], 
                });
            });
        },
        /**
         * Redirect to the employee form view.
         *
         * @private
         * @param {MouseEvent} event
         * @returns {Deferred} action loaded
         */
        _onEmployeeRedirect: function (event) {
            event.preventDefault();
            var employee_id = parseInt($(event.currentTarget).data('employee-id'));
            return this.do_action({
                type: 'ir.actions.act_window',
                view_type: 'form',
                view_mode: 'form',
                views: [[false, 'form']],
                target: 'current',
                res_model: 'hr.employee',
                res_id: employee_id,
            });
        },
        /**
         * Redirect to the sub employee form view.
         *
         * @private
         * @param {MouseEvent} event
         * @returns {Deferred} action loaded
         */
        _onEmployeeSubRedirect: function (event) {
            event.preventDefault();
            var employee_id = parseInt($(event.currentTarget).data('employee-id'));
            var employee_name = $(event.currentTarget).data('employee-name');
            var type = $(event.currentTarget).data('type') || 'direct';
            var domain = [['parent_id', '=', employee_id]];
            var name = _.str.sprintf(_t("Direct Subordinates of %s"), employee_name);
            if (type === 'total') {
                domain = ['&', ['parent_id', 'child_of', employee_id], ['id', '!=', employee_id]];
                name = _.str.sprintf(_t("Subordinates of %s"), employee_name);
            } else if (type === 'indirect') {
                domain = ['&', '&',
                    ['parent_id', 'child_of', employee_id],
                    ['parent_id', '!=', employee_id],
                    ['id', '!=', employee_id]
                ];
                name = _.str.sprintf(_t("Indirect Subordinates of %s"), employee_name);
            }
            if (employee_id) {
                return this.do_action({
                    name: name,
                    type: 'ir.actions.act_window',
                    view_mode: 'kanban,list,form',
                    views: [[false, 'kanban'], [false, 'list'], [false, 'form']],
                    target: 'current',
                    res_model: 'hr.employee',
                    domain: domain,
                });
            }
        },
    });
    
    field_registry.add('einfo_hr_org_chart', FieldOrgChart);
    
    return FieldOrgChart;
    
    });
    