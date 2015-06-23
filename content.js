'use strict';
/* global debounce */
var playingElements = [];
function noAutomatedEvent (cb) {
	return function (e) {
		if (e.target.____automatedEvent) {
			delete e.target.____automatedEvent;
			return;
		}
		cb.call(this, e);
	};
}
function isAnyElements (elements, property) {
	for (var i = elements.length - 1; i >= 0; i--) {
		if (elements[i][property]) {
			return true;
		}
	}
}
function deleteAllProperties (elements, property) {
	for (var i = elements.length - 1; i >= 0; i--) {
		delete elements[i][property];
	}
}
function notifyOfEvent (name) {
	try {
		chrome.extension.sendMessage({
			event: name,
		});
	} catch (e) {
		// Extension was updated, deactivate this instance
		deinit();
	}
}
function somethingIsPlaying (media) {
	if(isAnyElements(playingElements, '_______wasPaused')) {
		// console.info('some were paused, now the page is fresh')
		deleteAllProperties(playingElements, '_______wasPaused');
		playingElements.length = 0;
	}
	if (!playingElements.length) {
		// console.log('page is playing');
		notifyOfEvent('play');
	}

	delete media._______wasPaused;

	// add only if not already there
	if (playingElements.indexOf(media) === -1) {
		playingElements.push(media);
	}
}
function somethingHasBeenPaused (media) {
	// console.log(playingElements);

	var index = playingElements.indexOf(media);
	if (index > -1) {
		playingElements.splice(playingElements.indexOf(media), 1);
	}

	if (!playingElements.length) {
		// console.log('page is not playing')
		notifyOfEvent('pause');
	}
}

var events = {};
events.play = noAutomatedEvent(debounce(function (e) {
	// console.log('user played', e.target);
	somethingIsPlaying(e.target);
}, 100));
events.pause = noAutomatedEvent(debounce(function (e) {
	// console.log('user paused', e.target);
	somethingHasBeenPaused(e.target);
}, 100));


var actions = {};

actions.pause = function () {
	for (var i = playingElements.length - 1; i >= 0; i--) {
		var current = playingElements[i];
		if (!current.paused) {
			// console.log('automated pausing', current);
			current.____automatedEvent = true;
			current.pause();
			current._______wasPaused = true;
		}
	}
};

actions.resume = function () {
	for (var i = playingElements.length - 1; i >= 0; i--) {
		var current = playingElements[i];
		if (current._______wasPaused) {
			// console.log('automated playing', current);
			current.____automatedEvent = true;
			current.play();
			delete current._______wasPaused;
		}
	}
};

function deinit () {
	window.removeEventListener('play', events.play, true);
	window.removeEventListener('pause', events.pause, true);
}

function detectCurrentPlayingMedia () {
	var media = document.querySelectorAll('video, audio');
	for (var i = media.length - 1; i >= 0; i--) {
		if (media[i].paused === false) {
			somethingIsPlaying(media[i]);
		}
	}
}

function init () {
	window.addEventListener('play', events.play, true);
	window.addEventListener('pause', events.pause, true);
	chrome.runtime.onMessage.addListener(function (request) {
		if(request && request.action && actions[request.action]) {
			// console.log('Got action:', request.action);
			actions[request.action]();
		}
	});
	detectCurrentPlayingMedia();
}
init();
