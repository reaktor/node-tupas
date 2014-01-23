casper.test.begin("OP Authentication", 1, function(test) {
  casper.start('https://localhost:8080', function() {
    this.click("#op-login");
  });

  casper.then(function() {
    this.fill('form[name="lomake"]', {
      'id': '123456',
      'pw': '7890'
    }, true);
  });

  casper.then(function(){
    this.fill('form[name="lomake"]', {
      'avainluku': '9999'
    }, true);
  });

  casper.then(function() {
    this.click('input[type="submit"]');
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with OP");
  }, function(){}, 10000);

  casper.run();
});
