# -*- coding: utf-8 -*-

from odoo import models, fields, api
import time
import json
import logging
_logger = logging.getLogger(__name__)
from odoo.exceptions import UserError, ValidationError

class demo_appoval(models.Model):
    _name = "demo.appoval"
    _description = "demo appoval"
    _inherit = "einfo.approval"


    name = fields.Char(string='Name')
    appoval_msg = fields.Char(string='Appoval content')


    @api.model
    def on_approval(self):
        _logger.info("have done Appoval !!")