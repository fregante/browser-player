// alert('background loaded')
var playingTabs = {};
function stopAll () {
	for(var tabId in playingTabs) {
		chrome.tabs.sendMessage(playingTabs[tabId].id, {
			action: 'pause'
		});
	}
}
function resumeAll () {
	for(var tabId in playingTabs) {
		chrome.tabs.sendMessage(playingTabs[tabId].id, {
			action: 'resume'
		});
	}
}
function thisTabIsPlaying (id, tab) {
	delete playingTabs[id];
	stopAll();
	playingTabs[id] = tab;
}
function thisTabHasBeenPaused (id) {
	delete playingTabs[id];
	resumeAll();
}

var tabEvents = {};

tabEvents.play = function someTabIsPlaying (request, sender) {
	thisTabIsPlaying(sender.tab.id, sender.tab);
};

tabEvents.pause = function someTabHasBeenPaused (request, sender) {
	thisTabHasBeenPaused(sender.tab.id);
};
chrome.runtime.onMessage.addListener(function (request, sender) {
	if(request && request.action && tabEvents[request.action]) {
		// console.log('Got event:', request.action);
		tabEvents[request.action](request, sender);
		// console.log('playingTabs:', playingTabs);
	}
});

chrome.tabs.onRemoved.addListener(thisTabHasBeenPaused);