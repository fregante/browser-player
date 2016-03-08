# Browser Player, a Chrome extension
Control your playback from a button and automatically pause other tabs when you play something else.

**Download it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/gngdbjfdljhcameljcapolcpijlefhib)**. Firefox version coming if there's interest ([#13](https://github.com/bfred-it/browser-player/issues/13)).


It's not "complete" yet, I haven't tested it on many sites and some don't work yet ([#20](https://github.com/bfred-it/browser-player/issues/20)), like Facebook ([#8](https://github.com/bfred-it/browser-player/issues/8)).

---
Have a look at the issues list and feel free to contribute in any way: https://github.com/bfred-it/browser-player/issues

Detailed feature list in the commits, if you're into that: https://github.com/bfred-it/browser-player/commits/master

## Scenario 1

You're listening to music on [Google Music](https://music.google.com) when a friends sends you [a video](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

Open the video and Google Music pauses automatically.

Close/pause the video and Google Music resumes playing.

## Scenario 2

You're listening to some podcast or video in the background, among your other 30 tabs and windows, when you get a call.

Click the extension's button to pause the podcast.

Click it again to resume it.

## Scenario 3

You're on Reddit and see 10 great songs you'd like to listen to, across YouTube, SoundCloud, and 8tracks. ([#20](https://github.com/bfred-it/browser-player/issues/20))

Click on all of them. Instant playlist.

Close the current song and the next one will start.

Close any tab at any time to remove it from the playlist.

Go click play in any of the tabs, that song will be played now.

Double-click the button to see the playlist ([#16](https://github.com/bfred-it/browser-player/issues/16))

## Testing

**I'd love to have feedback on it.** Tell me if you find it useful, annoying, or both. The main possible offender currently is the lack of temporary or permanent blacklist ([#12](https://github.com/bfred-it/browser-player/issues/12)).

To test it out,

0. visit http://youtube.com/ and open 3 videos at a time, see how it behaves

0. Click on the new button to play/pause the video

0. Close any of the three tabs, in any order

## Related

- The [Chrome Media Keys extension](https://github.com/msfeldstein/chrome-media-keys) is further along in development and offers keyboard access, but that replaces iTunes keys altogether, even when no media is playing.
- [BeardedSpice](https://github.com/beardedspice/beardedspice) also enables the keyboard media keys on OS X but sometimes it doesn't work correctly and [breaks the normal usage of the keys.](https://github.com/beardedspice/beardedspice/issues/267)


## More

Developed by Federico Brigante. [Follow me on Twitter](https://twitter.com/bfred_it) for more.

Are you a developer? Try [GhostText](https://github.com/Cacodaimon/GhostText-for-SublimeText/), an extension I worked on.
