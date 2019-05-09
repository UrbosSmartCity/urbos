# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from openerp.modules.registry import RegistryManager


def migrate(cr, version):
    registry = RegistryManager.get(cr.dbname)
    from openerp.addons.account.models.chart_template import migrate_tags_on_taxes
    migrate_tags_on_taxes(cr, registry)
