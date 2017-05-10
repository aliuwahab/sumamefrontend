(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CustomersController', CustomersController);

/** @ngInject */
function CustomersController($scope, $rootScope, $state, CustomersService, Dialog) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllCustomers();
  }

  function getAllCustomers() {
    $scope.requestsPromise = CustomersService.getAllCustomers($scope.filterParams)
    .then(function (response) {
      // TODO: Tell Aliu to change 'all_drivers' to 'all_consumers'
      $scope.customers = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  // SHOW CUSTOMER DIALOG
  $scope.showCustomerDialog = function (ev, customer, dialog) {
    $scope.selectedCustomer = customer;
    Dialog.showCustomDialog(ev, dialog, $scope);
  };

}
})();
