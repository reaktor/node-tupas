var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , app = express()
  , _ = require('underscore')._
  , moment = require("moment");

var globalOpts = {
  appHandler: app,
  hostUrl: "https://localhost:8080",
  callback: handler
};

var tupas = require(__dirname + '/../tupas').create(globalOpts);

tupas.on('success', function (data, res) {
  console.log(data);
  res.send(data);
});

tupas.on('mac-check-failed', function (data, res) {
  console.log(data);
  res.send("MAC check failed.");
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
  key: fs.readFileSync(__dirname + '/certs/server.key'),
  cert: fs.readFileSync(__dirname + '/certs/server.crt'),
  ca: fs.readFileSync(__dirname + '/certs/ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app.get('/', function (req, res) {
  var now = moment().format('YYYYMMDDhhmmss');
  var requestId = now + "123456";

  var bankForms = _.map(tupas.banks, function (bankId) {
    return tupas.tupasButton(bankId, 'FI', requestId);
  });
  var html = "<html><body><div class='bank-buttons'>" + bankForms.join("") + "</div></body></html>";

  res.send(html);
});

https.createServer(sslOptions, app).listen(8080);
