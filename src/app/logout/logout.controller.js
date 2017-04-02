(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('LogoutController', LogoutController);

/** @ngInject */
function LogoutController($scope, $rootScope, $state, $auth, $window, $timeout, localStorageService,
  segment) {

  $scope.logoutUser = function () {

    if ($rootScope.previousState.name != 'auth.login') {
      segment.track(segment.events.logout, {
        name: $rootScope.authenticatedUser.first_name + ' ' + $rootScope.authenticatedUser.last_name,
        time: new Date(),
      });
    }

    $auth.logout();
    localStorageService.clearAll();

    $state.go('auth.login');
    $timeout(function () {
      $window.location.reload();
    });
  };

  $scope.logoutUser();
}
})();
