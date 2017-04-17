(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, RequestsService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllRequests();
  }

  function getAllRequests() {
    $scope.requestsPromise = RequestsService.getRequests($scope.filterParams)
    .then(function (response) {
      $scope.requests = response.data.data.all_request;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.openMenu = function ($mdMenu, ev) {
    // originatorEv = ev;
    $mdMenu.open(ev);
  };

}
})();
