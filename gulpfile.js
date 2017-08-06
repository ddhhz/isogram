'use strict';

var gulp = require('gulp');
var p = require('gulp-load-plugins')();

var handle = function(err) {
  console.log(err); this.emit('end');
};

gulp.task('server', function() {
  return p.connect.server({
    root: 'dist',
    port: 8000,
    livereload: true
  });
});

gulp.task('sass', function() {
  return gulp.src('src/style/main.scss')
    .pipe(p.sass({outputStyle: 'compressed'}))
    .on('error', handle)
    .pipe(gulp.dest('dist'))
    .pipe(p.connect.reload());
});

gulp.task('bower', function() {
    return gulp.src('./bower.json')
        .pipe(p.mainBowerFiles())
        .pipe(gulp.dest('./src/libs'));
});
gulp.task('scripts', ['bower'], function() {
  return gulp.src(['src/scripts/**/*.js', 'src/libs/**/*.js'])
    .pipe(p.uglify())
    .on('error', handle)
    .pipe(p.concat('main.js'))
    .on('error', handle)
    .pipe(gulp.dest('dist'))
    .pipe(p.connect.reload());
});

gulp.task('pug', function() {
  return gulp.src('src/views/index.pug')
    .pipe(p.pug({pretty: false}))
    .on('error', handle)
    .pipe(gulp.dest('dist'))
    .pipe(p.connect.reload());
});

gulp.task('assets', function() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('dist/'))
});

gulp.task('watch', function() {
  gulp.watch('src/views/**/*.pug', ['pug']);
  gulp.watch('src/style/*.scss', ['sass']);
  gulp.watch('src/scripts/*.js', ['scripts']);
});

gulp.task('deploy', () => {
  return gulp.src('./dist/**/*')
    .pipe(p.ghPages());
});

gulp.task('default', ['assets', 'pug', 'sass', 'scripts', 'server', 'watch']);
