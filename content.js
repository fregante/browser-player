'use strict';
/* global debounce */

/**
 * TOOLS
 */
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
	for(var element of elements) {
		if (element[property]) {
			return true;
		}
	}
}
function deleteAllProperties (elements, property) {
	for(var element of elements) {
		delete element[property];
	}
}
function notifyOfEvent (name) {
	try {
		chrome.extension.sendMessage({
			event: name,
		});
	} catch (e) {
		// Extension was updated, deactivate this instance
		die();
	}
}
function hasAudio (video) {
  return video.mozHasAudio ||
	  video.webkitAudioDecodedByteCount ||
	  video.audioTracks && video.audioTracks.length;
}


/**
 * MEDIA EVENTS
 */

var localPlaylist = new Set();

var events = {};
events.play = function (media) {
	if(isAnyElements(localPlaylist, '_______wasPaused')) {
		// console.info('some were paused, now the page is fresh')
		deleteAllProperties(localPlaylist, '_______wasPaused');
		localPlaylist.clear();
	}
	if (!localPlaylist.size) {
		// console.log('page is playing');
		notifyOfEvent('play');
	}

	delete media._______wasPaused;

	localPlaylist.add(media);

	if (!media._______tracking) {
		media.addEventListener('DOMNodeRemovedFromDocument', function () {
			events.pause(media);
		});
		media._______tracking = true;
	}
};

events.pause = function (media) {
	// console.log(localPlaylist);

	localPlaylist.delete(media);

	if (!localPlaylist.size) {
		// console.log('page is not playing')
		notifyOfEvent('pause');
	}
};

events.all = noAutomatedEvent(debounce(function (e) {
	var media = e.target;
	var isSilent = media.muted || !media.volume || !hasAudio(media);
	if (isSilent && !media._______wasPaused || e.type === 'pause') {
		events.pause(media);
	} else if(!isSilent && !media.paused) {
		events.play(media);
	}
}, 100));


/**
 * EXTENSION REQUESTS
 */

var actions = {};

actions.pause = function () {
	localPlaylist.forEach(function (media) {
		if (!media.paused) {
			// console.log('automated pausing', media);
			media.____automatedEvent = true;
			media.pause();
			media._______wasPaused = true;
		}
	});
};

actions.resume = function () {
	localPlaylist.forEach(function (media) {
		if (media._______wasPaused) {
			// console.log('automated playing', media);
			media.____automatedEvent = true;
			media.play();
			delete media._______wasPaused;
		}
	});
};

function die () {
	window.removeEventListener('play', events.all, true);
	window.removeEventListener('pause', events.all, true);
	window.removeEventListener('seeking', events.all, true);
	window.removeEventListener('volumechange', events.all, true);
}

function detectCurrentPlayingMedia () {
	var media = document.querySelectorAll('video, audio');
	for (var i = media.length - 1; i >= 0; i--) {
		if (media[i].paused === false) {
			events.play(media[i]);
		}
	}
}

function init () {
	window.addEventListener('play', events.all, true);
	window.addEventListener('pause', events.all, true);
	window.addEventListener('seeking', events.all, true);
	window.addEventListener('volumechange', events.all, true);
	chrome.runtime.onMessage.addListener(function (request) {
		if(request && request.action && actions[request.action]) {
			// console.log('Got action:', request.action);
			actions[request.action]();
		}
	});
	detectCurrentPlayingMedia();
}
init();
