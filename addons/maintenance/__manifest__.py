# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Equipments',
    'version': '1.0',
    'sequence': 125,
    'category': 'Human Resources',
    'description': """
        Track equipment and manage maintenance requests.""",
    'depends': ['mail'],
    'summary': 'Equipments, Assets, Internal Hardware, Allocation Tracking',
    'data': [
        'security/maintenance.xml',
        'security/ir.model.access.csv',
        'data/maintenance_data.xml',
        'views/maintenance_views.xml',
        'views/maintenance_templates.xml',
        'data/maintenance_cron.xml',
    ],
    'demo': ['data/maintenance_demo.xml'],
    'installable': True,
    'application': True,
}
