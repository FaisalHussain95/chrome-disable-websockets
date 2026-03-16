(function() {
	var RealWebSocket = window.WebSocket;
	var patternStrings = window.BLOCKED_WS_PATTERNS || [];
	var patterns = patternStrings.map(function(p) {
		try { return new RegExp(p); } catch (e) { return null; }
	}).filter(Boolean);

	function isBlocked(url) {
		for (var i = 0; i < patterns.length; i++) {
			if (patterns[i].test(url)) return true;
		}
		return false;
	}

	// FakeWebSocket mimics real WebSocket but never sends/receives
	function FakeWebSocket(url, protocols) {
		this.url = url;
		this.readyState = 0;
		this.bufferedAmount = 0;
		this.extensions = '';
		this.protocol = typeof protocols === 'string' ? protocols : (protocols?.[0] || '');
		this.binaryType = 'blob';
		this._listeners = { open: [], close: [], error: [], message: [] };
		var self = this;
		setTimeout(function() {
			self.readyState = 1;
			self._emit('open', new Event('open'));
		}, 0);
		console.log('WebSocket blocked:', url);
	}

	// Inherit from RealWebSocket.prototype for instanceof checks
	FakeWebSocket.prototype = Object.create(RealWebSocket.prototype);
	FakeWebSocket.prototype.constructor = FakeWebSocket;

	FakeWebSocket.prototype._emit = function(type, event) {
		if (this['on' + type]) this['on' + type](event);
		var listeners = this._listeners[type].slice();
		for (var i = 0; i < listeners.length; i++) {
			var l = listeners[i];
			l.fn(event);
			if (l.once) this.removeEventListener(type, l.fn);
		}
	};
	FakeWebSocket.prototype.send = function() { this.bufferedAmount = 0; };
	FakeWebSocket.prototype.close = function(code, reason) {
		if (this.readyState === 3) return;
		this.readyState = 3;
		this._emit('close', new CloseEvent('close', { code: code || 1000, reason: reason || '' }));
	};
	FakeWebSocket.prototype.addEventListener = function(type, fn, opts) {
		if (this._listeners[type]) {
			this._listeners[type].push({ fn: fn, once: opts?.once || opts === true });
		}
	};
	FakeWebSocket.prototype.removeEventListener = function(type, fn) {
		var arr = this._listeners[type];
		if (arr) this._listeners[type] = arr.filter(function(l) { return l.fn !== fn; });
	};
	FakeWebSocket.prototype.dispatchEvent = function(event) {
		this._emit(event.type, event);
		return true;
	};

	// Proxy constructor
	var ProxyWebSocket = function(url, protocols) {
		if (isBlocked(url)) {
			return new FakeWebSocket(url, protocols);
		}
		return new RealWebSocket(url, protocols);
	};

	// Copy static properties and prototype
	ProxyWebSocket.prototype = RealWebSocket.prototype;
	ProxyWebSocket.CONNECTING = RealWebSocket.CONNECTING;
	ProxyWebSocket.OPEN = RealWebSocket.OPEN;
	ProxyWebSocket.CLOSING = RealWebSocket.CLOSING;
	ProxyWebSocket.CLOSED = RealWebSocket.CLOSED;

	window.WebSocket = ProxyWebSocket;
})();
