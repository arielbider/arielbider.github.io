document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("gauges-window").addEventListener("click", openCloseGaugesWindow);
});

function openCloseGaugesWindow(button){

	window_isOpen = button.srcElement.checked;

	if (window_isOpen) {
		 document.getElementsByClassName("gauges-div")[0].style.display = "flex";
	} else {
		 document.getElementsByClassName("gauges-div")[0].style.display = "none";
	}

}



L.Control.Gauges = L.Control.extend({
	onAdd: function(map) {
		var div = L.DomUtil.create('div');
		div.className += "gauges-div leaflet-bar leaflet-control";
		div.innerHTML = document.querySelector(".gauges-div").innerHTML;
		document.querySelector(".gauges-div").remove();
		return div;
	},

	onRemove: function(map) {
		// Nothing to do here
	}
});

L.control.gauges = function(opts) {
	return new L.Control.Gauges(opts);
}

L.control.gauges({
	position: 'bottomleft',
	style: {
		className: "leaflet-bar leaflet-control"
	}
}).addTo(map);

var bearing_gauge = new RadialGauge({
	renderTo: "bearing",
	height: 170,
	width: 200,
	minValue: 0,
	maxValue: 360,
	majorTicks: [
		"N",
		"3",
		"6",
		"E",
		"12",
		"15",
		"S",
		"21",
		"24",
		"W",
		"30",
		"33",
		"N"
],
	minorTicks: 4,
	ticksAngle: 360,
	startAngle: 180,
	strokeTicks: false,
	highlights: false,
	colorPlate: "#222",
	colorMajorTicks: "#f5f5f5",
	colorMinorTicks: "#ddd",
	colorNumbers: "#ccc",
	colorNeedle: "white",
	colorNeedleEnd: "white",
	valueBox: false,
	valueTextShadow: false,
	colorCircleInner: "#fff",
	colorNeedleCircleOuter: "#ccc",
	needleCircleSize: 15,
	needleCircleOuter: false,
	animationRule: "linear",
	needleType: "line",
	needleStart: 75,
	needleEnd: 99,
	needleWidth: 3,
	borders: true,
	borderInnerWidth: 0,
	borderMiddleWidth: 0,
	borderOuterWidth: 5,
	colorBorderOuter: "#ccc",
	colorBorderOuterEnd: "#ccc",
	colorNeedleShadowDown: "#222",
	borderShadowWidth: 0,
	animationTarget: "plate",
	animationDuration: 1500,
	title: "HEADING",
	fontTitleSize: 19,
	colorTitle: "white",
}).draw();

var big_altitude = new RadialGauge({
	renderTo: "big_altitude",
	height: 170,
	width: 200,
	minValue: 0,
	maxValue: 1000,
	majorTicks: [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"0"
],
	minorTicks: 4,
	ticksAngle: 360,
	startAngle: 180,
	strokeTicks: false,
	highlights: false,
	colorPlate: "#222",
	colorMajorTicks: "#f5f5f5",
	colorMinorTicks: "#ddd",
	colorNumbers: "#ccc",
	colorNeedle: "white",
	colorNeedleEnd: "white",
	valueBox: false,
	valueTextShadow: false,
	colorCircleInner: "#fff",
	colorNeedleCircleOuter: "#ccc",
	needleCircleSize: 15,
	needleCircleOuter: false,
	animationRule: "linear",
	needleType: "arrow",
	needleStart: 0,
	needleEnd: 85,
	needleWidth: 5,
	borders: true,
	borderInnerWidth: 0,
	borderMiddleWidth: 0,
	borderOuterWidth: 5,
	colorBorderOuter: "#ccc",
	colorBorderOuterEnd: "#ccc",
	colorNeedleShadowDown: "#222",
	borderShadowWidth: 0,
	animationDuration: 1500,
	title: "ALTITUDE",
	fontTitleSize: 19,
	colorTitle: "white",
	units: "Feet"
}).draw();

var small_altitude = new RadialGauge({
	renderTo: "small_altitude",
	height: 170,
	width: 200,
	valueBox: false,
	minValue: 0,
	maxValue: 1000,
	majorTicks: [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"0"
],
	minorTicks: 4,
	ticksAngle: 360,
	startAngle: 180,
	strokeTicks: false,
	highlights: false,
	colorPlate: "transparent",
	colorMajorTicks: "transparent",
	colorMinorTicks: "transparent",
	colorNumbers: "transparent",
	colorNeedle: "white",
	colorNeedleEnd: "white",
	valueTextShadow: false,
	colorCircleInner: "transparent",
	colorNeedleCircleOuter: "transparent",
	needleCircleSize: 15,
	needleCircleOuter: false,
	animationRule: "linear",
	needleType: "arrow",
	needleStart: 0,
	needleEnd: 55,
	needleWidth: 5,
	borders: true,
	borderInnerWidth: 0,
	borderMiddleWidth: 0,
	borderOuterWidth: 5,
	colorBorderOuter: "transparent",
	colorBorderOuterEnd: "transparent",
	colorNeedleShadowDown: "transparent",
	borderShadowWidth: 0,
	animationDuration: 1500,
}).draw();

var speed_gauge = new RadialGauge({
    renderTo: 'speedometer',
		height: 170,
    width: 200,
    units: "Knots",
    minValue: 0,
    maxValue: 220,
    majorTicks: [
        "0",
        "20",
        "40",
        "60",
        "80",
        "100",
        "120",
        "140",
        "160",
        "180",
        "200",
        "220"
    ],
    minorTicks: 2,
    strokeTicks: true,
    highlights: [
        {
            "from": 160,
            "to": 220,
            "color": "rgba(200, 50, 50, .75)"
        }
    ],
    colorPlate: "#222",
    needleType: "arrow",
		colorNeedle: "white",
		colorNeedleEnd: "white",
    needleWidth: 2,
    needleCircleSize: 7,
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear",
		colorMajorTicks: "#f5f5f5",
		colorMinorTicks: "#ddd",
		colorNumbers: "#ccc",
		borders: true,
		borderInnerWidth: 0,
		borderMiddleWidth: 0,
		borderOuterWidth: 5,
		colorBorderOuter: "#ccc",
		colorBorderOuterEnd: "#ccc",
		colorNeedleShadowDown: "#222",
		borderShadowWidth: 0,
		animationDuration: 1500,
		title: "SPEED",
		fontTitleSize: 19,
		colorTitle: "white",
		valueBox: false
}).draw();
