const gulp = require('gulp');

const appDirectory = 'views/cookie-banner';
const assetsDirectory = 'build/assets';
const stylesheetsDirectory = 'build/assets';

function copyCookieBanner(done) {
    gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/**/*.js'])
        .pipe(gulp.dest(`${assetsDirectory}/js/`));

    gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/**/*.njk'])
        .pipe(gulp.dest(`${appDirectory}/cookie-manager/`));

    gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/button/**/*.*'])
        .pipe(gulp.dest(`${appDirectory}/button/`));

    gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/styles/**/*.css'])
        .pipe(gulp.dest(`${stylesheetsDirectory}/`));

    gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-banner/**/*.*'])
        .pipe(gulp.dest(`${appDirectory}/cookie-banner/`));

    gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/govuk_template_jinja/assets/javascripts/**/*.js'
    ])
        .pipe(gulp.dest(`${assetsDirectory}/js/lib/`));
    done();
}

exports.default = copyCookieBanner;
