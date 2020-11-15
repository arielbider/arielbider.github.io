var canvas = document.querySelector("#scrathpad");
var signaturePad = new SignaturePad(canvas, {
	minWidth: 2,
	maxWidth: 10,
});

function resizeCanvas() {
	var ratio = Math.max(window.devicePixelRatio || 1, 1);
	canvas.width = canvas.offsetWidth * ratio;
	canvas.height = canvas.offsetHeight * ratio;
	canvas.getContext("2d").scale(ratio, ratio);
	// signaturePad.clear(); //otherwise isEmpty() might return incorrect value
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.getElementById("scrathpad-button").onclick = function() {
	document.getElementById("mapid").style.display = "none";
	document.getElementById("scrathpad-wrapper").style.display = "block";
	document.getElementById("help-sidebar-button").click();
};

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("scrathpad-wrapper").style.display = "none";
});

document.getElementsByClassName("fa-times-circle")[0].onclick = function() {
	document.getElementById("mapid").style.display = "block";
	document.getElementById("scrathpad-wrapper").style.display = "none";
}

document.getElementById("clear-board-button").onclick = function() {
	signaturePad.clear();
}

document.getElementById("erase-button").onclick = function() {
	if (document.getElementById("erase-button").style.color == "blue") {
		document.getElementById("erase-button").style.color = "black";
		signaturePad.penColor = "black";
		signaturePad.minWidth = 2;
		signaturePad.maxWidth = 10;
	} else {
		console.log("here");
		document.getElementById("erase-button").style.color = "blue";
		signaturePad.penColor = "white";
		signaturePad.minWidth = 20;
		signaturePad.maxWidth = 30;
	}
}
