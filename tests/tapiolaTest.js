casper.test.begin("Tapiola Authentication", 1, function(test) {
  casper.start('https://localhost:8080', function() {
   this.click("#tapiola-login");
  });

  casper.then(function() {
    this.fill('form[name="loginForm"]', {
      'username': '12345678',
      'password': '123TAP'
    }, true);
  });

  casper.then(function(){
    this.fill('form[name="loginPinForm"]', {
      'pinCode': '9999'
    }, true);
  });

  casper.then(function() {
    this.click('button[type="submit"]');
  });

  casper.then(function(){
    test.assertExists("#success");
    this.echo("Succesfully authenticated with Tapiola");
   });

  casper.run();
});



