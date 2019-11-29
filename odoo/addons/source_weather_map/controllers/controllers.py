# -*- coding: utf-8 -*-
from odoo import http

# class SourceWeatherMap(http.Controller):
#     @http.route('/source_weather_map/source_weather_map/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/source_weather_map/source_weather_map/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('source_weather_map.listing', {
#             'root': '/source_weather_map/source_weather_map',
#             'objects': http.request.env['source_weather_map.source_weather_map'].search([]),
#         })

#     @http.route('/source_weather_map/source_weather_map/objects/<model("source_weather_map.source_weather_map"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('source_weather_map.object', {
#             'object': obj
#         })