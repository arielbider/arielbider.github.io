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
    maxZoom: 17
});

var marker;
map.on('popupopen', function(source) {
    marker = source.popup;
    var content = marker.getContent();
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

var waypoints_must_layer = new L.FeatureGroup().addTo(map),
    waypoints_by_request_layer = new L.FeatureGroup().addTo(map),
    waypoints_switch_atc_layer = new L.FeatureGroup().addTo(map),
    civil_airways_layer = new L.FeatureGroup().addTo(map),
    military_airways_layer = new L.FeatureGroup().addTo(map),
    altitude_pins_layer = new L.FeatureGroup().addTo(map);

for (var waypoint_key in cvfr_waypoints) {
    var waypoint = cvfr_waypoints[waypoint_key];
    let curr_marker;

    if (waypoint["atc_switch"]) {
        curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
                icon: new L.DivIcon({
                    className: 'waypoint-div',
                    html: '<img class="waypoint-icon" src="map_pins/must_switch.png"/>' +
                        '<span class="waypoint-name">' + waypoint["שם"] + '</span>'
                })
            })
            .addTo(waypoints_switch_atc_layer);
        curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["שם"]} - ${waypoint["CODE"]}</div>
          <div>
            <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
            <span class="button-text">הוסף לנתיב</span>
          </div>
        </div>`);

    } else if (waypoint["סוג דיווח"] == "דרישה") {
        curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
                icon: new L.DivIcon({
                    className: 'waypoint-div',
                    html: '<img class="waypoint-icon" src="map_pins/by_request.png"/>' +
                        '<span class="waypoint-name">' + waypoint["שם"] + '</span>'
                })
            })
            .addTo(waypoints_by_request_layer);
        curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["שם"]} - ${waypoint["CODE"]}</div>
          <div>
            <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
            <span class="button-text">הוסף לנתיב</span>
          </div>
        </div>`);

    } else if (waypoint["סוג דיווח"] == "ARP") {
        curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
                icon: new L.DivIcon({
                    className: 'waypoint-div',
                    html: '<img class="waypoint-icon" src="map_pins/airport.png"/>' +
                        '<span class="waypoint-name">' + waypoint["שם"] + '</span>'
                })
            })
            .addTo(waypoints_by_request_layer);
        curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["שם"]} - ${waypoint["CODE"]}</div>
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
    } else if (waypoint["סוג דיווח"] == "חובה") {
        curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
                icon: new L.DivIcon({
                    className: 'waypoint-div',
                    html: '<img class="waypoint-icon" src="map_pins/must.png"/>' +
                        '<span class="waypoint-name">' + waypoint["שם"] + '</span>'
                })
            })
            .addTo(waypoints_must_layer);
        curr_marker.bindPopup(`<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["שם"]} - ${waypoint["CODE"]}</div>
          <div>
            <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
            <span class="button-text">הוסף לנתיב</span>
          </div>
        </div>`);
    };
}

