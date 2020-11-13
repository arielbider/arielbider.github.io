// *************** Utitily Functions ****************
function log(text) {
	console.log(text);
}

function bearingFormat(bearing) {
	if (bearing.toString().length == 1) {
		return '00' + bearing;
	} else if (bearing.toString().length == 2) {
		return '0' + bearing;
	}
	return bearing;
}

function angleFromCoordinate(lat1, lon1, lat2, lon2) {
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
	return angleDeg - 90;
}

var bearingCalculator = {
	bearing: function(lat1, lng1, lat2, lng2) {
		var dLon = this._toRad(lng2 - lng1);
		var y = Math.sin(dLon) * Math.cos(this._toRad(lat2));
		var x = Math.cos(this._toRad(lat1)) * Math.sin(this._toRad(lat2)) - Math.sin(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) * Math.cos(dLon);
		var brng = this._toDeg(Math.atan2(y, x));
		return ((brng + 360) % 360);
	},

	_toRad: function(deg) {
		return deg * Math.PI / 180;
	},

	_toDeg: function(rad) {
		return rad * 180 / Math.PI;
	},
};

//-- Define radius function
if (typeof(Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}

//-- Define degrees function
if (typeof(Number.prototype.toDeg) === "undefined") {
	Number.prototype.toDeg = function() {
		return this * (180 / Math.PI);
	}
}

function middlePoint(lat1, lng1, lat2, lng2) {

	//-- Longitude difference
	var dLng = (lng2 - lng1).toRad();

	//-- Convert to radians
	lat1 = lat1.toRad();
	lat2 = lat2.toRad();
	lng1 = lng1.toRad();

	var bX = Math.cos(lat2) * Math.cos(dLng);
	var bY = Math.cos(lat2) * Math.sin(dLng);
	var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
	var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

	//-- Return result
	return [lat3.toDeg(), lng3.toDeg()];
}

// dist in KM
function destinationPoint(point, brng, dist) {
	dist = dist / 6371;
	brng = brng.toRad();

	var lat1 = point.lat.toRad(),
		lon1 = point.lng.toRad();

	var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
		Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

	var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
		Math.cos(lat1),
		Math.cos(dist) - Math.sin(lat1) *
		Math.sin(lat2));

	if (isNaN(lat2) || isNaN(lon2)) return null;

	return [lat2.toDeg(), lon2.toDeg()];
}

function getDistance(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}

// *************** Main code starts here **************************

var map = L.map('mapid', {

});

var sidebar = L.control
	.sidebar({
		container: "sidebar",
		position: "right"
	})
	.addTo(map)
	.open("help");

var marker;
map.on('popupopen', function(source) {
	marker = source.popup;
	var content = marker.getContent();
	try {
		var template = /data-waypoint=".+" c/gm;
		content = content.match(template)[0];
		content = content.replaceAll("\"", "");
		content = content.replace(" c", "");
		content = content.replace("data-waypoint=", "");
		if (content.includes("LL") && content.length == 4) {
			updatePopup(content, 1);
		} else {
			updatePopup(content, 0);
		}
	} catch (err) {
		console.log(err);
	}
});

var cvfr_map_layer = L.tileLayer('map/{z}/{x}/{y}.png', {
		attribution: 'מקור: &copy; פמ"ת פנים ארצי, רת"א | עיבוד: בר רודוי ואריאל בידר',
		minZoom: 8,
		maxZoom: 14
	}).addTo(map),
	satellite_imagery_layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		minZoom: 8,
		maxZoom: 17
	}),
	cvfr_points_names_layer = L.layerGroup(),
	cvfr_airways_layer = L.layerGroup(),
	kmz = L.kmzLayer();

kmz.load("https://github.com/arielbider/arielbider.github.io/raw/master/cvfr-map-dev/data/Basic_Map.kmz");

var satellite_and_points_names = L.layerGroup([satellite_imagery_layer, cvfr_points_names_layer, cvfr_airways_layer, kmz]);

