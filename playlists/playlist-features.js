const playlistTools = require("./playlist-tools-v2");
const Playlists = playlistTools.Playlists;
// playlist combiner
// 1. given playlist names, find their ids
// 2. using their ids, get the tracks
// 3. using the tracks, create/update a new playlist
// input: playlist names, new playlist name, access_token
const combinePlaylists = async (
  access_token,
  playlistNames,
  newPlaylistName
) => {
  // search current user playlists for playlist names
  var playlistObjects = [];
  console.log("Retrieving User Playlists");
  const playlists = await playlistTools.getAllCurrentUserPlaylists(
    access_token
  );
  console.log("Retrieved Playlists");
  console.log("Searching for combined playlists");
  for (const playlistName of playlistNames) {
    console.log(`Finding ${playlistName}`);
    const foundPlaylist = playlistTools.getUserPlaylistByName(
      playlistName,
      playlists
    );
    if (!foundPlaylist) {
      console.log("Uh oh an error occured");
      return {
        success: false,
        error: "One of the playlists could not be found"
      };
    }
    playlistObjects.push(foundPlaylist);
  }
  console.log("Found all playlists");
  // using found playlists, get all of the tracks for them
  console.log("Scraping Tracks");
  const tracks = await playlistTools.getTrackDataFromPlaylistArray(
    playlistObjects,
    access_token
  );
  console.log(tracks.length);

  console.log("Creating new playlist if doesn't exist");
  // check to see if playlist exists, if it doesnt then create it
  var newPlaylist = playlistTools.getUserPlaylistByName(
    newPlaylistName,
    playlists
  );
  if (!newPlaylist) {
    newPlaylist = await playlistTools.createPlaylist(
      newPlaylistName,
      access_token
    );
  }
  console.log("Adding tracks to playlist");
  // add tracks to playlist
  const returns = await Playlists.addTracks(
    access_token,
    newPlaylist.id,
    tracks,
    true
  );
  console.log("Done");
  return { success: "success" };
};

const test = async () => {
  const playlistNames = [
    "DJ Stregz Fresh Squeezed Vol. 2",
    "DJ Stregz Fresh Squeezed Vol. 1"
  ];
  const newPlaylistName = "DJ Stregz Fresh Squeezed Full Collection";
  const access_token =
    "BQABAwh0wXiG4NgzDKrP_mt0DUzwEUIPL6OPUlEqQt60Z_072GMFbz17-ldX2PjofTt4l0HZQfJbiinuEnOGfv92p3C76olS0GN5TgpYFOdHXI7UmmJfREUFqnNuxCoa_82PEnUMqrmNmIB0BHeZoncdgV36NlQXBOE9eB9INhFu2sbxPn0Ayp4VBW1-fthDkLOOKc77vTbUWoonTqxpk1W4fRSyOplin4PoBP7u8H3Oo4aSrXPb5GiPcPU";
  combinePlaylists(access_token, playlistNames, newPlaylistName);
};

module.exports = {
  combinePlaylists
};
