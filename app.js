/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var musetools = require('./muse-tools');
var playlist_tools = require('./playlist-tools');
var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri =  process.env.REDIRECT_URI; // Your redirect uri

var a_token = ''
var r_token = ''

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}


app.get('/search', function(req, res) {
  res.redirect('/searcher#' +
  querystring.stringify({
    access_token: req.query.access_token,
    refresh_token: req.query.refresh_token
  }));
});

app.get('/player', function(req, res) {
  res.redirect('/grouper#' +
    querystring.stringify({
      access_token: a_token,
      refresh_token: r_token
    })
  );
});

app.get('/grouper', function(req, res) {
  res.sendFile(__dirname + '/public/player.html');
})

app.get('/searcher', function(req, res) {
  res.sendFile(__dirname + '/public/search.html');
})

app.get('/playlists', function(req, res) {
  res.sendFile(__dirname + '/public/playlists.html');
})

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-playback-state streaming user-read-birthdate user-read-email user-read-email playlist-read-private playlist-modify-private playlist-read-collaborative playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body)
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        a_token = access_token;
        r_token = refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/playlists', function(req, res) {
  var access_token = req.query.access_token;
  var username = req.query.username;
  musetools.setAccessToken(access_token);
  musetools.getRecentlyAddedTracksPlaylist();
});

app.get('/recentlyAdded', function(req, res) {
  var access_token = req.query.access_token;
  var playlistName = req.query.playlistName;
  var excludedPlaylists = req.query.excludedPlaylists;
  var weeksback = req.query.weeksback;

  var days = parseInt(weeksback);

  /*
  var userID = playlist_tools.getUserID(access_token, function(user_id, error) {
    if (!error) {
      res.send({
        'userID': user_id
      });
    }
  });
  */

  playlist_tools.createRecentlyAddedPlaylist(access_token, excludedPlaylists, playlistName, days, function(data) {
    res.send({
      'data': data
    });
  });


});

app.get('/trackdetail', function(req, res) {
  var access_token = req.query.access_token;
  var trackID = req.query.track_id;
  musetools.setAccessToken(access_token);

});

console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);
