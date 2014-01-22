var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , app = express()
  , _ = require('underscore')._;

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

var tupas = require('./tupas').create(globalOpts, bankOpts);

tupas.on('success', function (data, res) {
  console.log(data);
  res.send(data);
});

tupas.on('cancel', function (res) {
  console.log("Cancelled");
  res.send("Tupas identification was cancelled.")
});

tupas.on('reject', function (res) {
  console.log("Rejected.");
  res.send("Identification failed.")
});

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
  var bankForms = _.map(tupas.banks, function (bankId) {
    return tupas.tupasButton(bankId, 'FI');
  });
  var html = "<html><body><div class='bank-buttons'>" + bankForms.join("") + "</div></body></html>";

  res.send(html);
});

https.createServer(sslOptions, app).listen(8080);
