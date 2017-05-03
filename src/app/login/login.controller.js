(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('LoginController', LoginController);

/** @ngInject */
function LoginController($scope, $rootScope, $state, $auth, localStorageService,
  ToastsService, ssSideNav, PermPermissionStore, PermRoleStore, UserService,
  segment, ActivityMonitor, logOutAfterSeconds) {

  $scope.user = {};
  $scope.resetShowing = false;

  $scope.flipForm = function () {
    $scope.resetShowing = !$scope.resetShowing;
  };

  $scope.loginUser = function (isValid) {

    if (isValid) {

      $scope.enableProgressBar = true;
      var data = $scope.user;
      var loginConfig = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        skipAuthorization: true,
        transformRequest: function (data) {
          if (data === undefined) {
            return data;
          }

          return $.param(data);
        },
      };

      $auth.login($scope.user, loginConfig)
      .then(function (response) {
        var token = response.data.token;

        UserService.getUserProfile(token)
        .then(function (user) {
          localStorageService.set('profile', user.data.user);
          $rootScope.authenticatedUser = user.data.user;

          if ($rootScope.authenticatedUser) {
            resetUserState();
            redefineRoles();
            $scope.enableProgressBar = false;
            $state.go('app.dashboard');

            segment.identify($rootScope.authenticatedUser.id, {
              email: $rootScope.authenticatedUser.email,
              username: $rootScope.authenticatedUser.first_name + ' ' +
               $rootScope.authenticatedUser.last_name,
            });

            segment.track(segment.events.login, {
              name: $rootScope.authenticatedUser.first_name + ' ' +
              $rootScope.authenticatedUser.last_name,
              time: new Date(),
            });

            subscribeToActivityMonitor();

          }else {
            localStorageService.clearAll();
            $scope.enableProgressBar = false;
            ToastsService.showToast('error', 'Unable to determine your user type');
          }
        })
        .catch(function (error) {
          localStorageService.clearAll();
          ToastsService.showToast('error', error.message);
        });
      })
      .catch(function (error) {
        $scope.enableProgressBar = false;
        localStorageService.clearAll();
        ToastsService.showToast('error', error.data.error);
      });

    }else {
      ToastsService.showToast('error', 'Enter valid credentials for all fields');
    }
  };

  function subscribeToActivityMonitor() {
    ActivityMonitor.options.inactive = logOutAfterSeconds;

    ActivityMonitor
    .on('inactive', function () {
      var currentState = $state.current.name;
      if (currentState != 'auth.login') {
        $state.go('auth.logout');
        ActivityMonitor.off('inactive');
      }
    });
  }

  function resetUserState() {
    if ($rootScope.authenticatedUser.user_type == 'staff' ||
    $rootScope.authenticatedUser.user_type == 'normal') {
      ssSideNav.setVisible('settings', false);
    }
  }

  function redefineRoles() {
    PermPermissionStore
    .defineManyPermissions(['seeDashboard', 'seeRequests', 'seeDrivers', 'seeCourierVehicles', 'seeEquipment',
    'seeCustomers',
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
}
})();
