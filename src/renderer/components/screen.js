// @flow strict

import * as React from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';

import SongItem from './songItem';

import type { StoreState, Dispatch, Song } from '../types';

import '../../css/screen.css';

type Props = {|
  +songs: Song[],
  +playlist: ?string,
  +selectSong: (song: Song) => void
|};

class Screen extends React.Component<Props> {
  _onClick = (song: Song) => {
    this.props.selectSong(song);
  };

  render() {
    const { songs, playlist } = this.props;

    const title = playlist || 'All Songs';

    const filtered =
      playlist == null
        ? songs
        : songs.filter(song => song.name.includes(playlist));

    return (
      <div className="screen">
        <h1>{title}</h1>
        {filtered.map(song => (
          <SongItem key={song.name} song={song} />
        ))}
      </div>
    );
  }
}

function mapState(state: StoreState) {
  return {
    songs: state.songs,
    playlist: state.playlist
  };
}

function mapDispatch(dispatch: Dispatch) {
  return {
    selectSong: (song: Song) => dispatch({ type: 'SELECT_SONG', song })
  };
}

const ConnectedComp: React.ComponentType<{||}> = connect(
  mapState,
  mapDispatch
)(Screen);

export default ConnectedComp;