(function() {
	function FakeWebSocket(url, protocols) {
		this.url = url;
		this.readyState = 0; // CONNECTING
		this.bufferedAmount = 0;
		this.extensions = '';
		this.protocol = typeof protocols === 'string' ? protocols : (protocols?.[0] || '');
		this.binaryType = 'blob';
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
		setTimeout(() => {
			this.readyState = 1; // OPEN
			if (this.onopen) this.onopen(new Event('open'));
		}, 0);
	}
	FakeWebSocket.prototype.send = function() { this.bufferedAmount = 0; };
	FakeWebSocket.prototype.close = function(code, reason) {
		this.readyState = 3; // CLOSED
		if (this.onclose) this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }));
	};
	FakeWebSocket.prototype.addEventListener = function(type, fn) { this['on' + type] = fn; };
	FakeWebSocket.prototype.removeEventListener = function(type, fn) { if (this['on' + type] === fn) this['on' + type] = null; };
	FakeWebSocket.CONNECTING = 0;
	FakeWebSocket.OPEN = 1;
	FakeWebSocket.CLOSING = 2;
	FakeWebSocket.CLOSED = 3;

	window.WebSocket = FakeWebSocket;
	console.log('WebSocket support disabled');
})();
