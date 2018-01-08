let restify = require('restify');
let registerRoutes = require('./routes');

let server = restify.createServer({
  name: 'Tonguarium'
});

server.use(restify.plugins.bodyParser());
server.use((req, res, next) => {
  console.log(`> ${req.method} ${req.url}`);
  next();
});

registerRoutes(server);

server.listen(process.env.PORT || 9090, function() {
  console.log(`${server.name} listening at ${server.url}`);
});
