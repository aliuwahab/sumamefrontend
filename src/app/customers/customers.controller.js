(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CustomersController', CustomersController);

/** @ngInject */
function CustomersController($scope, $rootScope, $state, CustomersService, Dialog, ToastsService,
  CachingService, localStorageService, ValidationService) {

  activate();

  function activate() {
    $scope.currentView =
    localStorageService.get('selectedCustomersView') || 'app.customers.businesses';
    $state.transitionTo($scope.currentView);

    $scope.filterParams = {
      limit: 50,
      page: 1,
    };
  }

  $scope.getAllCustomers = function (customerType) {
    $scope.filterParams.consumer_type = customerType;
    var scopeVarName = 'customers' + customerType;

    $scope.requestsPromise = CustomersService.getAllCustomers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_consumers;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.data.error);
    });
  };

  $scope.searchCustomers = function () {
    if ($scope.searchText && $scope.searchText.length > 0) {
      $scope.searching = true;
      $scope.requestsPromise =
      CustomersService.searchCustomers({ search_key: $scope.searchText, limit: 20, page: 1 })
      .then(function (results) {
        $scope.customerResults = results.data.data.search_results;
      })
      .catch(function (error) {
        debugger;
      });
    }
  };

  $scope.addCustomer = function () {
    $scope.newCustomer.username = $scope.newCustomer.phone_number;
    $scope.newCustomer.password_confirmation = $scope.newCustomer.password;

    ValidationService.validate($scope.newCustomer, 'customer')
    .then(function (result) {
      $scope.addingCustomer = true;
      CustomersService.addCustomer($scope.newCustomer)
      .then(function (response) {
        $scope.addingCustomer = false;
        if (response.data.code == 200) {
          ToastsService.showToast('success', 'Customer successfully added');
          reloadCustomers();
          $rootScope.closeDialog();
        }else {
          ToastsService.showToast('error', response.data.message);
        }
      })
      .catch(function (error) {
        debugger;
        $scope.addingCustomer = false;
        ToastsService.showToast('error', error.data.error);
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });

  };

  $scope.changeCustomerStatus = function (customer, action) {
    $scope.processInProgress = true;
    CustomersService.changeCustomerStatus({
      user_id: customer.id,
    }, action)
    .then(function (response) {
      ToastsService.showToast('success', 'Customer successfully blocked');
      $scope.processInProgress = false;
      reloadCustomers();
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

  $scope.showAddCustomerDialog = function (ev) {
    $scope.newCustomer = {
      account_confirm: 1,
      user_created_by: $rootScope.authenticatedUser.id,
    };
    Dialog.showCustomDialog(ev, 'add_customer', $scope);
  };

  $scope.changeCustomersTab = function (stateName) {
    $scope.currentView = stateName;
    localStorageService.set('selectedCustomersView', stateName);
    $state.go(stateName);
  };

  function reloadCustomers() {
    var cache = 'customers?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);
    $scope.getAllCustomers();
  }

}
})();
