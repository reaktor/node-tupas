module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    express: {
      options: {
        port: 8080,
        server : 'sample/app.js',
        hostname : "localhost"
      }
    },

    casperjs: {
        options: {
          async: {
            parallel: true
          },
          casperjsOptions: ['--ignore-ssl-errors=true']

        },
        files: ['tests/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-casperjs');

  // Default task(s).
  grunt.registerTask('default', ['express-server', 'casperjs']);

};