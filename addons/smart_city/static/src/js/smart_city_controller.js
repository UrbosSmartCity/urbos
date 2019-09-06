odoo.define('Map.Controller',function(require){
  'use strict';
  var AbstractController = require('web.AbstractController');
  var MapRenderer = require('Map.Renderer');
  var core = require('web.core');
  var qweb = core.qweb;
//
  var MapController = AbstractController.extend({
        getContext: function () {
            var state = this.model.get();
            return {
                graph_mode: state.mode,
            };
        },
       renderButtons: function ($node) {
           if ($node) {
               this.$buttons = $(qweb.render('ViewSmartTrafic.buttons'));
               this.$buttons.find('button').tooltip();
               this.$buttons.click(this._onMapClick.bind(this));
               this._updateButtons();
               this.$buttons.appendTo($node);
           }

       },
       _onMapClick: function(event){

         var $target = $(event.target);

         if($target.hasClass('o_map_button')){
           this._setMode($target.data('mode'));
         }
       },
       _setMode: function(mode){
         this.update({mode: mode});
         this._updateButtons();
       },
       _updateButtons: function(){
         if (!this.$buttons) {
             return;
         }
         var state = this.model.get();
         this.$buttons.find('.o_map_button').removeClass('active');
         this.$buttons
            .find('.o_map_button[data-mode="' + state.mode + '"]')
            .addClass('active');
       },
  });
  return MapController;

});
