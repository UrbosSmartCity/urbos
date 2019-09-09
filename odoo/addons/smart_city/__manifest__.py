# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    'name': "Smart City",

    'summary': """
        this module allow manage smart trafic""",

    'description': """
        this module allow manage smart trafic
    """,
    'sequence':1,
    'author': "Mall Connections",
    'website': "http://www.mallconnections.cl",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/11.0/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','web'],

    # always loaded
    'data': [
        'views/PointView.xml',
        'views/PerimeterView.xml',
        'views/RoadCongestionView.xml',
        'views/CameraView.xml',
        'views/AirQualityView.xml',
        'views/TemperatureView.xml',
        'views/WindSpeedView.xml',
        'views/templates.xml',
        'security/ir.model.access.csv',
        'views/SmartCityMenu.xml',
        'demo/demo.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'qweb': [
        'static/src/xml/smart_city.xml',
    ],
    'application': True,
}
