var request = require('request'); // "Request" library

var access_token = "";
var current_user_id = "";
var ignore_playlists = ['Discover Weekly', 'Release Radar', 'Discover Weekly Archive', 'DJ Stregz Weekly'];
var lock = false;
var recentlyAddedExists = false;
var recentlyAddedName = "DJ Stregz Weekly";
var recentlyAddedID = "";

function setAccessToken(code) {
    access_token = code;
}

function setOwnerID() {

}

function getRecentlyAddedTracksPlaylist(){
    if (!lock) {
        lock = true;
        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
            console.log(body);
            var parsedBody = JSON.stringify(body);
            parsedBody = parsedBody.toString();
            var parsed = JSON.parse(parsedBody);
            current_user_id = parsed.id;
            getAllPlaylistIDs();
        });

        console.log("Retrieving Playlists...");
    }


}

function getPlaylists(playlistURL, ids, callback) {
    var playlistIDS = [];
    var next = "";
    var options = {
        url: playlistURL,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };
    request.get(options, function(error, response, body) {
        var str = JSON.stringify(body);
        str = str.toString();
        var playlists = JSON.parse(str);
        for (i = 0; i < playlists.items.length; i++) {
            x = playlists.items[i];
            console.log(x.name);
            console.log(x.owner.id);
            console.log(current_user_id);
            if (!ignore_playlists.includes(x.name) && x.owner.id == current_user_id){
                playlistIDS.push(x.id);
            }
            if (x.name == recentlyAddedName) {
                console.log("Recently Added Playlist Exists :)")
                recentlyAddedExists = true
                recentlyAddedID = x.id
            }

        }
        if (playlists.next) {
            next = playlists.next
        }
        if (ids.length > 0) {
            playlistIDS = playlistIDS.concat(ids)

        }
        return callback( [playlistIDS, next]);
    });
}

function returnPlaylists(body) {
    //console.log(body)
    var ids = body[0]
    var next = body[1]
    if (next) {
        getPlaylists(next, ids, returnPlaylists)
    } else {
        console.log("Playlists Retrieved")
        console.log(ids.length)
        console.log("Requesting Tracks From Playlists...")
        var trackIDS = []
        getAllRecentlyAddedTracks(ids, trackIDS)
    }

}

function getAllPlaylistIDs() {
    var ids = []
    var next = 'https://api.spotify.com/v1/me/playlists?limit=50';
    getPlaylists(next, ids, returnPlaylists);
}

function getAllTracksFromPlaylists(trackURL, ids, playlists, callback) {
    console.log(trackURL)
    var trackIDS = []
    var next = ""
    var options = {
        url: trackURL,
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    };
    request.get(options, function(error, response, body) {
        var str = JSON.stringify(body)
        str = str.toString()
        var tracks = JSON.parse(str);
        for ( i = 0; i < tracks.items.length; i++) {
            var item = tracks.items[i];
            var itemUserAddedID = item.added_by.id
            var itemID = item.track.id
            var itemAddedDate = new Date(item.added_at)
            var oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            if (itemAddedDate > oneWeekAgo && itemUserAddedID == current_user_id && !ids.includes(itemID)) {
                console.log("Matched Track!")
                trackIDS.push(itemID)
            }
        }
        if (tracks.next) {
            next = tracks.next;
        }
        if (ids.length > 0) {
            trackIDS = trackIDS.concat(ids);
        }
        return callback([trackIDS, playlists, next]);
    });
}

function getAllRecentlyAddedTracks(playlistIDs, trackIDS) {
    var id = playlistIDs.pop();
    var next = `https://api.spotify.com/v1/playlists/${id}/tracks`;
    getAllTracksFromPlaylists(next, trackIDS, playlistIDs, checkTracks)
}

function checkTracks(body) {
    var trackIDS = body[0]
    var playlistIDS = body[1];
    var next = body[2]

    if (next) {
        getAllTracksFromPlaylists(next, trackIDS, playlistIDS, checkTracks)
    } else if (playlistIDS.length > 0) {
        getAllRecentlyAddedTracks(playlistIDS, trackIDS)
    } else {
        console.log(trackIDS)
        createPlaylist("DJ Stregz Weekly", trackIDS)
    }
}

function createPlaylist(name, trackIDS) {
    if (!recentlyAddedExists){
        request.post({
            headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json'},
            url:     `https://api.spotify.com/v1/users/${current_user_id}/playlists`,
            body:    `{"name": "${name}", "description":"description", "public": false}`
        }, function(error, response, body){
            console.log(error);
            console.log(body);
            var str = JSON.stringify(body);
            str = str.toString()
            var playlist = JSON.parse(str);
            recentlyAddedID = playlist.id
            updatePlaylistFromTracks(recentlyAddedID, trackIDS)
        });
    } else {
        updatePlaylistFromTracks(recentlyAddedID, trackIDS)
    }
}

function updatePlaylistFromTracks(id, tracks) {
    var uri_body = '{"uris": ['
    for(i = 0; i < tracks.length; i++){
        uri_body = uri_body + `"spotify:track:${tracks[i]}"`
        if (i != tracks.length-1){
            uri_body = uri_body + ","
        }
    }
    uri_body = uri_body + "]}"
    console.log(uri_body)
    request.put({
        headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json'},
        url:     `https://api.spotify.com/v1/playlists/${id}/tracks`,
        body:    `${uri_body}`
    }, function(error, response, body){
        console.log(error)
        console.log(body);

    });
}


exports.getAllPlaylistIDs = getAllPlaylistIDs
exports.setAccessToken = setAccessToken
exports.getRecentlyAddedTracksPlaylist = getRecentlyAddedTracksPlaylist
exports.setOwnerID = setOwnerID
