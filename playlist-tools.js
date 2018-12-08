var request = require('request');

// gets the userid of the current access token
function getUserID(access_token, callback) {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, body) {
    var parsedBody = JSON.stringify(body);
    parsedBody = parsedBody.toString();
    parsedBody = JSON.parse(parsedBody);
    current_user_id = parsedBody.id;
    console.log('UserID retreived: ' + current_user_id);

    return callback(current_user_id, error);
  });
}

// this gets the playlist ids
function getPlaylistIDs(access_token, user_id, ignore_playlists, playlistURL, ids, origCallback, callback) {
  // variables
    var playlistIDS = [];
    var next = "";
    var options = {
        url: playlistURL,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };
    // request to get playlists
    request.get(options, function(error, response, body) {
      try {
      if (error) {
        console.log(error);
      }
        var str = JSON.stringify(body);
        str = str.toString();
        var playlists = JSON.parse(str);
        // loop through playlists
        for (i = 0; i < playlists.items.length; i++) {
            playlistDict = {};
            x = playlists.items[i];
            //console.log(x.name);
            playlistDict["name"] = x.name;
            // if the name of the playlist doesn't exist in the ignore playlists
            // and the owner of the playlist is the current_user
            if (!ignore_playlists.includes(x.name) && x.owner.id == user_id){
                playlistDict["id"] = x.id;
                playlistIDS.push(playlistDict);
            }
        }
        // if the response has a value next then apply it
        if (playlists.next) {
            next = playlists.next;
        }
        // if ids is populated then we concat
        if (ids.length > 0) {
            playlistIDS = playlistIDS.concat(ids);
        }
        // callback time
        return callback(access_token, next, playlistIDS, user_id, ignore_playlists, error, origCallback);
      }
      catch (error) {
        console.log(error.message);
        return callback(null, null, null, null, null, "something fucked up", origCallback);
      }
    });
}

function getAllPlaylistIDs(access_token, next, ids, user_id, ignore_playlists, error, callback) {
  if (next && !error) {
    getPlaylistIDs(access_token, user_id, ignore_playlists, next, ids, callback, getAllPlaylistIDs);
  } else if (error){
      return callback([], error);
    } else {
    // we have gotten all of our playlistIDs and now we need to go through
    if(callback){
      return callback(ids, null);
    } else {
      console.log("An error occured");
    }
  }
}


function getTrackDataFromPlaylist(access_token, playlistID, trackDataArray, origCallback, callback) {
  var next = "";
  var tracks = [];
  var options = {
    url: playlistID,
    headers: { 'Authorization': 'Bearer ' + access_token},
    json: true
  };
  request.get(options, function(error, response, body) {
    try {
    if (error) {
      console.log("error: " + error);
    }
    var trackData = JSON.stringify(body);
    trackData = trackData.toString();
    trackData = JSON.parse(trackData);
    for (i = 0; i < trackData.items.length; i++) {
      var item = trackData.items[i];
      var id = item.track.id;
      if (id) {
        var dateAdded = item.added_at;
        var track = [id, dateAdded];
        //console.log(track)
        tracks.push(track);
      }
    }
    trackDataArray.push(tracks);
    return callback(access_token, trackData.next, trackDataArray, error, origCallback);
    }
    catch (error) {
      console.log(error.message);
      return callback(null, null, null, null, null, "something fucked up in track", origCallback);
    }
  });
}

function getAllTrackDataFromPlaylist(access_token, next, trackDataArray, error, callback) {
  if (next && !error) {
    getTrackDataFromPlaylist(access_token, next, trackDataArray, callback, getAllTrackDataFromPlaylist);
  } else if (error) {
    console.log("ERROR: " + error);
    return callback([], error);
  } else {
    if(callback) {
      return callback(trackDataArray, null);
    }
  }
}

function getAllTrackDataFromMultiplePlaylists(access_token, playlistIDs, playlistTrackDataArray, callback) {
  if (playlistIDs.length > 0) {
    // then we get all the track data from that playlist
    dict = playlistIDs.pop();
    id = dict["id"];
    name = dict["name"];
    next = `https://api.spotify.com/v1/playlists/${id}/tracks`;
    getAllTrackDataFromPlaylist(access_token, next, [], null, function(trackDataArray, error) {
      if (error) {
        return callback(null, error);
      }
      //console.log("PlaylistTrackData Length: " + playlistTrackDataArray.length);
      playlistTrackDataArray = playlistTrackDataArray.concat(trackDataArray);
      getAllTrackDataFromMultiplePlaylists(access_token, playlistIDs, playlistTrackDataArray, callback);
    });
  }
    else {
      //console.log(playlistTrackDataArray);
      return callback(playlistTrackDataArray);
  }
}

function getTrackIDsViaDateFilter(trackDataArray, days) {
  next = "";
  trackIDs = [];
  count = 0;
  for (index = 0; index < trackDataArray.length; index++) {
    var trackData = trackDataArray[index];
    for (i = 0; i < trackData.length; i++) {
      var track = trackData[i];
      var id = track[0];
      var dateAdded = new Date(track[1].toString());
      var targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - days);
      if (dateAdded > targetDate && !trackIDs.includes(id)) {
        //console.log("Recently added track found!");
        count = count + 1;
        trackIDs.push(id);
      }
    }
  }
  console.log("Total Tracks After Filter: " + count);
  return trackIDs;
}

