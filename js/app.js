map        = null,
paths      = [],
infowindow = null;

CONFIG = {
  //dataURL: "http://wsjgraphics.cartodb.com/api/v1/sql?q=SELECT%20ST_X(rs.the_geom)%20as%20rs_longitude,%20ST_Y(rs.the_geom)%20as%20rs_latitude,ST_X(hs.the_geom)%20as%20hs_longitude,%20ST_Y(hs.the_geom)%20as%20hs_latitude,ST_AsGeoJSON(sd.the_geom,4)%20as%20route,rs.relocating_school_bn,rs.host_bldg_id,directions_time,address_of_relocating_school,%20hs.host_bldg_name,rs.grade_levels_that_are_relocating,rs.name_of_relocating_school%20FROM%20schools_directions%20as%20sd%20INNER%20JOIN%20relocating_schools%20as%20rs%20ON%20sd.relocating_school_bn=rs.relocating_school_bn%20INNER%20JOIN%20host_schools%20as%20hs%20ON%20hs.host_bldg_id=rs.host_bldg_id",
  dataURL: "http://wsjgraphics.cartodb.com/api/v1/sql?q=SELECT array_agg(ST_X(rs.host_geom)%7C%7C','%7C%7CST_Y(rs.host_geom))as host_coordinates, array_agg(host_bldg_id) as host_bldg_ids, array_agg(host_building_name) as host_building_names, array_agg(host_building_address) as host_building_addresses, array_agg(grade_levels_that_are_relocating) as grades_levels_that_are_relocating, array_agg(host_bldg_id) as host_bldg_ids, ST_X(rs.the_geom)%7C%7C','%7C%7CST_Y(rs.the_geom) as coordinates_relocating_school, rs.name_of_relocating_school, addressofrelocatingschool, relocating_school_bn FROM relocating_lines as rs GROUP BY the_geom,name_of_relocating_school,addressofrelocatingschool,relocating_school_bn",
  mapStyle: [ { stylers: [ { saturation: -65 }, { gamma: 1.52 } ] },{ featureType: "administrative", stylers: [ { saturation: -95 }, { gamma: 2.26 } ] },{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "administrative.locality", stylers: [ { visibility: "off" } ] },{ featureType: "road", stylers: [ { visibility: "simplified" }, { saturation: -99 }, { gamma: 2.22 } ] },{ featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "off" } ] },{ featureType: "road.local", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "transit", stylers: [ { visibility: "off" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", stylers: [ { saturation: -55 } ] } ],

  pathStyle:       {"strokeColor": "#333", "strokeWeight": 2, "strokeOpacity": .8 },
  hostingIcon:     { path: google.maps.SymbolPath.CIRCLE, fillColor: "black", fillOpacity: 0.8, scale: 5, strokeColor: "black", strokeWeight: 0 },
  relocatingIcon:  { path: google.maps.SymbolPath.CIRCLE, fillColor: "red",   fillOpacity: 0.8, scale: 5, strokeColor: "black",   strokeWeight: 1 },
};

window.paths = paths;

function addMarker(map, type, coordinates, data) {

  var icon = null;

  if (type == "hosting") {
    icon = CONFIG.hostingIcon
  } else {
    icon = CONFIG.relocatingIcon
  }

  return new google.maps.Marker({
    position: new google.maps.LatLng(coordinates[0], coordinates[1]),
    icon: icon,
    map: map,
    type: type,
    data: data
  });
}

function drawPath(p1, p2) {
  var coordinates = [
    new google.maps.LatLng(p1[0], p1[1]),
    new google.maps.LatLng(p2[0], p2[1])
  ];

  var path = new google.maps.Polyline({
    path: coordinates,
    "strokeColor": "#333",
    "strokeWeight": 1,
    "strokeOpacity": .5
  });

  path.setMap(map);

  return path;
}

function drawPath_old(route) {
  var geo  = JSON.parse(route);
  var path = new GeoJSON(geo, CONFIG.pathStyle);
  path[0].setMap(map);
  return path[0];
}

function selectPath(e) {
  var that = this;

  var content = "";

  if (that.type == "hosting") {

    _.each(paths, function(p) {
      if (p.data.host_bldg_ids != that.data.host_bldg_ids) p.path.setMap(null);
      else {
      p.path.setOptions({"strokeColor": "#333",
          "strokeWeight": 2.5,
          "strokeOpacity": .8
      });
      p.path.setMap(map);
      }
    });


    content = "<p><strong>Host Blg Name</strong><br />" +
      this.data.host_building_names.join("<br />")+"</p>" +
      "<p><strong>Name of relocating school</strong><br />" +
      this.data.name_of_relocating_school+"</p>" +
      "<p><strong>Grade levels that are relocating</strong><br />" +
      this.data.grades_levels_that_are_relocating.join("<br />") +"</p>";
  } else {

    _.each(paths, function(p) {
      if (p.data.host_bldg_ids != that.data.host_bldg_ids) p.path.setMap(null);
      else {
        p.path.setOptions({"strokeColor": "#333",
          "strokeWeight": 2.5,
          "strokeOpacity": .8
        });
        p.path.setMap(map);
      }
    });





    content = "<p><strong>Name of relocating school</strong><br />" +
      this.data.name_of_relocating_school+"</p>" +
      "<p><strong>Grade levels that are relocating</strong><br />" +
      this.data.grades_levels_that_are_relocating.join("<br />")+"</p>" +
      "<p><strong>Host Blg Name</strong><br />" +
      this.data.host_building_names.join("<br />")+"</p>";
  }

  infowindow.setContent(content);
  infowindow.setPosition(e.latLng);
  infowindow.open();
}

function draw() {

  $.ajax({ url: CONFIG.dataURL, success: function(data) {

    var results = data.rows;

    _.each(results, function(p) {

      _.each(p.host_coordinates, function(c) {

        if (c != null) {

          var hosting_coordinates    = c.split(",");
          var relocating_coordinates = p.coordinates_relocating_school.split(",");

          var hc = [parseFloat(hosting_coordinates[1], 10) + Math.random()/1000, parseFloat(hosting_coordinates[0], 10) + Math.random()/1000];
          var rc = [parseFloat(relocating_coordinates[1], 10) + Math.random()/1000, parseFloat(relocating_coordinates[0], 10) + Math.random()/1000];

          var hosting    = addMarker( map, "hosting",    hc, p );
          var relocating = addMarker( map, "relocating", rc, p );

          paths.push({ data: p, hosting: hosting, relocating: relocating, path: drawPath(hc, rc) });

          google.maps.event.addListener(relocating, 'click', selectPath);
          google.maps.event.addListener(hosting,    'click', selectPath);

        }
      });

    });

  }});

}


function init() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(40.69355504328839, -73.94279479980469),
    disableDefaultUI: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    scaleControl: true,
    zoom: 11,
  });

  var styledMap = new google.maps.StyledMapType(CONFIG.mapStyle, {name: "Styled Map"});

  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');

  draw();

  infowindow = new CartoDBInfowindow(map);
}


