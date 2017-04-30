(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentController', EquipmentController);

/** @ngInject */
function EquipmentController($scope, $rootScope, $state, Dialog, EquipmentService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllEquipment();
  }

  function getAllEquipment() {
    $scope.requestsPromise = EquipmentService.getAllEquipment($scope.filterParams)
    .then(function (response) {
      $scope.vehicles = response.data.data.all_vehicles;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addEquipment = function () {
    $scope.addingEquipment = true;
    EquipmentService.addVehicle($scope.newVehicle)
    .then(function (response) {
      $scope.addingEquipment = false;
      ToastsService.showToast('success', 'Vehicle successfully added');
      $rootScope.closeDialog();
      getAllEquipment();
    })
    .catch(function (error) {
      $scope.addingEquipment = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD VEHICLE DIALOG
  $scope.showAddEquipmentDialog = function (ev) {

    Dialog.showCustomDialog(ev, 'add_vehicle', $scope);
  };

}
})();
