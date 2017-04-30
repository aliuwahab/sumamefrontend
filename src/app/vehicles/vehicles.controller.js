(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $rootScope, $state, Dialog, VehiclesService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllVehicles();
  }

  function getAllVehicles() {
    $scope.requestsPromise = VehiclesService.getAllVehicles($scope.filterParams)
    .then(function (response) {
      $scope.vehicles = response.data.data.all_vehicles;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addVehicle = function () {
    $scope.addingVehicle = true;
    VehiclesService.addVehicle($scope.newVehicle)
    .then(function (response) {
      $scope.addingVehicle = false;
      ToastsService.showToast('success', 'Vehicle successfully added');
      $rootScope.closeDialog();
      getAllVehicles();
    })
    .catch(function (error) {
      $scope.addingVehicle = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD VEHICLE DIALOG
  $scope.showAddVehicleDialog = function (ev) {
    $scope.newRequest = {

    };

    Dialog.showCustomDialog(ev, 'add_vehicle', $scope);
  };

}
})();
