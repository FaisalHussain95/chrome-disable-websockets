(function() {
	chrome.storage.sync.get({ patterns: [] }, function(data) {
		document.documentElement.dataset.wsBlockPatterns = JSON.stringify(data.patterns);
	});
})();
