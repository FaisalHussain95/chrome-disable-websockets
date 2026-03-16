(function() {
	var patternsList = document.getElementById('patterns');
	var testRegexInput = document.getElementById('testRegex');
	var testUrlInput = document.getElementById('testUrl');
	var testResult = document.getElementById('testResult');
	var testBtn = document.getElementById('testBtn');
	var addBtn = document.getElementById('addBtn');

	function loadPatterns() {
		chrome.storage.sync.get({ patterns: [] }, function(data) {
			renderPatterns(data.patterns);
		});
	}

	function savePatterns(patterns, callback) {
		chrome.storage.sync.set({ patterns: patterns }, callback);
	}

	function renderPatterns(patterns) {
		patternsList.innerHTML = '';
		if (patterns.length === 0) {
			patternsList.innerHTML = '<li class="empty">No patterns configured</li>';
			return;
		}
		patterns.forEach(function(p, i) {
			var li = document.createElement('li');
			li.innerHTML = '<span>' + escapeHtml(p) + '</span>';
			var btn = document.createElement('button');
			btn.className = 'btn-danger';
			btn.textContent = '×';
			btn.onclick = function() { removePattern(i); };
			li.appendChild(btn);
			patternsList.appendChild(li);
		});
	}

	function escapeHtml(str) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function testRegex() {
		var pattern = testRegexInput.value.trim();
		var url = testUrlInput.value.trim();
		testResult.className = '';

		if (!pattern) {
			testResult.textContent = 'Enter a regex pattern';
			testResult.className = 'error';
			return false;
		}

		try {
			var re = new RegExp(pattern);
			if (!url) {
				testResult.textContent = 'Regex is valid';
				testResult.className = 'match';
				return true;
			}
			if (re.test(url)) {
				testResult.textContent = 'Match!';
				testResult.className = 'match';
			} else {
				testResult.textContent = 'No match';
				testResult.className = 'nomatch';
			}
			return true;
		} catch (e) {
			testResult.textContent = 'Invalid regex: ' + e.message;
			testResult.className = 'error';
			return false;
		}
	}

	function addPattern() {
		var pattern = testRegexInput.value.trim();
		if (!pattern) return;

		try {
			new RegExp(pattern);
		} catch (e) {
			testResult.textContent = 'Invalid regex: ' + e.message;
			testResult.className = 'error';
			return;
		}

		chrome.storage.sync.get({ patterns: [] }, function(data) {
			var patterns = data.patterns;
			if (patterns.indexOf(pattern) === -1) {
				patterns.push(pattern);
				savePatterns(patterns, function() {
					testRegexInput.value = '';
					testResult.textContent = 'Pattern added';
					testResult.className = 'match';
					renderPatterns(patterns);
				});
			} else {
				testResult.textContent = 'Pattern already exists';
				testResult.className = 'error';
			}
		});
	}

	function removePattern(index) {
		chrome.storage.sync.get({ patterns: [] }, function(data) {
			var patterns = data.patterns;
			patterns.splice(index, 1);
			savePatterns(patterns, function() {
				renderPatterns(patterns);
			});
		});
	}

	testBtn.onclick = testRegex;
	addBtn.onclick = addPattern;
	testRegexInput.onkeyup = function(e) { if (e.key === 'Enter') addPattern(); };
	testUrlInput.onkeyup = function(e) { if (e.key === 'Enter') testRegex(); };

	loadPatterns();
})();
