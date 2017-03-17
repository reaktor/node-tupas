/* global casper */
var config = require('../config.json');

casper.options.waitTimeout = 10000;

casper.test.begin('Saastopankki Authentication', 1, function (test) {
  var loginForm = 'form[name="LoginForm"]';
  var verificationForm = 'form[name="SecurityKeyForm"]';

  casper.start('https://localhost:' + config.port, function () {
    this.click('#saastopankki-login');
  });

  casper.waitForSelector(loginForm, function () {
    this.fill(loginForm, {
      'USERNAME': '11111111',
      'PASSWORD': '123456'
    }, true);
  });

  casper.waitForSelector(verificationForm, function () {
    this.fill(verificationForm, {
      'SECURITYKEY': '123456'
    }, true);
  });

  casper.then(function () {
    this.click('button.SubmitButton');
  });

  casper.waitForSelector('#success', function () {
    test.assertExists('#success');
    this.echo('Succesfully authenticated with Saastopankki');
  });

  casper.run(function () {
    test.done();
  });
});

casper.test.begin('Test auth cancelation', 1, function (test) {
  casper.start('https://localhost:' + config.port, function () {
    this.click('#saastopankki-login');
  });

  casper.then(function () {
    this.click('button.CancelButton');
  });

  casper.waitForSelector('#cancel', function () {
    test.assertExists('#cancel');
    this.echo('Succesfully canceled authentication');
  });

  casper.run(function () {
    test.done();
  });
});
