/* global casper */
var config = require('../config.json');

casper.options.waitTimeout = 10000;

casper.test.begin('OP Authentication', 1, function (test) {
  var loginForm = 'form[name="lomake"]';
  var verificationForm = 'form[name="lomake"]';

  casper.start('https://localhost:' + config.port, function () {
    this.click('#op-login');
  });

  casper.waitForSelector(loginForm, function () {
    this.fill(loginForm, {
      'id': '123456',
      'pw': '7890'
    }, true);
  });

  casper.waitForSelector(verificationForm, function () {
    this.fill(verificationForm, {
      'avainluku': '9999'
    }, true);
  });

  casper.then(function () {
    this.click('input[type="submit"]');
  });

  casper.waitForSelector('#success', function () {
    test.assertExists('#success');
    this.echo('Succesfully authenticated with OP');
  });

  casper.run(function () {
    test.done();
  });
});
