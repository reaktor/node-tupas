module.exports = function(grunt) {

  var config = require("./config.json");
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    express: {
      options: {
        port: config.port,
        server : 'sample/app.js',
        hostname : "localhost"
      }
    },

    casperjs: {
        options: {
          async: {
            parallel: false
          },
          casperjsOptions: ['--ignore-ssl-errors=true']

        },
        files: ['tests/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['tests/unit/*.js']
      }
    }

  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Default task(s).
  grunt.registerTask('default', ['express-server', 'casperjs', 'mochaTest']);

};