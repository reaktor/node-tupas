const fs = require('fs');
const hapi = require('hapi');

const config = require('../../config');

const server = new hapi.Server();

const tls = {
  key: fs.readFileSync(__dirname + '/certs/server.key'),
  cert: fs.readFileSync(__dirname + '/certs/server.crt'),
  ca: fs.readFileSync(__dirname + '/certs/ca.crt')
};

server.connection({
  host: 'localhost',
  port: config.port,
  tls,
});

server.register([
  require('inert'),
  require('./tupas-plugin')
])
  .then(() => {
    return server.start();
  })
  .then(() => {
    console.log('Server running at:', server.info.uri);
  })
  .catch((err) => {
    console.error('Error', err);
  });
