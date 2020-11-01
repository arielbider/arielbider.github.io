function addWaypoint(id, if_airport) {
	if (document.getElementById("route").innerHTML == "") {
		document.getElementById("route").innerHTML = id;
	} else {
		document.getElementById("route").innerHTML += " " + id;
	}

	updatePopup(id, if_airport);
	translateRoute();
}

function removeWaypoint(id, if_airport) {

	var route_string = document.getElementById("route").innerHTML;

	if (route_string != "") {

		ICAO_code = id.replaceAll(" ", "");

		var index = route_string.lastIndexOf(ICAO_code),
			route_string_as_Array = Array.from(route_string),
			last_char = ICAO_code.length;

		for (var i = 0; i < last_char; i++) {
			route_string_as_Array.splice(index, 1);
		}

		document.getElementById("route").innerHTML = route_string_as_Array.join('');
		updatePopup(id, if_airport);
		translateRoute();
	}
}

class routePolyline {
	constructor(color) {
		this._polyline = new L.Polyline([], {
			color: color,
			weight: 10,
			opacity: 0.5,
			id: 'route_polyline'
		}).addTo(map);
		this._airways = [];
		this.error = false;
		this.allowDirect = false;
		this.allowUserPoints = false;
	}

	hasError(errorBool) {
		this.error = errorBool;
	}

	isError() {
		return this.error;
	}

	addAirway(airway) {
		console.log(airway);
		this._airways.push(Object.assign({}, airway));
		if (!this.error) {
			this._setNewPolyline();
		}
		console.log(this._airways);
	}

	removeAirway(airway) {
		let index = _airways.findIndex(e => e.start_point == airway.start_point && e.end_point == airway.end_point);
		this._airways.splice(index, 1);
		if (!this.error) {
			this._setNewPolyline();
		}
	}

	removeAll() {
		this._airways = [];
		this._setNewPolyline();
	}

	_setNewPolyline() {
		let latLongs = Array();

		this._airways.forEach((airway, i) => {
			let coords = this._getCoordsOfAirway(airway);

			if (airway.start) {}

			if (i == 0) {
				latLongs.push([coords.start_point.lat, coords.start_point.long]);
			}
			if (airway.hasOwnProperty('points')) {
				airway.points.forEach((point, x) => {
					latLongs.push([point.lat, point.long]);
				});
			}

			latLongs.push([coords.end_point.lat, coords.end_point.long]);
		});

		this._polyline.setLatLngs(latLongs);
		this._polyline.bringToFront();
	}

	_getCoordsOfAirway(airway) {
		let point1, point2;

		if (/POINT.+/.test(airway.start_point) && /POINT.+/.test(airway.end_point)) {
			point1 = Object.values(userPoints).find(waypoint => waypoint.name == airway.start_point);
			point2 = Object.values(userPoints).find(waypoint => waypoint.name == airway.end_point);
		} else if (/POINT.+/.test(airway.end_point)) {
			point1 = Object.values(cvfr_waypoints).find(waypoint => waypoint["name"] == airway.start_point);
			point2 = Object.values(userPoints).find(waypoint => waypoint.name == airway.end_point);
		} else if (/POINT.+/.test(airway.start_point)) {
			point1 = Object.values(userPoints).find(waypoint => waypoint.name == airway.start_point);
			point2 = Object.values(cvfr_waypoints).find(waypoint => waypoint["name"] == airway.end_point);
		} else {
			point1 = Object.values(cvfr_waypoints).find(waypoint => waypoint["name"] == airway.start_point);
			point2 = Object.values(cvfr_waypoints).find(waypoint => waypoint["name"] == airway.end_point);
		}
		return {
			start_point: {
				lat: point1.LAT,
				long: point1.LONG
			},
			end_point: {
				lat: point2.LAT,
				long: point2.LONG
			}
		};
	}
}

var route_polyline = new routePolyline("rgb(255,0,255)");
var route_polyline_error = new routePolyline("rgb(220,20,60)");


document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('route').addEventListener('keyup', translateRoute);
	document.getElementById("direct-routes").addEventListener("click", changeDirectPermission);
	document.getElementById("user-points").addEventListener("click", changeUserPointPermission);
});

