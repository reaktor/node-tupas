var x = require('casper').selectXPath;
var config = require("../config.json");
casper.test.begin("Aktia Authentication", 1, function(test) {
  casper.start('https://localhost:' + config.port , function() {
    this.click("#aktia-login");
  });


  casper.then(function() {

    this.fill('form[name="LoginForm"]', {
      "USERNAME" : "11111111",
      "PASSWORD" : "123456"
    }, true);

  });

  casper.then(function(){
    this.fill('form[name="SecurityKeyForm"]', {
      "SECURITYKEY" : '123456'
    }, true);
  });

  casper.then(function() {
    this.click(x("//button[.='Hyväksy']"));
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Aktia");
  }, function(){}, 10000);


  casper.run(function() {
     test.done();
  });
});
