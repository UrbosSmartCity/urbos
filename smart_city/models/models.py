from collections import defaultdict
from datetime import datetime
from dateutil.relativedelta import relativedelta
from odoo import api, fields, models

class Base(models.AbstractModel):
    _inherit = 'base'

    @api.model
    def get_map_group_data(self, domain, fieldLevel):
        records = self.search(domain)
        result_dict = {}
        for record in records:
            for perimeter in record.perimeters:
                for point in perimeter.points:
                    if record.id not in result_dict:
                        result_dict[record.id] = {
                            fieldLevel:record[fieldLevel],
                            'points':[],
                        }
                    result_dict[record.id]['points'].append({
                        'lat': point.lat,
                        'lng': point.lng
                    })
        return result_dict

    # @api.model
    # def get_video_source_group_data(self,domain):
    #     #records = self.(domain)
    #     return "None"
