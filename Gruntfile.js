(function() {
	'use strict';

	module.exports = function (grunt) {
		grunt.task.loadNpmTasks('grunt-sass');
		grunt.task.loadNpmTasks('grunt-contrib-copy');
		grunt.task.loadNpmTasks('grunt-contrib-clean');
		grunt.task.loadNpmTasks('grunt-autoprefixer');
		grunt.task.loadNpmTasks('grunt-contrib-watch');
		grunt.task.loadNpmTasks('assemble');

		grunt.initConfig({
			sass: {
				options: {
					outputStyle: 'nested',
					sourceMap: false
				},
				dist: {
					options: {
						outputStyle: 'nested',
						sourceMap: false
					},
					files: {
						'dist/css/styles.css': 'tmp/styles.scss'
					}
				}
			},
			clean: {
				options: {
					force: true
				},
				dist: {
					files: [
						{
							src: ['dist']
						}
					]
				},
				tmp: {
					files: [
						{
							src: ['tmp']
						}
					]
				}
			},
			autoprefixer: {
				options: {
					browsers: ['last 2 versions']
				},
				dev: {
					options: {
						map: true
					},
					src: 'dist/css/*.css'
				}
			},
			watch: {
				scss: {
					files: ['sources/sass/**/*.scss'],
					tasks: ['css']
				},
				assemble: {
					files: ['sources/assemble/**/*.hbs', 'component-helpers/assemble/**/*.hbs', 'sources/data/**/*.json'],
					tasks: ['assemble']
				}
			},
			assemble: {
				options: {
					data: 'sources/data/**/*.{json,yml}',
					helpers: ['component-helpers/assemble/helper/*.js'],
					layoutdir: 'component-helpers/assemble/layouts/',
					partials: ['sources/assemble/**/*.hbs']
				},
				dev: {
					options: {
						production: false
					},
					files: [
						{
							cwd: 'component-helpers/assemble/pages/',
							dest: 'dist',
							expand: true,
							flatten: true,
							src: ['**/*.hbs']
						}
					]
				}
			},
			copy: {
				js: {
					cwd: 'component-helpers/js/',
					dest: 'dist/js',
					expand: true,
					src: ['**/*.js']
				}
			}
		});

		grunt.registerTask( 'css', ['clean:tmp', 'generate-tmp-styles-scss', 'sass', 'autoprefixer']);
		grunt.registerTask('build', [ 'clean:dist', 'copy:js', 'css', 'assemble']);
		grunt.registerTask('default', ['build', 'watch']);

		grunt.registerTask( 'generate-tmp-styles-scss', 'Generate styles tmp file', function() {
			var resultContent = grunt.file.read( 'component-helpers/sass/styles_config.scss' );

			//get rid of ../../-prefix, since libsass does not support them in @import-statements+includePaths option
			resultContent = resultContent.replace( /\"\.\.\/\.\.\//g, '"' );

			var importMatches = resultContent.match( /^@import.+\*.*$/mg );


			if ( importMatches ) {
				importMatches.forEach( function(initialMatch) {
					// remove all " or '
					var match = initialMatch.replace( /["']/g, '' );
					// remove the preceeding @import
					match = match.replace( /^@import/g, '' );
					// lets get rid of the final ;
					match = match.replace( /;$/g, '' );
					// remove all whitespaces
					match = match.trim();

					// get all files, which match this pattern
					var files = grunt.file.expand(
						{
							'cwd': 'node_modules/rb_layout_defaults/sources/',
							'filter': 'isFile'
						},
						match
					);

					var replaceContent = [];

					files.forEach( function(matchedFile) {
						replaceContent.push( '@import "node_modules/rb_layout_defaults/sources/'  + matchedFile + '";' );
					} );

					resultContent = resultContent.replace( initialMatch, replaceContent.join( "\n" ) );
				} );
			}
			grunt.file.write( 'tmp/styles.scss', resultContent );
		} );
	};
})();
