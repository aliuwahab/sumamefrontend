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
            return ['super', 'normal', 'staff'] || false;
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
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'auth.login',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.pending', {
      parent: 'app.requests',
      url: '/pending',
      templateUrl: 'app/requests/pending/pending.html',
      controller: 'PendingRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.assigned', {
      parent: 'app.requests',
      url: '/assigned',
      templateUrl: 'app/requests/assigned/assigned.html',
      controller: 'AssignedRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.in_progress', {
      parent: 'app.requests',
      url: '/in-progress',
      templateUrl: 'app/requests/in_progress/in_progress.html',
      controller: 'InProgressRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.declined', {
      parent: 'app.requests',
      url: '/declined',
      templateUrl: 'app/requests/declined/declined.html',
      controller: 'DeclinedRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.completed', {
      parent: 'app.requests',
      url: '/completed',
      templateUrl: 'app/requests/completed/completed.html',
      controller: 'CompletedRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.local', {
      parent: 'app.requests',
      url: '/local',
      templateUrl: 'app/requests/local/local.html',
      controller: 'LocalRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.foreign', {
      parent: 'app.requests',
      url: '/foreign',
      templateUrl: 'app/requests/foreign/foreign.html',
      controller: 'ForeignRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.equipment', {
      parent: 'app.requests',
      url: '/equipment',
      templateUrl: 'app/requests/equipment/equipment.html',
      controller: 'EquipmentRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.cancelled', {
      parent: 'app.requests',
      url: '/cancelled',
      templateUrl: 'app/requests/cancelled/cancelled.html',
      controller: 'CancelledRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.business', {
      parent: 'app.requests',
      url: '/business',
      templateUrl: 'app/requests/business/business.html',
      controller: 'BusinessRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.individual', {
      parent: 'app.requests',
      url: '/individual',
      templateUrl: 'app/requests/individual/individual.html',
      controller: 'IndividualRequestsController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.requests.details', {
      parent: 'app.requests',
      url: '/:requestId',
      templateUrl: 'app/requests/request_detail/request_detail.html',
      controller: 'RequestDetailController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
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
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'auth.login',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.drivers.approved', {
      parent: 'app.drivers',
      url: '/approved',
      templateUrl: 'app/drivers/approved/approved.html',
      controller: 'ApprovedDriversController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.drivers.unapproved', {
      parent: 'app.drivers',
      url: '/unapproved',
      templateUrl: 'app/drivers/unapproved/unapproved.html',
      controller: 'UnapprovedDriversController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.drivers.deleted', {
      parent: 'app.drivers',
      url: '/deleted',
      templateUrl: 'app/drivers/deleted/deleted.html',
      controller: 'DeletedDriversController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
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
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'auth.login',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.equipment', {
      url: '/equipment',
      templateUrl: 'app/rental_equipment/rental_equipment.html',
      controller: 'EquipmentController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
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
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'auth.login',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.customers.businesses', {
      parent: 'app.customers',
      url: '/businesses',
      templateUrl: 'app/customers/businesses/businesses.html',
      controller: 'BusinessCustomersController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.customers.individuals', {
      parent: 'app.customers',
      url: '/individuals',
      templateUrl: 'app/customers/individuals/individuals.html',
      controller: 'IndividualCustomersController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.customers.deleted', {
      parent: 'app.customers',
      url: '/deleted',
      templateUrl: 'app/customers/deleted/deleted.html',
      controller: 'DeletedCustomersController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal', 'staff'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.invoices', {
      url: '/invoices',
      templateUrl: 'app/invoices/invoices.html',
      controller: 'InvoicesController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal'] || false;
          },

          redirectTo: 'auth.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.invoices.all', {
      parent: 'app.invoices',
      url: '/all',
      templateUrl: 'app/invoices/invoices_all.html',
      controller: 'InvoicesController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.invoices.details', {
      parent: 'app.invoices',
      url: '/:invoiceId',
      templateUrl: 'app/invoices/invoice_detail.html',
      controller: 'InvoiceDetailController',
      data: {
        permissions: {
          only: function () {
            return ['super', 'normal'] || false;
          },

          redirectTo: 'app.dashboard',
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
            return ['super'] || false;
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
            return ['super'] || false;
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
            return ['super'] || false;
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
            return ['super'] || false;
          },

          redirectTo: 'app.dashboard',
        },
      },
      resolve: {
        loginRequired: loginRequired,
      },
    })
    .state('app.settings.customization', {
      parent: 'app.settings',
      url: '/customization',
      templateUrl: 'app/settings/customizations/settings.customizations.html',
      controller: 'CustomizationsController',
      data: {
        permissions: {
          only: function () {
            return ['super'] || false;
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
