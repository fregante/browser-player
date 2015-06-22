'use strict';

function off (el, name, cb) {
	el.removeEventListener(name, cb, true);// @warn: true = capturing!!
}
function on (el, name, cb, once) {
	if (once) {
		var oldCb = cb;
		cb = function () {
			oldCb.apply(this, arguments);
			off(el, name, cb);
		};
	}
	el.addEventListener(name, cb, true);// @warn: true = capturing!!
}
function once (el, name, cb) {
	var oldCb = cb;
	cb = function () {
		oldCb.apply(this, arguments);
		off(el, name, cb);
	};
	on(el, name, cb);
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

function somethingIsPlaying (media) {
	if(isAnyElements(playingElements, '_______wasPaused')) {
		// console.info('some were paused, now the page is fresh')
		deleteAllProperties(playingElements, '_______wasPaused');
		playingElements.length = 0;
	}
	if (!playingElements.length) {
		// console.log('page is playing');
		chrome.extension.sendMessage({
			event: 'play',
		});
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
		chrome.extension.sendMessage({
			event: 'pause',
		});
	}
}

var playingElements = [];
window.addEventListener('play', function (e) {
	if (e.target.____automatedEvent) {
		delete e.target.____automatedEvent;
		return;
	}
	// console.log('user played', e.target);

	somethingIsPlaying(e.target);
}, true);
window.addEventListener('pause', function (e) {
	if (e.target.____automatedEvent) {
		delete e.target.____automatedEvent;
		return;
	}
	//@todo: withhold pause event until seeking event stops for a bit (debounce)
	// console.log('user paused', e.target);
	somethingHasBeenPaused(e.target);
}, true);



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

chrome.runtime.onMessage.addListener(function (request) {
	if(request && request.action && actions[request.action]) {
		// console.log('Got action:', request.action);
		actions[request.action]();
	}
});