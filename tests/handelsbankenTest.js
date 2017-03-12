/* global document, casper */
var config = require('../config.json');

casper.options.waitTimeout = 10000;

casper.test.begin('Handelsbanken Authentication', 1, function (test) {
  var verificationForm = 'form[name="SecurityKeyForm"]';

  casper.start('https://localhost:' + config.port, function () {
    this.click('#handelsbanken-login');
  });

  casper.then(function () {
    this.evaluate(function () {
      document.getElementById('focusField').value = '11111111';
    });

    this.evaluate(function () {
      document.getElementById('PASSWORD').value = '123456';
    });

    this.click('button[type="submit"]');
  });

  casper.waitForSelector(verificationForm, function () {
    this.fill(verificationForm, {
      'SECURITYKEY': '123456'
    }, true);
  });

  casper.then(function () {
    this.click('button[class="SubmitButton"]');
  });

  casper.waitForSelector('#success', function () {
    test.assertExists('#success');
    this.echo('Succesfully authenticated with Handelsbanken');
  });

  casper.run(function () {
    test.done();
  });
});
