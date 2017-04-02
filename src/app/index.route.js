(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {

    // Auth Configs
    var skipIfLoggedIn = ['$q', '$auth', function ($q, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
          deferred.reject();
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      },
    ];

    var loginRequired = ['$q', '$location', '$auth', function ($q, $location, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
          deferred.resolve();
        } else {
          $location.path('/login');
        }

        return deferred.promise;
      },
    ];

    $stateProvider
    .state('app', {
        abstract: true,
        templateUrl: 'app/index.html',
        controller: 'AppController',
      })
    .state('app.go_trending', {
        url: '/',
        templateUrl: 'app/go_trending/go_trending.html',
        controller: 'GoTrendingController',
        data: {
          permissions: {
            only: function () {
              return ['admin', 'consultant'] || false;
            },

            redirectTo: 'auth.login',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.all_go_trending_questions', {
        url: '/go_trending_questions',
        templateUrl: 'app/go_trending/all_go_trending_questions.html',
        controller: 'AllGoTrendingQuestionsController',
        data: {
          permissions: {
            only: function () {
              return ['admin', 'consultant'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.question', {
        url: '/question/:questionId',
        templateUrl: 'app/go_trending/question_detail.html',
        controller: 'QuestionController',
        data: {
          permissions: {
            only: function () {
              return ['admin', 'consultant'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.consultants', {
        url: '/consultants',
        templateUrl: 'app/consultants/consultants.html',
        controller: 'ConsultantsController',
        data: {
          permissions: {
            only: function () {
              return ['admin'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.students', {
        url: '/students',
        templateUrl: 'app/students/students.html',
        controller: 'StudentsController',
        data: {
          permissions: {
            only: function () {
              return ['admin'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.learnrite_questions', {
        url: '/learnrite_questions',
        templateUrl: 'app/learnrite_questions/learnrite_questions.html',
        controller: 'SomameQuestionsController',
        data: {
          permissions: {
            only: function () {
              return ['admin', 'consultant'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.wassce_questions', {
        url: '/wassce_questions',
        templateUrl: 'app/wassce_questions/wassce_questions.html',
        controller: 'WASSCEQuestionsController',
        data: {
          permissions: {
            only: function () {
              return ['admin', 'consultant'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.vouchers', {
        url: '/vouchers',
        templateUrl: 'app/vouchers/vouchers.html',
        controller: 'VouchersController',
        data: {
          permissions: {
            only: function () {
              return ['admin'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.print_vouchers', {
        url: '/vouchers/print',
        templateUrl: 'app/vouchers/vouchers_print.html',
        controller: 'VouchersController',
        data: {
          permissions: {
            only: function () {
              return ['admin'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })
    .state('app.settings', {
        url: '/settings',
        templateUrl: 'app/settings/settings.html',
        controller: 'SettingsController',
        data: {
          permissions: {
            only: function () {
              return ['admin'] || false;
            },

            redirectTo: 'app.go_trending',
          },
        },
        resolve: {
          loginRequired: loginRequired,
        },
      })

    // AUTH
    .state('auth', {
        abstract: true,
        templateUrl: 'app/components/auth/auth.html',
        controller: 'AuthController',
      })
    .state('auth.login', {
        url: '/login',
        templateUrl: 'app/login/login.html',
        controller: 'LoginController',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn,
        },
      })
    .state('auth.reset_password', {
        url: '/reset_password',
        templateUrl: 'app/reset_password/reset_password.html',
        controller: 'ResetPasswordController',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn,
        },
      })
    .state('auth.logout', {
        url: '/logout',
        templateUrl: 'app/logout/logout.html',
        controller: 'LogoutController',
      });

    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('app.go_trending');
    });
  }

})();
