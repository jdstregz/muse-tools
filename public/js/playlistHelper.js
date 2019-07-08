const modalTemplate = (openID, title, description) => {
  document.getElementById(openID).innerHTML = `
<div class="modal fade bd-example-modal-lg" id="${openID}Modal" tabindex="-1" role="dialog" aria-labelledby="exampleModal3Label" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModal3Label">${title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div id="${openID}Description">
        <form class="mt-2" id="${openID}Form">
        </form>
        <div id="${openID}Progress">
        </div>
        <div id="${openID}Messages" class="mt-3">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`;
};
