(function() {

	function getLatLon(coords) {
		var parts = coords.trim().split(" ");
		if (parts.length == 6) {
			return [parts[0] + " " + parts[1] + " " + parts[2], parts[3] + " " + parts[4] + " " + parts[5]];
		}
		if (parts.length == 4) {
			return [parts[0] + " " + parts[1], parts[2] + " " + parts[3]];
		}
		if (parts.length == 2) {
			return parts;
		}
		return ["", ""];
	}

	try {
		var cacheCode = window.document.title.split(" ")[0];
		var cacheName = "", cacheCoords = "", cacheHint = "";
		window.document.body.querySelectorAll('span').forEach((input) => {
			if (input.id.endsWith("CacheName")) {cacheName = input.textContent;}
			if (input.id.endsWith("LatLon")) {cacheCoords = input.textContent;}
		});
		window.document.body.querySelectorAll('p').forEach((para) => {
			if (para.classList.contains("content-title-noshade-size2") && para.innerText.indexOf("(WGS84)")>0) {
				cacheCoords = para.innerText.substring(0, para.innerText.indexOf("(")).trim();
			}
			if (para.id == "decrypt-hints") {
				cacheHint = para.innerText;
			}
		});
		if (cacheCoords) {
			[lat, lon] = getLatLon(cacheCoords);
		}
		else {
			console.log("No coords found");
		}

		var points = [];
		var wp = {
			"code": cacheCode,
			"name": cacheName,
			"hint": cacheHint,
			"lat" : lat,
			"lon" : lon
		};
		points.push(wp);
		window.document.body.querySelectorAll('table').forEach((input) => {
			if (input.id.endsWith("_Waypoints")) {
				input.querySelectorAll('tr').forEach((row) => {
					var wpCode = "", wpCoords = "", colNum = 0;
					row.querySelectorAll('td').forEach((cell) => {
						if (colNum == 2) {wpCode = cacheCode + cell.textContent.trim();}
						else if (colNum == 5) {wpCoords = cell.textContent.trim();}
						colNum++;
					});
					if (wpCode != "" && wpCoords != "") {
						[lat, lon] = getLatLon(wpCoords);
						if (lat != "" && lon != "") {
							points.push({"code": wpCode, "name": wpCode, "hint": "", "lat" : lat, "lon" : lon});
						}
					}
				});
			}
		});
		return points;

	} catch (err) {
		console.log("No coordinates could be obtained from webpage: " + err);
		var textHead = browser.i18n.getMessage("noCoordError");
		return Promise.reject(new Error(textHead));
	}

})();
