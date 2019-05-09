# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    'name': 'Project Rating',
    'version': '1.0',
    'category': 'Project',
    'description': """
This module Allows a customer to give rating on Project.
""",
    'website': 'http://odoo.com',
    'depends': [
        'rating',
        'project'
    ],
    'data': [
        'data/project_data.xml',
        'views/res_config_settings_views.xml',
        'views/project_view.xml',
    ],
    'demo': ['data/project_demo.xml'],
    'installable': True,
}
