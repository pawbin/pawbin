let socket = io('/biome/grassland');

let i = 0;
$('#testbutton').click(function(e){
  socket.emit('test event', i++);
});

socket.on('newSilhouette', (silhouette) => {
  notify({content: `new silhouette: ${silhouette._id}`, type: 'basic'});
  $('.silhouettes').append(`<div class="silhouette" silhouetteid="${silhouette._id}"><img src="${silhouette.creatureRef.creatureTypeRef.images.full_lg}"></div>`);
});

socket.on('caughtSilhouette', (silhouette) => {
  $(`.silhouette[silhouetteid="${silhouette.id}"]`).css({opacity: 0.4}).addClass('taken');
});

$('body').on('click', '.silhouette:not(.taken)', function(e){
  socket.emit('catchSilhouette', $(this).attr('silhouetteid'));
  /*
  api.catchSilhouette('grassland', $(this).attr('silhouetteid')).then(s => {
    console.log('caught', s);
    $(this).remove();
  });
  */
});