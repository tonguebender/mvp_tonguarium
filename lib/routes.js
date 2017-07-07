module.exports = function(server) {
  server.get('/ping', (req, res, next) => {
    res.send(200, {
      status: 'ok',
      pong: (new Date()).toLocaleString()
    });

    return next();
  });
};
