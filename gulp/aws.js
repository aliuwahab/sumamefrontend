var gulp = require('gulp');
var cloudfront = require('gulp-cloudfront-invalidate');

var settings = {
  distribution: process.env.CLOUDFRONT_DISTRIBUTION_ID,           // Cloudfront distribution ID
  paths: ['/index.html', '/styles/*', '/assets/*', '/scripts/*'],  // Paths to invalidate
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,                     // AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,             // AWS Secret Access Key
  wait: false,                                                    // Whether to wait until invalidation is completed
};

gulp.task('invalidate', function () {
  return gulp.src('*')
    .pipe(cloudfront(settings));
});
