(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('UserController', UserController);

/** @ngInject */
function UserController($scope, $mdDialog, UserService) {

  activate();

  function activate() {

  }

  $scope.updateUserSettings = function () {
    //Update user information
  };

}
})();
