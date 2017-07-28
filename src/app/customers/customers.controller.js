(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .controller('CustomersController', CustomersController);

  /** @ngInject */
  function CustomersController($scope, $rootScope, $state, CustomersService, Dialog, ToastsService,
    CachingService, localStorageService, ValidationService) {

    var currentCustomerType;
    var limit = localStorage.getItem('tablePageLimit') || 20;

    activate();

    function activate() {
      $scope.currentView =
        localStorageService.get('selectedCustomersView') || 'app.customers.businesses';
      $state.transitionTo($scope.currentView);

      $scope.filterParams = {
        limit: limit,
        page: 1,
      };
    }

    $scope.getAllCustomers = function (customerType) {
      customerType ? currentCustomerType = customerType : false;

      $scope.requestsPromise =
        CustomersService.getAllCustomers($scope.filterParams, currentCustomerType)
        .then(function (response) {
          switch (currentCustomerType) {
            case 'individualCustomers':
              $scope[currentCustomerType] = response.data.data.all_consumers;
              break;
            case 'businessCustomers':
              $scope[currentCustomerType] = response.data.data.business_consumers;
              break;
            case 'deletedCustomers':
              $scope[currentCustomerType] = response.data.data.all_deleted;
              break;
            default:
              $scope[currentCustomerType] = response.data.data.all_consumers;
          }
        })
        .catch(function (error) {
          ToastsService.showToast('error', error.data.error);
        });
    };

    $scope.paginate = function (page, limit) {
      localStorage.setItem('tablePageLimit', limit);

      $scope.getAllCustomers();
    };

    $scope.searchCustomers = function () {
      if ($scope.searchText && $scope.searchText.length > 0) {
        $scope.searching = true;
        $scope.requestsPromise =
          CustomersService.searchCustomers({
            search_key: $scope.searchText,
            limit: 20,
            page: 1
          })
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
              } else {
                ToastsService.showToast('error', response.data.message);
              }
            })
            .catch(function (error) {
              $scope.addingCustomer = false;
              if (error.data && error.data.errors) {
                var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
                ToastsService.showToast('error', errorList[0]);
              } else {
                ToastsService.showToast('error', error.data.message);
              }
            });
        })
        .catch(function (error) {
          ToastsService.showToast('error', error.message);
        });
    };

    $scope.deleteCustomer = function (customer, customerType) {
      Dialog.confirmAction('Do you want to deleted this customer?')
        .then(function () {
          var data;
          if (customerType == 'individual') {
            data = {
              user_id: customer.id,
            };
          } else if (customerType == 'business') {
            data = {
              business_id: customer.business_id,
              admin_to_delete_id: customer.id,
            };
          }

          $scope.processInProgress = true;
          CustomersService.deleteCustomer(data, customerType)
            .then(function (response) {
              ToastsService.showToast('success', 'Customer successfully blocked');
              $scope.processInProgress = false;
              CachingService.destroyOnCreateOperation('deletedCustomers' +
                $.param($scope.filterParams));
              reloadCustomers(customerType + 'Customers');
            })
            .catch(function (error) {
              $scope.processInProgress = false;
              if (error.data && error.data.errors) {
                var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
                ToastsService.showToast('error', errorList[0]);
              } else {
                ToastsService.showToast('error', error.data.message);
              }
            });
        }, function () {
          // Dialog has been canccelled
        });
    };

    $scope.changeInvoicingPeriod = function (customer, oldInvoicePeriod) {
      var data = {
        user_id: customer.id,
        choice_of_invoice_duration: customer.choice_of_invoice_duration,
      };

      Dialog.confirmAction('Do you want to change invoicing period?')
      .then(function () {
        $scope.processInProgress = true;
        CustomersService.changeInvoicingPeriod(data)
          .then(function (response) {
            ToastsService.showToast('success', 'Customer invoicing period successfully changed');
            $scope.processInProgress = false;
            reloadCustomers('businessCustomers');
          })
          .catch(function (error) {
            $scope.processInProgress = false;
            if (error.data && error.data.errors) {
              var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
              ToastsService.showToast('error', errorList[0]);
            } else {
              ToastsService.showToast('error', error.data.message);
            }
          });
      }, function () {
        customer.choice_of_invoice_duration = oldInvoicePeriod;
      });
    };

    $scope.restoreDeletedCustomer = function (ev, customer) {
      Dialog.confirmAction('Do you want to restore this deleted customer?')
        .then(function () {
          $scope.processInProgress = true;

          var data = {
            user_id: customer.id,
          };

          CustomersService.restoreDeletedCustomer(data)
            .then(function (response) {
              if (response.data.code == 200) {
                ToastsService.showToast('success', 'Customer successfully restored!');
              } else {
                ToastsService.showToast('error', response.data.message);
              }

              CachingService.destroyOnCreateOperation(customer.consumer_type + 'Customers' +
                $.param($scope.filterParams));

              reloadCustomers('deletedCustomers');
              $scope.processInProgress = false;
            })
            .catch(function (error) {
              $scope.processInProgress = false;
              if (error.data && error.data.errors) {
                var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
                ToastsService.showToast('error', errorList[0]);
              } else {
                ToastsService.showToast('error', error.data.message);
              }
            });
        }, function () {
          // Dialog has been canccelled
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

    function reloadCustomers(customerType) {
      var cachePrefix;
      customerType != undefined ? cachePrefix = customerType : cachePrefix = currentCustomerType;
      var cache = cachePrefix + $.param($scope.filterParams);

      CachingService.destroyOnCreateOperation(cache);
      customerType != undefined ? $scope.getAllCustomers(customerType) : $scope.getAllCustomers();
    }
  }
})();
