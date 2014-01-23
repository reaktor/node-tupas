var config = require("../config.json");

casper.test.begin("Handelsbanken Authentication", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#handelsbanken-login");
  });

  casper.then(function() {

    this.evaluate(function() {
      document.getElementById('focusField').value = '11111111';
    });

    this.evaluate(function() {
      document.getElementById('PASSWORD').value = '123456';
    });

    this.click('button[type="submit"]');

  });

  casper.then(function(){
    this.fill('form[name="SecurityKeyForm"]', {
      "SECURITYKEY" : '123456'
    }, true);
  });

  casper.then(function() {
    this.click('button[class="SubmitButton"]');
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Handelsbanken");
  }, function(){}, 10000);


  casper.run(function() {
    test.done();
  });
});