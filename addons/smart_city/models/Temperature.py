# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api

class Temperature(models.Model):
    _name = 'temperature'
    _description = 'Temperature'

    name = fields.Char('Nombre', required=True)
    farenheitDegrees = fields.Integer(string="Farenheit Degrees")
    levelTemperature = fields.Selection([(1,'Low'),(2,'Medium'),(3,'High')],string="Level of Temperature",compute="_getLevelTemperature")
    perimeters = fields.Many2one('perimeter',string='Set of Points')

    @api.one
    @api.depends('farenheitDegrees')
    def _getLevelTemperature(self):
        if self.farenheitDegrees > 30:
            self.levelTemperature = 3
        elif self.farenheitDegrees > 20 and self.farenheitDegrees < 29:
            self.levelTemperature = 2
        else:
            self.levelTemperature = 1
