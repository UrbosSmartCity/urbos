# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'test-import-export',
    'version': '0.1',
    'category': 'Tests',
    'description': """A module to test import/export.""",
    'depends': ['base'],
    'data': ['ir.model.access.csv'],
    'installable': True,
    'auto_install': False,
    'test': [
        'tests/test_import_reference.yml',
        'tests/test_import_menuitem.yml',
    ]
}
