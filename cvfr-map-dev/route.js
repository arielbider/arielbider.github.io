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
    let route = document.getElementById("route").innerText;
    //console.log(route);
    let route_upper = route.toUpperCase();
    if (route != "") {
        let ICAO_codes = route.split(" ");

        let latlongs = Array();

        ICAO_codes.forEach(function(code) {
            code = code.replaceAll(" ", "");
            code = code.replaceAll("&nbsp;", "");
            let waypoint_data = Object.values(cvfr_waypoints).filter(waypoint => waypoint.CODE == code);

            if (waypoint_data.length != 0) {
                let lat = waypoint_data[0].LAT,
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
    //document.getElementById("route").innerText = route_upper;
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
    let route = document.getElementById("route").innerHTML,
        dep = document.getElementById("departure").innerHTML,
        arr = document.getElementById("arrival").innerHTML,
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



function isMobile() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


var div = document.getElementById('planner');
var box_height = div.offsetHeight,
    box_width = div.offsetWidth,
    window_height = window.innerHeight,
    window_width = window.innerWidth;

if (window_width >= 576 || !isMobile()) {
    window.onload = addListeners();
}

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
