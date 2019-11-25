odoo.define('smart_city.olMap', function(require){
    "use strict";
    var Class = require('web.Class');

    var olMap = Class.extend({
      init: function(){
        self = this;
        self.count = 0;
        self.olView = self.getView();

        //Get Vector Layers
        self.vectorLayers = self.getVectorLayers();

        self.tileLayers = self.getTileLayers();

      },
      //Get Map
      getOlMap: function(){
        var self = this;
        self.map = new ol.Map({
          layers: [
            self.tileLayers,
            self.vectorLayers
          ],
          target: document.getElementById('map'),
          controls: ol.control.defaults({
            attributionOptions: {
              collapsible: false
            }
          }),
          view: self.olView,
          interactions: ol.interaction.defaults()
        });
        self.getLocation();
        self.getSeeker();
        self.getPopup();
        // self.getMenu();
        // self.startTraffic();
        return self.map;
      },
      //Get OSM and Bing Tiles Server
      getTileLayers: function(){
        self = this;
        return new ol.layer.Group({
              'title': 'Mapas Base',
              openInLayerSwitcher: true,
              layers: [
                  new ol.layer.Tile({
                    title: 'Satelite',
                    baseLayer: true,
                    visible: false,
                    source: new ol.source.XYZ({
                      url: 'https://{1-4}.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png?app_id=7FgAjcMD3R5qFUhX1mie&app_code=IeXKbbtk4umjA_muW5l_EA'
                    })
                  }),
                  new ol.layer.Tile({
                    title: 'OSM',
                    baseLayer: true,
                    source: new ol.source.XYZ({
                      url: 'https://osm.urbos.io/osm/{z}/{x}/{y}.png'
                    })
                  })
              ]
        });
      },
      //Get TileLayers
      getVectorLayers: function(){

        //Get Vectors
        self.vectorHeat = self.getVectorHeat();
        self.vectorAirQuality = self.getVectorAirQuality();
        self.vectorTraffic = self.getVectorTraffic();
        self.vectorWindVelocity = self.getVectorWindVelocity();

        return new ol.layer.Group({
          // A layer must have a title to appear in the layerswitcher
          title: 'Capas',
          fold: 'open',
          layers: [
            self.vectorAirQuality,
            self.vectorWindVelocity,
            self.vectorHeat,
            self.vectorTraffic,
          ]
        });
      },
      //Get Location
      getLocation:function(){
        self = this;
        var geolocation = new ol.Geolocation({
          tracking: true,
          projection: self.olView.getProjection()
        });

        geolocation.on('change:position', function() {
          var p = geolocation.getPosition();
          self.olView.setCenter([parseFloat(p[0]), parseFloat(p[1])]);
        });
      },
      //Get seeker
      getSeeker: function(){
        self = this;
        // Set the search control
        var search = new ol.control.SearchNominatim (
          {
            polygon: $("#polygon").prop("checked"),
            reverse: true,
            position: true	// Search, with priority to geo position
          });

        self.map.addControl(search);

        // Select feature when click on the reference index
        search.on('select', function(e)
          {
            // Check if we get a geojson to describe the search
            if (e.search.geojson) {
              var format = new ol.format.GeoJSON();
              var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
              var view = self.map.getView();
              var resolution = self.olView.getResolutionForExtent(f.getGeometry().getExtent(), self.map.getSize());
              var zoom = view.getZoomForResolution(resolution);
              var center = ol.extent.getCenter(f.getGeometry().getExtent());
              // redraw before zoom
              setTimeout(function(){
                  view.animate({
                  center: center,
                  zoom: Math.min (zoom, 16)
                });
              }, 100);
            }
            else {
              self.map.getView().animate({
                center:e.coordinate,
                zoom: Math.max (self.map.getView().getZoom(),16)
              });
            }
          });
      },
      //Get Pop-up window
      getPopup: function(){
            /**
         * Popup
         **/
         self = this;
        var
            container = document.getElementById('popup'),
            content_element = document.getElementById('popup-content'),
            closer = document.getElementById('popup-closer');

        closer.onclick = function() {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        var overlay = new ol.Overlay({
            element: container,
            autoPan: true,
            offset: [0, -10]
        });
        self.map.addOverlay(overlay);

        var fullscreen = new ol.control.FullScreen();
        self.map.addControl(fullscreen);

        var layerSwitcher = new ol.control.LayerSwitcher();
        self.map.addControl(layerSwitcher);

        self.map.on('click', function(evt){
            var feature = self.map.forEachFeatureAtPixel(evt.pixel,
              function(feature, layer) {
                return feature;
              });
            if (feature) {
              var geometry = feature.getGeometry();
                var content = '';

                if(feature.getId().indexOf("congestion")==0){
                  var coord = geometry.getCoordinates()[0];

                  if(feature.get('levelCongestion')==1){
                    content += '<h3>Baja</h3>';
                    content += '<i class="fa fa-leaf fa-5x" style="color:blue;"></i>';
                  }else if(feature.get('levelCongestion')==2){
                    var content = '<h3>Regular</h3>';
                    content += '<i class="fa fa-heartbeat fa-5x" style="color:orange;"></i>';
                  }else if(feature.get('levelCongestion')==3){
                    var content = '<h3>Alta</h3>';
                    content += '<i class="fa fa-life-ring fa-5x" style="color:red;"></i>';
                  }

                  content += '</br>';
                  content += '<strong>Cantidad de Canales: </strong>' + feature.get('channelWidth');
                  content += '</br>';
                  content += '<strong>Cantidad de Vehiculos: </strong>' + feature.get('numberVehicles');
                  content += '</br>';

                }else if(feature.getId().indexOf("air_quality")==0){
                  var coord = geometry.getCoordinates();
                  if(feature.get('levelQuality')==1){
                    content += '<h3>Bueno</h3>';
                    content += '<i class="fa fa-leaf fa-5x" style="color:green;"></i>';
                  }else if(feature.get('levelQuality')==2){
                    var content = '<h3>Regular</h3>';
                    content += '<i class="fa fa-heartbeat fa-5x" style="color:blue;"></i>';
                  }else if(feature.get('levelQuality')==3){
                    var content = '<h3>Alerta</h3>';
                    content += '<i class="fa fa-life-ring fa-5x" style="color:purple;"></i>';
                  }else if(feature.get('levelQuality')==4){
                    var content = '<h3>Preemergencia</h3>';
                    content += '<i class="fa fa-ambulance fa-5x" style="color:orange;"></i>';
                  }else if(feature.get('levelQuality')==5){
                    var content = '<h3>Emergencia</h3>';
                    content += '<i class="fa fa-industry fa-5x" style="color:red;"></i>';
                  }

                  content += '</br>';
                  content += '<strong>Particulas 10 Micrometros: </strong>' + feature.get('pM10') + ' μg/m³';
                  content += '</br>';
                  content += '<strong>Particulas 2.5 Micrometros: </strong>' + feature.get('pM2_5') + ' μg/m³';
                  content += '</br>';
                  content += '<strong>Dioxido de Azufre: </strong>' + feature.get('sO2') + ' μg/m³';
                  content += '</br>';
                  content += '<strong>Dioxido de Nitrogeno: </strong>' + feature.get('nO2') + ' μg/m³';
                  content += '</br>';
                  content += '<strong>Ozono: </strong>' + feature.get('o3') + ' μg/m³';
                }else if(feature.getId().indexOf("wind_speed")==0){
                  var coord = geometry.getCoordinates();
                  if(feature.get('levelSpeed')==1){
                    content += '<h3>Baja</h3>';
                    content += '<i class="fa fa-leaf fa-5x" style="color:blue;"></i>';
                  }else if(feature.get('levelSpeed')==2){
                    var content = '<h3>Regular</h3>';
                    content += '<i class="fa fa-heartbeat fa-5x" style="color:orange;"></i>';
                  }else if(feature.get('levelSpeed')==3){
                    var content = '<h3>Alta</h3>';
                    content += '<i class="fa fa-life-ring fa-5x" style="color:red;"></i>';
                  }

                  content += '</br>';
                  content += '<strong>Velocidad del viento (Kmh): </strong>' + feature.get('speed') + ' (Km/h)';
                  content += '</br>';

                }else if(feature.getId().indexOf("temperature")==0){
                  var coord = geometry.getCoordinates();
                  if(feature.get('levelTemperature')==1){
                    content += '<h3>Baja</h3>';
                    content += '<i class="fa fa-leaf fa-5x" style="color:blue;"></i>';
                  }else if(feature.get('levelTemperature')==2){
                    var content = '<h3>Regular</h3>';
                    content += '<i class="fa fa-heartbeat fa-5x" style="color:orange;"></i>';
                  }else if(feature.get('levelTemperature')==3){
                    var content = '<h3>Alta</h3>';
                    content += '<i class="fa fa-life-ring fa-5x" style="color:red;"></i>';
                  }

                  content += '</br>';
                  content += '<strong>Temperatura (Kmh): </strong>' + feature.get('farenheitDegrees') + ' °F';
                  content += '</br>';

                }

                content_element.innerHTML = content;
                overlay.setPosition(coord);
            }
        });

        self.map.on('pointermove', function(e) {
            if (e.dragging) return;

            var pixel = self.map.getEventPixel(e.originalEvent);
            var hit = self.map.hasFeatureAtPixel(pixel);

            self.map.getTarget().style.cursor = hit ? 'pointer' : '';
        });
      },
      //Get menu
      getMenu: function(){
        self = this;
        // Overlay
    		var menu = new ol.control.Overlay ({
    			closeBox : true,
    			className: "slide-left menu",
    			content: $("#menu").get(0)
    		});
    		self.map.addControl(menu);

    			// A toggle control to show/hide the menu
    			var t = new ol.control.Toggle(
    				{	html: '<i class="fa fa-bars" ></i>',
    					className: "menu",
    					title: "Menu",
    					onToggle: function() { menu.toggle(); }
    				});
    		self.map.addControl(t);
      },
      //Get view
      getView:function(){
        return new ol.View({
          center: [-8134275.676052, -4409575.724744],
          projection:'EPSG:3857',
          zoom: 11,
          maxZoom:19,
          minZoom:3
        });
      },
      // Get Heat Map
      getVectorHeat: function(){
        self = this;
        var vectorHeat = new ol.layer.Heatmap({
          title:'Temperatura',
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url:'https://geoserver.urbos.io/geoserver/Chile/wfs?service=WFS&version=1.0.0&request=GetFeature&typename=temperature&outputFormat=application/json&srsname=EPSG:3857',
            projection:'EPSG:3857'
          }),
          blur: 70,
          radius: 90,
          opacity: 0.5
        });

        vectorHeat.getSource().on('addfeature', function(event) {
          var farenheitDegrees = parseFloat(event.feature.get('farenheitDegrees'));
          event.feature.set('weight', (farenheitDegrees + 30)/100);
        });

        return vectorHeat;
      },
      //Get Traffic
      getVectorTraffic: function(){
        self = this;
        /*Moving Cars*/
        var styleFunction = function(feature, resolution){
          var llevelCongestion = parseInt(feature.get('levelCongestion'));

          if(llevelCongestion == 3){
            var color = 'red';
          }else if(llevelCongestion == 2){
            var color = 'orange';
          }else if(llevelCongestion == 1){
            var color = 'blue';
          }

          var style = [
            // old
            new ol.style.Style({
                image: new ol.style.Icon({ src:"smart_city/static/data/car.png", scale: 0.8}),
            }),
            //old
            new ol.style.Style({
              image: new ol.style.Shadow(
        				{	radius: 15,
        				}),
        				stroke: new ol.style.Stroke(
        				{	color: color,
        					width: 6
        				}),
        				fill: new ol.style.Fill(
        					{	color: color
        					}),
        				zIndex: -1
        			})
          ];
          return style;
        };
        //new
        // new ol.style.Style({
        //   image: new ol.style.FontSymbol({
        //     form: "none", //"hexagone",
        //     gradient: false,
        //     glyph: "fa-automobile",//car[Math.floor(Math.random()*car.length)],
        //     fontSize: 1,
        //     fontStyle: "",
        //     radius: 15,
        //     //offsetX: -15,
        //     rotation: 0,
        //     rotateWithView: false,
        //     offsetY: 0,
        //     color: "red",
        //     fill: new ol.style.Fill(
        //     {	color: "navy"
        //     }),
        //     stroke: new ol.style.Stroke(
        //     {	color: "white",
        //       width: 3
        //     })
        //   }),
        //   stroke: new ol.style.Stroke(
        //   {	width: 2,
        //     color: '#f80'
        //   }),
        //   fill: new ol.style.Fill(
        //   {	color: [255, 136, 0, 0.6]
        //   })
        // }),

      	var source = new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          loader: function(extent, resolution, projection){
            var proj = projection.getCode();
            var url = 'https://geoserver.urbos.io/geoserver/Chile/wfs?service=WFS&'+
            'version=1.0.0&request=GetFeature&typename=congestion&'+
            'outputFormat=application/json&srsname='+proj+'&bbox=' + extent.join(',') + ',' + proj;
            // console.log(extend.join(','));
            var xhr = new XMLHttpRequest();
           xhr.open('GET', url);
           var onError = function() {
             source.removeLoadedExtent(extent);
           }
           xhr.onerror = onError;
           xhr.onload = function() {
             if (xhr.status == 200) {
               source.addFeatures(
                   source.getFormat().readFeatures(xhr.responseText));
             } else {
               onError();
             }
           }
           xhr.send();
          },
          strategy: ol.loadingstrategy.bbox,
        });
        // projection:'EPSG:3857'

      	return new ol.layer.Vector(
      	{
          title: 'Trafico',
          source: source,
      		style: styleFunction,
          opacity:0.5
      	});
      },
      //Get Air Quality
      getVectorAirQuality:function(){
        return new ol.layer.Vector({
          title:'Calidad del Aire',
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: 'https://geoserver.urbos.io/geoserver/Chile/wfs?service=WFS&version=1.0.0&request=GetFeature&typename=air_quality&outputFormat=application/json&srsname=EPSG:3857',
            projection:'EPSG:3857'
          })
        })
      },
      //Get Vector Wind Velocity
      getVectorWindVelocity:function(){
        return new ol.layer.Vector({
          title:'Velocidad del Viento',
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: 'https://geoserver.urbos.io/geoserver/Chile/wfs?service=WFS&version=1.0.0&request=GetFeature&typename=wind_speed&outputFormat=application/json&srsname=EPSG:3857',
            projection:'EPSG:3857'
          })
        });
      },
      //Get 3D Map
      start3D:function(){
        /**/
          /*
          *
          *
          * Mapa 3d
          *
          */
          // var ol2d = new ol.Map({
          //     layers: [
          //         new ol.layer.Tile({
          //         source: new ol.source.OSM()
          //         })
          //     ],
          //     controls: ol.control.defaults({
          //         attributionOptions: {
          //         collapsible: false
          //         }
          //     }),
          //     target: 'map3d',
          //     view: new ol.View({
          //         center: ol.proj.transform([25, 20], 'EPSG:4326', 'EPSG:3857'),
          //         zoom: 3
          //     })
          // });

          // var ol3d = new olcs.OLCesium({
          //     map: map,
          // });
          //
          // ol3d.setEnabled(true);
          // create a Geolocation object setup to track the position of the device
      },
      //Start Traffic
      startTraffic:function(){

      	// Animation
      	var paths;
        self.vectorTraffic.getSource().on('change',function(e){
          if(self.vectorTraffic.getSource().getState() === 'ready'){
            paths = self.vectorTraffic.getSource().getFeatures();
          }
        });

      	// Add a feature on the map
      	var f, anim;
      	function animateFeature(){
          _.each(paths,function(path, index, array){
            if(path){
            f = new ol.Feature(new ol.geom.Point([0,0]));
      			anim = new ol.featureAnimation.Path({
              path: path,
      				rotate: false,
      				easing: 'linear',
      				speed: 0.1,
                      revers: false,
                      repeat: 500
                  });
      			self.vectorTraffic.animateFeature ( f, anim );
      		  }
          //each
          });
        //animFeature
      	}

      	for (var i=0; i<6; i++){
          setTimeout (animateFeature, i*5000);
      	}
      },
    });
    return olMap;
});
