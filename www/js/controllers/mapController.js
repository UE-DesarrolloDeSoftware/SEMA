
angular.module('ema.controllers')

.controller('MapController',function($scope, $cordovaGeolocation, $ionicPopup,ZonaEstacionamientoServices ){

    
    
    var coordinates = [];
    
    // INICIALIZACION DEL MAPA
    //$scope.$on("$stateChangeSuccess", function() {
      // create a map in the "map" div, set the view to a given place and zoom
       
        var cloudmadeUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
        map = new L.Map('map', {layers: [cloudmade] , zoomControl: true, center: new L.LatLng(-34.789439,-58.523198),
         zoom: 16 });




        
        var editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);
        

       
       
        
        var MyCustomMarker = L.Icon.extend({
            options: {
                shadowUrl: null,
                iconAnchor: new L.Point(12, 12),
                iconSize: new L.Point(18, 18),
                iconUrl: 'img/auto.png'
                

            }
        });
        
        var options = {
            position: 'bottomleft',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#3333ff',
                        weight: 12
                    }
                },
                polygon: false,
                circle: false, // Turns off this drawing tool
                rectangle:false,
                marker: {
                    icon: new MyCustomMarker()
                }
            },
            edit: {

                featureGroup: editableLayers, //REQUIRED!!
                remove: true
                
            }

        };
          


        var drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems)
        



        ZonaEstacionamientoServices.getZonasEstacionamiento().then(function (result) {
             var coordenadas = result.data.data
           
          
            for (var x = 0; x < result.data.data.length; x++) {
               var jsonVar = JSON.parse(result.data.data[x].coordinates);
               var polyline = L.polyline(jsonVar,{color :'blue',weight :10}).addTo(map);
                }
      
      
      });
      

        

        map.on('draw:created', function (e) {
          

          var type = e.layerType,
              layer = e.layer;

              
          if (type === 'polyline') {
           
              // here you can get it in geojson format
              var geojson = layer.toGeoJSON();
              
              
            
            latlngs = layer.getLatLngs();
            
            for (var i = 0; i < latlngs.length; i++) {
                coordinates.push([latlngs[i].lat,latlngs[i].lng]);
                }

         
         // here you add it to a layer to display it in the map
           drawnItems.addLayer(layer);
            
          
            var estacionamiento = {};
            estacionamiento.coordinates = JSON.stringify(coordinates);
            ZonaEstacionamientoServices.addZonaEstacionamiento(estacionamiento).then(function () {
          
        })
          
      }      
    })


    
    // SITUAR EN POSICION ACTUAL
    $scope.locate = function(){

        $cordovaGeolocation
          .getCurrentPosition()
          .then(function (position) {

              $scope.map.center.lat = position.coords.latitude;
              $scope.map.center.lng = position.coords.longitude;
              $scope.map.center.zoom = 18;

              $scope.map.markers.now = {
                  lat:position.coords.latitude,
                  lng:position.coords.longitude,
                  message: "Estas Aqui!",
                  focus: true,
                  draggable: false
              };

          }, function(err) {
              // error
              $ionicPopup.alert({
                  title: 'Error',
                  template: err.message
              });
          });

    };
})