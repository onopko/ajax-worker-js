/** =================================================================
 *
 * ajaxWorker
 *
 * ------------------------------------------------------------------
 *
 * by Takehiko Ono (https://onotakehiko.com/)
 *
 * License: MIT (https://choosealicense.com/licenses/mit/)
 * Forked from: https://qiita.com/cgetc/items/e8a59416ddb18236ca78
 *
 * --------------------------------------------------------------- */

(function (_window) {

	var window = _window;

	var ExecutorService = (function () {
		ExecutorService.prototype.maxThreads = 5;

		function ExecutorService (_path, _maxThreads) {
			this.path = _path;
			this.queue = [];
			this.pool = [];
			this.running = 0;

			if (_maxThreads) {
				this.maxThreads = _maxThreads;
			}
		}

		ExecutorService.prototype.execute = function () {
			if (this.running >= this.maxThreads) {
				return this.queue.push(arguments);
			}
			else {
				return this._execute.apply(this, arguments);
			}
		};

		ExecutorService.prototype._execute = function (_message, _options) {
			var that = this;

			++this.running;

			var worker = this.pool.shift() || new Worker(this.path);
			var context = _options.context || this;

			var onMessage = function (_event) {
				if (_options.success) {
					var filtered_arguments;

					new Promise(function (resolve) {
						dataFilter({
							data: _event.data,
							elementType: _message.elementType,
							complete: function (_filtered_arguments) {
								filtered_arguments = _filtered_arguments;

								resolve();
							}
						});
					})
					.then(function () {
						_options.success.apply(context, filtered_arguments);

						return onComplete(_event);
					});
				}
				else {
					return onComplete(_event);
				}
			};

			var onError = function (_event) {
				if (_options.error) {
					var response_array = _event.message.split(',');

					_options.error.apply(context, response_array);
				}

				return onComplete(_event);
			};

			var onComplete = function (_event) {
				if (_options.complete) {
					_options.complete.apply(context, [_event]);
				}

				that.release(worker, onMessage, onError);

				return that.dequeue();
			};

			worker.addEventListener('message', onMessage, false);
			worker.addEventListener('error', onError, false);

			return worker.postMessage(_message);
		};

		ExecutorService.prototype.release = function (_worker, _onMessage, _onError) {
			_worker.removeEventListener('message', _onMessage, false);
			_worker.removeEventListener('error', _onError, false);

			_worker.terminate();

			return --this.running;
		};

		ExecutorService.prototype.dequeue = function () {
			var arguments = this.queue.shift();

			if (arguments) {
				return this.execute.apply(this, arguments);
			}
		};

		return ExecutorService;
	})();


	/**
	 * _args = {
	 *     @param object   data
	 *     @param string   elementType
	 *     @param function complete
	 * }
	*/
	function dataFilter (_args) {
		var value = _args.data[0];
		var dataType = _args.data[1];
		var elementType = _args.elementType;
		var complete = _args.complete;

		switch (dataType) {
			case 'xml':
				var parser = new DOMParser();
				value = parser.parseFromString(value, 'text/xml');

				complete([value, dataType]);
				break;

			case 'image':
				var image = new Image();

				if (elementType === 'inline') {
					image.onload = function () {
						complete([image, dataType]);
					};

					image.src = value;
				}
				else {
					var objectURL = URL.createObjectURL(value);

					image.onload = function () {
						URL.revokeObjectURL(objectURL);

						complete([image, dataType]);
					};

					image.src = objectURL;
				}

				break;

			default:
				complete([value, dataType]);
		}
	};


	/**
	 * _settings = {
	 *     @param string   dir
	 *     @param string   method
	 *     @param string   url
	 *     @param string   dataType
	 *     @param string   elementType
	 *     @param object   context
	 *     @param object   data
	 *     @param int      timeout
	 *     @param boolean  cache
	 *     @param object   headers
	 *     @param function success
	 *     @param function error
	 *     @param function complete
	 * }
	*/
	window.ajaxWorker = function (_settings) {
		var message_defaults = {
			method: 'GET',
			url: null,
			dataType: null,
			elementType: 'inline',
			data: null,
			timeout: 2000,
			cache: false,
			headers: null
		}

		var options_defaults = {
			success: function () {},
			error: function () {},
			complete: function () {}
		};

		var message = {};
		Object.keys(message_defaults).forEach(function (_key) {
			message[_key] = _settings[_key] || message_defaults[_key];
		});

		var options = {};
		Object.keys(options_defaults).forEach(function (_key) {
			options[_key] = _settings[_key] || options_defaults[_key];
		});

		var dir = _settings.dir;
		if (dir.substr(-1, 1) === '/') {
			dir = dir.slice(0, -1);
		}

		var AjaxService = new ExecutorService(`${dir}/xhr.worker.js`);
		AjaxService.execute(message, options);

		message_defaults = options_defaults = message = options = dir = AjaxService = void 0;
	};

})(window);
