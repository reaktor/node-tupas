var x = require('casper').selectXPath;
var config = require("../config.json");
casper.test.begin("Aktia Authentication", 1, function(test) {
  casper.start('https://localhost:' + config.port , function() {
    this.click("#aktia-login");
  });


  casper.then(function() {

    this.fill('form[name="Login"]', {
      "IDToken1" : "12345678",
      "IDToken2" : "123456"
    }, true);

  });

  casper.then(function(){
    this.fill('form[name="Login"]', {
      "IDToken1" : '1234'
    }, true);
  });

  casper.then(function() {
    this.click('input[value="Hyväksy"]');
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Aktia");
  }, function(){}, 10000);


  casper.run(function() {
     test.done();
  });
});

casper.test.begin("Test auth cancelation", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#aktia-login");
  });

  casper.then(function() {
    this.click(x("//a[.='Keskeytä']"));
  });

  casper.waitForSelector('#cancel', function() {
    test.assertExists("#cancel");
    this.echo("Succesfully canceled authentication");
  }, function(){}, 10000);

  casper.run(function() {
    test.done();
  });

});