# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api

class AirQuality(models.Model):
    _name = 'air_quality'
    _description = 'Air Quality'

    pM10 = fields.Integer(string="Particles Smaller Than 10 Micrometos μg/m³")
    pM2_5 = fields.Integer(string="Particles Smaller Than 2.5 Micrometos μg/m³")
    sO2 = fields.Integer(string="Sulfur Dioxide")
    cO = fields.Integer(string="Carbon Monoxide")
    nO2 = fields.Integer(string="Nitrogen Dioxide")
    o3 = fields.Integer(string="Ozone")
    point = fields.GeoPoint(index="True")
    perimeters = fields.Many2one('perimeter',string='Set of Points')
    levelQuality = fields.Selection(
        [(1,'Great'),
        (2,'Regular'),
        (3,'Alert'),
        (4,'PreEmergence'),
        (5,'Emergence'),],string="Level Quality", compute="_getLevelQuality",store=True)

    # use measures of https://www.pdao.cl/monitoreo-calidad-de-aire
    @api.one
    @api.depends('pM10','pM2_5','sO2','cO','nO2','o3')
    def _getLevelQuality(self):
        if self.pM10 <= 149 and self.pM2_5 <= 49:
            self.levelQuality = 1
        elif (self.pM10 >= 150 and self.pM10 <= 194) or (self.pM2_5 >= 50 and self.pM2_5 <= 79):
            self.levelQuality = 2
        elif (self.pM10 >= 195 and self.pM10 <= 239) or (self.pM2_5 >= 80 and self.pM2_5 <= 109):
            self.levelQuality = 3
        elif (self.pM10 >= 240 and self.pM10 <= 239) or (self.pM2_5 >= 110 and self.pM2_5 <= 169):
            self.levelQuality = 4
        elif self.pM10 >= 330 or self.pM2_5 >= 170:
            self.levelQuality = 5
        else:
            self.levelQuality = 1
