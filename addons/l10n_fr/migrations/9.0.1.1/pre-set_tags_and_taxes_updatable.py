# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from openerp.modules.registry import RegistryManager

def migrate(cr, version):
    registry = RegistryManager.get(cr.dbname)
    from openerp.addons.account.models.chart_template import migrate_set_tags_and_taxes_updatable
    migrate_set_tags_and_taxes_updatable(cr, registry, 'l10n_fr')

