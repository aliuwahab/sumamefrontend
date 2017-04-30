(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService) {

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
      ToastsService.showToast('success', error.data.message);
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
      if ($scope.selectedVehicleType && $scope.deliveryDistance) {
        executeNextStep();
        $scope.calculatedFare =
        PriceCalculator.calculateOfflineDeliveryFare($scope.deliveryDistance,
          $scope.selectedVehicleType.pricing, $scope.selectedVehicleType.base_fare);
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

  $scope.selectVehicleType = function (vehicle) {
    $scope.selectedVehicleType = vehicle;
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
    }else if (requestType == 'add_online_request') {
      $scope.newOnlineRequest = {};
      loadAllWarehouses();
    }
  };

  function loadAllWarehouses() {
    $scope.loadingRequiredOnlineRequestData = true;
    SettingsService.getAllWarehouses($scope.filterParams)
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

  $scope.deliveryVehicleTypes = [
    {
      name: 'Motorbike',
      value: 'motorbike',
      image: '../assets/images/delivery-vehicle-motorbike.jpg',
      base_fare: 5,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 1,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 0.7,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 0.3,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 0.1,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Tri-Cycle',
      value: 'tri_cycle',
      image: '../assets/images/delivery-vehicle-tricycle.jpg',
      base_fare: 10,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 2,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 1,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 0.8,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 0.1,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Abossey Okine Macho',
      value: 'abossey_okine_macho_similar',
      image: '../assets/images/delivery-vehicle-type-7.jpg',
      base_fare: 25,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 5,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 2,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 0.5,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Kia K2700 or similar',
      value: 'kia_k2700_similar',
      image: '../assets/images/delivery-vehicle-kia-2700.jpg',
      base_fare: 50,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 3,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 0.5,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Sprinter Van or similar',
      value: 'sprinter_van_similar',
      image: '../assets/images/delivery-vehicle-sprinter-van.jpg',
      base_fare: 150,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 3,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 1,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Kia Bongo or similar',
      value: 'kia_bongo_similar',
      image: '../assets/images/delivery-vehicle-kia-bongo.jpg',
      base_fare: 150,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 20,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 8,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 3,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Kia Mighty or similar',
      value: 'kia_mighty_similar',
      image: '../assets/images/delivery-vehicle-type-7.jpg',
      base_fare: 150,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 20,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 3,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Kia Rhino or similar',
      value: 'kia_rhino_similar',
      image: '../assets/images/delivery-vehicle-kia-rhino.jpg',
      base_fare: 250,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 25,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 5,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: 'Articulated Truck',
      value: 'articulated_truck_similar',
      image: '../assets/images/delivery-vehicle-articulated-truck.jpg',
      base_fare: 500,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 43,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 23,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 10,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: '20 Seater Bus',
      value: '20_seater_bus_similar',
      image: '../assets/images/delivery-vehicle-20-seater-bus.jpg',
      base_fare: 300,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 25,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 15,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 5,
          calculated_fare: 0,
        },
      ],
    },
    {
      name: '60 Seater Bus',
      value: '60_seater_bus_similar',
      image: '../assets/images/delivery-vehicle-60-seater-bus.jpg',
      base_fare: 500,
      pricing: [
        {
          lower_bound: 0,
          upper_bound: 40,
          fare: 43,
          calculated_fare: 0,
        },
        {
          lower_bound: 41,
          upper_bound: 60,
          fare: 23,
          calculated_fare: 0,
        },
        {
          lower_bound: 61,
          upper_bound: 90,
          fare: 10,
          calculated_fare: 0,
        },
        {
          lower_bound: 92,
          upper_bound: 'infinity',
          fare: 3,
          calculated_fare: 0,
        },
      ],
    },
  ];

}
})();
