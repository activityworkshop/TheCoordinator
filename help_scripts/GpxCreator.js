const fileName = "waypoints.gpx"

function decimalize(coord) {
	const r = /^([NSEW]) ([0-9]+)° ([0-9.]+)$/
	const m = coord.trim().toUpperCase().match(r);
	if (m !== null) {
		var posneg = "NE".indexOf(m[1]) < 0 ? -1 : 1;
		var degrees = posneg * (parseInt(m[2]) + parseFloat(m[3])/60.0);
		return degrees.toString();
	}
	return coord.trim();
}

function createGpx(coordArray, cacheName) {
	// create XML
	var length = coordArray.length;
	var XML = new XMLWriter();

	// start gpx
	XML.BeginNode("gpx");
	XML.Attrib("version", "1.1");
	XML.Attrib("creator", "TheCoordinator");
	XML.Attrib("xsi:schemaLocation", "http://www.topografix.com/GPX/1/1/gpx.xsd");
	XML.Attrib("xmlns", "http://www.topografix.com/GPX/1/1" );
	XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");

	// start metadata
	XML.BeginNode("metadata");
	XML.Node("name", fileName);

	// start link
	XML.BeginNode("link");
	XML.Attrib("href", "https://addons.mozilla.org/firefox/addon/the-coordinator/");
	XML.Node("text", "The:Coordinator");
	// end link
	XML.EndNode();

	// end metadata
	XML.EndNode();

	let firstCode = coordArray[0].code;
	for (var i = 0; i < length; i++) {
		var wpCode = (cacheName.length == 0 ? coordArray[i].code : coordArray[i].code.replace(firstCode, cacheName));
		XML.BeginNode("wpt");
		XML.Attrib("lat", decimalize(coordArray[i].lat));
		XML.Attrib("lon", decimalize(coordArray[i].lon));
		XML.Node("name", wpCode.trim());
		XML.Node("description", coordArray[i].name.trim());
		XML.Node("comment", coordArray[i].hint.trim());
		XML.EndNode();
	}

	// end gpx
	XML.EndNode();

	return XML.ToString();
}

