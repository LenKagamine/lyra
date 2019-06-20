// @flow strict

/*
  YouTube related utility methods

  Some of the packages that are used for YouTube integration
  require some setup before running (e.g. ffmpeg, googleapis).
  Moving all of them to this file helps centralize the setup
  code, and avoid duplication across the codebase.
*/

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import events from 'events';
import storage from 'electron-json-storage';
import ytdl from 'ytdl-core';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { google } from 'googleapis';
import he from 'he';

import store from './state/store';
import { setTags, parseDuration } from './util';

import type { Song, SongID, VideoSong } from './types';

ffmpeg.setFfmpegPath(ffmpegPath.path.replace('app.asar', 'app.asar.unpacked'));

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.ELECTRON_WEBPACK_APP_YT_API
});

export async function getStreamURL(id: SongID): Promise<string> {
  const info = await ytdl.getInfo(id);

  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestaudio'
  });

  return format.url;
}

export function downloadVideo(id: SongID) {
  /*
    This method fetches the audio of a YouTube video, and downloads it
    to download.mp3, while converting to a mp3 file. Once it finishes,
    it renames the file to the title of the video, applies metadata tags,
    and returns the new song object.
  */

  let info, currDuration;
  const dlPath = path.join(storage.getDataPath(), 'download.mp3');

  const emitter = new events.EventEmitter();

  const stream = ytdl(id, { quality: 'highestaudio' }).on('info', ytinfo => {
    info = ytinfo;
  });

  /*
    The info object from ytdl contains a "length_seconds" value,
    but it's only precise to seconds. The progress event from ffmpeg
    has a precision of 0.01s, but doesn't contain total duration information.

    The following calculation uses ytdl's info as an approximate duration
    to calculate percent downloaded. Then, it uses the last duration from
    ffmpeg's progress to store as song duration metadata.
  */

  ffmpeg(stream)
    .audioBitrate(128)
    .save(dlPath)
    .on('progress', progress => {
      const [h, m, s] = progress.timemark.split(':').map(Number);
      currDuration = h * 3600 + m * 60 + s;

      const percent = Math.min(100 * (currDuration / info.length_seconds), 100);

      emitter.emit('progress', percent);
    })
    .on('end', async () => {
      await setTags(dlPath, {
        title: info.title,
        artist: info.author.name
      });

      // Sanitize for file name
      const safeName = info.title.replace(/[\/\\\?%\*:|"<>. ]/g, '_') + '.mp3';
      const filepath = path.join(storage.getDataPath(), safeName);

      fs.rename(dlPath, filepath, err => {
        const song: Song = {
          id: createHash('sha256')
            .update(info.video_id)
            .digest('hex'),
          filepath,
          title: info.title,
          artist: info.author.title,
          duration: currDuration,
          playlists: [],
          date: Date.now(),
          source: 'LOCAL'
        };

        emitter.emit('end', song);
      });
    });

  return emitter;
}

export function downloadAndAdd(id: SongID) {
  // Downloads a YouTube video as audio, and adds it to the library

  const state = store.getState();
  if (state.isDownloading) {
    return;
  }

  store.dispatch({ type: 'DOWNLOAD_START' });

  downloadVideo(id)
    .on('progress', progress =>
      store.dispatch({ type: 'DOWNLOAD_PROGRESS', progress })
    )
    .on('end', song => {
      store.dispatch({ type: 'DOWNLOAD_FINISH' });
      store.dispatch({ type: 'ADD_SONGS', songs: [song] });
    });
}

async function ytQuery(options): Promise<VideoSong[]> {
  const res = await youtube.search.list({
    part: 'snippet',
    fields: 'items(id,snippet(title,channelTitle,thumbnails/default))',
    maxResults: 25,
    type: 'video',
    ...options
  });

  const videos = res.data.items.map(item => ({
    id: item.id.videoId,
    title: he.decode(item.snippet.title),
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default
  }));

  // const res2 = await youtube.videos.list({
  //   part: 'contentDetails,statistics',
  //   fields: 'items(contentDetails/duration, statistics/viewCount)',
  //   id: videos.map(v => v.id).join(',')
  // });

  // return videos.map((v, i) => ({
  //   ...v,
  //   duration: parseDuration(res2.data.items[i].contentDetails.duration),
  //   views: res2.data.items[i].statistics.viewCount
  // }));

  // This doesn't always work, but avoids making an API call
  const infos = await Promise.all(videos.map(v => ytdl.getInfo(v.id)));
  return videos.map((v, i) => ({
    ...v,
    playlists: [],
    date: Date.now(),
    source: 'YOUTUBE',
    url: v.id,
    duration: infos[i].length_seconds,
    views: infos[i].player_response.videoDetails.viewCount
  }));
}

export async function ytSearch(keyword: string): Promise<VideoSong[]> {
  return ytQuery({
    q: keyword
  });
}

export async function getRelatedVideos(id: SongID): Promise<VideoSong[]> {
  // return ytQuery({
  //   relatedToVideoId: id
  // });

  // Alternative using ytdl
  const { related_videos } = await ytdl.getInfo(id);
  const infos = await Promise.all(
    related_videos.filter(v => v.id).map(v => ytdl.getInfo(v.id))
  );
  return infos.map(v => ({
    id: v.video_id,
    title: v.title,
    artist: v.author.name,
    duration: v.length_seconds,
    playlists: [],
    date: Date.now(),
    source: 'YOUTUBE',
    url: v.video_id,
    views: v.player_response.videoDetails.viewCount,
    thumbnail: v.player_response.videoDetails.thumbnail.thumbnails[0]
  }));
}
