# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Questions on Events',
    'description': 'Questions on Events',
    'category': 'Marketing',
    'version': '1.0',
    'depends': ['website_event'],
    'data': [
        'views/event_views.xml',
        'views/event_templates.xml',
        'report/report_event_question_view.xml',
        'security/ir.model.access.csv',
    ],
    'demo': [
        'data/event_demo.xml',
    ],
    'installable': True,
}
