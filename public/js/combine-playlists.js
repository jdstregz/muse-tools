document.getElementById("combinePlaylistsSection").innerHTML = `
<div class="modal fade bd-example-modal-lg" id="combinePlaylistsModal" tabindex="-1" role="dialog" aria-labelledby="exampleModal3Label" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModal3Label">Playlist Merge</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>
          Well I dunno about you but I have like twelve different emo playlists and at least three thousand 'chill' playlists. So for the sake of cleaning
          this tool allows you to select the playlists you want to combine and create/update a playlist with those tracks.
        </p>
        <div class="alert alert-warning" role="alert">
          <strong>Warning!</strong> If you specify a playlist name that already exists in your profile, it will be overwritten!
        </div>
        <form class="mt-2">
          <div class="form-group">
            <label for="playlistsToCombine"><b>Playlists to combine (seperate by commas) [e.i. Streger Chill 2019, Streger Chillax Crusty Jams, Playlist3Example]</b></label>
            <input type="text" class="form-control" id="playlistNamesToCombine" placeholder="Playlist Name">
          </div>
          <div class="form-group">
            <label for="playlistToCreate"><b>New Playlist Name</b></label>
            <input type="text" class="form-control" id="playlistToCreate">
          </div>
        </form>
        <button type="button" class="btn btn-success" id="combinePlaylists">Combine</button>
        <div id="combineProgressBar">
          <p class="mt-3">
            Loading... If you have large playlists this will take a minute...
          </p>
          <div class="progress mt-3" >
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
          </div>
        </div>
        <div id="CombineMessage" class="mt-3">
          <p id="messageCombine">

          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>

      </div>
    </div>
  </div>
</div>
`;

$("#CombineMessage").hide();
$("#combineProgressBar").hide();

document.getElementById("combinePlaylists").addEventListener(
  "click",
  function(event) {
    document.getElementById("combinePlaylists").classList.add("disabled");
    $("#CombineMessage").hide();
    var playlistName = document.getElementById("playlistToCreate").value;
    var includedPlaylists = document.getElementById("playlistNamesToCombine")
      .value;
    $.ajax({
      url: "/combinePlaylists",
      data: {
        access_token: access_token,
        playlistName: playlistName,
        includedPlaylists: includedPlaylists
      }
    })
      .done(function(data) {
        if (data.data == "error") {
          document.getElementById("message").innerHTML = "An error occured.";
          $("#CombineMessage").show();
        } else if (data.data == "success") {
          document.getElementById("message").innerHTML =
            "Success!! Check your spotify!";
          $("#CombineMessage").show();
        }
        $("#combineProgressBar").hide();
        document
          .getElementById("combinePlaylists")
          .classList.remove("disabled");
      })
      .fail(function(jqXHR, textStatus) {
        console.log(jqXHR);
        document.getElementById("message").innerHTML =
          "The request failed: " + textStatus;
        $("#CombineMessage").show();
        $("#combineProgressBar").hide();
        document
          .getElementById("combinePlaylists")
          .classList.remove("disabled");
      });
  },
  false
);
