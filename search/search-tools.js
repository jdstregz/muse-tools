//Imports
const axios = require("axios");
const _ = require("lodash");
const token =
  "BQCc-ZRH6Aiqv54dOiy4FquZEa6znYVrar38udNqWAkL9Vpmqxtf1YGEs2txjlLG5BBRA8OeFtRWwn34JcqimAejAGdNJZk5nspWejiXq890kICMUi87pHV12wxErVR-eqk7y5k6g3tF9SHVqgKFtqR6xWdJnPQZzr8QTo_Gc-5VkXdgxAQ8vwuvehsFWRwd8m00VRvFGErtLWnqdHo991YNzwdnnjuJiiSUEvdfleKcmNXShgD3GgyVpWc";

const authHeader = access_token => {
  header = { Authorization: "Bearer " + access_token };
  return header;
};

const searchEndpoint = `https://api.spotify.com/v1/search`;

// returns data
// tracks....href, next, limit (20), total (results), offset, previous, items
const search = async (access_token, query, type) => {
  const searchString = `${searchEndpoint}?q=${query}+&type=${type}&limit=50`;
  const search = await axios({
    method: "get",
    url: searchString,
    headers: authHeader(access_token),
    json: true
  });
  //console.log(search.data);
  return search.data;
};

const getSongByName = async (access_token, name) => {
  const searchResults = await search(access_token, name, "track");
  const tracks = searchResults.tracks.items;
  for (const track of tracks) {
    console.log(
      track.name.trim().toLowerCase() + " - " + name.trim().toLowerCase()
    );
    if (track.name.trim().toLowerCase() == name.trim().toLowerCase()) {
      return track;
    }
  }
  return null;
};

function product(iterables, repeat) {
  var argv = Array.prototype.slice.call(arguments),
    argc = argv.length;
  if (argc === 2 && !isNaN(argv[argc - 1])) {
    var copies = [];
    for (var i = 0; i < argv[argc - 1]; i++) {
      copies.push(argv[0].slice()); // Clone
    }
    argv = copies;
  }
  return argv.reduce(
    function tl(accumulator, value) {
      var tmp = [];
      accumulator.forEach(function(a0) {
        value.forEach(function(a1) {
          tmp.push(a0.concat(a1));
        });
      });
      return tmp;
    },
    [[]]
  );
}

function subsets(seq) {
  var fullSets = [];
  for (const mask of product([false, true], seq.length)) {
    var zipped = mask.map(function(e, i) {
      return [e, seq[i]];
    });
    var returnValue = [];
    for (const zip of zipped) {
      if (zip[0]) {
        returnValue.push(zip[1]);
      }
    }
    fullSets.push(returnValue);
  }
  return fullSets;
}

function ordered_groups(seq) {
  var fullReturn = [];
  for (var indices of subsets(_.range(1, seq.length))) {
    indices = [0].concat(indices.concat([seq.length]));
    var resty = indices.slice(1, indices.length);
    var zipped = indices.map(function(e, i) {
      return [e, resty[i]];
    });
    var grouping = [];
    for (const zip of zipped) {
      grouping.push(seq.slice(zip[0], zip[1]));
    }
    fullReturn.push(grouping);
  }
  return fullReturn;
}

const returnValidSongGrouping = async (groupings, access_token) => {
  var validGroups = [];
  console.log(groupings.length);
  for (const group of groupings) {
    //console.log(group);
    var pass = true;
    var songs = [];
    for (var i = 0; i < group.length - 1; i++) {
      if (group[i].length > 0) {
        //console.log(groupings);
        const songName = group[i].join(" ");
        const song = await getSongByName(access_token, songName);
        songs.push(song);
        if (!song) {
          pass = false;
        }
      }
    }
    if (pass) {
      validGroups.push({ group: group, songs: songs });
      console.log("Group Passed!");
      break;
    }
  }
  if (validGroups.length == 0) {
    return null;
  }
  return validGroups;
};

const getSongsViaSentence = async (access_token, sentence) => {
  const wordArray = sentence.split(" ");
  const groups = ordered_groups(wordArray);
  const values = await returnValidSongGrouping(groups, access_token);
  return values;
};

const test = async () => {
  var sets = ordered_groups(["Hello", "My", "Name", "Is", "Joshua"]);
  console.log(sets);
  //const values = await returnValidSongGrouping(sets, token);
  for (const value of values) {
    console.log(value.group);
    console.log(value.songs);
  }
};

test();

module.exports = {
  search,
  getSongsViaSentence
};
