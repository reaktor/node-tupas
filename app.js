var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , tupas = require('./tupas')
  , app = express();

tupas.initialize(app, "https://localhost:8080", handler);

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

app.get('/', function (req, res) {
  var html = "<html><body>" +
             tupas.tupasForm('danskebank', 'FI', 'xxxxxx', 'xxxxxx') +
             "</body></html>";
  res.send(html);
});

https.createServer(sslOptions, app).listen(8080);
