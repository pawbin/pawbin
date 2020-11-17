let socket = io('/test');

let i = 0;
$('#testbutton').click(function(e){
  socket.emit('test event', i++);
});

socket.on('test event', (e) => {
  notify({content: `new message from ${e.from}: ${e.message}`, type: 'basic'});
});