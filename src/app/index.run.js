(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, $http, $mdDialog, PermPermissionStore, PermRoleStore,
    ssSideNav, localStorageService, Rollbar, ActivityMonitor, logOutAfterSeconds,
    NgMap, ENV) {

    $rootScope.viewBackgroundImage = '../assets/patterns/brickwall.png';

    if (localStorageService.get('profile')) {

      $rootScope.authenticatedUser = localStorageService.get('profile');

      Rollbar.configure({
        payload: {
          person: {
            id: $rootScope.authenticatedUser.id,
            email: $rootScope.authenticatedUser.email,
          },
          environment: ENV.stage,
        },
      });

      PermPermissionStore
      .defineManyPermissions(['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles',
      'seeEquipment', 'seeCustomers',
      ],
      function () {
        return ['super', 'staff', 'normal'].indexOf($rootScope.authenticatedUser.admin_type) != -1;
      });

      PermPermissionStore
      .defineManyPermissions(['seeSettings'],
      function () {
        return (['super'].indexOf($rootScope.authenticatedUser.admin_type) != -1);
      });

      PermRoleStore
      .defineManyRoles({
        super: ['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers', 'seeSettings',
        ],
        normal: ['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers',
        ],
        staff: ['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers',
        ],
      });

      $rootScope.pusher = new Pusher(ENV.pusherApiKey, {
        cluster: 'eu',
        encrypted: true,
      });
      $rootScope.pusher.subscribe('request');
    }

    if ($rootScope.authenticatedUser && ($rootScope.authenticatedUser.admin_type == 'staff' ||
      $rootScope.authenticatedUser.admin_type == 'normal')) {
      ssSideNav.setVisible('settings', false);
    }

    $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
      $rootScope.previousState = from;
    });

    if ($state.current.name != 'auth.login') {
      ActivityMonitor.options.inactive = logOutAfterSeconds;

      ActivityMonitor
      .on('inactive', function () {
        $state.go('auth.logout');
        ActivityMonitor.off('inactive');
      });
    }

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      switch (toState.name) {
        case 'app.requests':
          var currentState = localStorageService.get('selectedRequestsView') ||
          'app.requests.pending';
          event.preventDefault();
          $state.go(currentState);
          break;
        case 'app.drivers':
          var currentState = localStorageService.get('selectedDriversView') ||
          'app.drivers.approved';
          event.preventDefault();
          $state.go(currentState);
          break;
        case 'app.settings':
          var currentState = localStorageService.get('selectedSettingsView') ||
          'app.settings.staff';
          event.preventDefault();
          $state.go(currentState);
          break;
        case 'app.customers':
          var currentState = localStorageService.get('selectedCustomersView') ||
          'app.customers.businesses';
          event.preventDefault();
          $state.go(currentState);
          break;
        case 'app.invoices':
          var currentState = localStorageService.get('selectedInvoicesView') ||
          'app.invoices.all';
          event.preventDefault();
          $state.go(currentState);
          break;
        default:

          // Do default
      }

    });

    NgMap.getMap().then(function (map) {
      $rootScope.map = map;
    });

    $rootScope.closeDialog = function () {
      $mdDialog.hide();
    };

  }

})();
