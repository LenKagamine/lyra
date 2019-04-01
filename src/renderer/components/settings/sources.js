// @flow strict

import * as React from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

import { getSongs } from '../../util';
import Toggle from '../toggle';

import type { StoreState, Dispatch, Song, SongID } from '../../types';

type Props = {|
  +addSongs: (songs: Song[]) => void
|};

type State = {|
  selected: boolean,
  tempDirs: string[],
  tempSongs: Song[],
  toggle: { [id: SongID]: boolean }
|};

class Sources extends React.Component<Props, State> {
  state = {
    selected: false,
    tempDirs: [],
    tempSongs: [],
    toggle: {}
  };

  _onAdd = () => {
    const songs = this.state.tempSongs.filter(
      song => this.state.toggle[song.id]
    );
    this.props.addSongs(songs);
  };

  _onSelect = () => {
    const dirs: ?(string[]) = remote.dialog.showOpenDialog({
      properties: ['openDirectory', 'multiSelections']
    });

    if (dirs == null) {
      return;
    }

    const promises = dirs.map(dir => getSongs(dir));

    Promise.all(promises).then(values => {
      // $FlowFixMe: Array.flat() not in Flow
      const songs: Song[] = values.flat();
      const ids = songs.map(song => song.id);
      const toggle = ids.reduce((acc, val) => ({ ...acc, [val]: true }), {});
      this.setState({
        selected: true,
        tempDirs: dirs,
        tempSongs: songs,
        toggle
      });
    });
  };

  _onToggle = (songID: SongID) => {
    this.setState(state => {
      const toggle = state.toggle;
      toggle[songID] = !toggle[songID];
      return {
        toggle
      };
    });
  };

  render() {
    return (
      <div>
        <h3>Add Songs</h3>
        <button onClick={this._onSelect}>Select Directory</button>

        {this.state.selected ? (
          <>
            {this.state.tempDirs.map(dir => (
              <div key={dir}>
                <h5>{dir}</h5>
                <div>
                  {this.state.tempSongs
                    .filter(song => song.dir === dir)
                    .map(song => (
                      <div key={song.name}>
                        <span>{song.name}</span>
                        <Toggle
                          onToggle={() => this._onToggle(song.id)}
                          selected={this.state.toggle[song.id]}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <button onClick={this._onAdd}>Import</button>
          </>
        ) : null}
      </div>
    );
  }
}

function mapDispatch(dispatch: Dispatch) {
  return {
    addSongs: (songs: Song[]) => dispatch({ type: 'ADD_SONGS', songs })
  };
}

const ConnectedComp: React.ComponentType<{||}> = connect(
  null,
  mapDispatch
)(Sources);

export default ConnectedComp;