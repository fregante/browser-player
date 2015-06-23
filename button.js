'use strict';
/*global tabs, chrome*/
var button = {};
button.update = function () {
	var count = tabs.list.length;
	var text = count > 1 ? ''+count : '';
	chrome.browserAction.setBadgeText({
		text: text
	});

	if (!count) {
		button.setIcon('icon');
		button.setTitle('Browser Player: Nothing is playing');
	} else if (tabs.isPlaying){
		button.setIcon('pause');
		button.setTitle('Pause media');
	} else {
		button.setIcon('play');
		button.setTitle('Play media');
	}
};
button.setIcon = function (icon) {
	chrome.browserAction.setIcon({
		path: {
			19: icon+'.png',
			38: icon+'.png'
		}
	});
};
button.setTitle = function (text) {
	chrome.browserAction.setTitle({
		title: text
	});
};

button._clickCount = 0;
button._resetCount = debounce(function () {
	button._clickCount = 0;
}, 1000);
function feedback () {
	if (tabs.isPlaying) {
		return;
	}
	button._clickCount += 1;
	if (button._clickCount === 3) {
		window.alert('That tickles! Nothing is playing, let me sleep. zzz');
	}
	button._resetCount();
}
function handleClick () {
	if (tabs.isPlaying) {
		tabs.last.act('pause');
		button.update();
	} else if (tabs.list.length) {
		tabs.last.act('resume');
		button.update();
	} else {
		feedback();
	}
}
chrome.browserAction.onClicked.addListener(handleClick);