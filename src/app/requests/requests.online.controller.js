(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('OnlineRequestsController', OnlineRequestsController);

/** @ngInject */
function OnlineRequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, PriceCalculator, CachingService, UploadService,
  SettingsService, CustomersService, ValidationService) {

  activate();

  function activate() {
    $scope.mapping = {};
    $scope.loadingRequiredOnlineRequestData = true;
    $scope.newRequest = {
      request_type: 'online_purchase_delivery',
      request_status: 'pending',
      estimated_delivery_distance: 0,
      request_source: 'admin',
    };
    loadAllWarehouses();
  }

  $scope.addOnlineRequest = function () {

    populateNewOnlineRequestData();

    ValidationService.validate($scope.newRequest, 'foreignPurchaseRequest')
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

  $scope.calculateRequestCost = function () {
    if (!isNaN($scope.itemValue)) {
      $scope.newRequest.request_cost =
      PriceCalculator.calculateOnlineDeliveryFare($scope.pricePercentage, $scope.itemValue);
    }else {
      ToastsService.showToast('error', 'This field must be a valid number.');
    }
  };

  ////////////////////// HELPER FUNCTIONS ///////////////////////////

  function populateNewOnlineRequestData() {
    if ($scope.selectedWarehouse) {
      $scope.newRequest.pickup_location_name = $scope.selectedWarehouse.name;
      $scope.newRequest.pickup_location_latitude = $scope.selectedWarehouse.location_latitude;
      $scope.newRequest.pickup_location_longitude = $scope.selectedWarehouse.location_longitude;
    }

    if ($scope.mapping) {
      $scope.newRequest.delivery_location_name = $scope.mapping.deliveryLocation.name;
      $scope.newRequest.delivery_location_latitude = $scope.mapping.deliveryLocation.latitude;
      $scope.newRequest.delivery_location_longitude = $scope.mapping.deliveryLocation.longitude;
    }

    if ($scope.data.selectedCustomer) {
      $scope.newRequest.requester_id = $scope.data.selectedCustomer.id;
    }
  }

  function loadAllWarehouses() {
    SettingsService.getAllWarehouses({ limit: 50, page: 1 })
    .then(function (response) {
      $scope.warehouses = response.data.data.all_requested_addresses;
      getPricePercentage();
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingRequiredOnlineRequestData = false;
      debugger;
    });
  }

  function getPricePercentage() {
    SettingsService.getPricingDetails()
    .then(function (response) {
      $scope.loadingRequiredOnlineRequestData = false;
      var percentageValue = response.data.data.price_estaimates[0].price_percentage_per_value;
      $scope.pricePercentage = percentageValue / 100;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingRequiredOnlineRequestData = false;
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
