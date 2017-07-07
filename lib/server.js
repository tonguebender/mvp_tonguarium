let restify = require('restify');
let registerRoutes = require('./routes');

let server = restify.createServer({
  name: 'Tonguarium',
  url: 'localhost',
  path: 'localhost',
  httpServerOptions: {
    url: 'localhost'
  }
});

registerRoutes(server);

server.listen(process.env.PORT || 9090, function() {
  console.log(`${server.name} listening at ${server.url}`);
});
