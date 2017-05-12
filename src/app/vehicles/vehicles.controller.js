(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $rootScope, $state, Dialog, VehiclesService, SettingsService,
UploadService, ToastsService, CachingService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllVehicles();
  }

  function getAllVehicles() {
    $scope.requestsPromise = VehiclesService.getAllVehicles($scope.filterParams)
    .then(function (response) {
      $scope.vehicles = response.data.data.all_vehicles;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addVehicle = function () {
    debugger;
    $scope.addingVehicle = true;
    VehiclesService.addVehicle($scope.newVehicle)
    .then(function (response) {
      debugger;
      ToastsService.showToast('success', 'Vehicle successfully added');
      doAfterVehicleOperation();
    })
    .catch(function (error) {
      debugger;
      $scope.addingVehicle = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  $scope.updateVehicle = function () {
    $scope.selectedVehicle.created_by = $scope.selectedVehicle.created_by.id;
    $scope.selectedVehicle.vehicle_id = $scope.selectedVehicle.id;
    $scope.addingVehicle = true;

    VehiclesService.updateVehicle($scope.selectedVehicle)
    .then(function (response) {
      ToastsService.showToast('success', 'Vehicle successfully updated');
      doAfterVehicleOperation();
    })
    .catch(function (error) {
      $scope.addingVehicle = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD VEHICLE DIALOG
  $scope.showAddVehicleDialog = function (ev) {
    loadAllVehicleCategories();
    $scope.newVehicle = {
      created_by: $rootScope.authenticatedUser.id,
    };

    Dialog.showCustomDialog(ev, 'add_vehicle', $scope);
  };

  $scope.showUpdateVehicleDialog = function (ev, vehicle) {
    $scope.selectedVehicle = vehicle;
    loadAllVehicleCategories();
    Dialog.showCustomDialog(ev, 'update_vehicle', $scope);
  };

  $scope.showViewVehicleDialog = function (ev, vehicle) {
    $scope.selectedVehicle = vehicle;
    Dialog.showCustomDialog(ev, 'view_vehicle', $scope);
  };

  function loadAllVehicleCategories() {
    $scope.loadingRequiredData = true;
    SettingsService.getAllVehicleCategories()
    .then(function (response) {
      $scope.priceCategories = response.data.data.categories;
      $scope.loadingRequiredData = false;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      $scope.loadingRequiredData = false;
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
        $scope.newVehicle.vehicle_image = url;
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

  function doAfterVehicleOperation() {
    $scope.addingVehicle = false;
    var cache = 'vehicles?page=' + $scope.filterParams.page +
    'limit=' + $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    $rootScope.closeDialog();
    getAllVehicles();
  }

}
})();
