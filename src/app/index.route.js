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
    .state('app.dashboard', {
      url: '/',
      templateUrl: 'app/dashboard/dashboard.html',
      controller: 'DashboardController',
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
    .state('app.requests', {
      url: '/requests',
      templateUrl: 'app/requests/requests.html',
      controller: 'RequestsController',
      params: {
        viewName: null,
        referer: null,
        requestStatus: null,
      },
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
    .state('app.request', {
      url: '/request/:requestId',
      templateUrl: 'app/requests/request_detail.html',
      controller: 'RequestDetailController',
      data: {
        permissions: {
          only: function () {
            return ['admin', 'consultant'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.drivers', {
      url: '/drivers',
      templateUrl: 'app/drivers/drivers.html',
      controller: 'DriversController',
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
    .state('app.vehicles', {
      url: '/vehicles',
      templateUrl: 'app/vehicles/vehicles.html',
      controller: 'VehiclesController',
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
    .state('app.customers', {
      url: '/customers',
      templateUrl: 'app/customers/customers.html',
      controller: 'CustomersController',
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
    .state('app.settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController',
      data: {
        permissions: {
          only: function () {
            return ['admin'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.settings.staff', {
      parent: 'app.settings',
      url: '/staff',
      templateUrl: 'app/settings/staff/settings.staff.html',
      controller: 'StaffController',
      data: {
        permissions: {
          only: function () {
            return ['admin'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.settings.warehouses', {
      parent: 'app.settings',
      url: '/warehouses',
      templateUrl: 'app/settings/warehouses/settings.warehouses.html',
      controller: 'WarehousesController',
      data: {
        permissions: {
          only: function () {
            return ['admin'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.settings.pricing', {
      parent: 'app.settings',
      url: '/pricing',
      templateUrl: 'app/settings/pricing/settings.pricing.html',
      controller: 'PricingController',
      data: {
        permissions: {
          only: function () {
            return ['admin'] || false;
          },

          redirectTo: 'app.dashboard',
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
    .state('auth.logout', {
      url: '/logout',
      templateUrl: 'app/logout/logout.html',
      controller: 'LogoutController',
    });

    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('app.dashboard');
    });
  }

})();
