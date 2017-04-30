(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog, RequestsService,
  NgMap, uiGmapGoogleMapApi, WizardHandler) {

  activate();

  function activate() {

    $scope.offlineWizardCurrentStep = 0;
    $scope.mapping = {};

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

  $scope.offlineRequestNextStep = function () {
    WizardHandler.wizard('offlineRequestWizard').next();
    $scope.offlineWizardCurrentStep = WizardHandler.wizard('offlineRequestWizard').currentStepNumber();
    changeOfflineRequestModalTitle();

    if ($scope.offlineWizardCurrentStep == 1) {
      calculateDeliveryDistance();
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

  function calculateDeliveryDistance() {
    if ($scope.mapping.pickupLocation && $scope.mapping.deliveryLocation) {
      uiGmapGoogleMapApi.then(function (maps) {
        var directionsService = new maps.DirectionsService();

        var request = {
          origin: new maps.LatLng(
           $scope.mapping.pickupLocation.latitude,
           $scope.mapping.pickupLocation.longitude
          ),
          destination: new maps.LatLng(
            $scope.mapping.deliveryLocation.latitude,
            $scope.mapping.deliveryLocation.longitude
          ),
          travelMode: maps.TravelMode['DRIVING'],
          optimizeWaypoints: true,
        };

        directionsService.route(request, function (response, status) {
          status == 'OK' ?  $scope.deliveryDistance = (response.routes[0].legs[0].distance.value) / 1000 : ToastsService.showToast('error', 'There was an error in distance calculation. Try again or contact Klloyds directly.');
        });
      });
    }
  }

  function populateNewRequestData() {
    $scope.newRequest.pickup_location_name = $scope.mapping.pickupLocation.name;
    $scope.newRequest.pickup_location_latitude = $scope.mapping.pickupLocation.latitude;
    $scope.newRequest.pickup_location_longitude = $scope.mapping.pickupLocation.longitude;

    $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
    $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
    $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;

    $scope.newRequest.requester_id = $rootScope.authenticatedUser.id;
    $scope.newRequest.requester_status = 'pending';
  }

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    Dialog.showCustomDialog(ev, requestType, $scope);

    if (requestType == 'add_offline_request') {
      $scope.modalTitle = 'Set your pickup and delivery locations (Step 1 of 3)';

      $scope.deliveryVehicleTypes = [
        {
          name: 'Motorbike',
          value: 'motorbike',
          image: '../assets/images/delivery-vehicle-motorbike.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Tri-Cycle',
          value: 'tri_cycle',
          image: '../assets/images/delivery-vehicle-tricycle.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Abossey Okine Macho',
          value: 'abossey_okine_macho_similar',
          image: '../assets/images/delivery-vehicle-type-7.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Kia K2700 or similar',
          value: 'kia_k2700_similar',
          image: '../assets/images/delivery-vehicle-kia-2700.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Sprinter Van or similar',
          value: 'sprinter_van_similar',
          image: '../assets/images/delivery-vehicle-sprinter-van.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Kia Bongo or similar',
          value: 'kia_bongo_similar',
          image: '../assets/images/delivery-vehicle-kia-bongo.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Kia Mighty or similar',
          value: 'kia_mighty_similar',
          image: '../assets/images/delivery-vehicle-type-7.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Kia Rhino or similar',
          value: 'kia_rhino_similar',
          image: '../assets/images/delivery-vehicle-kia-rhino.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: 'Articulated Truck',
          value: 'articulated_truck_similar',
          image: '../assets/images/delivery-vehicle-articulated-truck.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: '20 Seater Bus',
          value: '20_seater_bus_similar',
          image: '../assets/images/delivery-vehicle-20-seater-bus.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
        {
          name: '60 Seater Bus',
          value: '60_seater_bus_similar',
          image: '../assets/images/delivery-vehicle-60-seater-bus.jpg',
          pricing: [
            {
              lower_bound: 0,
              upper_bound: 40,
              amount: 43,
            },
            {
              lower_bound: 41,
              upper_bound: 60,
              amount: 23,
            },
            {
              lower_bound: 61,
              upper_bound: 90,
              amount: 10,
            },
            {
              lower_bound: 61,
              upper_bound: 'infinity',
              amount: 3,
            },
          ],
        },
      ];
    }
  };

}
})();
