(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DeletedCustomersController', DeletedCustomersController);

/** @ngInject */
function DeletedCustomersController($scope) {

  activate();

  function activate() {
    $scope.getAllCustomers('deletedCustomers');
  }

}
})();
