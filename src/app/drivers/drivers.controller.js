(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $rootScope, $state, DriversService) {

  activate();

  function activate() {
    getAllRequests();
  }

  function getAllRequests() {
    DriversService.getAllDrivers()
    .then(function (response) {
      $scope.drivers = response.data;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

}
})();
