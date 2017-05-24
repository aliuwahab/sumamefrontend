(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WarehousesController', WarehousesController);

/** @ngInject */
function WarehousesController($scope, $rootScope, $state, $mdDialog, lodash, Dialog,
  SettingsService, ToastsService, CachingService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllWarehouses();
    $scope.loadingWarehouses = true;
  }

  $rootScope.pusher.subscribe('address');

  $rootScope.pusher.bind('new-address-created', function (data) {
    updateAfterWarehouseOperation();
  });

  function getAllWarehouses() {
    SettingsService.getAllWarehouses($scope.filterParams)
    .then(function (response) {
      $scope.warehouses = response.data.data.all_requested_addresses;
      $scope.loadingWarehouses = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingWarehouses = false;
      debugger;
    });
  }

  $scope.addWarehouse = function () {
    $scope.newWarehouse.location_latitude = $scope.warehouseLocation.latitude;
    $scope.newWarehouse.location_longitude = $scope.warehouseLocation.longitude;

    $scope.warehouses.data.unshift($scope.newWarehouse);
    ToastsService.showToast('success', 'Warehouse successfully added');
    $rootScope.closeDialog();

    SettingsService.addWarehouse($scope.newWarehouse)
    .then(function (response) {
      // Warehouse Successfully added
    })
    .catch(function (error) {
      $scope.addingWarehouse = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  $scope.updateWarehouse = function () {

    if ($scope.warehouseLocation && $scope.warehouseLocation.latitude) {
      $scope.selectedWarehouse.location_latitude = $scope.warehouseLocation.latitude;
      $scope.selectedWarehouse.location_longitude = $scope.warehouseLocation.longitude;
    }else {
      $scope.selectedWarehouse.location_latitude = $scope.existingWarehouseLocation.latitude;
      $scope.selectedWarehouse.location_longitude = $scope.existingWarehouseLocation.longitude;
    }

    $scope.selectedWarehouse.created_by = $scope.selectedWarehouse.created_by.id;
    $scope.selectedWarehouse.address_id = $scope.selectedWarehouse.id;
    $scope.addingWarehouse = true;

    SettingsService.updateWarehouse($scope.selectedWarehouse)
    .then(function (response) {
      $scope.addingWarehouse = false;
      ToastsService.showToast('success', 'Warehouse successfully updated');
      updateAfterWarehouseOperation();
    })
    .catch(function (error) {
      $scope.addingWarehouse = false;
      ToastsService.showToast('error', error.data.message);
    });
  };

  $scope.deleteWarehouse = function (warehouse, index) {
    Dialog.confirmAction('Do you want to delete this warehouse?')
    .then(function () {

      $scope.warehouses.data.splice(index, 1);
      ToastsService.showToast('success', 'Warehouse successfully deleted!');

      SettingsService.deleteWarehouse(warehouse.id)
      .then(function (response) {
        updateAfterWarehouseOperation();
      })
      .catch(function (error) {
        ToastsService.showToast('error',
        'There was an error deleting the warehouse, please try again.');
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD DIALOG
  $scope.showAddWarehouseDialog = function (ev) {
    $scope.newWarehouse = {
      created_by: $rootScope.authenticatedUser.id,
    };
    Dialog.showCustomDialog(ev, 'add_warehouse', $scope);
  };

  $scope.showUpdateWarehouseDialog = function (ev, warehouse) {
    $scope.selectedWarehouse = angular.copy(warehouse);
    $scope.existingWarehouseLocation = {
      latitude: warehouse.location_latitude,
      longitude: warehouse.location_longitude,
    };

    Dialog.showCustomDialog(ev, 'update_warehouse', $scope);
  };

  function updateAfterWarehouseOperation() {
    var cache = 'warehouses?page=' +
    $scope.filterParams.page + 'limit=' + $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    getAllWarehouses();
  }

}
})();
