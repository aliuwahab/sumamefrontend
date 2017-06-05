(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('LogoutController', LogoutController);

/** @ngInject */
function LogoutController($scope, $rootScope, $state, $auth, $window, $timeout,
  localStorageService) {

  $scope.logoutUser = function () {
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
