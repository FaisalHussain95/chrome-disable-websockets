(function() {
	function FakeWebSocket(url, protocols) {
		this.url = url;
		this.readyState = 3; // CLOSED
		this.bufferedAmount = 0;
		this.extensions = '';
		this.protocol = '';
		this.binaryType = 'blob';
		setTimeout(() => {
			if (this.onerror) this.onerror(new Event('error'));
			if (this.onclose) this.onclose(new CloseEvent('close', { code: 1006, reason: 'WebSocket disabled' }));
		}, 0);
	}
	FakeWebSocket.prototype.send = function() {};
	FakeWebSocket.prototype.close = function() {};
	FakeWebSocket.CONNECTING = 0;
	FakeWebSocket.OPEN = 1;
	FakeWebSocket.CLOSING = 2;
	FakeWebSocket.CLOSED = 3;

	window.WebSocket = FakeWebSocket;
	console.log('WebSocket support disabled');
})();
