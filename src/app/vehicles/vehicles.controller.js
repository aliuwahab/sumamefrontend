(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $q, $timeout, $rootScope, $state, Dialog, VehiclesService,
  SettingsService, UploadService, ToastsService, CachingService, DriversService, $window,
  ValidationService) {

  activate();

  function activate() {
    var limit = localStorage.getItem('tablePageLimit') || 20;

    $scope.filterParams = {
      limit: limit,
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

  $scope.paginate = function (page, limit) {
    localStorage.setItem('tablePageLimit', limit);

    $scope.requestsPromise = VehiclesService.getAllVehicles($scope.filterParams)
    .then(function (response) {
      $scope.vehicles = response.data.data.all_vehicles;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.addVehicle = function () {
    ValidationService.validate($scope.newVehicle, 'vehicle')
    .then(function (result) {
      $scope.vehicles.data.unshift($scope.newVehicle);
      $rootScope.closeDialog();

      $scope.addingVehicle = true;
      VehiclesService.addVehicle($scope.newVehicle)
      .then(function (response) {
        ToastsService.showToast('success', response.data.message);
        doAfterVehicleOperation();
      })
      .catch(function (error) {
        $scope.addingVehicle = false;
        ToastsService.showToast('error', error.data.message);
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.updateVehicle = function () {
    $scope.selectedVehicle.created_by = $scope.selectedVehicle.created_by.id;
    $scope.selectedVehicle.vehicle_id = $scope.selectedVehicle.id;

    ValidationService.validate($scope.selectedVehicle, 'vehicle')
    .then(function (result) {
      $scope.addingVehicle = true;
      $rootScope.closeDialog();

      VehiclesService.updateVehicle($scope.selectedVehicle)
      .then(function (response) {
        $scope.addingVehicle = false;
        ToastsService.showToast('success', response.data.message);
        doAfterVehicleOperation();
      })
      .catch(function (error) {
        $scope.addingVehicle = false;
        ToastsService.showToast('error', error.data.message);
        debugger;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.deleteVehicle = function (ev, vehicle) {
    Dialog.confirmAction('Do you want to delete this vehicle?')
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        vehicle_id: vehicle.id,
      };

      VehiclesService.deleteVehicle(data)
      .then(function (response) {

        if (response.data.code == 200) {
          ToastsService.showToast('success', 'Vehicle successfully deleted!');
        } else {
          ToastsService.showToast('error', response.data.message);
        }

        $scope.processInProgress = false;
        doAfterVehicleOperation();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        ToastsService.showToast('error', error.data.message);
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.assignVehicle = function () {
    $scope.processInProgress = true;
    var data = {
      driver_id: $scope.data.selectedDriver.id,
      vehicle_id: $scope.selectedVehicle.id,
    };

    VehiclesService.assignVehicleToDriver(data)
    .then(function (response) {
      ToastsService.showToast('success', response.data.message,
      $scope.data.selectedDriver.full_name);
      $scope.processInProgress = false;
      doAfterVehicleOperation();
    })
    .catch(function (error) {
      $scope.processInProgress = false;
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

  $scope.showAssignVehicleDialog = function (ev, vehicle) {
    $scope.selectedVehicle = vehicle;
    Dialog.showCustomDialog(ev, 'assign_vehicle', $scope);
  };

  $scope.openEquipmentDoc = function (url) {
    if ($rootScope.authenticatedUser.admin_type == 'super') {
      $window.open(url, '_blank');
    }else {
      ToastsService.showToast('error', 'You do not have permission to view this file');
    }
  };

  // LOAD VEHICLE CATEGORIES
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

  // UPLOAD ITEM
  $scope.uploadItem = function (file, field, category, type, editing) {
    $scope.s3Uploader = UploadService;
    var uploadProgress = field + '_progress';
    var uploadToggle = 'uploading_' + field;

    if (file) {
      $scope[uploadToggle] = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope[uploadProgress] = newVal;
      });

      UploadService.uploadFileToS3(file, '', 'image')
      .then(function (url) {
        editing ? $scope.selectedVehicle[field] = url : $scope.newVehicle[field] = url;
        $scope[uploadToggle] = false;
        $scope[uploadProgress] = 0;
      })
      .catch(function (error) {
        $scope[uploadToggle] = false;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

  // RELOAD VEHICLES
  function doAfterVehicleOperation() {
    $scope.addingVehicle = false;
    var cache = 'vehicles?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);
    getAllVehicles();
  }

  ////////////////////// DRIVER SEARCH HELPER FUNCTIONS ////////////////////////
  $scope.querySearch = function (query) {
    return DriversService.searchDrivers({ search_key: query, limit: 10, page: 1 })
    .then(function (driverResults) {
      return driverResults.data.data.search_results.data;
    })
    .catch(function (error) {
      debugger;
    });
  };

}
})();
