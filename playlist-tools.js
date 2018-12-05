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
    return callback(current_user_id, error);
  });
}

// after we get the userID we use it in our getPlaylistFunction

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
      if (error) {
        console.log(error);
      }
        var str = JSON.stringify(body);
        str = str.toString();
        var playlists = JSON.parse(str);
        // loop through playlists
        for (i = 0; i < playlists.items.length; i++) {
            x = playlists.items[i];
            console.log(x.name);
            // if the name of the playlist doesn't exist in the ignore playlists
            // and the owner of the playlist is the current_user
            if (!ignore_playlists.includes(x.name) && x.owner.id == user_id){
                playlistIDS.push(x.id);
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
    });
}

function getAllPlaylistIDs(access_token, next, ids, user_id, ignore_playlists, error, callback) {
  if (next && !error) {
    console.log("NEXT WAS THERE");
    getPlaylistIDs(access_token, user_id, ignore_playlists, next, ids, callback, getAllPlaylistIDs);
  } else if (error){
    console.log("ERROR HERE");
      console.log(error);
    } else {
    // we have gotten all of our playlistIDs and now we need to go through
    if(callback){
      console.log("CALLBACK RETURNED HERE");
      console.log(ids.length);
      return callback(ids);
    } else {
      console.log("NO CALLBACK");
      console.log(ids.lengh);
    }
  }
}


function getTrackDataFromPlaylist(access_token, playlistID, trackDataArray, origCallback, callback) {
  console.log("Track Data Length so far: " + trackDataArray.length);
  var next = "";
  var tracks = []
  var options = {
    url: playlistID,
    headers: { 'Authorization': 'Bearer ' + access_token},
    json: true
  };
  request.get(options, function(error, response, body) {
    if (error) {
      console.log("error");
    }
    var trackData = JSON.stringify(body);
    trackData = trackData.toString();
    trackData = JSON.parse(trackData);
    for (i = 0; i < trackData.items.length; i++) {
      var item = trackData.items[i];
      var id = item.track.id;
      if (id) {
        var dateAdded = item.added_at;
        var track = [id, dateAdded]
        //console.log(track)
        tracks.push(track)
      }
    }
    trackDataArray.push(tracks);
    return callback(access_token, trackData.next, trackDataArray, error, origCallback);
  });
}

function getAllTrackDataFromPlaylist(access_token, next, trackDataArray, error, callback) {
  if (next && !error) {
    console.log("TRACK DATA ARRAY" + trackDataArray)
    getTrackDataFromPlaylist(access_token, next, trackDataArray, callback, getAllTrackDataFromPlaylist);
  } else if (error) {
    console.log("ERROR" + error);
  } else {
    if(callback) {
      console.log("CALLBACK RETURNED HERE");
      return callback(trackDataArray);
    }
  }
}

function getAllTrackDataFromMultiplePlaylists(access_token, playlistIDs, playlistTrackDataArray, callback) {
  if (playlistIDs.length > 0) {
    // then we get all the track data from that playlist
    id = playlistIDs.pop();
    next = `https://api.spotify.com/v1/playlists/${id}/tracks`;
    console.log("getting track data from" + id);
    getAllTrackDataFromPlaylist(access_token, next, [], null, function(trackDataArray) {
      console.log("PlaylistTrackData Length: " + playlistTrackDataArray.length);
      playlistTrackDataArray = playlistTrackDataArray.concat(trackDataArray);
      getAllTrackDataFromMultiplePlaylists(access_token, playlistIDs, playlistTrackDataArray, callback);
    });
  }
    else {
      console.log(playlistTrackDataArray);
      return callback(playlistTrackDataArray);
  }
}

function getTrackIDsViaDateFilter(trackDataArray, days) {
  next = "";
  trackIDs = [];
  for (index = 0; index < trackDataArray.length; index++) {
    var trackData = trackDataArray[index];
    console.log("TrackData: " + trackData);
    for (i = 0; i < trackData.length; i++) {
      console.log("Track: " + i)
      var track = trackData[i];
      var id = track[0]
      var dateAdded = new Date(track[1].toString());
      var targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - days);
      if (dateAdded > targetDate && !trackIDs.includes(id)) {
        console.log("recently added track found!")
        trackIDs.push(id);
      } else {
        //console.log(dateAdded + " is not more recent than " + targetDate);
      }
    }
  }

  return trackIDs;
}

function getAllRecentlyAddedTrackIdsFromPlaylists(access_token, ids, days, callback) {

  getAllTrackDataFromMultiplePlaylists(access_token, ids, [], function(trackData) {
    var ids = getTrackIDsViaDateFilter(trackData, days);
    return callback(ids);
  });
}

//function getAllTrackIDsFromMultiplePlaylists(access_token, )

function checkIfPlaylistExists(access_token, playlistName) {

}

function createPlaylist(access_token, playlistName) {

}

function updatePlaylist(access_token, playlistID, trackIDs) {

}

function createRecentlyAddedPlaylist(access_token, ignore_playlists, playlistName, weeksBack, callback) {
  getUserID(access_token, function(user_id, error) {
    if (!error) {
      // userID retrieved, we now get playlists
      var ids = [];
      var next = 'https://api.spotify.com/v1/me/playlists?limit=50';
      getAllPlaylistIDs(access_token, next, ids, user_id, ignore_playlists, false, function(playlistIDs) {
        getAllTrackDataFromMultiplePlaylists(access_token, playlistIDs, [], function(trackData) {
          var ids = getTrackIDsViaDateFilter(trackData, 7);
          console.log(ids)
          return callback(ids);
        });
      });

    }
  });
}


// exports
exports.getUserID = getUserID;
exports.createRecentlyAddedPlaylist = createRecentlyAddedPlaylist;
