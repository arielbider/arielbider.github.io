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
	ipAddress = document.getElementById("ipAddress").value;
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
				document.getElementsByClassName("fa-location-arrow")[0].style.color = "black";
			} else {
				focusOnAircraft = true;
				document.getElementsByClassName("fa-location-arrow")[0].style.color = "mediumspringgreen";
			}
		}).addTo(map);
		getAirplaneFromSim();
		intervalAircraftData = setInterval(getAirplaneFromSim, 2500);
	} else {
		clearInterval(intervalAircraftData);
		userAircraft.remove();
		mapControl.remove();
	}
});

function getAirplaneFromSim() {
	var con = new XMLHttpRequest();
	con.onreadystatechange = function() {
		if (con.readyState == XMLHttpRequest.DONE) {
			try{
				console.log(con.responseText);
				let data = JSON.parse(con.responseText);
				setAircraftData(data);
			} catch(e){
				console.log(e);
			}
		}
	}
	con.open('GET', simURL, true);
	con.send();
}

function setAircraftData(data) {
	userAircraft.setLatLng([data.latitude, data.longitude]);
	map.hasLayer(userAircraft) ? userAircraft : userAircraft.addTo(map);
	document.getElementsByClassName("userAircraft")[0].style.transform = `rotate(${data.heading - 45}deg)`;
	if (focusOnAircraft) {
		map.setView([data.latitude, data.longitude], map.getZoom());
	}
}
