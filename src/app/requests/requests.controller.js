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

  $scope.addRequest = function (requestType) {
    switch (requestType) {
      case 'goods_delivery':
        $scope.newRequest = $scope.newOfflineRequest;
        break;
      case 'online_purchase_delivery':
        $scope.newRequest = $scope.newOnlineRequest;
        break;
      case 'vehicle_request':
        $scope.newRequest = $scope.newEquipmentRequest;
        break;
      default:
    }

    $scope.newRequest.request_type = requestType;
    populateNewRequestData();

    debugger;

    RequestsService.addRequest($scope.newRequest)
    .then(function (response) {
      debugger;
    })
    .catch(function (error) {
      $scope.error = error.data.message;
      debugger;
    });
  };

  function populateNewRequestData() {
    $scope.newRequest.pickup_location_name = $scope.pickupLocation.name;
    $scope.newRequest.pickup_location_latitude = $scope.pickupLocation.latitude;
    $scope.newRequest.pickup_location_longitude = $scope.pickupLocation.longitude;

    $scope.newRequest.delivery_location_name = $scope.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.deliveryLocation.longitude;

    $scope.newRequest.requester_id = $rootScope.authenticatedUser.id;
    $scope.newRequest.requester_status = 'pending';
  }

  /////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    Dialog.showCustomDialog(ev, requestType, $scope);
  };

  $scope.openMenu = function ($mdMenu, ev) {
    // originatorEv = ev;
    $mdMenu.open(ev);
  };

}
})();
