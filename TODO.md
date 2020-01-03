TODO:

- Keyboard shortcuts
  - Space to play/pause
  - Left/right arrow keys to skip 10 seconds
- While editing, metadata input fields should wrap
- Queue management
  - Cap previous queue list to 50? songs
  - Song getting pushed off of prev queue will be removed from cache if it's in it
  - If song in cache is popped, it should be removed from cache
- Search history
  - Show youtube search history on blank yt search screen
- Clicking the song info on bottom left
  - where the current song is playing from
  - all songs? playlist? youtube?
  - opens the respective screen for the song
  - Remove "playing" tab in sidebar under youtube

Refactor:

- Unify lyra and lyra-native
  - Use css-in-js similar to react native's stylesheets (?)
    - move variables.scss to constants.js
  - standardize file names
    - rangeinput -> slider
    - songItem -> song-item
  - standardize common utils
    - useToggle hook
- Screen display
  - currently, it's hacked together with playlists
  - playlists / all songs should be seperately handled from other screens (e.g. settings, youtube)
  - loading all songs is laggy due to reloading all songs again
    - bring `getSongList` into component, and only update if props change
  - new screen management:
    - currScreen: 'MAIN' | 'PLAYLIST' | 'SETTINGS' | 'YOUTUBE'
    - currSubScreen: PlaylistID | 'SEARCH' | 'PLAYING'
  - make it like lyra-mobile?

Minor fixes:

- Scroll bar
  - Sidebar scroll bar should only scroll playlists?
- Deleting playlist
  - Show confirmation modal?
- Inconsistent action to open context menu
  - Youtube playing: click options icon
  - Library: right click

Bugs:

- Sorting by name should ignore punctuation (like brackets)
- If the song skips before related songs are loaded, it won't autoplay the next song
- Linux:
  - If something else takes control of the media buttons and releases them, the media buttons won't work anymore

Long term features:

- Music metadata
  - Edit metadata on song add
- Drag and drop
  - Add songs to all songs
  - Add songs to playlists
  - Add songs into playlists
- Youtube
  - Pagination
  - Open in browser
- Online
  - Make account
  - Show songs saved online
  - Stream songs
  - Download songs
    - When listening to a Youtube song, download it in the background as a cache
    - Future playbacks and actual downloads will fetch from server's cache instead
  - Upload songs
- Rooms!
  - Several users listening to the same stream

Ideas:

- Song row interaction
  - Single click does nothing
  - Double click to play
  - Play button on left
    - Single click to play
  - Right click to open menu
    - Play, Edit
      - Edit is same
- Download from Youtube
  - Server download, since it requires converting to mp3
- Hover over seek bar
  - Show time over cursor