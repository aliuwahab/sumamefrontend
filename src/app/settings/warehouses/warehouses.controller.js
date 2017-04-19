(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WarehousesController', WarehousesController);

/** @ngInject */
function WarehousesController($scope, $rootScope, $state, $mdDialog, lodash, Dialog,
  SettingsService) {

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

}
})();
