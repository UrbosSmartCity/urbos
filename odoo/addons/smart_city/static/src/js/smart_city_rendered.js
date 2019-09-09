odoo.define('Map.Renderer',function(require){
  'use strict';

  var AbstractRenderer = require('web.AbstractRenderer');
  var core = require('web.core');
  var qweb = core.qweb;
  var _t = core._t;

  var MapRenderer = AbstractRenderer.extend({
        className:"o_map_container",

        /**
         * The graph view uses the Leaflet render the map. This lib requires
         * that the rendering is done directly into the DOM (so that it can correctly
         * compute positions). However, the views are always rendered in fragments,
         * and appended to the DOM once ready (to prevent them from flickering). We
         * here use the on_attach_callback hook, called when the widget is attached
         * to the DOM, to perform the rendering. This ensures that the rendering is
         * always done in the DOM.
         *
         * @override
         */
        on_attach_callback: function () {
            this._super.apply(this, arguments);
            this.isInDOM = true;
            this._render();
        },
        /**
         * @override
         */
        on_detach_callback: function () {
            this._super.apply(this, arguments);
            this.isInDOM = false;
        },
        _render: function () {
            var self = this;
            self.$el.empty();
            self.$el.append(qweb.render('ViewSmartTrafic', {
                'groups': self.state,
            }));

            if(this.isInDOM){
              if(Object.keys(self.state).length > 2){
                console.log(self.state);
                self._renderMap(self.state);
              }else{
                self.$el.empty();
                self.$el.append(qweb.render('MapView.error', {
                    title: _t("No data to display"),
                    description: _t("No data available for this Map. " +
                        "Try to add some records, or make sure that " +
                        "there is no active filter in the search bar."),
                }));
              }
            }
            return this._super.apply(this, arguments);
        },
        _renderMap: function(state){
          self = this;
          var tile_url = 'https://osm.urbos.io/osm/{z}/{x}/{y}.png';

          if (state.mode=='earth') {
            self._renderOLHeat(state,tile_url);
          }if(state.mode=='default'){
            self._renderOL(state,tile_url);
          }else if (state.mode=='hum') {
            self._renderOL(state,tile_url);
          }else if(state.mode=='dark'){
            self._renderOLine(state,tile_url);
          }
        },
        _renderLine: function(elements,tile_url){
          self = this;
          var map = new L.Map('windy');

      	 L.tileLayer(tile_url, {
            maxZoom: 18,
            minZoom: 0
         }).addTo(map);
         map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.
         self.polylineOptions = {
           weight: 12,
           opacity: 1.9,
           color:'red'
         };
         self.polylinePoints = [];
         self.acum = 0;
         self.enum = 0;
          _.each(elements,function(element,index,field){
            if(typeof element.points != "undefined"){
              _.each(element.points,function(point,index2,field2){
                  self.polylinePoints.push(new L.LatLng(point.lat, point.lng));
                });
                if(self.polylinePoints.length > 0){
                    self.acum += element[elements.fieldLevel];
                    self.enum +=1;
                }
              }
          });
          var value = self.acum/self.enum;
          if(value>=2.5){
            self.polylineOptions.color = 'red';
          }else if(value>=1,5  && value<=2.4){
            self.polylineOptions.color = 'green';
          }else if(value>=0 && value<=1,4){
            self.polylineOptions.color = 'blue';
          }

          var polyline = L.polyline(self.polylinePoints, self.polylineOptions).addTo(map);
          // zoom the map to the polyline
          map.fitBounds(polyline.getBounds());

          map.locate({setView: true, maxZoom: 16}).on('locationerror', function(e){
              map.setView([-36.78124222006407,-73.07624816894531],10);
          });
        },
        _renderHeat: function(elements,tile_url){
          self = this;
          self.puntos = [];
          _.each(elements,function(element,index,field){
            if(typeof element.points != "undefined"){

              _.each(element.points,function(point,index2,field2){
                  self.puntos.push({lat:point.lat, lng:point.lng, count: element[elements.fieldLevel]});
              });
            }
          });
          var testData = {
            max: 3,
            min: 1,
            data: self.puntos
          };

          var baseLayer = L.tileLayer(
            tile_url,{
              maxZoom: 18
            }
          );

          var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 40,
            "maxOpacity": 0.4,
            // scales the radius based on map zoom
            "scaleRadius": false,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count',
            blur: .99
          };


          var heatmapLayer = new HeatmapOverlay(cfg);

          var map = new L.Map('windy', {
            center: new L.LatLng(-36.78124222006407, -73.07624816894531),
            zoom: 8,
            trackResize:true,
            boxZoom:true,
            preferCanvas:true,
            layers: [baseLayer, heatmapLayer]
          });

          heatmapLayer.setData(testData);

          map.locate({setView: true, maxZoom: 10}).on('locationerror', function(e){
              map.setView([-36.78124222006407,-73.07624816894531],10);
              map.invalidateSize(true);
          });

        },
        _renderPoint: function(elements,tile_url){
          var map = L.map('windy',{
            center: new L.LatLng(-36.78124222006407, -73.07624816894531),
            zoom:13
          });
          self = this;
          self.puntos = [];
          _.each(elements,function(element,index,field){
            if(typeof element.points != "undefined"){
              _.each(element.points,function(point,index2,field2){
                var marker = L.marker([point.lat, point.lng]).bindPopup(elements.fieldLevel+": "+element[elements.fieldLevel]).addTo(map);
              });
            }
          });

          L.tileLayer(tile_url,{
            maxZoom:18,
          }).addTo(map);
        },
        /***********************
        *******OpenLayers*******
        ************************/
        _renderOL:function(elements,tile_url){

          var view = new ol.View({
            center: ol.proj.fromLonLat([-73.07624816894531,-36.78124222006407]),
            zoom: 10
          });

          var layer = new ol.layer.Tile({
            source: new ol.source.XYZ({url:tile_url})
          });

          var geolocation = new ol.Geolocation({
            projection: view.getProjection(),
	          tracking:true
          });

          geolocation.on('change', function(evt) {
            view.setCenter(geolocation.getPosition());
          });

          geolocation.on('error', function(error) {
            console.log(error);
          });

          var map = new ol.Map({
            target: 'windy',
            layers: [
              layer
            ],
            view: view
          });

        },
        _renderOLine: function(elements, tile_url){
          self = this;
          var image = new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: 'red', width: 1})
          });

          var styles = {
            'LineString': new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'green',
                lineDash: [4],
                width: 1
              })
            }),
            'Polygon': new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
              })
            }),
          };

          var styleFunction = function(feature) {
            return styles[feature.getGeometry().getType()];
          };

          var geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
              'type': 'name',
              'properties': {
                'name': 'EPSG:4326'
              }
            },
            'features': [{
              'type': 'Feature',
              'geometry': {
                'type': 'LineString',
                'coordinates': [[-8720032.521075, -4331434.792390], [-5909499.530784, -6105178.323194]]
              }
            }]
          };


          _.each(elements,function(element,index,field){
            if(typeof element.points != "undefined"){
              self.data = [];
              _.each(element.points,function(point,index2,field2){
                  self.data.push([point.lng, point.lat]);
                    //element[elements.fieldLevel]
              });
            }
          });
          geojsonObject.features.push({
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': self.data
            }
          });

          console.log(self.data);

          var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
          });


          var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
          });


          var map = new ol.Map({
            layers: [
              new ol.layer.Tile({
                source: new ol.source.XYZ({url: tile_url})
              }),
              vectorLayer
            ],
            target: 'windy',
            controls: ol.control.defaults({
              attributionOptions: {
                collapsible: false
              }
            }),
            view: new ol.View({
              center: ol.proj.fromLonLat([-73.07624816894531,-36.78124222006407]),
              zoom: 8
            })
          });
        },
        _renderOLHeat: function(elements, tile_url){

          var view = new ol.View({
            center: ol.proj.fromLonLat([-73.07624816894531,-36.78124222006407]),
            zoom: 10,
            maxZoom: 2,
            minZoom: 10
          });

          var geolocation = new ol.Geolocation({
            projection: view.getProjection(),
	          tracking:true
          });

          // update the HTML page when the position changes.
          geolocation.on('change', function() {
          	view.setCenter(geolocation.getPosition());
            view.setZoom(10);
          });

          // handle geolocation error.
          geolocation.on('error', function(error) {
            console.log(error);
          });

          var vector = new ol.layer.Heatmap({
            source: new ol.source.Vector({
              url: 'https://openlayers.org/en/v4.6.5/examples/data/kml/2012_Earthquakes_Mag5.kml',
              format: new ol.format.KML({
                extractStyles: false
              })
            }),
            blur: parseInt(25, 10),
            radius: parseInt(25, 10)
          });

          vector.getSource().on('addfeature', function(event) {
            // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
            // standards-violating <magnitude> tag in each Placemark.  We extract it from
            // the Placemark's name instead.
            var name = event.feature.get('name');
            var magnitude = parseFloat(name.substr(2));
            event.feature.set('weight', magnitude - 5);
          });

          var raster = new ol.layer.Tile({
            source: new ol.source.XYZ({url: tile_url})
          });

          var map = new ol.Map({
            layers: [raster, vector],
            target: 'windy',
            view: view
          });

        },
    });

    return MapRenderer;

});
