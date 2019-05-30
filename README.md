# Music Player

TODO:

- Add search bar on top of song list
- Highlight row of current song
- Stylize scroll bar (like mercurywm)
- Right click song item for more options
  - Delete song

Minor fixes:

- Adjust icon sizing / padding
  - Sort up/down
    - Position up and down
    - Last column's sort arrows should be on the left
  - Skip, replay/forward
- Scroll bar
  - Screen's scroll bar should only scroll song rows, not the title, search bar, or header row of table
  - Sidebar scroll bar should only scroll playlists?

Bugs:

- Uncontrolled to controlled component warning
  - On song item edit, switching focus for the first time

Youtube:

- New sidebar item: "YouTube"
  - Playing
    - Streams a youtube song
    - Option to add to library

Long term features:

- Playlists
  - Add song to playlist
  - Remove song to playlist
- Music metadata
  - Edit metadata on song add
- Drag and drop
  - Add songs to all songs
  - Add songs to playlists
  - Add songs into playlists
- Online
  - Make account
  - Show songs saved online
  - Stream songs
  - Download songs
  - Upload songs
- Youtube
  - Save song to library
  - Skip to next / previous
  - Show several related songs

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

Note:

- Media button shortcuts don't work normally in Linux. To get around it, the player uses `dbus` to directly access shortcuts. `dbus` requires several other packages to install:
  - `npm i -g node-gyp`
  - `sudo apt-get install libdbus-1-dev libglib2.0-dev`
  - Upon installing `dbus`, node will build the package for use. However, there may be differences in Node and Electron `NODE_MODULE_VERSION`s.
    - See more here: https://electronjs.org/docs/tutorial/using-native-node-modules
- On Linux, running the AppImage for the first time will install the desktop file in `~/.local/share/applications/` for desktop integration. However, if the path to the AppImage has a space in it, the desktop file will have an incorrect value for `TryExec`, making it unable to run.
  - `TryExec` doesn't support quotes, so spaces in the path must be escaped. However, they are escaped with `\\s` rather than `\s`.
    - See https://github.com/AppImage/AppImageKit/issues/948 and https://github.com/electron-userland/electron-builder/issues/3547
  - My fix is to set the AppImage executable name to something without spaces. As long as the directories in the path don't have spaces, the integration should work normally.
