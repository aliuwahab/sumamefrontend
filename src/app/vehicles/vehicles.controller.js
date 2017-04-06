(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $rootScope, $state, VehiclesService) {

  activate();

  function activate() {
    getAllVehicles();
  }

  function getAllVehicles() {
    VehiclesService.getAllVehicles()
    .then(function (response) {
      $scope.vehicles = response.data;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

}
})();
