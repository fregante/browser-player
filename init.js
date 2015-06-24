'use strict';

chrome.browserAction.setBadgeBackgroundColor({
	color: '#333'
});

(function enableAllCurrentTabs () {
	var scripts = chrome.runtime.getManifest().content_scripts;
	scripts.forEach(function (script) {
		chrome.tabs.query({
			url: script.matches
		}, function (tabs) {
			tabs.forEach(function (tab) {
				script.js.forEach(function (file) {
					chrome.tabs.executeScript(tab.id, {
						allFrames: script.all_frames,
						file: file
					}, function (shutUp) {
						shutUp = chrome.runtime.lastError;
					});
				});
			});
		});
	});
}());