function translateRoute() {
	let route = document.getElementById("route").innerText;
	let departure = document.getElementById("departure").value;
	departure = departure.replaceAll(" ", "");
	let arrival = document.getElementById("arrival").value;
	departure = departure.replaceAll(" ", "");

	if (route || (departure && arrival)) {
		let errors = Array();
		let ICAO_codes = route.split(" ");
		ICAO_codes = ICAO_codes.filter(code => code);

		if (departure) {
			ICAO_codes.unshift(departure);
		}
		if (arrival) {
			ICAO_codes.push(arrival);
		}
		console.log(ICAO_codes);
		let i;

		route_polyline.removeAll();
		route_polyline_error.removeAll();

		route_polyline.hasError(false);

		document.getElementById("routes-errors").innerHTML = "";

		for (i = 1; i < ICAO_codes.length; i++) {
			if (!ICAO_codes[i]) {
				continue;
			}
			let curr_code = ICAO_codes[i];
			let prev_code = ICAO_codes[i - 1];

			curr_code = curr_code.replaceAll(" ", "");
			curr_code = curr_code.replaceAll("&nbsp;", "");
			prev_code = prev_code.replaceAll(" ", "");
			prev_code = prev_code.replaceAll("&nbsp;", "");

			if (/POINT.+/gm.test(curr_code) && /POINT.+/gm.test(prev_code) && route_polyline.allowUserPoints) {
				if (!route_polyline.isError()) {
					route_polyline.addAirway({
						start_point: prev_code,
						end_point: curr_code
					});
				} else {
					route_polyline_error.addAirway({
						start_point: prev_code,
						end_point: curr_code
					});
				}
			} else if (/POINT.+/gm.test(prev_code) && route_polyline.allowUserPoints) {
				let curr_code_name = Object.values(cvfr_waypoints).find(waypoint => waypoint.CODE == curr_code).name;
				if (!route_polyline.isError()) {
					route_polyline.addAirway({
						start_point: prev_code,
						end_point: curr_code_name
					});
				} else {
					route_polyline_error.addAirway({
						start_point: prev_code,
						end_point: curr_code_name
					});
				}
			} else if (/POINT.+/gm.test(curr_code) && route_polyline.allowUserPoints) {
				let prev_code_name = Object.values(cvfr_waypoints).find(waypoint => waypoint.CODE == prev_code).name;

				if (!route_polyline.isError()) {
					route_polyline.addAirway({
						start_point: prev_code_name,
						end_point: curr_code
					});
				} else {
					route_polyline_error.addAirway({
						start_point: prev_code_name,
						end_point: curr_code
					});
				}
			} else {
				let curr_code_name = Object.values(cvfr_waypoints).find(waypoint => waypoint.CODE == curr_code).name;
				let prev_code_name = Object.values(cvfr_waypoints).find(waypoint => waypoint.CODE == prev_code).name;

				try {
					let airway = Object.values(airways).find(airway => ((airway.start_point == prev_code_name && airway.end_point == curr_code_name) || (airway.end_point == prev_code_name && airway.start_point == curr_code_name && airway.one_way == 0)));
					if (airway.end_point == prev_code_name && airway.start_point == curr_code_name && airway.one_way == 0) {
						let temp_start_point = airway.start_point;
						airway.start_point = airway.end_point;
						airway.end_point = temp_start_point;
						if (airway.hasOwnProperty('points')) {
							airway.points = airway.points.reverse();
						}
					}
					if (!route_polyline.isError()) {
						route_polyline.addAirway(airway);
					} else {
						route_polyline_error.addAirway(airway);
					}
				} catch (err) {
					if (!route_polyline.allowDirect) {
						console.log(err);
						errors.push([prev_code_name, curr_code_name]);
						route_polyline.hasError(true);

						route_polyline_error.addAirway({
							start_point: prev_code_name,
							end_point: curr_code_name,
						});

					} else {
						route_polyline.addAirway({
							start_point: prev_code_name,
							end_point: curr_code_name,
						});
					}
					console.log("here");
				}
			}

		}

		if (errors.length > 0) {
			let errorString;
			errors.forEach((error, i) => {
				if (errorString) {
					errorString += `<br>לא קיים נתיב בין ${error[0]} ו${error[1]}`;
				} else {
					errorString = `לא קיים נתיב בין ${error[0]} ו${error[1]}`;
				}
			});
			document.getElementById("routes-errors").innerHTML = errorString;
		}
	} else {
		route_polyline.removeAll();
		route_polyline_error.removeAll();
	}

	calculateTime();
}


function changeDirectPermission(button) {
	route_polyline.allowDirect = button.srcElement.checked;
	translateRoute();
}

var userPoints = Array(),
	userPointsLayer = new L.FeatureGroup().addTo(map);

var userMarker = L.Marker.extend({
	options: {
		name: ""
	}
});

var userPointsEvent = function(e) {
	let pointName = `POINT${(userPoints.length+1)}`;
	let customMarker = new userMarker([e.latlng.lat, e.latlng.lng], {
		name: pointName
	}).addTo(userPointsLayer).bindPopup(`<div class="waypoint_popup" id="${pointName}-div"><div class="airport-name">${pointName}</div>
                <div>
                  <img src="img/plan-normal.png" data-waypoint="${pointName}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                  <span class="button-text">הוסף לנתיב</span>
                </div>
              </div>`).openPopup();

	customMarker.on("dblclick", function(e) {
		console.log(e.target.options.name);
		customMarker.removeFrom(map);
		let index = userPoints.findIndex(point => point.name == e.target.options.name);
		userPoints.splice(index, 1);
		translateRoute();
	});

	userPoints.push({
		name: pointName,
		marker: customMarker,
		LAT: e.latlng.lat,
		LONG: e.latlng.lng
	});
};

