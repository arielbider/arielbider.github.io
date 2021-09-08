chartsData.forEach((airport) => {
	let airportCharts = document.createElement('div');
	// airportCharts.className = 'airportCharts';

	let h3 = document.createElement('h3')
	h3.className = 'airport-chart-title';
	h3.innerText = airport.name;
	airportCharts.appendChild(h3);

	let expendArrow = document.createElement('i')
	expendArrow.className = 'fas fa-arrow-left';
	airportCharts.appendChild(expendArrow);

	let chartsList = document.createElement('div');
	chartsList.className = 'charts-list';

	airport.charts.forEach((link) => {
		let chartData = document.createElement('div');
		chartData.className = 'chart-data';

		let statusSquare = document.createElement('i')
		statusSquare.className = 'fas fa-plus-square';
		chartData.appendChild(statusSquare);

		let chartName = document.createElement('a');
		chartName.dataset.url = link.url;
		chartName.innerText = link.chartName;
		chartData.appendChild(chartName);

		chartsList.appendChild(chartData);

	});

	airportCharts.appendChild(chartsList);
	document.getElementById("inner-sidebar").appendChild(airportCharts);
});


airportsTitle = document.getElementsByClassName("airport-chart-title");
for (i = 0; i < airportsTitle.length; i++) {
	airportsTitle[i].addEventListener("click", function() {
		changeArrow(this);
	});
}

function changeArrow(node) {
	arrowNode = node.parentNode.querySelector(".fas");
	if (arrowNode.classList.contains("fa-arrow-left")) {
		arrowNode.classList.replace("fa-arrow-left", "fa-arrow-down");
		node.parentNode.querySelector(".charts-list").style.display = "block";
		node.parentNode.style.marginBottom = "20px";
	} else {
		arrowNode.classList.replace("fa-arrow-down", "fa-arrow-left");
		node.parentNode.querySelector(".charts-list").style.display = "none";
		node.parentNode.style.marginBottom = "0px";
	}
}

chartsTitles = document.getElementsByClassName("chart-data");
for (i = 0; i < chartsTitles.length; i++) {
	chartsTitles[i].addEventListener("click", function() {
		changeAddRemove(this.querySelector("i"));
	});
}

var activeChartsLayers = [];

function changeAddRemove(node) {
	if (node.classList.contains("fa-plus-square")) {
		node.classList.replace("fa-plus-square", "fa-minus-square");
		chartUrl = node.parentNode.querySelector("a").dataset.url;

		fullURL = 'charts/' + chartUrl + '/{z}/{x}/{y}.png';
		// TODO: CHANGE THIS TO "../cvfr-map-dev/charts" when deploying DEV to PROD

		layerToMap = L.tileLayer(fullURL, {
			attribution: 'מקור: &copy; פמ"ת פנים ארצי, רת"א | עיבוד: בר רודוי ואריאל בידר',
		}).addTo(map);

		activeChartsLayers.push({
			"url": chartUrl,
			"layer": layerToMap
		});

	} else {
		node.classList.replace("fa-minus-square", "fa-plus-square");
		chartUrl = node.parentNode.querySelector("a").dataset.url;
		index = activeChartsLayers.findIndex(layer => layer.url == chartUrl);
		activeChartsLayers[index].layer.remove();
		activeChartsLayers.splice(index, 1);
	}
}

document.querySelector('.main-map-button').addEventListener('click', removeAllCharts);

function removeAllCharts() {
	activeChartsLayers.forEach((layer) => {
		layer.layer.remove();
	});
	let buttons = document.querySelectorAll(".fa-minus-square");
	buttons.forEach((button) => {
		button.classList.replace("fa-minus-square", "fa-plus-square");
	});
}

addAirportsToToolbar();

function addAirportsToToolbar() {
	let airports = Object.values(cvfr_waypoints).filter(waypoint => waypoint.type == "ARP");

	let dataList = document.createElement('datalist');
	dataList.id = 'airports';

	airports.forEach((airport, i) => {
		let option = document.createElement('option');
		option.value = airport.CODE;
		option.innerText = airport.name;
		dataList.appendChild(option);
	});

	document.getElementById("flight-plan").appendChild(dataList);
}

let helpButtons = document.querySelectorAll(".fa-question-circle");
helpButtons.forEach((button) => {
	button.addEventListener("click", function() {
		console.log(this.parentNode);
		let p = this.parentNode.querySelector("p");
		if (p.style.display == "none" || p.style.display == "") {
			p.style.display = "block";
		} else {
			p.style.display = "none";
		}
	});
});


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
