# -*- coding: utf-8 -*-
{
    'name': 'Contact Book - Leads - Opportunity - Activity - Calendar',
    'version': '13.1.0',
    'category': 'Tools',
    'description': """
Contact Book - Leads - Opportunity - Activity - Calendar
    """,
    'summary': '''
    Show your contacts in a float popup, easy to search by name, phone, email
    ''',
    'live_test_url': 'https://demo13.domiup.com',
    'author': 'Domiup',
    'license': 'OPL-1',
    'support': 'domiup.contact@gmail.com',
    'depends': [
        'crm',
    ],
    'data': [
        # ============================================================
        # DATA
        # ============================================================
        # 'data/',

        'security/res_groups.xml',
        'security/ir.model.access.csv',
        # ============================================================
        # VIEWS
        # ============================================================
        # 'views/',
        'views/contact_book_templates.xml',
    ],
    'images': ['static/description/banner.gif'],
    'test': [],
    'demo': [],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'active': False,
    'application': True,
}
