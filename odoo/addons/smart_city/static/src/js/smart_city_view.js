odoo.define('Map.View',function(require){
  'use strict';

  var AbstractView = require('web.AbstractView');
  var core = require('web.core');
  var view_registry = require('web.view_registry');
  var MapModel = require('Map.Model');
  var MapController = require('Map.Controller');
  var MapRenderer = require('Map.Renderer');


  var MapView = AbstractView.extend({
    display_name: 'Maps',
    icon:'fa-map',
    config:{
      Model: MapModel,
      Controller: MapController,
      Renderer: MapRenderer,
    },
    viewType:'map',
    enableTimeRangeMenu: 'true',
    init: function(viewInfo,params){
      this._super.apply(this,arguments);
      var attrs = this.arch.attrs;
      if (!attrs.fieldLevel) {
          throw new Error('Map view has not defined "Field of level" attribute.');
      }
      // Model Parameters
      this.loadParams.fieldLevel = attrs.fieldLevel;
      this.loadParams.mode = attrs.type || 'earth';
    },
  });

  view_registry.add('map', MapView);
  return MapView;

});
