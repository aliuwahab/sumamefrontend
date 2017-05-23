(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, $http, $mdDialog, PermPermissionStore, PermRoleStore,
    ssSideNav, localStorageService, Rollbar, segment, ActivityMonitor, logOutAfterSeconds,
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

      segment.identify($rootScope.authenticatedUser.id, {
        email: $rootScope.authenticatedUser.email,
        username: $rootScope.authenticatedUser.first_name + ' ' +
        $rootScope.authenticatedUser.last_name,
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
    }

    if ($rootScope.authenticatedUser && ($rootScope.authenticatedUser.admin_type == 'staff' ||
      $rootScope.authenticatedUser.admin_type == 'normal')) {
      ssSideNav.setVisible('settings', false);
    }

    $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
      segment.page();
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

    NgMap.getMap().then(function (map) {
      $rootScope.map = map;
    });

    $rootScope.closeDialog = function () {
      $mdDialog.hide();
    };

  }

})();
