/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
/* globals PDFJS */

'use strict';

// Simply resolve the promise, signaling all the assets are loaded.
// Used since the assets are all included in odoo bundle
PDFJS.fakeWorkerFilesLoadedCapability.resolve();