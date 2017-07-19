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

  server.get('/dict/:dictName/:lemma', (req, res, next) => {
    console.log('>', req.url);
    let lemma = req.params.lemma;
    lemma = lemma.trim().toLocaleLowerCase();

    dicts
      .getDefinitions(lemma)
      .then(definitions => {
        res.send(200, {
          status: 'ok',
          data: definitions
        });

        next();
      }, err => {
        if (err.error === 'not found') {
          res.send(404, {
            status: 'error',
            error: 'Lemma is not found'
          });
        } else {
          res.send(500, {
            status: 'error',
            error: 'Internal server error'
          });
        }

        next();
      });
  });

};
