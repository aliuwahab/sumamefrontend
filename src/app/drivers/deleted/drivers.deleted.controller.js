(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DeletedDriversController', DeletedDriversController);

/** @ngInject */
function DeletedDriversController($scope) {

  activate();

  function activate() {
    $scope.getDeletedDrivers();
  }

}
})();
