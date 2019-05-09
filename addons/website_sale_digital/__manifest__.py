# -*- encoding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    'name': 'Website Sale Digital - Sell digital products',
    'version': '0.1',
    'category': 'Website',
    'description': """
Sell digital product using attachments to virtual products
""",
    'depends': [
        'document',
        'website_sale',
    ],
    'installable': True,
    'data': [
        'views/website_sale_digital.xml',
        'views/website_sale_digital_view.xml',
    ],
    'demo': [
        'data/product_demo.xml',
    ],
}
