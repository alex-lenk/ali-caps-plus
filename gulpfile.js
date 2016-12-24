'use strict';

var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    browserSync = require('browser-sync'),
    cleanCSS = require('gulp-clean-css'),
    watch = require('gulp-watch'),
    newer = require('gulp-newer'),
    rename = require('gulp-rename'),
    create = browserSync.create(),
    reload = browserSync.reload;


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/img/',
        maps: '../maps/',
        fonts: './build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: './src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: './src/js/*.js',//В стилях и скриптах нам понадобятся только main файлы
        style: './src/style/*.scss',
        img: './src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: './src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/style/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    clean: './build'
};


var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9005,
    logPrefix: "frontend",
    devBaseUrl: 'http://localhost'
};

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html))//Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений*/
});

gulp.task('img:build', function (cb) {
    gulp.src(path.src.img) //Выберем файлы по нужному пути
        .pipe(newer(path.build.img))
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.img))//Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});


gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError)) //Скомпилируем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(rename({
            prefix: "",
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        })) //Добавим вендорные префиксы
        .pipe(cleanCSS({debug: true}, function (details) {
        }))
        .pipe(sourcemaps.write(path.build.maps, {
            addComment: true
            //sourceMappingURLPrefix: 'https://asset-host.example.com/assets'
        }))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'img:build'
]);

gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('img:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);