L.control.layers({
	"מפת CVFR": cvfr_map_layer,
	'תצ"א': satellite_and_points_names
}).addTo(map);

var waypoints_layer = new L.FeatureGroup().addTo(map);

map.on("zoomend", function() {
	if (map.getZoom() < 11 && map.hasLayer(waypoints_layer)) {
		waypoints_layer.remove();
	} else {
		waypoints_layer.addTo(map);
	}
});

for (let waypoint_key in cvfr_waypoints) {
	let waypoint = cvfr_waypoints[waypoint_key];

	let iconPic;
	if (waypoint["atc_switch"]) {
		iconPic = "map_pins/by_request.png";
	} else if (waypoint["type"] == "ARP") {
		iconPic = "map_pins/airport.png";
	} else if (waypoint["type"] == "דרישה") {
		iconPic = "map_pins/must_switch.png";
	} else {
		iconPic = "map_pins/must.png";
	}

	var name_marker_html = `<img src="${iconPic}" class="waypoint_icon"><br>${waypoint["name"]} - ${waypoint["CODE"]}`;

	L.marker([waypoint["LAT"], waypoint["LONG"]], {
		icon: new L.DivIcon({
			iconSize: [150, 150],
			iconAnchor: [75, 40],
			className: "waypoint_name",
			html: name_marker_html
		})
	}).addTo(cvfr_points_names_layer);

	if (waypoint["type"] == "ARP") {
		curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
			icon: new L.DivIcon({
				iconSize: [240, 240],
				iconAnchor: [120, 120],
				className: 'waypoint-marker',
			})
		}).addTo(waypoints_layer);
		curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["name"]} - ${waypoint["CODE"]}</div>
                    <div>
                      <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 1)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                      <span class="button-text">הוסף לנתיב</span>
                    </div>
                    <div>
                      <img src="img/plan-normal.png" onclick="setAsDeparture(this.dataset.airport)" data-airport="${waypoint["CODE"]}" class="popup-button" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                      <span class="button-text">קבע כשדה המראה</span>
                    </div>
                    <div>
                      <img src="img/plan-normal.png" onclick="setAsArrival(this.dataset.airport)" data-airport="${waypoint["CODE"]}" class="popup-button" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                      <span class="button-text">קבע כשדה נחיתה</span>
                    </div>
                  </div>`, {
			minWidth: 170
		});
	} else {
		curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
			icon: new L.DivIcon({
				iconSize: [120, 120],
				iconAnchor: [60, 60],
				className: 'waypoint-marker',
			})
		}).addTo(waypoints_layer);
		curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["name"]} - ${waypoint["CODE"]}</div>
                    <div>
                      <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                      <span class="button-text">הוסף לנתיב</span>
                    </div>
                  </div>`);
	}
}

airways.forEach((airway, i) => {
	console.log(airway);
	console.log(airway["start_point"]);
	console.log(airway["end_point"]);
	let start_point = Object.values(cvfr_waypoints).find(waypoint => waypoint.name == airway.start_point),
		end_point = Object.values(cvfr_waypoints).find(waypoint => waypoint.name == airway.end_point),
		airway_latlngs = [];

	if (airway.hasOwnProperty("points")) {
		airway_latlngs.push([start_point.LAT, start_point.LONG]);
		airway.points.forEach((point, i) => {
			airway_latlngs.push([point.lat, point.long]);
		});
		airway_latlngs.push([end_point.LAT, end_point.LONG]);
	} else {
		airway_latlngs = [
		    [start_point.LAT, start_point.LONG],
		    [end_point.LAT, end_point.LONG]
		];
	}

	let settings = {
		color: 'rgb(0,165,80)',
		weight: 10,
		lineCap: 'butt'
	};

	if (airway.army_airway) {
		settings.color = "rgb(0,113,187)";
	}
	if (airway.on_atc_approval) {
		settings.dashArray = '50, 50';
		settings.dashOffset = '0';
	}

	L.polyline(airway_latlngs, settings).addTo(cvfr_airways_layer);
});


map.setView([32.00944444, 34.88555556], 13);
