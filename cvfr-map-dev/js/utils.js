function bearingFormat(bearing) {
	if (bearing.toString().length == 1) {
		return '00' + bearing;
	} else if (bearing.toString().length == 2) {
		return '0' + bearing;
	}
	return bearing;
}

function angleFromCoordinate(lat1, lon1, lat2, lon2) {
	var p1 = {
		x: lat1,
		y: lon1
	};

	var p2 = {
		x: lat2,
		y: lon2
	};
	// angle in radians
	var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
	// angle in degrees
	var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
	return angleDeg - 90;
}

var bearingCalculator = {
	bearing: function(lat1, lng1, lat2, lng2) {
		var dLon = this._toRad(lng2 - lng1);
		var y = Math.sin(dLon) * Math.cos(this._toRad(lat2));
		var x = Math.cos(this._toRad(lat1)) * Math.sin(this._toRad(lat2)) - Math.sin(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) * Math.cos(dLon);
		var brng = this._toDeg(Math.atan2(y, x));
		return ((brng + 360) % 360);
	},

	_toRad: function(deg) {
		return deg * Math.PI / 180;
	},

	_toDeg: function(rad) {
		return rad * 180 / Math.PI;
	},
};

//-- Define radius function
if (typeof(Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}

//-- Define degrees function
if (typeof(Number.prototype.toDeg) === "undefined") {
	Number.prototype.toDeg = function() {
		return this * (180 / Math.PI);
	}
}

function middlePoint(lat1, lng1, lat2, lng2) {

	//-- Longitude difference
	var dLng = (lng2 - lng1).toRad();

	//-- Convert to radians
	lat1 = lat1.toRad();
	lat2 = lat2.toRad();
	lng1 = lng1.toRad();

	var bX = Math.cos(lat2) * Math.cos(dLng);
	var bY = Math.cos(lat2) * Math.sin(dLng);
	var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
	var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

	//-- Return result
	return [lat3.toDeg(), lng3.toDeg()];
}

// dist in KM
function destinationPoint(point, brng, dist) {
	dist = dist / 6371;
	brng = brng.toRad();

	var lat1 = point.lat.toRad(),
		lon1 = point.lng.toRad();

	var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
		Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

	var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
		Math.cos(lat1),
		Math.cos(dist) - Math.sin(lat1) *
		Math.sin(lat2));

	if (isNaN(lat2) || isNaN(lon2)) return null;

	return [lat2.toDeg(), lon2.toDeg()];
}

function getDistance(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}
