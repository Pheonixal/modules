# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright Domiup (<http://domiup.com>).
#
##############################################################################

from odoo import api, fields, models, _


class ContactBookHistory(models.Model):
    _name = 'contact.book.history'
    _description = 'History'
    _order = 'date desc'

    date = fields.Datetime('Date', required=True, default=fields.Datetime.now)
    type = fields.Selection([('Call', 'Call'), ('SMS', 'SMS')],
                           string='Type')
    user_id = fields.Many2one(
        comodel_name='res.users', default=lambda self: self.env.uid)
    contact_name = fields.Char('Contact')
    phone = fields.Char('Phone')
    email = fields.Char('Email')
    fa_icon = fields.Char('Fa-icon')
    res_id = fields.Integer('Record ID')
    res_model = fields.Char('Record Model')
