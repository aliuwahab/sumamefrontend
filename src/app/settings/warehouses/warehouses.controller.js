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
  }

  function getAllWarehouses() {
    $scope.loadingWarehouses = true;
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
    $scope.addingWarehouse = true;

    SettingsService.addWarehouse($scope.newWarehouse)
    .then(function (response) {
      $scope.addingWarehouse = false;
      ToastsService.showToast('success', 'Warehouse successfully added');
      updateAfterWarehouseOperation();
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
    $rootScope.closeDialog();
    getAllWarehouses();
  }

}
})();
