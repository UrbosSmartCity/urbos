# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, fields, api

class Congestion(models.Model):
    _name = 'congestion'
    _description = 'Congestion in the Roads'

    channelWidth = fields.Selection([
        (1,'One'),
        (2,'Two'),
        (3,'Three'),
        (4,'Four'),
        (5,'Five'),
        (6,'Six')],string="Channel Width")
    numberVehicles = fields.Integer(string="Number of Vehicles")
    vehiclesVelocity = fields.Integer(string="Velocity Vehicles (Km/h)")
    levelCongestion = fields.Selection([
        (1,'Low'),
        (2,'Medium'),
        (3,'High')],string="Level of Congestion",compute="_getLevelCongestion",store=True)
    perimeters = fields.Many2one('perimeter',string='Set of Points')
    line = fields.GeoLine('Power supply line', index=True)

    @api.one
    @api.depends('channelWidth','numberVehicles')
    def _getLevelCongestion(self):
        if self.channelWidth < 2 and self.numberVehicles > 5:
            self.levelCongestion = 3
        elif self.channelWidth < 4 and self.numberVehicles > 25:
            self.levelCongestion = 2
        else:
            self.levelCongestion = 1
