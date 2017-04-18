(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $rootScope, $state, DriversService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllRequests();
  }

  function getAllRequests() {
    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope.drivers = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.approveDriver = function () {

  };

}
})();
