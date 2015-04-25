module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'Gruntfile.js',
        'lib/**/*.js',
        'test/**/*.js'
      ]
    },

    mochaTest: {
      all: [
        'test/**/*.js'
      ]
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', [
    'jshint', 'mochaTest'
  ]);
  grunt.registerTask('test', [
    'mochaTest'
  ]);
};