var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    connect = require('gulp-connect');

var paths = {
    src: './src',
    dist: './dist',
    js: './src/static/js/**/*.js',
    html: './src/index.html'
};

gulp.task('build:js', function() {
    gulp.src(paths.src + '/static/js/app.js')
        .pipe(browserify({
            transform: ['debowerify']
        }))
        .on('error', function() {
            console.log(arguments)
        })
        .pipe(gulp.dest(paths.dist + '/static/js'));
});

gulp.task('build:html', function() {
    gulp.src(paths.html)
        .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['build:js', 'build:html']);

gulp.task('watch', function() {
    gulp.watch(paths.js, ['build:js']);
    gulp.watch(paths.html, ['build:html']);
});

gulp.task('server', function() {
    connect.server({
        root: paths.dist,
        livereload: true,
        port: 8082
    });
});

gulp.task('default', ['server', 'build', 'watch']);

