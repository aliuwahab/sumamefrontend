(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, RequestsService) {

  activate();

  function activate() {
    getAllRequests();
  }

  function getAllRequests() {
    RequestsService.getRequests()
    .then(function (response) {
      $scope.requests = response.data;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

}
})();
