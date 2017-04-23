(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $stateParams, Dialog, RequestsService,
  NgMap) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    if ($stateParams && ($stateParams.referer == 'dashboard')) {
      $scope.viewName = $stateParams.viewName;
      $scope.filterParams.request_status = $stateParams.requestStatus;
      $scope.selectedStatus = $stateParams.requestStatus;
    }

    getAllRequests();
  }

  // GET ALL REQUESTS
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

  $scope.filterByRequestStatus = function () {
    switch ($scope.selectedStatus) {
      case 'pending':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Pending Requests';
        getAllRequests();
        break;
      case 'assigned':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Assigned Requests';
        getAllRequests();
        break;
      case 'delivery-in-progress':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'In-Progress Requests';
        getAllRequests();
        break;
      case 'delivered':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Completed Requests';
        getAllRequests();
        break;
      default:
        delete $scope.filterParams.request_status;
        $scope.viewName = 'Requests';
        getAllRequests();
    }
  };

  /////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    $scope.newRequest = {

    };

    Dialog.showCustomDialog(ev, requestType, $scope);
  };

  $scope.openMenu = function ($mdMenu, ev) {
    // originatorEv = ev;
    $mdMenu.open(ev);
  };

}
})();
