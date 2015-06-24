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
function hasAudio (video) {
    return video.mozHasAudio ||
    video.webkitAudioDecodedByteCount ||
    video.audioTracks && video.audioTracks.length;
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

var onMediaEvent = noAutomatedEvent(debounce(function (e) {
	var media = e.target;
	var isSilent = media.muted || !media.volume || !hasAudio(media);
	if (isSilent && !media._______wasPaused || e.type === 'pause') {
		somethingHasBeenPaused(media);
	} else if(!isSilent && !media.paused) {
		somethingIsPlaying(media);
	}
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
	window.removeEventListener('play', onMediaEvent, true);
	window.removeEventListener('pause', onMediaEvent, true);
	window.removeEventListener('volumechange', onMediaEvent, true);
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
	window.addEventListener('play', onMediaEvent, true);
	window.addEventListener('pause', onMediaEvent, true);
	window.addEventListener('volumechange', onMediaEvent, true);
	chrome.runtime.onMessage.addListener(function (request) {
		if(request && request.action && actions[request.action]) {
			// console.log('Got action:', request.action);
			actions[request.action]();
		}
	});
	detectCurrentPlayingMedia();
}
init();
