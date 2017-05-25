(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentRequestsController', EquipmentRequestsController);

/** @ngInject */
function EquipmentRequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  $mdSidenav, ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, EquipmentService, CustomersService) {

  activate();

  function activate() {
    $scope.mapping = {};
    $scope.data = {};
    $scope.selectedEquipment = null;
    $scope.loadingRequiredEquimentRequestData = true;
    $scope.equipmentWizardCurrentStep = 0;

    $scope.newRequest = {
      request_type: 'equipment_request',
      request_status: 'pending',
      request_source: 'admin',
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

  // ADD EQUIPMENT
  function addEquipmentRequest() {
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

  // WIZARD CHECKS AND NEXT STEPS
  $scope.equipmentRequestNextStep = function () {
    if ($scope.equipmentWizardCurrentStep == 0) {
      var proceed = $scope.selectedEquipment ? executeNextStep() :
      ToastsService.showToast('error', 'Please select a vehicle before proceeding.');
    } else if ($scope.equipmentWizardCurrentStep == 1) {
      if ($scope.newRequest.request_cost && $scope.mapping.deliveryLocation.latitude) {
        addEquipmentRequest();
      } else {
        ToastsService.showToast('error',
        'Please enter both number of days and where you\'ll use the equipment');
      }
    }

    function executeNextStep() {
      WizardHandler.wizard('equipmentRequestWizard').next();
      $scope.equipmentWizardCurrentStep =
      WizardHandler.wizard('equipmentRequestWizard').currentStepNumber();
      changeEquipmentRequestModalTitle();
    }
  };

  // WIZARD PREVIOUS STEP
  $scope.equipmentRequestPrevStep = function () {
    WizardHandler.wizard('equipmentRequestWizard').previous();
    $scope.equipmentWizardCurrentStep -= 1;
    changeEquipmentRequestModalTitle();
  };

  // CHANGE REQUEST MODAL TITLE
  function changeEquipmentRequestModalTitle() {
    switch ($scope.equipmentWizardCurrentStep) {
      case 0:
        $scope.modalTitle = 'Search for your desired equipment';
        break;
      case 1:
        $scope.modalTitle = 'Confirm and Submit Request';
        break;
      default:
    }
  };

  // RESET WIZARD WHEN MODAL IS CLOESED
  $scope.cancelEquipmentRequest = function () {
    WizardHandler.wizard('equipmentRequestWizard').reset();
    $rootScope.closeDialog();
  };

  ////////////////////// HELPER FUNCTIONS ///////////////////////////

  function populateEquipmentRequestData() {
    $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;
    $scope.newRequest.pickup_location_name = $scope.selectedEquipment.equipment_location_name;
    $scope.newRequest.pickup_location_latitude =
    $scope.selectedEquipment.equipment_location_latitude;
    $scope.newRequest.pickup_location_longitude =
    $scope.selectedEquipment.equipment_location_longitude;
    $scope.newRequest.equipment_id = $scope.selectedEquipment.id;
    $scope.newRequest.requester_id = $scope.data.selectedCustomer.id;
  }

  // LOAD EQUIPMENT
  function loadEquipment() {
    EquipmentService.getAllEquipment($scope.equipmentFilterParams)
    .then(function (response) {
      $scope.equipment = response.data.data.rental_equipment;
      $scope.loadingRequiredEquimentRequestData = false;
      $scope.filteringEquipment = false;
    })
    .catch(function (error) {
      $scope.loadingRequiredEquimentRequestData = false;
      $scope.filteringEquipment = false;
      debugger;
    });
  }

  // SELECT EQUIPMENT
  $scope.selectEquipment = function (equipment) {
    $scope.selectedEquipment = equipment;
  };

  // CALCULATE REQUEST COST
  $scope.calculateRequestCost = function () {
    if (isNaN($scope.data.numberOfDays)) {
      ToastsService.showToast('error', 'That is not a valid number.');
    }else {
      $scope.newRequest.request_cost = $scope.data.numberOfDays *
      $scope.selectedEquipment.equipment_price_per_day;
    }
  };

  // FILTER EQUIPMENT
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

  $scope.toggleTermsNav = function (equipment, navID) {
    $scope.equipmentDetails = equipment;

    $mdSidenav(navID)
    .toggle();
  };

  /// SEARCH FUNCTION
  $scope.querySearch = function (query) {
    return CustomersService.searchCustomers({ search_key: query, limit: 10, page: 1 })
    .then(function (customersResults) {
      return customersResults.data.data.search_results.data;
    })
    .catch(function (error) {
      debugger;
    });
  };

}
})();
