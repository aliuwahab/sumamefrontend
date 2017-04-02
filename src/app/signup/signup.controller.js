(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SignupController', SignupController);

/** @ngInject */
function SignupController($scope, $state, UserService) {

  $scope.user = {};

  $scope.createUser = function (isValid) {
    if (isValid) {
      UserService.createUser($scope.user)
      .then(function (response) {
        var data = {
          displayName: $scope.user.firstname + ' ' + $scope.user.lastname,
        };
        UserService.updateUser(data)
        .then(function (response) {
          $state.go('app.go_trending');
        })
        .catch(function (error) {
          console.log(error.message);
        });
      })
      .catch(function (error) {
        console.log(error.message);
      });
    }
  };
}
})();
