(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('OfflineRequestsController', OfflineRequestsController);

/** @ngInject */
function OfflineRequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, UploadService, CustomersService, ValidationService) {

  activate();

  function activate() {
    $scope.data = {};
    $scope.newRequest = {
      request_type: 'offline_delivery',
      request_status: 'pending',
      request_source: 'admin',
    };
    $scope.offlineWizardCurrentStep = 0;
    $scope.mapping = {};
    $scope.modalTitle = 'Set your pickup and delivery locations (Step 1 of 3)';
    loadAllVehicleCategories();
  }

  $scope.addOfflineRequest = function () {
    populateNewOfflineRequestData();

    ValidationService.validate($scope.newRequest, 'otherRequest')
    .then(function (result) {
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
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });

  };

  $scope.offlineRequestNextStep = function () {

    if ($scope.offlineWizardCurrentStep == 0) {
      if ($scope.mapping.pickupLocation.latitude &&
        $scope.mapping.deliveryLocation.latitude &&
        $scope.data.selectedCustomer) {
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
        ToastsService.showToast('error', 'Please enter valid locations and CustomersService');
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

  $scope.selectServiceCategory = function (category) {
    $scope.selectedServiceCategory = category;
  };

  function populateNewOfflineRequestData() {
    if ($scope.mapping) {
      $scope.newRequest.pickup_location_name = $scope.mapping.pickupLocation.name;
      $scope.newRequest.pickup_location_latitude = $scope.mapping.pickupLocation.latitude;
      $scope.newRequest.pickup_location_longitude = $scope.mapping.pickupLocation.longitude;
    }

    if ($scope.mapping) {
      $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
      $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
      $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;
    }

    if ($scope.deliveryDistance && $scope.calculatedFare && $scope.data.selectedCustomer) {
      $scope.newRequest.estimated_delivery_distance = $scope.deliveryDistance;
      $scope.newRequest.request_cost = $scope.calculatedFare.totalFare;
      $scope.newRequest.requester_id = $scope.data.selectedCustomer.id;
    }
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

  // UPLOAD IMAGE
  $scope.uploadImage = function (file) {
    $scope.s3Uploader = UploadService;

    if (file) {
      $scope.uploadingImage = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'request', 'image')
      .then(function (url) {
        $scope.newRequest.request_image = url;
        $scope.uploadingImage = false;
        $scope.uploadProgress = 0;
      })
      .catch(function (error) {
        $scope.uploadingImage = false;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
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
