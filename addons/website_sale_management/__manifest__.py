# -*- encoding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    'name': 'Website Sale - Sale Management',
    'version': '1.0',
    'category': 'Website',
    'description': """
Display orders to invoice in website dashboard.
""",
    'depends': [
        'sale_management',
        'website_sale',
    ],
    'installable': True,
    'auto_install': True,
    'data': [
    ],
    'demo': [
    ],
    'qweb': ['static/src/xml/*.xml'],
}
