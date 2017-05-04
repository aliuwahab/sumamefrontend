(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentRequestsController', EquipmentRequestsController);

/** @ngInject */
function EquipmentRequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, EquipmentService) {

  activate();

  function activate() {
    $scope.mapping = {};
    $scope.equipmentSelectionConfirmed = false;
    $scope.selectedEquipment = null;
    $scope.loadingRequiredEquimentRequestData = true;
    $scope.newRequest = {
      request_type: 'vehicle_request',
      requester_id: $rootScope.authenticatedUser.id,
      request_status: 'pending',
    };

    $scope.equipmentFilterParams = {
      page: 1,
      limit: 20,
    };

    $scope.loadMoreEquipment = function () {
      $scope.filteringEquipment = true;
      loadEquipment();
    };

    loadEquipment();
  }

  $scope.addRequest = function (requestType) {

    populateEquipmentRequestData();
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

  function populateEquipmentRequestData() {
    $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;
  }

  function loadEquipment() {
    EquipmentService.getAllEquipment($scope.equipmentFilterParams)
    .then(function (response) {
      $scope.equipment = response.data.data.rental_equipment;
      $scope.loadingRequiredEquimentRequestData = false;
      $scope.filteringEquipment = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingRequiredEquimentRequestData = false;
      $scope.filteringEquipment = false;
      debugger;
    });
  }

  $scope.filterEquipment = function (type) {
    switch (type) {
      case 'category':
        $scope.filteringEquipment = true;
        loadEquipment();
        break;
      case 'search':
        if ($scope.equipmentFilterParams.equipment_category) {
          delete $scope.equipmentFilterParams.equipment_category;
        }

        $scope.equipmentFilterParams.search = value;
        $scope.filteringEquipment = true;
        loadEquipment();
        break;
      default:
    }
  };

}
})();
