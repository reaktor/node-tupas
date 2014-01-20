var express = require('express');
var tupas = require('./tupas');
var app = express();

tupas.initialize("foobar", app, "/tupas", handler);

function handler(tupasStatus, responseData) {
  console.log(tupasStatus);
  console.log(responseData);
}

app.listen(8080)
