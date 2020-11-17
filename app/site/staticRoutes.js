
module.exports = (app) => {
  app.get('/js/renderjson.js', (req, res) => {
    res.sendFile('/app/node_modules/renderjson/renderjson.js');
  });
}