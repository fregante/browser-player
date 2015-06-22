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
	} else if (tabs.isPlaying){
		button.setIcon('pause');
	} else {
		button.setIcon('play');
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
function handleClick () {
	if (tabs.isPlaying) {
		console.log('was Playing')
		tabs.last.act('pause');
		button.update();
	} else if (tabs.list.length) {
		console.log('should play')
		tabs.last.act('resume');
		button.update();
	}
}
chrome.browserAction.onClicked.addListener(handleClick);