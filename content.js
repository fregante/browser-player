'use strict';
/* global debounce */
var localPlaylist = new Set();
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
		deinit();
	}
}
function somethingIsPlaying (media) {
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
			somethingHasBeenPaused(media);
		});
		media._______tracking = true;
	}
}
function hasAudio (video) {
    return video.mozHasAudio ||
    video.webkitAudioDecodedByteCount ||
    video.audioTracks && video.audioTracks.length;
}
function somethingHasBeenPaused (media) {
	// console.log(localPlaylist);

	localPlaylist.delete(media);

	if (!localPlaylist.size) {
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
