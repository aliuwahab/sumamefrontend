(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WarehousesController', WarehousesController);

/** @ngInject */
function WarehousesController($scope, $rootScope, $state, $mdDialog, lodash, Dialog,
  SettingsService, ToastsService) {

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
      $rootScope.closeDialog();
      getAllWarehouses();
    })
    .catch(function (error) {
      $scope.error = error.data.message;
      $scope.addingWarehouse = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
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

}
})();
