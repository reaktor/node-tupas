var config = require("../config.json");

casper.test.begin("Nordea Authentication", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#nordea-login");
  });

  casper.then(function() {
    this.fill('form[name="A236312Y"]', {
      'A02Y_USERID': '123456',
      'A02Y_IDNBR': '1111'
    }, true);
  });

  casper.then(function() {
    this.click('input[type="submit"]');
  });

  casper.then(function(){
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Nordea");
  });

  casper.run();
});
