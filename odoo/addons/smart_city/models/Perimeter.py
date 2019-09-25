# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api

class Perimeter(models.Model):
    _name = 'perimeter'
    _description = 'Perimeter'
    _rec_name = 'noun'

    noun = fields.Char('Nombre', required=True)
    area = fields.GeoMultiPolygon('Area')
    total_sensors = fields.Integer(compute='_total_sensors')
    # point = fields.GeoPoint('Point')
    @api.one
    @api.depends('noun','area')
    def _total_sensors(self):
        self.total_sensors = 9
