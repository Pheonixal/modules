# -*- coding: utf-8 -*-
{
   'name': "Approval Flow by HSP",

   'summary': """
    Approve according to HR personnel structure""",
   'license': 'LGPL-3',
   'description': """
    Approve according to HR personnel structure
   """,

   'author': "HSP",
   'website': "http://www.einfo-tech.com",
   'category': 'Tools',
   'version': '12.0.1.1.3',
   'images': ['static/description/11.gif'],
   'depends': ['base','hr','hr_org_chart'],

   'data': [
        "security/ir.model.access.csv",
		   "views/templates.xml", 
         "views/demo.xml",
         "security/res.groups.xml", 
   ],
   'qweb': [
        'static/src/xml/hr_org_chart.xml',
    ],

   "installable":True,

}