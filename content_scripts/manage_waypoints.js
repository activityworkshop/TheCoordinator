(function() {
	var waypoints = [];
	/**
	 * Check and set a global guard variable. If this content script is
	 * injected into the same page again, it will do nothing next time.
	 */
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	function addWptToList(wpt) {
		waypoints.push(wpt);
	}

	/**
	 * Listen for messages from the background script
	 */
	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "add") {
			addWptToList(message.coord);
		} else if (message.command === "getWpts") {
			// send all the current saved waypoints
			return new Promise((resolve, reject) => {
				var jsonString = JSON.stringify(waypoints);
				resolve(jsonString); // fulfilled
				// or
				reject("Error while obtaining saved waypoints"); // rejected
				// TODO: Check this, it seems to do both resolve AND reject?
			});
		} else if (message.command === "resetList") {
			waypoints = [];
		}
	});
})();

