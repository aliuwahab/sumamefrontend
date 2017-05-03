(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('OnlineRequestsController', OnlineRequestsController);

/** @ngInject */
function OnlineRequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, PriceCalculator, CachingService,
  SettingsService) {

  activate();

  function activate() {
    $scope.mapping = {};
    $scope.loadingRequiredOnlineRequestData = true;
    $scope.newRequest = {
      request_type: 'online_purchase_delivery',
      requester_id: $rootScope.authenticatedUser.id,
      request_status: 'pending',
      estimated_delivery_distance: 0,
    };
    loadAllWarehouses();
  }

  $scope.addOnlineRequest = function () {

    populateNewOnlineRequestData();

    $scope.addingRequest = true;
    RequestsService.addRequest($scope.newRequest)
    .then(function (response) {
      $scope.addingRequest = false;
      $rootScope.$broadcast('newRequestAdded');
    })
    .catch(function (error) {
      $scope.addingRequest = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  ////////////////////// HELPER FUNCTIONS ///////////////////////////

  function populateNewOnlineRequestData() {
    $scope.newRequest.pickup_location_name = $scope.selectedWarehouse.name;
    $scope.newRequest.pickup_location_latitude = $scope.selectedWarehouse.location_latitude;
    $scope.newRequest.pickup_location_longitude = $scope.selectedWarehouse.location_longitude;

    $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;
  }

  function loadAllWarehouses() {
    SettingsService.getAllWarehouses({ limit: 50, page: 1 })
    .then(function (response) {
      $scope.loadingRequiredOnlineRequestData = false;
      $scope.warehouses = response.data.data.all_requested_addresses;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingRequiredOnlineRequestData = false;
      debugger;
    });
  }

}
})();
