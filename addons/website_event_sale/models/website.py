# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class Website(models.Model):
    _inherit = 'website'

    def sale_product_domain(self):
        # remove product event from the website content grid and list view (not removed in detail view)
        return ['&'] + super(Website, self).sale_product_domain() + [('event_ok', '=', False)]
