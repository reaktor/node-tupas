var request = require('supertest');
var express = require('express');

var app = express();

var globalOpts = {
  appHandler: app,
  hostUrl: "https://localhost:3000"
};

var tupas = require(__dirname + '/../../tupas').create(globalOpts);

tupas.on('success', function (req, res) {
  res.status(200).send('success');
});

tupas.on('mac-check-failed', function (req, res) {
  res.status(400).send('mac-check-failed');
});

describe('POST tupas/ok', function(){
  it('to handle invalid post parameters and trigger mac-check-failed', function(done){
    request(app)
      .post('/tupas/ok')
      .expect(400)
      .expect('mac-check-failed')
      .end(done);
  });
});
