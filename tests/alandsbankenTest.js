/* global casper */
var config = require('../config.json');

casper.options.waitTimeout = 10000;

casper.test.begin('Alandsbanken', 1, function (test) {
  var loginForm = 'form[name="loginForm"]';
  var verificationForm = 'form[name="loginPinForm"]';

  casper.start('https://localhost:' + config.port, function () {
    this.click('#alandsbanken-login');
  });

  casper.waitForSelector(loginForm, function () {
    this.fill(loginForm, {
      'username': '12345678',
      'password': '1234'
    }, true);
  });

  casper.waitForSelector(verificationForm, function () {
    this.fill(verificationForm, {
      'pinCode': '1234'
    }, true);
  });

  casper.then(function () {
    this.click('button[type="submit"]');
  });

  casper.then(function () {
    test.assertExists('#success');
    this.echo('Succesfully authenticated with Alandsbanken');
  });

  casper.run(function () {
    test.done();
  });
});
