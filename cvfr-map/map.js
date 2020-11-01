// *************** Utitily Functions ****************

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
	minZoom: 8,
	maxZoom: 14
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

var cvfr_map = L.tileLayer('../cvfr-map-dev/map/{z}/{x}/{y}.png', {
	attribution: 'מקור: &copy; פמ"ת פנים ארצי, רת"א | עיבוד: בר רודוי ואריאל בידר',
}).addTo(map);

var waypoints_layer = new L.FeatureGroup().addTo(map);

map.on("zoomend", function(){
	if(map.getZoom() < 11 && map.hasLayer(waypoints_layer)){
		waypoints_layer.remove();
	} else {
		waypoints_layer.addTo(map);
	}
});

for (let waypoint_key in cvfr_waypoints) {
	let waypoint = cvfr_waypoints[waypoint_key];

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

// function resizeLayers(multiplyBy) {
//     //waypoints_layer.getLayers().length
//     if (altitude_markers.length > 0) {
//         for (let i = 0; i < altitude_markers.length; i++) {
//             var transform = altitude_markers[i].style.transform;
//             if (transform.includes("scale(0") || transform.includes("scale(1")) {
//                 var pattern = /scale(.)+./gm;
//                 transform = transform.replace(pattern, `scale(${multiplyBy})`);
//             } else if (transform.includes("scale")) {
//                 transform = transform.replace("scale(1)", `scale(${multiplyBy})`);
//             } else {
//                 transform += ` scale(${multiplyBy})`;
//             }
//             altitude_markers[i].style.transform = transform;
//         }
//     }
// }
//
// map.on('zoomend', function() {
//     var currentZoom = map.getZoom();
//     var multiplyBy = 1;
//     // if (currentZoom > 16) {
//     // multiplyBy = 1 + ((currentZoom - 13) * 0.2);
//     // }
//     if (currentZoom < 13 && currentZoom > 10) {
//         multiplyBy = 1 - ((13 - currentZoom) * 0.2);
//     } else if (currentZoom == 10 || currentZoom == 9) {
//         multiplyBy = 0.4;
//     } else if (currentZoom == 8) {
//         multiplyBy = 0.2;
//     } else {
//         multiplyBy = 1;
//     }
//
//     multiplyBy = parseFloat(multiplyBy).toFixed(2);
//
//     resizeLayers(multiplyBy);
// });

map.setView([32.00944444, 34.88555556], 13);


// function Weather(code) {
// 	this.code = code;
// 	this.metar = "No Data";
// 	this.taf = "No Data";
// 	get: function(ICAO_code){
// 		return {metar: this.metar, taf: this.taf};
// 	};
// 	private getData(){
// 		var metarURL = "https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=" + code;
// 		var tafURL = "https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&hoursBeforeNow=3&timeType=issue&mostRecent=true&stationString=" + code;
// 	};
// };
