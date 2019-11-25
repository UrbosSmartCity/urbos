odoo.define('smart_city.map_front', function (require) {

  require('web.dom_ready');
  var olMap = require('smart_city.olMap');

  (function(){
    var Mapa = new olMap();
    var map = Mapa.getOlMap();

  })();

});
