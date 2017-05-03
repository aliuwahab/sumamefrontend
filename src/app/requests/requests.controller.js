(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, EquipmentService) {

  activate();

  function activate() {

    $scope.filterParams = {
      limit: 20,
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
        populateNewOfflineRequestData();
        break;
      case 'online_purchase_delivery':
        $scope.newRequest = $scope.newOnlineRequest;
        populateNewOnlineRequestData();
        break;
      case 'vehicle_request':
        $scope.newRequest = $scope.newEquipmentRequest;
        break;
      default:
    }

    $scope.newRequest.request_type = requestType;
    populateCommonRequestData();

    $scope.addingRequest = true;
    RequestsService.addRequest($scope.newRequest)
    .then(function (response) {
      $scope.addingRequest = false;
      ToastsService.showToast('success', 'Request successfully added');
      $rootScope.closeDialog();
      var requestsCache = 'requests?page=' +
      $scope.filterParams.page + 'limit=' + $scope.filterParams.limit;
      CachingService.destroyOnCreateOperation(requestsCache);
      getAllRequests();
    })
    .catch(function (error) {
      $scope.addingRequest = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  $scope.offlineRequestNextStep = function () {

    if ($scope.offlineWizardCurrentStep == 0) {
      if ($scope.mapping.pickupLocation.latitude && $scope.mapping.deliveryLocation.latitude) {
        executeNextStep();
        PriceCalculator.calculateDeliveryDistance($scope.mapping.pickupLocation,
        $scope.mapping.deliveryLocation)
        .then(function (response) {
          $scope.deliveryDistance = response;
        })
        .catch(function (error) {
          debugger;
        });
      }else {
        ToastsService.showToast('error', 'Please enter valid locations for pickup and delivery');
      }
    } else if ($scope.offlineWizardCurrentStep == 1) {
      if ($scope.selectedServiceCategory && $scope.deliveryDistance) {
        executeNextStep();
        $scope.calculatedFare =
        PriceCalculator.calculateOfflineDeliveryFare($scope.deliveryDistance,
          $scope.selectedServiceCategory.category_pricing,
          $scope.selectedServiceCategory.category_base_fare);
      }else {
        ToastsService.showToast('error', 'Please choose a delivery service type');
      }
    }

    function executeNextStep() {
      WizardHandler.wizard('offlineRequestWizard').next();
      $scope.offlineWizardCurrentStep =
      WizardHandler.wizard('offlineRequestWizard').currentStepNumber();
      changeOfflineRequestModalTitle();
    }
  };

  $scope.offlineRequestPrevStep = function () {
    WizardHandler.wizard('offlineRequestWizard').previous();
    $scope.offlineWizardCurrentStep -= 1;
    changeOfflineRequestModalTitle();
  };

  function changeOfflineRequestModalTitle() {
    switch ($scope.offlineWizardCurrentStep) {
      case 0:
        $scope.modalTitle = 'Set your pickup and delivery locations (Step 1 of 3)';
        break;
      case 1:
        $scope.modalTitle = 'What kind of vehicle will your package fit? (Step 2 of 3)';
        break;
      case 2:
        $scope.modalTitle = 'Submit your request (Step 3 of 3)';
        break;
      default:
    }
  };

  $scope.cancelOfflineRequest = function () {
    WizardHandler.wizard('offlineRequestWizard').reset();
    $rootScope.closeDialog();
  };

  ////////////////////// HELPER FUNCTIONS ///////////////////////////

  $scope.openMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  $scope.selectServiceCategory = function (category) {
    $scope.selectedServiceCategory = category;
  };

  function populateNewOfflineRequestData() {
    $scope.newRequest.pickup_location_name = $scope.mapping.pickupLocation.name;
    $scope.newRequest.pickup_location_latitude = $scope.mapping.pickupLocation.latitude;
    $scope.newRequest.pickup_location_longitude = $scope.mapping.pickupLocation.longitude;

    $scope.newRequest.estimated_delivery_distance = $scope.deliveryDistance;
  }

  function populateNewOnlineRequestData() {
    $scope.newRequest.pickup_location_name = $scope.selectedWarehouse.name;
    $scope.newRequest.pickup_location_latitude = $scope.selectedWarehouse.location_latitude;
    $scope.newRequest.pickup_location_longitude = $scope.selectedWarehouse.location_longitude;
    $scope.newRequest.estimated_delivery_distance = 0;
  }

  function populateCommonRequestData() {
    $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;

    $scope.newRequest.requester_id = $rootScope.authenticatedUser.id;
    $scope.newRequest.request_status = 'pending';
  }

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    Dialog.showCustomDialog(ev, requestType, $scope);
    $scope.mapping = {};

    if (requestType == 'add_offline_request') {
      $scope.newOfflineRequest = {};
      $scope.offlineWizardCurrentStep = 0;
      $scope.modalTitle = 'Set your pickup and delivery locations (Step 1 of 3)';
      loadAllVehicleCategories();
    }else if (requestType == 'add_online_request') {
      $scope.newOnlineRequest = {};
      loadAllWarehouses();
    }else if (requestType == 'add_equipment_request') {
      $scope.newEquipmentRequest = {};
      $scope.equipmentSelectionConfirmed = false;
      $scope.selectedEquipment = null;
      $scope.loadingRequiredEquimentRequestData = true;
      $scope.equipmentFilterParams = {
        page: 1,
        limit: 2,
      };

      $scope.loadMoreEquipment = function () {
        $scope.filteringEquipment = true;
        loadEquipment();
      };

      loadEquipment();
    }
  };

  function loadAllWarehouses() {
    $scope.loadingRequiredOnlineRequestData = true;
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

  function loadAllVehicleCategories() {
    $scope.loadingRequiredOfflineRequestData = true;
    SettingsService.getAllVehicleCategories()
    .then(function (response) {
      $scope.categories = response.data.data.categories;
      $scope.loadingRequiredOfflineRequestData = false;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      $scope.loadingRequiredOfflineRequestData = false;
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
