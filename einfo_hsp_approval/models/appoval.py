# -*- coding: utf-8 -*-

from odoo import models, fields, api
import logging
_logger = logging.getLogger(__name__)
class msg(models.Model):
    _name = "approval.msg"

    employee_id = fields.Many2one(comodel_name="hr.employee",string='Approver')
    state = fields.Selection(selection=[('PASS','Agree'),('UNPASS','Disagree')])
    time = fields.Datetime(string='Approval time')

class approval_node(models.Model):
    _name = "einfo.approval.node"
    _description = "Approval node"

    job = fields.Many2one('hr.job', string='Job',)
    department_id = fields.Many2one('hr.department', string='Department',)
    is_node = fields.Boolean('is node')
    model_name = fields.Char(string='Model')


class approval(models.Model):
    _name = "einfo.approval"
    _description = "Approval"

    @api.model
    def default_get(self, fields):
        res = super(approval, self).default_get(fields)
        if len(self.env.user.employee_ids) > 0:
            res.update({
            'start_approval_employee_id': self.env.user.employee_ids[0].id,
            })
        return res

    approval_msg_ids = fields.Many2many(comodel_name="approval.msg",string='approval msg')
    approval_state = fields.Selection(selection=[('draft','Draft'),('approvaling','Approvaling'),('pass','Agree'),('unpass','Disagree')],default='draft',string="Approval state")
    start_approval_employee_id = fields.Many2one(comodel_name="hr.employee",required=True,string='Approval initiator',)
    start_approval_time = fields.Datetime(string='Start time')
    tem_approval_field = fields.Char(default='..')
    job_id = fields.Many2one('hr.job',related="start_approval_employee_id.job_id",string="Job")
    current_approval_employee_id = fields.Many2one(comodel_name="hr.employee",string='Current Approver',compute='_compute_approval_employee')

   

    @api.depends('approval_msg_ids')
    def _compute_approval_employee(self):
        for record in self:
            #如果通过或者不通过，则当前审批人为空
            if record.approval_state == 'pass' or record.approval_state == 'unpass':
                record.current_approval_employee_id = False
                return
            # compute employee data for org chart
            ancestors, current = self.env['hr.employee'], record.start_approval_employee_id
            while current.parent_id:
                ancestors += current.parent_id
                current = current.parent_id
            
            #如果审批信息列表为空，则当前审批人为审批发起者
            if len(record.approval_msg_ids) == 0 :
                record.current_approval_employee_id = record.start_approval_employee_id.id
            else:
                parent_ids = record.approval_msg_ids.mapped('employee_id').mapped('id')
                #按顺序遍历审批发起者的上级，当遍历的上级发现不在审批信息列表里面，说明该上级还没有处理，
                #把该上级设置成当前审批者
                for tem_employee in ancestors:
                    if tem_employee.id not in parent_ids:
                        record.current_approval_employee_id = tem_employee.id
                        break
            

