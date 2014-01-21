var express = require('express');
var tupas = require('./tupas');
var app = express();

tupas.initialize("xxxxxxxxxxx", app, "https://localhost:8080", "/tupas", handler);

function handler(tupasStatus, responseData) {
  console.log(tupasStatus);
  console.log(responseData);
}

app.listen(8080)
