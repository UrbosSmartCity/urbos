# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Paypal Payment Acquirer',
    'category': 'Accounting',
    'summary': 'Payment Acquirer: Paypal Implementation',
    'version': '1.0',
    'description': """Paypal Payment Acquirer""",
    'depends': ['payment'],
    'data': [
        'views/payment_views.xml',
        'views/payment_paypal_templates.xml',
        'data/payment_acquirer_data.xml',
    ],
    'installable': True,
    'post_init_hook': 'create_missing_journal_for_acquirers',
}
