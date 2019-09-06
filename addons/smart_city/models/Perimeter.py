# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api

class Perimeter(models.Model):
    _name = 'perimeter'
    _description = 'Perimeter'

    name = fields.Char('Nombre', required=True)
    points = fields.Many2many('points','id',string='Set of Points')
