function addWaypoint(id, if_airport) {
    if (document.getElementById("route").innerHTML == "") {
        document.getElementById("route").innerHTML = id;
    } else {
        document.getElementById("route").innerHTML += " " + id;
    }

    updatePopup(id, if_airport);
    translteRoute();
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
        translteRoute();
    }
}

var route_polyline = L.polyline([], {
    color: 'rgb(255,0,255)',
    weight: 10,
    opacity: 0.5,
    id: 'route_polyline'
}).addTo(map);

document.getElementById('route').addEventListener('keyup', translteRoute);

function translteRoute() {
    var route = document.getElementById("route").innerHTML;
    if (route != "") {
        var ICAO_codes = route.split(" ");

        var latlongs = Array();

        ICAO_codes.forEach(function(code) {
            code = code.replaceAll(" ", "");
            code = code.replaceAll("&nbsp;", "");
            var waypoint_data = Object.values(cvfr_waypoints).filter(waypoint => waypoint.CODE == code);

            if (waypoint_data.length != 0) {
                var lat = waypoint_data[0].LAT,
                    lng = waypoint_data[0].LONG;
                latlongs.push([lat, lng]);
            }
        });

        route_polyline.setLatLngs(latlongs);
        addAirportsToRoutePolyline();
    } else {
        route_polyline.setLatLngs([]);
        addAirportsToRoutePolyline();
    }
}

var dep = "",
    arr = "";

function validateAirport(id) {

    var airport_code = document.getElementById(id).innerHTML;

    if (id == "departure" && ((airport_code.length == 3 && dep.length == 4) || (airport_code.length == 5 && dep.length == 4) || (dep.length - airport_code.length > 1)) && route_polyline.getLatLngs().length > 0) {
        var new_polyline = route_polyline.getLatLngs();
        new_polyline.splice(0, 1);
        route_polyline.setLatLngs(new_polyline);
        dep = airport_code;

    } else if (id == "arrival" && ((airport_code.length == 3 && arr.length == 4) || (airport_code.length == 5 && arr.length == 4) || (arr.length - airport_code.length > 1)) && route_polyline.getLatLngs().length > 0) {
        var new_polyline = route_polyline.getLatLngs();
        new_polyline.pop();
        route_polyline.setLatLngs(new_polyline);
        arr = airport_code;
    }

    if (airport_code.length == 4) {
        var airport = Object.values(cvfr_waypoints).filter(waypoint => waypoint["סוג דיווח"] == "ARP" && waypoint.CODE == airport_code);

        if (airport.length != 0) {

            translteRoute();
            //addAirportsToRoutePolyline();

            document.getElementById("validate-" + id).innerHTML = airport[0]["שם"];
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

function addAirportsToRoutePolyline() {
    var dep = document.getElementById("departure").innerHTML,
        arr = document.getElementById("arrival").innerHTML,
        array_of_points = route_polyline.getLatLngs();

    if (dep != "") {
        var airport = Object.values(cvfr_waypoints).filter(waypoint => waypoint.CODE == dep);
        if (airport.length != 0) {
            array_of_points.splice(0, 0, [airport[0].LAT, airport[0].LONG]);
        }
    }

    if (arr != "") {
        var airport = Object.values(cvfr_waypoints).filter(waypoint => waypoint.CODE == arr);
        if (airport.length != 0) {
            array_of_points.push([airport[0].LAT, airport[0].LONG]);
        }
    }

    if (document.getElementById("route")) {
        route_polyline.setLatLngs(array_of_points);
    }

}

function setAsDeparture(airport_code) {
    document.getElementById("departure").innerHTML = airport_code;
    validateAirport("departure");
    updatePopup(airport_code, 1);
}

function setAsArrival(airport_code) {
    document.getElementById("arrival").innerHTML = airport_code;
    validateAirport("arrival");
    updatePopup(airport_code, 1);
}

function updatePopup(airport_code, if_airport) {
    let route = document.getElementById("route").innerHTML, dep = document.getElementById("departure").innerHTML,
    arr = document.getElementById("arrival").innerHTML, marker_info = marker.getContent().split("<div>");

    marker_info = marker_info[0] + "<div>" + marker_info[1];

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

var div = document.getElementById('planner');
var box_height = div.offsetHeight,
    box_width = div.offsetWidth,
    window_height = window.innerHeight,
    window_width = window.innerWidth;

window.onload = addListeners();
var offX;
var offY;

function addListeners() {
    document.getElementById('planner').addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

}

function mouseUp() {
    window.removeEventListener('mousemove', divMove, true);
}

function mouseDown(e) {
    window.addEventListener('mousemove', divMove, true);
    offY = e.clientY - parseInt(div.offsetTop);
    offX = e.clientX - parseInt(div.offsetLeft);
}

function divMove(e) {
    //div.style.removeProperty('bottom');
    div.style.bottom = "";
    div.style.position = 'absolute';

    if (e.clientY - offY < 0) {
        div.style.top = '0px';
    } else if (e.clientY - offY > window_height - box_height) {
        div.style.top = window_height - box_height + 'px';
    } else {
        div.style.top = (e.clientY - offY) + 'px';
    }

    if (e.clientX - offX < 0) {
        div.style.left = '0px';
    } else if (e.clientX - offX > window_width - box_width) {
        div.style.left = window_width - box_width + 'px';
    } else {
        div.style.left = (e.clientX - offX) + 'px';
    }
}
