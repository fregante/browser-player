'use strict';
/*global tabs, debounce*/
var media = {};

media.shouldPlayNext = false;
media.handlePlay = function (tab) {
	tabs.remove(tab.id); // prevent duplicates and pausing oneself
	tabs.last.act('pause');
	tabs.add(tab);

	media.shouldPlayNext = false;
};

media.handlePause = function (tab, skipTimer) {
	var wasRemoved = tabs.remove(tab.id || tab);
	if (wasRemoved) {
		media.shouldPlayNext = true;
		setTimeout(function () {
			if (media.shouldPlayNext) {
				tabs.last.act('resume');
			}
		}, skipTimer?0:1000);
	}
};

media.hasQueuedPause = false;
media.queuePause = debounce(function (tab) {
	if (media.hasQueuedPause) {
		console.log('pause');
		media.handlePause(tab, true);
	}
}, 1000); // give it time to seek, if the pause is caused by that

media.onplay = function (request, sender) {
	media.hasQueuedPause = false;
	console.log('play');
	media.handlePlay(sender.tab);
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
chrome.tabs.onRemoved.addListener(media.handlePause);
setInterval(tabs.keepUpdated, 3000);
