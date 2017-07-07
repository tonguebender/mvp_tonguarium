let dicts = require('./dicts/dicts');

module.exports = function(server) {

  server.get('/ping', (req, res, next) => {
    res.send(200, {
      status: 'ok',
      pong: (new Date()).toLocaleString()
    });

    return next();
  });

  server.get('/dicts', (req, res, next) => {
    res.send(200, {
      status: 'ok',
      data: dicts.list
    });

    return next();
  });

  server.get('/dict/:dictName/:word', (req, res, next) => {
    console.log('>', req.params);
    res.send(200, {
      status: 'ok',
      data: dicts.get({ dictName: req.params.dictName, word: req.params.word })
    });

    return next();
  });

};