function changeUserPointPermission(button) {
	route_polyline.allowUserPoints = button.srcElement.checked;
	let route = document.getElementById("route").innerText;

	if (route_polyline.allowUserPoints) {
		map.on('click', userPointsEvent);
		userPointsLayer.addTo(map);
	} else {
		map.off('click', userPointsEvent);
		userPointsLayer.remove();

		userPoints.forEach((point, i) => {
			route = route.replaceAll(point.name, "");
		});

		console.log("route " + route);
		document.getElementById("route").innerText = route;
	}

	translateRoute();
}

var dep = "",
	arr = "";

function validateAirport(id) {

	var airport_code = document.getElementById(id).value.toUpperCase();

	if (id == "departure" && ((airport_code.length == 3 && dep.length == 4) || (airport_code.length == 5 && dep.length == 4) || (dep.length - airport_code.length > 1)) && route_polyline._polyline.getLatLngs().length > 0) {

		translateRoute();
		dep = airport_code;

	} else if (id == "arrival" && ((airport_code.length == 3 && arr.length == 4) || (airport_code.length == 5 && arr.length == 4) || (arr.length - airport_code.length > 1)) && route_polyline._polyline.getLatLngs().length > 0) {

		translateRoute();
		arr = airport_code;
	}

	if (airport_code.length == 4) {
		var airport = Object.values(cvfr_waypoints).filter(waypoint => (waypoint.type == "ARP" && waypoint.CODE == airport_code));

		if (airport.length != 0) {
			translateRoute();

			document.getElementById(id).blur();

			document.getElementById("validate-" + id).innerHTML = airport[0]["name"];
			if (id == "departure") {
				dep = airport_code;
			} else {
				arr = airport_code;
			}
		}
	} else {
		document.getElementById("validate-" + id).innerHTML = "";
	}
}

function setAsDeparture(airport_code) {
	document.getElementById("departure").value = airport_code;
	validateAirport("departure");
	updatePopup(airport_code, 1);
}

function setAsArrival(airport_code) {
	document.getElementById("arrival").value = airport_code;
	validateAirport("arrival");
	updatePopup(airport_code, 1);
}

function updatePopup(airport_code, if_airport) {
	let route = document.getElementById("route").innerHTML,
		dep = document.getElementById("departure").value,
		arr = document.getElementById("arrival").value,
		marker_info = marker.getContent().split("<div>");
	marker_info = marker_info[0] + "<div>" + marker_info[1];
	if (!if_airport) {
		marker_info = marker_info.split("</div>");
		marker_info = marker_info[0] + "</div>" + marker_info[1];
	}
	if (route.includes(airport_code)) {
		marker_info += `<div>
          <img src="img/plan-normal.png" data-waypoint="${airport_code}" class="popup-button" onclick="removeWaypoint(this.dataset.waypoint, ${if_airport})" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
          <span class="button-text">הסר מנתיב</span>
        </div>`;
	}
	if (dep != airport_code && if_airport) {
		//הוספת כפתור קבע כשדה המראה
		marker_info += `<div>
          <img src="img/plan-normal.png" onclick="setAsDeparture(this.dataset.airport)" data-airport="${airport_code}" class="popup-button" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
          <span class="button-text">קבע כשדה המראה</span>
          </div>`;
	}
	if (arr != airport_code && if_airport) {
		marker_info += `<div>
          <img src="img/plan-normal.png" onclick="setAsArrival(this.dataset.airport)" data-airport="${airport_code}" class="popup-button" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
          <span class="button-text">קבע כשדה נחיתה</span>
        </div>`;
	}

	marker_info + "</div>";
	marker.setContent(marker_info);
}


document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("speed").addEventListener('change', calculateTime);
	document.getElementById("departure-time").addEventListener('change', calculateTime);
});

function calculateTime() {
	let airspeed = document.getElementById("speed").value;
	airspeed.length > 0 ? airspeed : airspeed = document.getElementById("speed").placeholder;
	console.log(airspeed);

	let departureTime = document.getElementById("departure-time").value;

	if (departureTime == "") {
		document.getElementById("arrival-time").innerHTML = "";
		return;
	}

	departureTime = departureTime.split(":");
	departureTime[0] = parseInt(departureTime[0]), departureTime[1] = parseInt(departureTime[1]);

	let allPoints = route_polyline._polyline.getLatLngs();
	let distance = 0;

	for (i = 0; i < allPoints.length - 1; i++) {
		distance += getDistance(allPoints[i].lat, allPoints[i].lng, allPoints[i + 1].lat, allPoints[i + 1].lng);
	}

	distance = distance / 1.852; // Distance in nautical miles

	let time = distance / airspeed;
	departureTime[0] += time % 24 - time % 24 % 1;

	departureTime[1] += Math.round((time % 1) * 60);

	departureTime[1] < 10 ? departureTime[1] = "0" + departureTime[1] : departureTime[1];

	document.getElementById("arrival-time").innerHTML = departureTime[0] + ":" + departureTime[1];
}
