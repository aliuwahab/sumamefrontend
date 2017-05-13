(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CustomersController', CustomersController);

/** @ngInject */
function CustomersController($scope, $rootScope, $state, CustomersService, Dialog, ToastsService,
  CachingService) {

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
      $scope.customers = response.data.data.all_consumers;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.data.error);
    });
  }

  $scope.changeCustomerStatus = function (customer, action) {
    $scope.processInProgress = true;
    CustomersService.changeCustomerStatus({
      user_id: customer.id,
    }, action)
    .then(function (response) {
      ToastsService.showToast('success', 'Customer successfully blocked');
      $scope.processInProgress = false;
      var cache = 'customers?page=' + $scope.filterParams.page +
      'limit=' + $scope.filterParams.limit;
      CachingService.destroyOnCreateOperation(cache);
      getAllCustomers();
    })
    .catch(function (error) {
      $scope.processInProgress = false;
      ToastsService.showToast('error', error.data.error);
    });
  };

  // SHOW CUSTOMER DIALOG
  $scope.showCustomerDialog = function (ev, customer, dialog) {
    $scope.selectedCustomer = customer;
    Dialog.showCustomDialog(ev, dialog, $scope);
  };

}
})();
