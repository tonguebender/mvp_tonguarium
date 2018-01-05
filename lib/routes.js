let tongues = require('./tongues');

module.exports = function(server) {

  server.get('/ping', (req, res, next) => {
    res.send(200, {
      status: 'ok',
      pong: (new Date()).toLocaleString()
    });

    return next();
  });

  server.get('/tongues', (req, res, next) => {
    res.send(200, {
      status: 'ok',
      data: tongues.tongues
    });

    return next();
  });

  server.get('/tongue/:name/:id', (req, res, next) => {
    console.log('>', req.url);
    const idParam = req.params.id;
    const id = idParam.trim().toLocaleLowerCase();
    const nameParam = req.params.name;
    const tongue = nameParam.trim().toLocaleLowerCase();

    tongues
      .get(tongue, id)
      .then(data => {
        res.send(200, {
          status: 'ok',
          data
        });

        next();
      }, err => {
        if (err.error === 'not found') {
          res.send(404, {
            status: 'error',
            error: 'Id is not found'
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
