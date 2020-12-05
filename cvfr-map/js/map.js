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

var cvfr_map_layer = L.tileLayer('../cvfr-map-dev/map/{z}/{x}/{y}.png', {
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
	kmz = L.layerGroup(),
	waypoints_layer = new L.FeatureGroup().addTo(map);

function onEachFeature(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.description) {
		layer.bindPopup(feature.properties.description);
	}
}

let kmz_vars = [fir, ga_airspace, limited_areas, parachuting, ratag, uas];

kmz_vars.forEach((layer, i) => {
	L.geoJSON(layer, {
		onEachFeature: onEachFeature,
		style: function(feature) {
			return {
				color: feature.style.fill
			};
		}
	}).addTo(kmz);
});


var satellite_and_points_names = L.layerGroup([satellite_imagery_layer, cvfr_points_names_layer, cvfr_airways_layer, kmz]);

L.control.layers({
	"מפת CVFR": cvfr_map_layer,
	'תצלום אוויר': satellite_and_points_names
}).addTo(map);

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
		iconPic = "map_pins/must_switch.png";
	} else if (waypoint["type"] == "ARP") {
		iconPic = "map_pins/airport.png";
	} else if (waypoint["type"] == "חובה") {
		iconPic = "map_pins/must.png";
	} else {
		iconPic = "map_pins/by_request.png";
	}

	let name_marker_html = `<img src="${iconPic}" class="waypoint_icon"><br>${waypoint["name"]} - ${waypoint["CODE"]}`;

	let satellite_layer_waypoint_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
		icon: new L.DivIcon({
			iconSize: [150, 150],
			iconAnchor: [75, 40],
			className: "waypoint_name",
			html: name_marker_html
		})
	}).addTo(cvfr_points_names_layer);

	if (waypoint["type"] == "ARP") {
		let curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
			icon: new L.DivIcon({
				iconSize: [240, 240],
				iconAnchor: [120, 120],
				className: 'waypoint-marker',
			})
		}).addTo(waypoints_layer);
		let markerHtml = `<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["name"]} - ${waypoint["CODE"]}</div>
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
                  </div>`;
		curr_marker.bindPopup(markerHtml, {
			minWidth: 170
		});
		satellite_layer_waypoint_marker.bindPopup(markerHtml);
	} else {
		let curr_marker = L.marker([waypoint["LAT"], waypoint["LONG"]], {
			icon: new L.DivIcon({
				iconSize: [120, 120],
				iconAnchor: [60, 60],
				className: 'waypoint-marker',
			})
		}).addTo(waypoints_layer);
		let markerHtml = `<div class="waypoint_popup" id="${waypoint["CODE"]}-div"><div class="airport-name">${waypoint["name"]} - ${waypoint["CODE"]}</div>
                    <div>
                      <img src="img/plan-normal.png" data-waypoint="${waypoint["CODE"]}" class="popup-button" onclick="addWaypoint(this.dataset.waypoint, 0)" onmouseover="this.src='img/plan-hover.png'" onmouseout="this.src='img/plan-normal.png'">
                      <span class="button-text">הוסף לנתיב</span>
                    </div>
                  </div>`
		curr_marker.bindPopup(markerHtml);
		satellite_layer_waypoint_marker.bindPopup(markerHtml);
	}
}

airways.forEach((airway, i) => {
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

waypoints_layer.bringToFront();

map.setView([32.00944444, 34.88555556], 13);
