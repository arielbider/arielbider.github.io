function angleFromCoordinate(lat1,lon1,lat2,lon2) {
    var p1 = {
        x: lat1,
        y: lon1
    };

    var p2 = {
        x: lat2,
        y: lon2
    };
    // angle in radians
    var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angleDeg-90;
}





var bearingCalculator = {
        bearing : function (lat1,lng1,lat2,lng2) {
            var dLon = this._toRad(lng2-lng1);
            var y = Math.sin(dLon) * Math.cos(this._toRad(lat2));
            var x = Math.cos(this._toRad(lat1))*Math.sin(this._toRad(lat2)) - Math.sin(this._toRad(lat1))*Math.cos(this._toRad(lat2))*Math.cos(dLon);
            var brng = this._toDeg(Math.atan2(y, x));
            return ((brng + 360) % 360);
        },

        _toRad : function(deg) {
             return deg * Math.PI / 180;
        },

        _toDeg : function(rad) {
            return rad * 180 / Math.PI;
        },
    };


var map = L.map('mapid', {
    minZoom: 8,
    maxZoom: 17
});
	
	var osm_map_layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'osm',
	}).addTo(map);
	
	var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});
	
	var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	});
	
	
	//var WaypointIcon = L.Icon.extend({
	//	options: {
	//		iconSize:     [24, 24],
	//		iconAnchor:   [0, 0],
	//		popupAnchor:  [-3, -76]
	//	}
	//});
	
	var waypoints_must_layer = L.layerGroup().addTo(map);
	var waypoints_by_request_layer = L.layerGroup().addTo(map);
	var waypoints_switch_atc_layer = L.layerGroup().addTo(map);
	var civil_airways_layer = L.layerGroup().addTo(map);
	var military_airways_layer = L.layerGroup().addTo(map);
	var altitude_pins_layer = L.layerGroup().addTo(map);
	
	for (var waypoint_key in cvfr_waypoints) {
		var waypoint = cvfr_waypoints[waypoint_key];
		
		if(waypoint["atc_switch"]) {
			L.marker([waypoint["LAT"], waypoint["LONG"]],
			{icon: new L.DivIcon({
				className: 'waypoint-div',
				html: '<img class="waypoint-icon" src="map_pins/must_switch.png"/>'+
					  '<span class="waypoint-name">'+waypoint["שם"]+'</span>'
				})
			})
			.bindPopup(`<div class="waypoint_popup">${waypoint["שם"]}<br>${waypoint.CODE}<br>lat: ${waypoint["LAT"]}, long: ${waypoint["LONG"]}</div>`).addTo(waypoints_switch_atc_layer);
		}
		
		else if (waypoint["סוג דיווח"] == "דרישה") {
			L.marker([waypoint["LAT"], waypoint["LONG"]],
			{icon: new L.DivIcon({
				className: 'my-div-icon',
				html: '<img class="waypoint-icon" src="map_pins/by_request.png"/>'+
					  '<span class="waypoint-name">'+waypoint["שם"]+'</span>'
				})
			}
			).bindPopup(`<div class="waypoint_popup">${waypoint["שם"]}<br>${waypoint.CODE}<br>lat: ${waypoint["LAT"]}, long: ${waypoint["LONG"]}</div>`).addTo(waypoints_by_request_layer);
		}
		
		else if (waypoint["סוג דיווח"] == "ARP") {
			L.marker([waypoint["LAT"], waypoint["LONG"]],
			{icon: new L.DivIcon({
				className: 'my-div-icon',
				html: '<img class="waypoint-icon" src="map_pins/airport.png"/>'+
					  '<span class="waypoint-name">'+waypoint["שם"]+'</span>'
				})
			}
			).bindPopup(`<div class="waypoint_popup">${waypoint["שם"]}<br>${waypoint.CODE}<br>lat: ${waypoint["LAT"]}, long: ${waypoint["LONG"]}</div>`).addTo(waypoints_by_request_layer);
		}
		
		else if (waypoint["סוג דיווח"] == "חובה") {
			L.marker([waypoint["LAT"], waypoint["LONG"]],
			{icon: new L.DivIcon({
				className: 'my-div-icon',
				html: '<img class="waypoint-icon" src="map_pins/must.png"/>'+
					  '<span class="waypoint-name">'+waypoint["שם"]+'</span>'
				})
			}
			).bindPopup(`<div class="waypoint_popup">${waypoint["שם"]}<br>${waypoint.CODE}<br>lat: ${waypoint["LAT"]}, long: ${waypoint["LONG"]}</div>`).addTo(waypoints_must_layer);
		};
	};
	
	
	airways.forEach(function(airway){
		
		var start_point_LAT = cvfr_waypoints[airway.start_point].LAT, start_point_LONG = cvfr_waypoints[airway.start_point].LONG;
		var end_point_LAT = cvfr_waypoints[airway.end_point].LAT, end_point_LONG = cvfr_waypoints[airway.end_point].LONG;
		
		
		// Take care of polylines that have marging of more then 0.075
		
		if (start_point_LAT - end_point_LAT > 0.075 || end_point_LAT - start_point_LAT > 0.075) {
			if (start_point_LAT < end_point_LAT) {
				start_point_LAT += 0.008;
				end_point_LAT -= 0.008;
			} else {
				start_point_LAT  -= 0.008;
				end_point_LAT  += 0.008;
			}
		}
		
		if (start_point_LONG - end_point_LONG > 0.075 || end_point_LONG - start_point_LONG > 0.075){
			if (start_point_LONG < end_point_LONG ) {
				start_point_LONG += 0.008;
				end_point_LONG -= 0.008;
			} else {
				start_point_LONG  -= 0.008;
				end_point_LONG  += 0.008;
			}
		}
		
		
		// Take care of polylines that have marging between 0.5 and 0.04=75
		
		if (0.075 > start_point_LAT - end_point_LAT > 0.05 || 0.075 > end_point_LAT - start_point_LAT > 0.05) {
			if (start_point_LAT < end_point_LAT) {
				start_point_LAT += 0.003;
				end_point_LAT -= 0.003;
			} else {
				start_point_LAT  -= 0.003;
				end_point_LAT  += 0.003;
			}
		}
	
		
		if (0.075 > start_point_LONG - end_point_LONG > 0.05 || 0.075 > end_point_LONG - start_point_LONG > 0.05){
					if (start_point_LONG < end_point_LONG ) {
						start_point_LONG += 0.003;
						end_point_LONG -= 0.003;
					} else {
						start_point_LONG  -= 0.003;
						end_point_LONG  += 0.003;
					}
				}
		
		// Take care of polylines that have marging of less then 0.5
		
		
		if (start_point_LAT - end_point_LAT < 0.05 || end_point_LAT - start_point_LAT < 0.05) {
			if (start_point_LAT < end_point_LAT) {
				start_point_LAT += 0.001;
				end_point_LAT -= 0.001;
			} else {
				start_point_LAT  -= 0.001;
				end_point_LAT  += 0.001;
			}
		}
		
		if (start_point_LONG - end_point_LONG < 0.05 || end_point_LONG - start_point_LONG < 0.05){
					if (start_point_LONG < end_point_LONG ) {
						start_point_LONG += 0.001;
						end_point_LONG -= 0.001;
					} else {
						start_point_LONG  -= 0.001;
						end_point_LONG  += 0.001;
					}
				}
		
		
		var start_point = [start_point_LAT, start_point_LONG];
		var end_point = [end_point_LAT, end_point_LONG];
		var latlngs = Array();

		latlngs.push(start_point);

		latlngs.push(end_point);
		
		var airway_color = function(){
			if (airway["army_airway"]) {
				return 'rgb(0,114,188)'; //blue
			}
			return 'rgb(0,166,81)'; // green
		};
		
		if (airway["on_atc_approval"]){
			var polyline = L.polyline(latlngs, {color: airway_color(), weight: 6, dashArray: '5, 15', lineCap: 'square' });
		} else {
			var polyline = L.polyline(latlngs, {color: airway_color(), weight: 6});
		}
		
		if (airway["army_airway"]){
				polyline.addTo(military_airways_layer);
			}
			else {
				polyline.addTo(civil_airways_layer);
		}
		
		if (airway["one_way"]){
			var arrowHead = L.polylineDecorator(polyline, {
			patterns: [
				{
					offset: '100%',
					repeat: 0,
					symbol: L.Symbol.arrowHead({pixelSize: 20, polygon: false, pathOptions: {stroke: true, color: airway_color(), weight: 6}})
				}
			]
			}).addTo(map);
		}
		
		
		var bearing = bearingCalculator.bearing(cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG, cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG);
		bearing = ~~bearing
		
		// make altitude marker
		
		var altitude_html = function(){
			var rotation_degree = angleFromCoordinate(start_point[0], start_point[1], end_point[0], end_point[1]);
			var html = `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/altitude_level.png" style="width: 75px">`;
			if(rotation_degree < -90 || rotation_degree > 90){
				html += `<div style="transform: rotate(180deg);"><div class="altitude-text" style="transform: translate(-50%, 10%);">${airway["to_altitude"]}</div></div><div class="bearing" style="transform: rotate(180deg)">${bearing}<\div><\div>`;
			} else {
				html += `<div class="altitude-text">${airway["to_altitude"]}</div><div class="bearing">${bearing}<\div><\div>`;
				
			}
			return html;
		};
		
		L.marker(start_point,
			{icon: new L.DivIcon({
				className: 'altitude-marker',
				html: altitude_html(),
				iconSize: [100, 100],
				iconAnchor: [50, 25]
				})
			}).bindPopup(`${airway["to_altitude"]}`)
			.addTo(altitude_pins_layer);
			
			
		//make opposite direction altitude marker if such exists
		
		var bearing_opposite = bearingCalculator.bearing(cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG, cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG);
		bearing_opposite = ~~bearing_opposite
		
		
		if (!airway["one_way"]){
			
			var altitude_html = function(){
			var rotation_degree = angleFromCoordinate(end_point[0], end_point[1], start_point[0], start_point[1]);
			var html = `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/altitude_level.png" style="width: 75px">`;
			if(rotation_degree < -90 || rotation_degree > 90){
				html += `<div style="transform: rotate(180deg);"><div class="altitude-text" style="transform: translate(-50%, 10%);">${airway["from_altitude"]}</div></div><div class="bearing" style="transform: rotate(180deg)">${bearing_opposite}<\div><\div>`;
			} else {
				html += `<div class="altitude-text">${airway["from_altitude"]}</div><div class="bearing">${bearing_opposite}<\div><\div>`;
				
			}
			return html;
		};
		
		L.marker(end_point,
			{icon: new L.DivIcon({
				className: 'altitude-marker',
				html: altitude_html(),
				iconSize: [100, 100],
				iconAnchor: [50, 25]
				})
			}).bindPopup(`${airway["from_altitude"]}`)
			.addTo(altitude_pins_layer);
			
		}
		
	});
	
	L.control.layers(
		{
			"OSM": osm_map_layer,
			"לוויני": Esri_WorldImagery,
			"מפה טופוגרפית": OpenTopoMap
		},
		{
			"דיווח חובה": waypoints_must_layer,
			"דיווח לפי דרישה": waypoints_by_request_layer,
			"נקודות מעבר פיקוח": waypoints_switch_atc_layer,
			"נתיבים אזרחיים": civil_airways_layer,
			"נתיבים צבאיים": military_airways_layer,
			"גבהי טיסה": altitude_pins_layer
		}
	).addTo(map);
	
	map.setView([32.00944444, 34.88555556], 13);