var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , tupas = require('./tupas')
  , app = express();

tupas.initialize("xxxxxxxxxxx", app, "https://localhost:8080", "/tupas", handler);

function handler(tupasStatus, responseData) {
  console.log(tupasStatus);
  console.log(responseData);
}

var sslOptions = {
  key: fs.readFileSync('../../certs/server.key'),
  cert: fs.readFileSync('../../certs/server.crt'),
  ca: fs.readFileSync('../../certs/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

https.createServer(sslOptions, app).listen(8080);
