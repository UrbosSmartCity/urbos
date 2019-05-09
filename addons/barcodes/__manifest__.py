# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Barcodes',
    'version': '2.0',
    'category': 'Extra Tools',
    'summary': 'Barcodes Scanning and Parsing',
    'depends': ['web'],
    'data': [
        'data/barcodes_data.xml',
        'views/barcodes_view.xml',
        'security/ir.model.access.csv',
        'views/barcodes_templates.xml',
    ],
    'installable': True,
    'auto_install': False,
}
