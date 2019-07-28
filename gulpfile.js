'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var config = require('./gulp.config')();
var wiredep = require('wiredep');
var livereload = require('gulp-livereload');

var paths = {
    appScripts: 'erp/app/**/*.js'
};

gulp.task('scripts', function () {
    return gulp.src([paths.appScripts])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter(require('jshint-stylish')))
        .pipe(plugins.size());
});

gulp.task('watch', ['serve'], function () {
    livereload.listen();

    gulp.watch([
        'erp/**/*.html',
        'erp/app/**/*.js',
        'erp/styles/*.css'
    ]).on('change', function (file) {
        console.log('File changed: ' + file.path);
        livereload.changed(file.path); //YES (by itself)
        //livereload.reload(); //YES (by itself)
    });

    gulp.watch(paths.appScripts, ['scripts']);
});

gulp.task('injectjs', function(){
    var target = gulp.src('./erp/public/index.html');
    var sources = gulp.src([paths.appScripts]);

    return target.pipe(plugins.inject(sources, {relative: true}))
        .pipe(gulp.dest('./erp'));

});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var serveStatic = require('serve-static')
    
    var app = connect()
        .use(serveStatic('erp'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('wiredep', function () {
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(plugins.inject(gulp.src(config.js), { relative: true }))
        .pipe(gulp.dest('erp'));
});