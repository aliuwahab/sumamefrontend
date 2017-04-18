(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $rootScope, $state, VehiclesService) {

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

}
})();
