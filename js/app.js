
 var map, infowindow, cartodb_gmaps1, cartodb_gmaps2;

  function init() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: new google.maps.LatLng(7.369722, 12.354722),
      disableDefaultUI: false,
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    });

    infowindow = new CartoDBInfowindow(map);

    wax_layer = wax.tilejson('http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp', function(tilejson) {

      map.mapTypes.set('mb', new wax.g.connector(tilejson));
      map.setMapTypeId('mb');

      wax.g.interaction()
        .map(map)
        .tilejson(tilejson)
        .on(wax.tooltip().parent(map.getDiv()).events());
    });


    // First cartodb layer, countries
    cartodb_gmaps1 = new CartoDBLayer({
      map: map,
      user_name:'examples',
      table_name: 'country_colors',
      query: "SELECT * FROM {{table_name}}",
      opacity: 0.2,
      auto_bound: false,
      debug: true
    });


    // Second cartodb layer, earthquakes
    cartodb_gmaps2 = new CartoDBLayer({
      map: map,
      user_name:"examples",
      table_name: 'earthquakes',
      query: "SELECT cartodb_id,the_geom_webmercator,the_geom,magnitude FROM {{table_name}}",
      tile_style: "#{{table_name}}{marker-fill:#E25B5B}",
      interactivity: "cartodb_id, magnitude",
      opacity:1,
      featureOver: function(ev, latlng, pos, data) {
        map.setOptions({draggableCursor: 'pointer'});
      },
      featureOut: function() {
        map.setOptions({draggableCursor: 'default'});
      },
      featureClick: function(ev, latlng, pos, data) {
        //ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;

        // Set infowindow content
        infowindow.setContent(data);

        // Set infowindow latlng
        infowindow.setPosition(latlng);

        // Show it!
        infowindow.open();
      },
      auto_bound: false,
      debug: true
    });





    google.maps.event.addListener(cartodb_gmaps2,"removed",function(){
      if ('console' in self && 'log' in console) console.log("removed")
    });

    google.maps.event.addListener(cartodb_gmaps2,"added",function(){
      if ('console' in self && 'log' in console) console.log("added")
    });

    google.maps.event.addListener(cartodb_gmaps2,"updated",function(){
      if ('console' in self && 'log' in console) console.log("updated")
    });

    google.maps.event.addListener(cartodb_gmaps2,"shown",function(){
      if ('console' in self && 'log' in console) console.log("shown")
    });

    google.maps.event.addListener(cartodb_gmaps2,"hidden",function(){
      if ('console' in self && 'log' in console) console.log("hidden")
    });

    google.maps.event.addListener(cartodb_gmaps2,"tileerror",function(){
      if ('console' in self && 'log' in console) console.log("tile - error")
    });

    google.maps.event.addListener(cartodb_gmaps2,"loading",function(){
      if ('console' in self && 'log' in console) console.log("loading")
    });

    google.maps.event.addListener(cartodb_gmaps2,"loaded",function(){
      if ('console' in self && 'log' in console) console.log("loaded")
    });

  }


