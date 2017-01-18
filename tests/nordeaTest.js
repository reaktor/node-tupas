var config = require("../config.json");

casper.options.waitTimeout = 10000;

casper.test.begin("Nordea Authentication", 1, function(test) {
  var loginForm = 'form[name="A236312Y"]';

  casper.start('https://localhost:' + config.port, function() {
    this.click("#nordea-login");
  });

  casper.waitForSelector(loginForm, function() {
    this.fill(loginForm, {
      'A02Y_USERID': '123456',
      'A02Y_IDNBR': '1111'
    }, true);
  });

  casper.then(function() {
    this.click('input[type="submit"]');
  });

  casper.then(function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Nordea");
  });

  casper.run(function() {
    test.done();
  });
});
