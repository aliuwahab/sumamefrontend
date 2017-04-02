// If the app environment is not set, we default to development
var ENV = process.env.STAGE || 'development';

// Here, we use dotenv  to load our env vars in the .env, into process.env
if (ENV === 'development') {
  require('dotenv').load();
}

// Our dependencies and paths of files we use
var gulp = require('gulp');
var gutil = require('gulp-util');
var ngConfig = require('gulp-ng-config');
var path = require('path');
var fs = require('fs');
var config = require(path.resolve(__dirname, '../configs/env.config.js'));

/*
 *  I first generate the json file that gulp-ng-config uses as input.
 *  Then I source it into our gulp task.
 */
gulp.task('ng-config', function () {
  fs.writeFileSync('./configs/config.json',
    JSON.stringify(config[ENV]));
  gulp.src('./configs/config.json')
    .pipe(ngConfig('somameEnv'))
    .pipe(gulp.dest('./src/app/'));
});
