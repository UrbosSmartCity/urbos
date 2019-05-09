/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define('web_diagram.view_registry', function (require) {
"use strict";

var view_registry = require('web.view_registry');

var DiagramView = require('web_diagram.DiagramView');

view_registry.add('diagram', DiagramView);

});
