# Learn Rite Admin Frontend

## User Guide

This project structure was generated using the Yeoman flow and customized to add an automated deployment process for different development environments and personal staging environments.

## Gulp tasks

* `gulp` or `gulp build` to build an optimized version of your application in `/dist`
* `gulp serve` to launch a browser sync server on your source files
* `gulp serve:dist` to launch a server on your optimized application
* `gulp test` to launch your unit tests with Karma
* `gulp test:auto` to launch your unit tests with Karma in watch mode
* `gulp protractor` to launch your e2e tests with Protractor
* `gulp protractor:dist` to launch your e2e tests with Protractor on the dist files

More information on the gulp tasks [below](user-guide.md).

## Directory structure

Structure follows the [Best Practice Recommendations for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub)

The root directory generated with default paths configuration for application with name `somameAdmin`:

<pre>
├──  bower_components/
├──  configs/
├──  e2e/
├──  env/
├──  gulp/
├──  nodes_modules/
│
├──  src/
│   ├──  app/
│   │   ├──  components/
│   │   │   └──  sidebar/
│   │   │   │   └──  sidebar.controller.js
│   │   │   │

│   │   │   └──  navbar/
│   │   │   │   ├──  navbar.directive.js
│   │   │   │   ├──  navbar.html
│   │   │   │   └──  navbar.scss
│   │   │   │
│   │   │   └──  webDevTec/
│   │   │       └──  webDevTec.service.js
│   │   │
│   │   ├──  dashboard/
│   │   │   ├──  dashboard.controller.js
│   │   │   ├──  dashboard.controller.spec.js
│   │   │   └──  dasboard.html
│   │   │
│   │   └──  index.config.js
│   │   └──  index.constants.js
│   │   └──  index.module.js
│   │   └──  index.route.js
│   │   └──  index.run.js
│   │   └──  index.scss
|   |
│   ├──  assets/
│   │   └──  images/
│   ├──  favico.ico
│   └──  index.html
│
├──  .bowerrc
├──  .editorconfig
├──  .gitignore
├──  .eslintrc
├──  bower.json
├──  gulpfile.js
├──  karma.conf.js
├──  package.json
└──  protractor.conf.js
</pre>


## Features included in the gulpfile
* *useref* : allow configuration of your files in comments of your HTML file
* *ngAnnotate* : convert simple injection to complete syntax to be minification proof
* *uglify* : optimize all your JavaScript
* *csso* : optimize all your CSS
* *autoprefixer* : add vendor prefixes to CSS
* *rev* : add a hash in the file names to prevent browser cache problems
* *watch* : watch your source files and recompile them automatically
* *eslint* : The pluggable linting utility for JavaScript
* *imagemin* : all your images will be optimized at build
* *Unit test (karma)* : out of the box unit test configuration with karma
* *e2e test (protractor)* : out of the box e2e test configuration with protractor
* *browser sync* : full-featured development web server with livereload and devices sync
* *angular-templatecache* : all HTML partials will be converted to JS to be bundled in the application