function getAllRecentlyAddedTrackIdsFromPlaylists(access_token, ids, days, callback) {

  getAllTrackDataFromMultiplePlaylists(access_token, ids, [], function(trackData) {
    var ids = getTrackIDsViaDateFilter(trackData, days);
    return callback(ids);
  });
}



//function getAllTrackIDsFromMultiplePlaylists(access_token, )

function playlistExists(playlistName, playlistDicts) {
  //console.log(playlistDicts);
    for (i = 0; i < playlistDicts.length; i++) {
      var dict = playlistDicts[i];
      var name = dict["name"];
      //console.log(dict["name"])
      if (playlistName == name) {
        return dict["id"];
      }
    }
    return null;

}

function createPlaylist(access_token, playlistName, user_id, callback) {
  request.post({
    headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json'},
    url:     `https://api.spotify.com/v1/users/${user_id}/playlists`,
    body:    `{"name": "${playlistName}", "description":"description", "public": false}`
  }, function(error, response, body) {

    return callback(body);
  });

}

function addSongsToPlaylist(access_token, playlistID, tracks, callback) {
  var uri_body = '{"uris": [';
  var second_set = [];
  if (tracks.length > 100) {
    second_set = tracks.slice(101, tracks.length);
    tracks = tracks.slice(0, 100);
  }
  for(i = 0; i < tracks.length; i++) {
    uri_body = uri_body + `"spotify:track:${tracks[i]}"`;
    if(i != tracks.length-1){
      uri_body = uri_body + ",";
    }
  }
  uri_body = uri_body + "]}";
  var options = {
        headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json'},
        url:     `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        body:    `${uri_body}`
  };
  request.post(options, function(error, response, body){
    console.log("ERROR IN UPDATE" + error);
    console.log("UPDATE BODY" + body);
    if (second_set.length > 0) {
      addSongsToPlaylist(access_token, playlistID, second_set, callback);
    } else {
      return callback();
    }
  });
  }

function updatePlaylist(access_token, playlistID, tracks, callback) {
  var uri_body = '{"uris": [';
  var second_set = [];
  if (tracks.length > 100) {
    second_set = tracks.slice(101, tracks.length);
    tracks = tracks.slice(0, 100);
  }
  for(i = 0; i < tracks.length; i++) {
    uri_body = uri_body + `"spotify:track:${tracks[i]}"`;
    if(i != tracks.length-1){
      uri_body = uri_body + ",";
    }
  }
  uri_body = uri_body + "]}";
  var options = {
        headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json'},
        url:     `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        body:    `${uri_body}`
  };
  request.put(options, function(error, response, body){
    console.log("ERROR IN UPDATE" + error);
    console.log("UPDATE BODY" + body);
    if (second_set.length > 0) {
      addSongsToPlaylist(access_token, playlistID, second_set, function() {
        return callback();
      });
    } else {
      console.log("CALLBACK");
      return callback();
    }
  });
}

function createRecentlyAddedPlaylist(access_token, ignore_playlists, playlistName, weeksBack, callback) {
  try {
  console.log("Starting recently added creation...");
  getUserID(access_token, function(user_id, error) {
    if (!error) {
      // userID retrieved, we now get playlists
      var ids = [];
      var next = 'https://api.spotify.com/v1/me/playlists?limit=50';
      var ignorePlaylists = ignore_playlists.split(',');
      console.log("Getting playlists...");
      getAllPlaylistIDs(access_token, next, ids, user_id, ignorePlaylists, false, function(playlistDicts, error) {
        console.log("Playlists found. Getting Tracks... this may take a moment...");
        if(error){
          return callback("error");
        }
        var playlistDictsCopy = JSON.parse(JSON.stringify( playlistDicts ));
        var id = playlistExists(playlistName, playlistDictsCopy);
        if (id) {
          index = 0;
          for (i = 0; i < playlistDicts.length; i++) {
            if (playlistDicts[i]["id"] == id) {
              playlistDicts.splice(i, 1);
              break;
            }
          }
        }
        getAllTrackDataFromMultiplePlaylists(access_token, playlistDicts, [], function(trackData, error) {
          console.log("Tracks obtained... Filtering by days back: " + weeksBack);
          var recentlyAddedIDs = getTrackIDsViaDateFilter(trackData, weeksBack);
          console.log(recentlyAddedIDs);
          if (!id) {
            console.log("Creating playlist: " + playlistName);
            createPlaylist(access_token, playlistName, user_id, function(body) {
              var parsed = JSON.parse(body);
              var returnID = parsed.id;
              console.log("Return ID" + returnID);
              updatePlaylist(access_token, returnID, recentlyAddedIDs, function() {
                return callback("success");
              });
            });
          } else {
            console.log("Playlist exists, updating tracks...");
            updatePlaylist(access_token, id, recentlyAddedIDs, function() {
              return callback("success");
            });
          }
        });
      });
    }
  });
}
catch (err) {
    console.log(err);
    return callack("failure");
  }
}


// exports
exports.getUserID = getUserID;
exports.createRecentlyAddedPlaylist = createRecentlyAddedPlaylist;
