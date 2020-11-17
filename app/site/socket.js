const gameSetup = require("../game/setup.js");
let gameHelper;
gameSetup.then(game => {
  gameHelper = require("../game/gameHelper.js")(game);
});

let io;
module.exports = {
  init(ioServ){
    io = ioServ;
    let testSpace = io.of('/test');
    testSpace.on('connection', (socket) => {
      console.log('connection:', socket.id, /*socket.handshake.headers.cookie*/);
      socket.on('test event', (message) => {
        console.log(socket.id, ':', {message})
        testSpace.emit('test event', {message, from: socket.id});
      });
    });

    let grasslandSpace = io.of('/biome/grassland');
    grasslandSpace.on('connection', (socket) => {
      //console.log('grassland connection:', socket.id, socket.request.session);
      socket.on('catchSilhouette', (id) => {
        let user = socket.request.session.passport.user;
        //console.log(socket.id, socket.handshake.headers.cookie, ':');
        //console.log(user, id);
        gameSetup.then(() => {
          gameHelper.catchSilhouette(user, 'grassland', id);
          grasslandSpace.emit('caughtSilhouette', {id});
        });
      });
    });
  },
  getIo(){
    return io;
  }
}