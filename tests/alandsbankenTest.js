var config = require("../config.json");

casper.test.begin("Alandsbanken", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#alandsbanken-login");
  });

  casper.then(function() {
    this.fill('form[name="loginForm"]', {
      'username': '12345678',
      'password': '1234'
    }, true);
  });

  casper.then(function(){
    this.fill('form[name="loginPinForm"]', {
      'pinCode': '1234'
    }, true);
  });

  casper.then(function() {
    this.click('button[type="submit"]');
  });

  casper.then(function(){
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Alandsbanken");
  });

  casper.run(function() {
    test.done();
  });
});