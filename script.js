(function() {
	var RealWebSocket = window.WebSocket;

	function getPatterns() {
		// Re-read each time in case storage loaded after first check
		try {
			var data = document.documentElement.dataset.wsBlockPatterns;
			if (!data) return [];
			var arr = JSON.parse(data);
			return arr.map(function(p) {
				try { return new RegExp(p); } catch (e) { return null; }
			}).filter(Boolean);
		} catch (e) {
			return [];
		}
	}

	function isBlocked(url) {
		var p = getPatterns();
		for (var i = 0; i < p.length; i++) {
			if (p[i].test(url)) return true;
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
	FakeWebSocket.CONNECTING = 0;
	FakeWebSocket.OPEN = 1;
	FakeWebSocket.CLOSING = 2;
	FakeWebSocket.CLOSED = 3;

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