airways.forEach(function(airway) {

    var start_point_LAT = cvfr_waypoints[airway.start_point].LAT,
        start_point_LONG = cvfr_waypoints[airway.start_point].LONG;
    var end_point_LAT = cvfr_waypoints[airway.end_point].LAT,
        end_point_LONG = cvfr_waypoints[airway.end_point].LONG;

    var bearing = bearingCalculator.bearing(cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG, cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG);
    bearing = ~~bearing

    var start_point, end_point;

    var distance = getDistance(cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG, cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG);

    if (distance > 20) {
        start_point = destinationPoint({
            lat: start_point_LAT,
            lng: start_point_LONG
        }, bearing, distance * 0.05);
        end_point = destinationPoint({
            lat: end_point_LAT,
            lng: end_point_LONG
        }, (bearing - 180), distance * 0.05);
    } else {
        start_point = destinationPoint({
            lat: start_point_LAT,
            lng: start_point_LONG
        }, bearing, distance * 0.1);
        end_point = destinationPoint({
            lat: end_point_LAT,
            lng: end_point_LONG
        }, (bearing - 180), distance * 0.1);
    }
    var latlngs = Array();
    latlngs.push(start_point);
    latlngs.push(end_point);

    var airway_color = function() {
        if (airway["army_airway"]) {
            return 'rgb(0,114,188)'; //blue
        }
        return 'rgb(0,166,81)'; // green
    };

    if (airway["on_atc_approval"]) {
        var polyline = L.polyline(latlngs, {
            color: airway_color(),
            weight: 6,
            dashArray: '5, 15',
            lineCap: 'square'
        });
    } else {
        var polyline = L.polyline(latlngs, {
            color: airway_color(),
            weight: 6
        });
    }

    if (airway["army_airway"]) {
        polyline.addTo(military_airways_layer);
    } else {
        polyline.addTo(civil_airways_layer);
    }

    if (airway["one_way"]) {
        var arrowHead = L.polylineDecorator(polyline, {
            patterns: [{
                offset: '100%',
                repeat: 0,
                symbol: L.Symbol.arrowHead({
                    pixelSize: 20,
                    polygon: false,
                    pathOptions: {
                        stroke: true,
                        color: airway_color(),
                        weight: 6
                    }
                })
            }]
        }).addTo(map);
    }

    // make altitude marker

    var rotation_degree = angleFromCoordinate(start_point[0], start_point[1], end_point[0], end_point[1]);

    if (airway["to_altitude"] == airway["from_altitude"]) {
        let html = "";
        let altitude_html = function() {
            if (rotation_degree < -90 || rotation_degree > 90) {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/equal_altitude.png" style="width: 100%"><div style="transform: rotate(180deg);"><div class="altitude-text" style="transform: translate(-50%, 10%);">${airway["to_altitude"]}</div></div>`;
            } else {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/equal_altitude.png" style="width: 100%"><div class="altitude-text" style="transform: translate(-50%, -60%)">${airway["to_altitude"]}</div></div>`;
            }
            return html;
        };

        //make the altitude marker
        var midPoint = middlePoint(start_point[0], start_point[1], end_point[0], end_point[1]);

        L.marker(midPoint, {
                icon: new L.DivIcon({
                    className: 'altitude-marker',
                    html: altitude_html(),
                    iconSize: [76, 76],
                    iconAnchor: [38, 38]
                })
            })
            .addTo(altitude_pins_layer);

        let bearingToText = function(bearing) {
            let html = "";
            if (rotation_degree < -90 || rotation_degree > 90) {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><div class="bearing" style="transform: rotate(180deg)">${bearing}</div></div>`;
            } else {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><div class="bearing">${bearing}</div></div>`;
            }
            return html;
        };
        bearingText = bearingFormat(bearing);
        //make bearing 1
        L.marker(start_point, {
                icon: new L.DivIcon({
                    className: 'altitude-marker',
                    html: bearingToText(bearingText),
                    iconSize: [76, 76],
                    iconAnchor: [38, 38]
                })
            })
            .addTo(altitude_pins_layer);

        //make bearing 2

        var bearing_opposite = bearingCalculator.bearing(cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG, cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG);
        bearing_opposite = ~~bearing_opposite
        bearingText_opposite = bearingFormat(bearing_opposite);

        L.marker(end_point, {
                icon: new L.DivIcon({
                    className: 'altitude-marker',
                    html: bearingToText(bearingText_opposite),
                    iconSize: [76, 76],
                    iconAnchor: [38, 38]
                })
            })
            .addTo(altitude_pins_layer);

    } else {
        bearingText = bearingFormat(bearing);

        var altitude_html = function() {
            var rotation_degree = angleFromCoordinate(start_point[0], start_point[1], end_point[0], end_point[1]);
            let html = "";
            if (rotation_degree < -90 || rotation_degree > 90) {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><div class="bearing" style="transform: rotate(180deg)">${bearingText}</div><img src="map_pins/altitude_level.png" style="width: 100%"><div style="transform: rotate(180deg);"><div class="altitude-text" style="transform: translate(-50%, 10%);">${airway["to_altitude"]}</div></div>`;
            } else {
                html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/altitude_level.png" style="width: 100%"><div class="altitude-text">${airway["to_altitude"]}</div><div class="bearing">${bearingText}</div></div>`;

            }
            return html;
        };

        let start_point = destinationPoint({
            lat: start_point_LAT,
            lng: start_point_LONG
        }, bearing, distance * 0.2);
        let end_point = destinationPoint({
            lat: end_point_LAT,
            lng: end_point_LONG
        }, (bearing - 180), distance * 0.2)

        L.marker(start_point, {
                icon: new L.DivIcon({
                    className: 'altitude-marker',
                    html: altitude_html(),
                    iconSize: [76, 76],
                    iconAnchor: [38, 38]
                })
            }).bindPopup(`${airway["to_altitude"]}`)
            .addTo(altitude_pins_layer);

        //make opposite direction altitude marker if such exists

        if (!airway["one_way"]) {
            var bearing_opposite = bearingCalculator.bearing(cvfr_waypoints[airway.end_point].LAT, cvfr_waypoints[airway.end_point].LONG, cvfr_waypoints[airway.start_point].LAT, cvfr_waypoints[airway.start_point].LONG);
            bearing_opposite = ~~bearing_opposite
            bearingText_opposite = bearingFormat(bearing_opposite);

            let altitude_html = function() {
                let rotation_degree = angleFromCoordinate(end_point[0], end_point[1], start_point[0], start_point[1]);
                let html = "";
                if (rotation_degree < -90 || rotation_degree > 90) {
                    html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><div class="bearing" style="transform: rotate(180deg)">${bearingText_opposite}</div><img src="map_pins/altitude_level.png" style="width: 100%"><div style="transform: rotate(180deg);"><div class="altitude-text" style="transform: translate(-50%, 10%);">${airway["from_altitude"]}</div></div>`;
                } else {
                    html += `<div class="altitude-div" style ="transform: rotate(${rotation_degree}deg);"><img src="map_pins/altitude_level.png" style="width: 100%"><div class="altitude-text">${airway["from_altitude"]}</div><div class="bearing">${bearingText_opposite}</div></div>`;

                }
                return html;
            };

            L.marker(end_point, {
                    icon: new L.DivIcon({
                        className: 'altitude-marker',
                        html: altitude_html(),
                        iconSize: [76, 76],
                        iconAnchor: [38, 38]
                    })
                }).bindPopup(`${airway["from_altitude"]}`)
                .addTo(altitude_pins_layer);
        }
    }
});

function resizeLayers(ClassName, multiplyBy) {
    var altitude_markers = document.getElementsByClassName(ClassName);

    if (altitude_markers.length > 0) {
        for (let i = 0; i < altitude_markers.length; i++) {
            var transform = altitude_markers[i].style.transform;
            if (transform.includes("scale(0") || transform.includes("scale(1")) {
                var pattern = /scale(.)+./gm;
                transform = transform.replace(pattern, `scale(${multiplyBy})`);
            } else if (transform.includes("scale")) {
                transform = transform.replace("scale(1)", `scale(${multiplyBy})`);
            } else {
                transform += ` scale(${multiplyBy})`;
            }
            altitude_markers[i].style.transform = transform;
        }
    }
}

map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    var multiplyBy = 1;
    // if (currentZoom > 16) {
    // multiplyBy = 1 + ((currentZoom - 13) * 0.2);
    // }
    if (currentZoom < 13 && currentZoom > 10) {
        multiplyBy = 1 - ((13 - currentZoom) * 0.2);
    } else if (currentZoom == 10 || currentZoom == 9) {
        multiplyBy = 0.4;
    } else if (currentZoom == 8) {
        multiplyBy = 0.2;
    } else {
        multiplyBy = 1;
    }

    multiplyBy = parseFloat(multiplyBy).toFixed(2);

    resizeLayers("altitude-div", multiplyBy);
    resizeLayers("waypoint-div", multiplyBy);
});

// Bring some layers to Front
civil_airways_layer.bringToBack();
military_airways_layer.bringToBack();
altitude_pins_layer.bringToBack();
waypoints_must_layer.bringToFront();
waypoints_by_request_layer.bringToFront();
waypoints_switch_atc_layer.bringToFront();

// Add Layer Control
L.control.layers({
    "OSM": osm_map_layer,
    "לוויני": Esri_WorldImagery,
    "מפה טופוגרפית": OpenTopoMap
}, {
    "דיווח חובה": waypoints_must_layer,
    "דיווח לפי דרישה": waypoints_by_request_layer,
    "נקודות מעבר פיקוח": waypoints_switch_atc_layer,
    "נתיבים אזרחיים": civil_airways_layer,
    "נתיבים צבאיים": military_airways_layer,
    "גבהי טיסה": altitude_pins_layer
}).addTo(map);

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
