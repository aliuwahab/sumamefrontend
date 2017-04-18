(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, $http, PermPermissionStore, PermRoleStore,
    ssSideNav, localStorageService, Rollbar, segment, ActivityMonitor, logOutAfterSeconds,
    NgMap, ENV) {

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
      .defineManyPermissions(['seeGoTrending', 'seeLRQuestions', 'seeWASSCEQuestions'],
      function () {
        return ['admin', 'consultant'].indexOf($rootScope.authenticatedUser.user_type) != -1;
      });

      PermPermissionStore
      .defineManyPermissions(['seeConsultants', 'seeStudents', 'seeVouchers', 'seeSettings'],
      function () {
        return (['admin'].indexOf($rootScope.authenticatedUser.user_type) != -1);
      });

      PermRoleStore
      .defineManyRoles({
        admin: ['seeGoTrending', 'seeSettings'],
        consultant: ['seeGoTrending'],
      });
    }

    if ($rootScope.authenticatedUser && $rootScope.authenticatedUser.user_type == 'consultant') {
      ssSideNav.setVisible('consultants', false);
      ssSideNav.setVisible('students', false);
      ssSideNav.setVisible('vouchers', false);
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

  }

})();
