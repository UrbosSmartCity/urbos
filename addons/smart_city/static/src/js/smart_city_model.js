odoo.define('Map.Model',function(require){
  'use strict';

  var AbstractModel = require('web.AbstractModel');
  var core = require('web.core');

  var MapModel = AbstractModel.extend({
    get: function(){
      self = this;
      return _.extend({},self.data,{
        fieldLevel: self.fieldLevel,
        mode: self.mode
      });
    },
    load: function(params){
      this.modelName = params.modelName;
      this.domain = params.domain;
      this.fieldLevel = params.fieldLevel;
      this.mode = params.mode;
      return this._fetchData();
    },
    reload: function (handle, params) {

        if ('domain' in params) {
          this.domain = params.domain;
        }
        if('mode' in params){
          this.mode = params.mode;
        }
        return this._fetchData();
    },
    _fetchData: function () {
        var self = this;
        var retorno = this._rpc({
            model: this.modelName,
            method: 'get_map_group_data',
            kwargs: {
                domain: this.domain,
                fieldLevel: this.fieldLevel
            }
        }).then(function (result) {
            self.data = result;
        });
        return retorno;
    },
  });

  return MapModel;

});
