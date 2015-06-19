// alert('background loaded')
var playingTabs = {};
function doActionToAllTabs (action) {
	for(var tabId in playingTabs) {
		chrome.tabs.sendMessage(playingTabs[tabId].id, {
			action: action
		});
	}
}
function pauseAll () {
	doActionToAllTabs('pause');
}
function resumeAll () {
	doActionToAllTabs('resume');
}
function thisTabIsPlaying (id, tab) {
	delete playingTabs[id];
	pauseAll();
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
	if(request && request.event && tabEvents[request.event]) {
		// console.log('Got event:', request.event);
		tabEvents[request.event](request, sender);
		// console.log('playingTabs:', playingTabs);
	}
});
chrome.tabs.onRemoved.addListener(thisTabHasBeenPaused);
