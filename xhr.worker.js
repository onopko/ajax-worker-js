/** =================================================================
 *
 * xhr.worker.js
 *
 * ------------------------------------------------------------------
 *
 * by Takehiko Ono (https://onotakehiko.com/)
 *
 * License: MIT (https://choosealicense.com/licenses/mit/)
 * Forked from: https://qiita.com/cgetc/items/e8a59416ddb18236ca78
 *
 * --------------------------------------------------------------- */

var dataType;


/** =================================================================
 *
 * METHODS
 *
 * --------------------------------------------------------------- */

var onLoad = function (_callback) {
	return function onLoad () {
		if (this.readyState === this.DONE) {
			if (this.status === 200) {
				_callback.call(this, this);
			}
			else {
				throw [this.status, this.statusText, `Error`];
			}
		}
	};
};

var postDataUri = onLoad(function (_xhr) {
	var blob = new Blob([_xhr.response]);
	var reader = new FileReader();

	reader.onload = function (_event) {
		var data = _event.target.result;

		var match = data.match(/(data:(.*);)(.*)/);
		if (match) {
			data = data.replace(match[1], `data:${_xhr.getResponseHeader('Content-Type')};`);
		}

		reader = void 0;

		self.postMessage([data, dataType]);
	};

	reader.readAsDataURL(blob);
});

var postBlob = onLoad(function (_xhr) {
	self.postMessage([_xhr.response, dataType]);
});

var postXML = onLoad(function (_xhr) {
	self.postMessage([_xhr.responseText, dataType]);
});

var postJSON = onLoad(function (_xhr) {
	self.postMessage([JSON.parse(_xhr.responseText), dataType]);
});

var postText = onLoad(function (_xhr) {
	self.postMessage([_xhr.responseText, dataType]);
});


/** =================================================================
 *
 * EVENTS
 *
 * --------------------------------------------------------------- */

self.onmessage = function (_event) {
	var message = _event.data;
	var xhr = new XMLHttpRequest();

	if (message.dataType && message.dataType.toLowerCase()) {
		dataType = message.dataType.toLowerCase();
	}

	switch (dataType) {
		case 'json':
			xhr.responseType = 'text';
			xhr.onreadystatechange = postJSON;
			break;

		case 'xml':
			xhr.responseType = 'text';
			xhr.onreadystatechange = postXML;
			break;

		case 'image':
			xhr.responseType = 'blob';
			if (message.elementType === 'inline') {
				xhr.onreadystatechange = postDataUri;
			}
			else {
				xhr.onreadystatechange = postBlob;
			}
			break;

		case 'datauri':
			xhr.responseType = 'blob';
			xhr.onreadystatechange = postDataUri;
			break;

		default:
			xhr.responseType = 'text';
			xhr.onreadystatechange = postText;
	}

	xhr.ontimeout = function () {
		throw [xhr.status, xhr.statusText, `Timeout error [${message.timeout}]`];
	};

	xhr.onerror = function () {
		throw [xhr.status, xhr.statusText, `Fetch error`];
	};

	xhr.open(message.method, message.url, true);
	xhr.timeout = message.timeout || 2000;

	if (message.headers) {
		for (var key in message.headers) {
			xhr.setRequestHeader(key, message.headers[key]);
		}
	}

	xhr.send(message.data);
};
