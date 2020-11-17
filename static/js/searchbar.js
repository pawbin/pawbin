// get every island that has at least one search input in it
$(".island").filter(function(i) {
  return $("input.js-search", this).length >= 1;
}).each(function(i) {
  // save all of the searchable items in this island
  let $searchItems = $(".js-search-item", this);
  // every time a keypress finishes in the input, hide irrelevant search items
  $("input.js-search", this).on("input", (e) => {
    // get whatever's currently typed in the input
    let currentInput = $(e.target).val().toLowerCase();
    // apply hidden class to each item that doesn't fit current input
    $searchItems.each(function(i) {
      let searchCriteria = $(".js-search-criteria", this).text();
      if(!searchCriteria.toLowerCase().includes(currentInput)) {
        $(this).addClass("hidden");
      } else {
        $(this).removeClass("hidden");
      }
    });
  });
});