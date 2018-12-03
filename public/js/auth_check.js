/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function changeButtonNavLayout(selected) {
  if (selected == 'home') {
    document.getElementById('homepage-nav-link').className = "btn btn-outline-light mr-1"
  }
}

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ( e = r.exec(q) ) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

var params = getHashParams();

var access_token = params.access_token,
  refresh_token = params.refresh_token,
  error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          $('#login').hide();
          $('#loggedin').show();
        },
        error: function(response) {
          $('#login').show();
          $('#loggedin').hide();
        }
      });
    } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();

    }
  }

  function hideShowNavElements(hide, name) {
    if (!$("#nav").size()) {
      window.requestAnimationFrame(hideShowNavElements);
    } else {
      if (hide == "hide") {
        console.log("hit")
        $('#login').show();
        $('#loggedin').hide();
        $('#log-in-top').show();
        $('#log-out-top').hide();
        $('#name').hide();
      } else if (hide == "show") {
        console.log("show")
        $('#login').hide();
        $('#loggedin').show();
        $('#log-in-top').hide();
        $('#log-out-top').show();
        $('#name').show();
        document.getElementById("name").innerHTML = name;
      }

      if(access_token) {
        document.getElementById('muse-tools-title').href = '/#access_token=' + access_token + '&refresh_token=' + refresh_token;
      } else {
        document.getElementById('muse-tools-title').href = '/';
      }

      document.getElementById('search-nav-link').addEventListener('click', function() {
        window.location = '/searcher#access_token=' + access_token + '&refresh_token=' + refresh_token;
      }, false);

    }
  }
