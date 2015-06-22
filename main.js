'use strict';
/*global button*/
var tabs = {};
tabs.isPlaying = false;
tabs.list = [];
tabs.onUpdate = function () {
	button.update();
};
tabs.add = function (tab) {
	tabs.isPlaying = true;
	tabs.list.push(tab);
	tabs.onUpdate();
};
tabs.has = function (tabId) {
	return tabs.list.some(function (current) {
		return current.id === tabId;
	});
};
tabs.remove = function (tabId) {
	var wasRemoved = false;
	tabs.list = tabs.list.filter(function (current) {
		var shouldRemove = current.id === tabId;
		if (shouldRemove) {
			wasRemoved = true;
		} else {
			return true;
		}
	});
	if (!tabs.list.length) {
		tabs.isPlaying = false;
	}
	tabs.onUpdate();
	return wasRemoved;
};
tabs.act = function (tab, action) {
	if (!tab) {
		return;
	}
	switch(action) {
		case 'resume': tabs.isPlaying = true; break;
		case 'pause': tabs.isPlaying = false; break;
	}
	chrome.tabs.sendMessage(tab.id, {
		action: action
	});
};
tabs.last = {
	get: function () {
		return tabs.list[tabs.list.length - 1];
	},
	act: function (action) {
		tabs.act(tabs.last.get(), action);
	}
};