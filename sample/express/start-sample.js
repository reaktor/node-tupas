var app = require('./app');
var config = require('../../config.json');
app.listen(config.port, err => {
  if (err) {
    console.error(err);
  } else {
    console.log('Started sample server at https://localhost:' + config.port);
  }
});
