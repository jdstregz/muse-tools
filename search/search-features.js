const Search = require("./search-tools.js");
const Playlist = require("../playlists/playlist-tools-v2.js");

const token =
  "BQAyxrWk7EMpnx0XlX60Wwvxe7rMi0sdMbGlhDPA2BerDEiyksb_orxO4XParixw-EHav1T5BG4xX3PCWEDZH4GYi6eOMyUZysc4McwftOrXHnSKnaWsDjQtBkgeRhnC5OtaO1u5wRdDO26npGUEBOcmHhAjEMAYxTX12kWkdtZDzKkvA_RvTzd4Jdwnj3ephL6ypbznp6GPIs_nTgYHm6ach7tZiyIMixjt2iC0IjxnHiWCjIwuMZEISps";

const createPlaylistFromSentence = async (
  access_token,
  sentence,
  playlistName
) => {
  const songValues = await Search.getSongsViaSentence(access_token, sentence);
  if (!songValues) {
    return {
      error: "There are no combination of songs that can create this sentence"
    };
  }

  const createdPlaylist = await Playlist.createPlaylist(
    playlistName,
    access_token
  );

  const songs = [];
  for (const song of songValues[0].songs) {
    songs.push({ track: song });
  }

  console.log(createdPlaylist);
  const addedSongs = await Playlist.addTracksToPlaylist(
    access_token,
    createdPlaylist.id,
    songs,
    false
  );

  return {
    success: "Success!"
  };
};

const test = async () => {
  const test = await createPlaylistFromSentence(
    token,
    "shit piss cocksucker",
    "poop"
  );
  console.log(test);
};

test();
