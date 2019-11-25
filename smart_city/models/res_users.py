# -*- coding: utf-8 -*-
from odoo import fields, models

class Users(models.Model):

    _inherit = 'res.users'

    odoobot_state = fields.Selection([
        ('not_initialized', 'Not initialized'),
        ('onboarding_emoji', 'Onboarding emoji'),
        ('onboarding_attachement', 'Onboarding attachement'),
        ('onboarding_command', 'Onboarding command'),
        ('onboarding_ping', 'Onboarding ping'),
        ('idle', 'Idle'),
        ('disabled', 'Disabled'),
    ], string="OdooBot Status", readonly=True, required=True, default="disabled")
