(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WarehousesController', WarehousesController);

/** @ngInject */
function WarehousesController($scope, $rootScope, $interval, $state, $mdDialog, lodash, Dialog,
  SettingsService, ToastsService, CachingService, ValidationService) {

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
    reloadWarehouses();
  });

  function getAllWarehouses() {
    SettingsService.getAllWarehouses($scope.filterParams)
    .then(function (response) {
      $scope.warehouses = response.data.data.all_requested_addresses;
      $scope.loadingWarehouses = false;
      $scope.$parent.processInProgress = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingWarehouses = false;
      $scope.processInProgress = false;
    });
  }

  $scope.addWarehouse = function () {
    $scope.newWarehouse.location_latitude = $scope.warehouseLocation.latitude;
    $scope.newWarehouse.location_longitude = $scope.warehouseLocation.longitude;

    ValidationService.validate($scope.newWarehouse, 'warehouse')
    .then(function (result) {
      $scope.addingWarehouse = true;
      SettingsService.addWarehouse($scope.newWarehouse)
      .then(function (response) {
        ToastsService.showToast('success', 'Warehouse successfully added');
        $scope.addingWarehouse = false;
        $rootScope.closeDialog();
        reloadWarehouses();
      })
      .catch(function (error) {
        $scope.addingWarehouse = false;
        ToastsService.showToast('error', error.data.message);
        debugger;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
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

    $scope.selectedWarehouse.created_by = $scope.selectedWarehouse.created_by;
    $scope.selectedWarehouse.address_id = $scope.selectedWarehouse.id;
    
    ValidationService.validate($scope.selectedWarehouse, 'warehouse')
    .then(function (result) {
      $scope.addingWarehouse = true;

      SettingsService.updateWarehouse($scope.selectedWarehouse)
      .then(function (response) {
        $scope.addingWarehouse = false;
        $rootScope.closeDialog();
        ToastsService.showToast('success', 'Warehouse successfully updated');
        reloadWarehouses();
      })
      .catch(function (error) {
        $scope.addingWarehouse = false;
        ToastsService.showToast('error', error.data.message);
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });

  };

  $scope.deleteWarehouse = function (warehouse, index) {
    Dialog.confirmAction('Do you want to delete this warehouse?')
    .then(function () {
      $scope.processInProgress = true;

      SettingsService.deleteWarehouse(warehouse.id)
      .then(function (response) {
        ToastsService.showToast('success', 'Warehouse successfully deleted!');
        reloadWarehouses();
        $scope.processInProgress = false;
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

  function reloadWarehouses() {
    var cache = 'warehouses?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);
    $scope.$parent.processInProgress = true;
    getAllWarehouses();
  }

}
})();
