chartsData.forEach((chart) => {
	basicDiv = `<div class="chart"> \
        <h3 class="airport-chart-title">${chart.name}</h3> \
        <i class="fas fa-arrow-left"></i> \
        <div class="charts-list">`;

	chart.charts.forEach((link) => {
		let dataTemaplate = `<div class="chart-data"> \
            <i class="fas fa-plus-square"></i> \
            <a data-url="../../cvfr-map-dev/charts/${link.url}">${link.chartName}</a> \
          </div>`;
		basicDiv += dataTemaplate;
	});
	basicDiv += '</div></div>';
	document.getElementById("inner-sidebar").innerHTML += basicDiv;
});


airportsTitle = document.getElementsByClassName("airport-chart-title");
for (i = 0; i < airportsTitle.length; i++) {
	airportsTitle[i].addEventListener("click", function() {
		changeArrow(this)
	});
}

function changeArrow(node) {
	arrowNode = node.parentNode.getElementsByClassName("fas")[0];
	if (arrowNode.classList.contains("fa-arrow-left")) {
		arrowNode.classList.replace("fa-arrow-left", "fa-arrow-down");
		node.parentNode.getElementsByClassName("charts-list")[0].style.display = "block";
		node.parentNode.style.marginBottom = "20px";
	} else {
		arrowNode.classList.replace("fa-arrow-down", "fa-arrow-left");
		node.parentNode.getElementsByClassName("charts-list")[0].style.display = "none";
		node.parentNode.style.marginBottom = "0px";
	}
}

chartsTitles = document.getElementsByClassName("chart-data");
for (i = 0; i < chartsTitles.length; i++) {
	chartsTitles[i].addEventListener("click", function() {
		changeAddRemove(this.getElementsByTagName("i")[0])
	});
}

var activeLayers = [];

function changeAddRemove(node) {
	if (node.classList.contains("fa-plus-square")) {
		node.classList.replace("fa-plus-square", "fa-minus-square");
		url = node.parentNode.getElementsByTagName("a")[0].dataset.url;
		fullURL = 'charts/' + url;
		fullURL += '/{z}/{x}/{y}.png';
		layerToMap = L.tileLayer(fullURL, {
			attribution: 'מקור: &copy; פמ"ת פנים ארצי, רת"א | עיבוד: בר רודוי ואריאל בידר',
		}).addTo(map);
		activeLayers.push({
			"url": url,
			"layer": layerToMap
		});
	} else {
		node.classList.replace("fa-minus-square", "fa-plus-square");
		url = node.parentNode.getElementsByTagName("a")[0].dataset.url;
		index = activeLayers.findIndex(layer => layer.url == url);
		activeLayers[index].layer.remove();
		activeLayers.splice(index, 1);
	}
}

function removeAll() {
	activeLayers.forEach((layer) => {
		layer.layer.remove();
	});
	let buttons = document.getElementsByClassName("fa-minus-square");
	while (buttons && buttons.length) {
		buttons[0].classList.replace("fa-minus-square", "fa-plus-square");
	}
}

addAirportsToToolbar();

function addAirportsToToolbar() {
	let airports = Object.values(cvfr_waypoints).filter(waypoint => waypoint.type == "ARP");
	let dataList = '<datalist id="airports">'

	airports.forEach((airport, i) => {
		dataList += `<option value="${airport.CODE}">${airport.name}</option>`
	});
	dataList += '</datalist>';

	document.getElementById("flight-plan").innerHTML += dataList;
}

let helpButtons = document.getElementsByClassName("fa-question-circle");
for (i = 0; i < helpButtons.length; i++) {
	helpButtons[i].addEventListener("click", function() {
		let ifDisplayed = this.parentNode.getElementsByTagName("p")[0].style.display;
		if (ifDisplayed == "none" || ifDisplayed == "") {
			this.parentNode.getElementsByTagName("p")[0].style.display = "block";
		} else {
			this.parentNode.getElementsByTagName("p")[0].style.display = "none";
		}
  });
}

// function getIaaWeather(){
// 	url = "https://ims.gov.il/aviation_data";
// 	let frame = document.createElement("iframe");
// 	frame.sandbox = "allow-same-origin allow-scripts";
// 	frame.id = "weather";
// 	frame.src = url;
// 	console.log(frame);
// 	document.getElementsByClassName("settings")[0].append(frame);
// 	let frameInside = document.getElementsByTagName("iframe")[0];
// 	let textTables = frameInside.contentWindow;
// 	console.log(textTables);
// }
