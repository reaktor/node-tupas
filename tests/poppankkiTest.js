var config = require('../config.json');

casper.test.begin('POP Pankki Authentication', 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click('#poppankki-login');
  });

  casper.then(function() {
    this.fill('form[name="LoginForm"]', {
      "USERNAME" : "11111111",
      "PASSWORD" : "123456"
    }, true);
  });

  casper.then(function () {
    this.fill('form[name="SecurityKeyForm"]', {
      "SECURITYKEY" : '123456'
    }, true);
  });

  casper.then(function () {
    this.click('button.SubmitButton');
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with POP Pankki");
  }, function(){}, 10000);

  casper.run(function() {
    test.done();
  });
});

casper.test.begin("Test auth cancelation", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#poppankki-login");
  });

  casper.then(function() {
    this.click('button.CancelButton');
  });

  casper.waitForSelector('#cancel', function() {
    test.assertExists("#cancel");
    this.echo("Succesfully canceled authentication");
  }, function(){}, 10000);

  casper.run(function() {
    test.done();
  });

});