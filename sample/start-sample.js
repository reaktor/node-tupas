var app = require('./app');
var config = require('../config.json');
console.log('Running on https://localhost:8081/'); // port can be changed in '../config.json'
app.listen(config.port);
