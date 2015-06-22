'use strict';
/*global tabs*/
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

var tabEvents = {};

tabEvents.play = function someTabIsPlaying (request, sender) {
	console.log('play');
	handlePlay(sender.tab);
};

tabEvents.pause = function someTabHasBeenPaused (request, sender) {
	console.log('pause');
	handlePause(sender.tab);
};
chrome.runtime.onMessage.addListener(function (request, sender) {
	if(request && request.event && tabEvents[request.event]) {
		// console.log('Got event:', request.event);
		tabEvents[request.event](request, sender);
		// console.log('tabs.list:', tabs.list);
	}
});
chrome.tabs.onRemoved.addListener(handlePause);