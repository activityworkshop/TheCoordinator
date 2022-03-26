var waypoints = [];
const parser = new DOMParser();

/**
 * Listen for clicks on the buttons, and send the appropriate message to the
 * content script in the page.
 */
function listenForClicks() {
	document.addEventListener("click", (e) => {

		/**
		 * create a .gpx file from the saved waypoints and download it to browser
		 */
		function download(tabs) {
			try {
				var cacheName = document.querySelector("#wptName").value;
				var xml = createGpx(waypoints, cacheName);
				downloadWaypoints(xml);

				// clear the coordinates list
				var response = browser.tabs.sendMessage(tabs[0].id, {
					command: "resetList",
				});
				// download successful - make sure error message is not displayed
				document.querySelector("#noDownloadWarning").style.display = 'none';
				// close the popup - but first sleep a bit to allow browser to open save dialog
				sleep(300).then(() => {
					window.close();
				})

			} catch (err) {
				document.querySelector("#noDownloadWarning").style.display = 'block';
			}
		}

		if (e.target.classList.contains("download")) {
			browser.tabs.query({active: true, currentWindow: true})
				.then(download)
				.catch(reportError);
		}
	});

	// checks length of name and enables adding a waypoint with ENTER key
	var el = document.querySelector("#wptName");
	if (el) {
		el.addEventListener("keydown", (e) => {
			if (e.keyCode == 13 || e.keyCode == 59) {
				e.preventDefault();
			}
		});
		el.addEventListener("input", (e) => {
			var nameBox = document.querySelector("#wptName");
			makeSemiColonList(nameBox.value);
			// count the length of the entered name and warn if too long
			var cs = nameBox.value.length;
			if (cs > 16) {
				document.querySelector("#nameWarning").style.display = 'block';
			} else {
				document.querySelector("#nameWarning").style.display = 'none';
			}
		});
	}
}

/**
 * Just log the error to the console.
 */
function reportError(error) {
	console.error(`command failed: ${error}`);
}


/**
 * download the waypoints to the browser as a .gpx file
 */
function downloadWaypoints(string) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(string));
	element.setAttribute('download', fileName);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function addCoordToPopup(message) {
	message.then((coordList) => {
		waypoints = coordList[0];
		makeSemiColonList("");
	}).catch((error) => {
		document.querySelector("#coordinatesDetails").innerHTML = "";
		document.querySelector("#coordinatesDetails").appendChild(parseHTML(error.message));
		document.querySelector("#coordinatesDetails").className = "no-coordinates-message border";
	});
}

function makeSemiColonList(cacheName) {
	let list = document.querySelector("#foundCoords");
	while (list.firstChild) {
		list.removeChild(list.firstChild);
	}
	let firstCode = waypoints[0].code;
	waypoints.forEach(wp => {
		var wpCode = (cacheName.length == 0 ? wp.code : wp.code.replace(firstCode, cacheName));
		list.appendChild(makePara(wp.lat + ";" + wp.lon + ";" + wpCode + ";" + wp.hint));
	});
}

/**
 * parse an HTML string to element to avoid direct assignment
 * @param htmlString HTML element
 */
function parseHTML(htmlString) {
	var parsed = parser.parseFromString(htmlString, "text/html");
	return parsed.getElementsByTagName("body")[0].firstChild;
}

function makePara(pText) {
	var para = document.createElement("p");
	para.innerText = pText;
	return para;
}

/**
 */
function checkPage(tabs) {
	var response = browser.tabs.executeScript({file: "/content_scripts/get_coordinates.js"});
	listenForClicks();
	addCoordToPopup(response);
}

/**
 * inject language-adjusted texts to the popup's HTML
 */
function injectTexts() {
	var elements = ["coordinatesHead", "waypointNameLabel", "nameWarning", "noDownloadWarning"]

	elements.forEach(function (entry) {
		document.querySelector("#" + entry).appendChild(parseHTML(browser.i18n.getMessage(entry)));
	});

	document.querySelector("#wptName").placeholder = browser.i18n.getMessage("wptName");
}

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}


injectTexts();
var tabs = browser.tabs.query({currentWindow: true, active: true});
tabs.then(checkPage);

