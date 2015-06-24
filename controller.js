'use strict';
/*global tabs, debounce*/

function handlePlay (tab) {
	tabs.remove(tab.id); // prevent duplicates and pausing oneself
	tabs.last.act('pause');
	tabs.add(tab);
}
function handlePause (tab) {
	var wasRemoved = tabs.remove(tab.id || tab);
	if (wasRemoved) {
		tabs.last.act('resume');
	}
}
function enableAllCurrentTabs () {
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
}

var media = {};

media.hasQueuedPause = false;
media.queuePause = debounce(function (tab) {
	if (media.hasQueuedPause) {
		console.log('pause');
		handlePause(tab);
	}
}, 1000); // give it time to seek, if the pause is caused by that

media.onplay = function (request, sender) {
	media.hasQueuedPause = false;
	console.log('play');
	handlePlay(sender.tab);
};

media.onpause = function (request, sender) {
	console.log('probably paused');
	media.hasQueuedPause = true;
	media.queuePause(sender.tab);
};

media.onseeking = function () {
	// false alarm! it's just seeking
	media.hasQueuedPause = false;
};

chrome.runtime.onMessage.addListener(function (request, sender) {
	if(request && request.event && media['on'+request.event]) {
		// console.log('Got event:', request.event);
		media['on'+request.event](request, sender);
		// console.log('tabs.list:', tabs.list);
	}
});
chrome.tabs.onRemoved.addListener(handlePause);
setInterval(tabs.keepUpdated, 3000);
enableAllCurrentTabs();