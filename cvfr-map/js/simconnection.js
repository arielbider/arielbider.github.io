var userAircraft = L.marker([], {
	icon: new L.DivIcon({
		iconSize: [100, 100],
		iconAnchor: [50, 50],
		className: "userAircraft-marker",
		html: '<img src="map_pins/cessna.png" class="userAircraft">'
	})
});
var intervalAircraftData;
var simURL;
var mapControl;
var focusOnAircraft = false;
var simURL;

document.getElementById("user-aircraft").addEventListener("click", function() {
	let ipAddress = document.getElementById("ipAddress").value;
	if (this.checked) {
		console.log(!ipAddress);
		if (ipAddress) {
			simURL = "http://" + ipAddress + ":2020";
		} else {
			simURL = "http://localhost:2020"
		}
		mapControl = L.easyButton('fas fa-location-arrow', function() {
			if (focusOnAircraft) {
				focusOnAircraft = false;
				document.querySelector(".fa-location-arrow").style.color = "black";
			} else {
				focusOnAircraft = true;
				document.querySelector(".fa-location-arrow").style.color = "mediumspringgreen";
			}
		}).addTo(map);
		getAirplaneFromSim();
		intervalAircraftData = setInterval(getAirplaneFromSim, 1000);
	} else {
		clearInterval(intervalAircraftData);
		userAircraft.remove();
		mapControl.remove();
		small_altitude.value = 0;
		speed_gauge.value = 0;
		big_altitude.value = 0;
		bearing_gauge.value = 0;
	}
});

function getAirplaneFromSim() {
	var con = new XMLHttpRequest();
	con.onreadystatechange = function() {
		if (con.readyState == XMLHttpRequest.DONE) {
			try {
				console.log(con.responseText);
				let data = JSON.parse(con.responseText);
				setAircraftData(data);
			} catch (e) {
				console.log(e);
			}
		}
	}
	con.open('GET', simURL, true);
	con.send();
}

function setAircraftData(data) {
	userAircraft.setLatLng([data.latitude, data.longitude]);
	if (!map.hasLayer(userAircraft)) {
		userAircraft.addTo(map);
	}
	document.querySelector(".userAircraft").style.transform = `rotate(${data.heading - 45}deg)`;
	if (focusOnAircraft) {
		map.setView([data.latitude, data.longitude], map.getZoom());
	}
	small_altitude.value = data.altitude / 10;
	speed_gauge.value = data.ias;
	big_altitude.value = data.altitude;
	bearing_gauge.value = data.heading;
}
