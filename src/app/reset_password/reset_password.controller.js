(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('ResetPasswordController', ResetPasswordController);

/** @ngInject */
function ResetPasswordController($scope, $rootScope, $state, $auth, localStorageService,
  ToastsService, ssSideNav, UserService, segment) {

  $scope.user = {};

  $scope.restPassword = function (isValid) {

    if (isValid) {

      $scope.enableProgressBar = true;

      UserService.resetPassword($scope.user.email)
      .then(function (response) {
        $scope.enableProgressBar = false;
        ToastsService.showToast('success', 'Please check your email for instructions.');
        $state.go('auth.login');
      })
      .catch(function (error) {
        $scope.enableProgressBar = false;
      });

    }else {
      ToastsService.showToast('error', 'Enter a valid email address');
    }
  };
}
})();
