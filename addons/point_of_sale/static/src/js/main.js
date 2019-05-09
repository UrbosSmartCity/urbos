/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).*/

odoo.define('point_of_sale.main', function (require) {
"use strict";

var chrome = require('point_of_sale.chrome');
var core = require('web.core');

core.action_registry.add('pos.ui', chrome.Chrome);

});
