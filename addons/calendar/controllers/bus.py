# -*- coding: utf-8 -*
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo.addons.bus.controllers.main import BusController
from odoo.http import request


class CalendarBusController(BusController):
    # --------------------------
    # Extends BUS Controller Poll
    # --------------------------
    def _poll(self, dbname, channels, last, options):
        if request.session.uid:
            channels = list(channels)
            channels.append((request.db, 'calendar.alarm', request.env.user.partner_id.id))
        return super(CalendarBusController, self)._poll(dbname, channels, last, options)
