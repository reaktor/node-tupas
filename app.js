var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , tupas = require('./tupas')
  , app = express();

var globalOpts = {
  appHandler: app,
  hostUrl: "https://localhost:8080",
  callback: handler
};

var bankOpts = [
  {
    id: 'danskebank',
    vendorId: 'xxxxxx',
    checksumKey: 'xxxxxx'
  },
  {
    id: 'nordea',
    vendorId: 'yyyyyy',
    checksumKey: 'yyyyyy'
  },
  {
    id : "oma",
    name : "Oma pankki"
  }
];

tupas.initialize(globalOpts, bankOpts);

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
             tupas.tupasForm('danskebank', 'FI') +
             "</body></html>";
  res.send(html);
});

https.createServer(sslOptions, app).listen(8080);
