(function() {
	chrome.storage.sync.get({ patterns: [] }, function(data) {
		try {
			var root = document.head || document.documentElement;

			// Inject patterns as global variable
			var config = document.createElement('script');
			config.textContent = 'window.BLOCKED_WS_PATTERNS=' + JSON.stringify(data.patterns) + ';';
			root.appendChild(config);
			config.parentNode.removeChild(config);

			// Inject main script
			var script = document.createElement('script');
			script.src = chrome.runtime.getURL('script.js');
			root.appendChild(script);
			script.onload = function() {
				script.parentNode.removeChild(script);
			};
		} catch (e) {}
	});
})();
