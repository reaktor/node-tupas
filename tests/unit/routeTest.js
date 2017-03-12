/* global describe, it */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var app = require('../../sample/app');
var request = require('supertest');

describe('POST tupas/ok', function () {
  it('to handle invalid post parameters', function (done) {
    request(app)
      .post('/tupas/ok')
      .expect(400, done);
  });
});
