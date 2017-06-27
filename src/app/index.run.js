(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, $http, $mdDialog, PermPermissionStore, PermRoleStore,
    ssSideNav, localStorageService, Rollbar, ActivityMonitor, logOutAfterSeconds,
    NgMap, ngAudio, ENV) {

    $rootScope.viewBackgroundImage = '../assets/patterns/brickwall.png';

    if (localStorageService.get('profile')) {

      $rootScope.authenticatedUser = localStorageService.get('profile');

      Offline.options = {
        checkOnLoad: true,
        interceptRequests: true,
        reconnect: {
          initialDelay: 3,
          delay: 30,
        },
        requests: true,
      };

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
      .defineManyPermissions(['seeRequests', 'seeDrivers', 'seeCourierVehicles',
      'seeEquipment', 'seeCustomers',
      ],
      function () {
        return ['super', 'staff', 'normal'].indexOf($rootScope.authenticatedUser.admin_type) != -1;
      });

      PermPermissionStore
      .defineManyPermissions(['seeDashboard', 'seeSettings'],
      function () {
        return (['super'].indexOf($rootScope.authenticatedUser.admin_type) != -1);
      });

      PermRoleStore
      .defineManyRoles({
        super: ['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers', 'seeSettings',
        ],
        normal: ['seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers',
        ],
        staff: ['seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
        'seeCustomers',
        ],
      });

      $rootScope.pusher = new Pusher(ENV.pusherApiKey, {
        cluster: 'eu',
        encrypted: true,
      });
      $rootScope.pusher.subscribe('request');

      var newRequestSound = ngAudio.load('../assets/sounds/bbm.mp3');

      $rootScope.pusher.bind('request-made', function (data) {
        if ($rootScope.authenticatedUser &&
          (!data.request.request_source || data.request.request_source != 'admin')) {
          newRequestSound.play();
        }
      });
    }

    if ($rootScope.authenticatedUser && ($rootScope.authenticatedUser.admin_type == 'staff' ||
      $rootScope.authenticatedUser.admin_type == 'normal')) {
      ssSideNav.setVisible('dashboard', false);
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
        case 'auth.login':
          if (localStorageService.get('token')) {
            event.preventDefault();
            return $state.go('app.dashboard');
          }

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
