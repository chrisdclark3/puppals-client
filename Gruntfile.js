module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [ 'sass/*.scss' ],
				dest: 'sass/styles.scss',
			}
		},
		watch {
			sass: {
				dist: {
					files: { 'css/styles.css':'sass/styles.scss' }
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default',['watch','concat','sass']);
};