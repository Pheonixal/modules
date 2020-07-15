# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.exceptions import AccessError
from odoo.http import request
import logging
from odoo import models, fields, api
_logger = logging.getLogger(__name__)

class HrOrgChartController(http.Controller):
    _managers_level = 200  # FP request

    def _prepare_employee_data(self, employee,model,model_id):
        appoval_state = 'NONE'
        time = ''
        can_approval = 0
        appoval_model = request.env[model].browse(model_id)
        current_approval_employee_id = appoval_model.current_approval_employee_id.id
        # employee_ids = appoval_model.approval_msg_ids.mapped('employee_id')
        # _logger.info(employee_ids)
        if(employee.id == current_approval_employee_id):
            appoval_state = 'APPOVALING'
        # elif employee_ids and employee.id in employee_ids.mapped('id'):
        for tem in appoval_model.approval_msg_ids:
            if tem.employee_id.id == employee.id:
                appoval_state = tem.state
                time = tem.time.strftime('%Y-%m-%d %H时-%M分-%S秒')

        job = employee.sudo().job_id

        #判断当前用户可否审批 0:不能 1: 能 2:能且最终审批
        #如果当前用户关联了员工，则可以审批
        if employee.id in request.env.user.employee_ids.mapped('id'):
            can_approval = 1

            #如果是最顶层员工，则默认是有审批通过权限
            # if employee.parent_id.id == False:
            #     can_approval = 2
        
        return dict(
            id=employee.id,
            name=employee.name,
            link='/mail/view?model=hr.employee&res_id=%s' % employee.id,
            job_id=job.id,
            job_name=job.name or '',
            direct_sub_count=len(employee.child_ids),
            indirect_sub_count=employee.child_all_count,
            appoval_state=appoval_state,#PASS UNPASS APPOVALING NONE
            time=time,
            can_approval = can_approval
        )

    @http.route('/einfo_hr/get_org_chart', type='json', auth='user')
    def get_org_chart(self, employee_id,model,model_id):
        if not employee_id:  # to check
            return {}
        employee_id = int(employee_id)


        Employee = request.env['hr.employee']
        # check and raise
        if not Employee.check_access_rights('read', raise_exception=False):
            return {}
        try:
            Employee.browse(employee_id).check_access_rule('read')
        except AccessError:
            return {}
        else:
            employee = Employee.browse(employee_id)

        # compute employee data for org chart
        approval_node_ids = request.env['einfo.approval.node'].search([('model_name','=',model),('is_node','=',True)])
        node_ids = approval_node_ids.mapped('job').mapped('id')

        ancestors, current = request.env['hr.employee'], employee
        while current.parent_id:
            ancestors += current.parent_id
            
            if current.parent_id.job_id.id in node_ids:
                #如果上级是可以审批通过，就退出
                break
            current = current.parent_id

        appoval_model = request.env[model].browse(model_id)
        approval_manager = False
        group_ids = request.env.user.groups_id.mapped('id')
        group_id = request.env.ref('einfo_hsp_approval.access_einfo_hsp_approval_manager').id
        if group_id in group_ids:
            approval_manager = True
        values = dict(
            self=self._prepare_employee_data(employee,model,model_id),
            managers=[self._prepare_employee_data(ancestor,model,model_id) for idx, ancestor in enumerate(ancestors) if idx < self._managers_level],
            managers_more=len(ancestors) > self._managers_level,
            # children=[self._prepare_employee_data(child,model,model_id) for child in employee.child_ids],
            children = [],
            approval_state = appoval_model.approval_state,
            approval_manager = approval_manager,
        )
        values['managers'].reverse()

        manager_length = len(values['managers'])
        if manager_length > 0 :
            # last_manager = values['managers'][manager_length-1]
            last_manager = values['managers'][0]
            #如果是最顶层员工，则默认是有审批通过权限
            #审批 0:不能 1: 能 2:能且最终审批
            if last_manager['can_approval'] == 1:
                last_manager['can_approval'] = 2
        return values

    @http.route('/einfo_hr/do_approval', type='json', auth='user')
    def do_approval(self,employee_id,approval,model,model_id):
        _logger.info('do_approval')
        appoval_model = request.env[model].browse(model_id)
        if approval == 1 :
            approval = 'PASS'
            appoval_model.sudo().write({'approval_state':'approvaling'})
        elif approval == 0:
            approval = 'UNPASS'
            appoval_model.sudo().write({'approval_state':'unpass'})
        elif approval == 2:
            approval = 'PASS'
            appoval_model.sudo().write({'approval_state':'pass'})

        if hasattr(appoval_model ,'on_approval'):
            appoval_model.on_approval()
        
        appoval_model.sudo().write({'approval_msg_ids':[(0,0,{'employee_id':employee_id,'state':approval,'time':fields.Datetime.now()})]})

        
    @http.route('/einfo_hr/on_setting', type='json', auth='user')
    def on_setting(self,model):
        approval_node = request.env['einfo.approval.node']
        approval_node_ids = request.env['einfo.approval.node'].search([('model_name','=',model)])
        jobs = request.env['hr.job'].sudo().search([])
        _logger.info(jobs)
        ids = []
        #如果初次 则拷贝一次
        if len(approval_node_ids) == 0 :
            for job in jobs:
                _logger.info(job.department_id)
                node = approval_node.sudo().create({'job':job.id,'department_id':job.department_id.id,'model_name':model})
                # _logger.info(id)
                ids.append(node.id)

        
        #如果已经有了,则检测一次是不是完整拷贝了
        else:
            ids = approval_node_ids.mapped('id')
            job_ids = approval_node_ids.mapped('job').mapped('id')
            for job in jobs:
                #没有则拷贝
                if job.id not in job_ids:
                    node = approval_node.sudo().create({'job':job.id,'department_id':job.department_id.id,'model_name':model})
                    ids.append(node.id)
        return ids
