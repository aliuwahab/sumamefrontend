(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CustomersController', CustomersController);

/** @ngInject */
function CustomersController($scope, $rootScope, $state, CustomersService) {

  activate();

  function activate() {
    getAllCustomers();
  }

  function getAllCustomers() {
    CustomersService.getAllCustomers()
    .then(function (response) {
      $scope.customers = response.data;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

}
})();
