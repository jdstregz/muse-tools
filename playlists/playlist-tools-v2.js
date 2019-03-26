// Imports
const axios = require("axios");

// access access
const accessor =
  "BQC-KPdmqCo5J9IqSPRlLKORkFy_ZFeWVvNKQM_KQEivTJdRmKtEnx1ln2H4-VOa8vSlO1vrxrkUisUJydZaKtu073jdt7-66xi7vUnpDZKlcQat-Ib9iS5NtTBCst0u2DsnSFA775PvNREnz2FZjh178vSZYyiYEUB17m--Xx7PRxUHuT-dooKyMk1LCZZJu0EOeod4Zm9pet_48-SKkOMIE828Sqqsrf4r09XDEtEqk61jFB_LqAYykLhJUiYnltuK1LQ2L3TTWw";
const test_playlist_id = "2ioqto276BZYNgKoiQ9bkn";
// Endpoint Constants

const authHeader = access_token => {
  header = { Authorization: "Bearer " + access_token };
  return header;
};

// PLAYLISTS
const playlistEndpoint = playlistID => {
  return `https://api.spotify.com/v1/playlists/${playlistID}`;
};

const playlistTracksEndpoint = playlistID => {
  return `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
};

const currentUsersPlaylists = () => {
  return `https://api.spotify.com/v1/me/playlists?limit=50`;
};

const createPlaylistEndpoint = `https://api.spotify.com/v1/playlists`;

const getUser = async access_token => {
  const user = await axios({
    method: "get",
    url: "https://api.spotify.com/v1/me",
    headers: authHeader(access_token),
    json: true
  });
  return user.data;
};

const getAllCurrentUserPlaylists = async access_token => {
  var playlists = [];
  var next = currentUsersPlaylists();
  while (next) {
    const playlistsData = await axios({
      method: "get",
      url: next,
      headers: { Authorization: "Bearer " + access_token },
      json: true
    });
    playlists = playlists.concat(playlistsData.data.items);
    next = playlistsData.next;
  }
  return playlists;
};

// Input: Playlist ID, Access Token
// Output: Array of Track IDs
const getPlaylistData = async (playlistID, access_token) => {
  const playlist = await axios({
    method: "get",
    url: playlistEndpoint(playlistID),
    headers: { Authorization: "Bearer " + access_token },
    json: true
  });
  return playlist.data;
};

// gets playlist track data from inputted url and access token
const getPlaylistTrackData = async (url, access_token) => {
  const tracks = await axios({
    method: "get",
    url: url,
    headers: authHeader(access_token),
    json: true
  });
  return tracks.data;
};

// Gets all tracks from a single playlist, recursing through the next url if # of tracks > 100
const getAllPlaylistTrackData = async (playlistID, access_token) => {
  var tracks = [];
  var next = playlistTracksEndpoint(playlistID);
  while (next) {
    const trackData = await getPlaylistTrackData(next, access_token);
    if (trackData.items) {
      tracks = tracks.concat(trackData.items);
      next = trackData.next;
    } else {
      next = null;
    }
  }
  return tracks;
};

// Gets all tracks from a list of playlists. The playlist array must be of object playlist containing the playlist id
const getTrackDataFromPlaylistArray = async (playlistArray, access_token) => {
  var tracks = [];
  for (const playlist of playlistArray) {
    const playlistTracks = await getAllPlaylistTrackData(
      playlist.id,
      access_token
    );
    tracks = tracks.concat(playlistTracks);
  }
  return tracks;
};

// create playlist

const createPlaylist = async (name, access_token) => {
  const user = await getUser(access_token);
  const playlist = await axios({
    method: "post",
    headers: {
      Authorization: "Bearer " + access_token,
      "Content-Type": "application/json"
    },
    url: `https://api.spotify.com/v1/users/${user.id}/playlists`,
    data: `{"name": "${name}", "description":"description", "public": false}`
  });
  return playlist.data;
};

// add tracks to playlist
const addTracksToPlaylist = async (
  access_token,
  playlist_id,
  trackArray,
  overwrite
) => {
  var track_chunks = [];
  var track_temp = trackArray;
  while (track_temp.length > 100) {
    track_chunks.push(trackArray.slice(0, 100));
    track_temp = track_temp.slice(100, tracks.length);
  }

  if (track_temp.length > 0) {
    track_chunks.push(track_temp);
  }

  var returns = [];
  var method = "post";
  if (overwrite) {
    method = "put";
  }
  for (const chunk of track_chunks) {
    var uri_body = '{"uris": [';
    for (i = 0; i < chunk.length; i++) {
      uri_body = uri_body + `"spotify:track:${chunk[i].track.id}"`;
      if (i != chunk.length - 1) {
        uri_body = uri_body + ",";
      }
    }
    uri_body = uri_body + "]}";

    const added = await axios({
      method: method,
      headers: {
        Authorization: "Bearer " + access_token,
        "Content-Type": "application/json"
      },
      url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      data: uri_body
    });
    returns.push(added);
    method = "post";
  }
  return returns;
};

// update tracks to playlist

// check if playlist exists

// check if playlist exists, if so, update tracks, else create and add tracks

// filter an array of tracks via added_at

// filter an array of tracks via some metric

// search for playlist by name

const getUserPlaylistByName = (searchName, playlists) => {
  for (const playlist of playlists) {
    if (searchName.toLowerCase().trim() == playlist.name.toLowerCase().trim()) {
      return playlist;
    }
  }
  return null;
};

const getTrackIDs = tracks => {
  var trackNameID = [];
  for (const item of tracks) {
    data = {
      name: item.track.name,
      id: item.track.id
    };
    trackNameID.push(data);
  }
  return trackNameID;
};

const getTrackData = async (trackID, access_token) => {};

const Playlists = {
  findByName: getUserPlaylistByName,
  addTracks: addTracksToPlaylist,
  getCurrentUserPlaylists: getAllCurrentUserPlaylists,
  getMultiTrackData: getTrackDataFromPlaylistArray,
  create: createPlaylist
};

module.exports = {
  getAllPlaylistTrackData,
  getUserPlaylistByName,
  getAllCurrentUserPlaylists,
  getTrackDataFromPlaylistArray,
  createPlaylist,
  addTracksToPlaylist,
  Playlists
};
