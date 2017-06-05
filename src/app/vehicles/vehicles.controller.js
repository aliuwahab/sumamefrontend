(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VehiclesController', VehiclesController);

/** @ngInject */
function VehiclesController($scope, $q, $timeout, $rootScope, $state, Dialog, VehiclesService,
  SettingsService, UploadService, ToastsService, CachingService, DriversService, $window) {

  activate();

  function activate() {
    $scope.searchText    = null;
    $scope.querySearch   = querySearch;

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
  };

  $scope.updateVehicle = function () {
    $scope.selectedVehicle.created_by = $scope.selectedVehicle.created_by.id;
    $scope.selectedVehicle.vehicle_id = $scope.selectedVehicle.id;
    $scope.addingVehicle = true;

    VehiclesService.updateVehicle($scope.selectedVehicle)
    .then(function (response) {
      ToastsService.showToast('success', response.data.message);
      doAfterVehicleOperation();
    })
    .catch(function (error) {
      $scope.addingVehicle = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  $scope.assignVehicle = function () {
    Dialog.confirmAction('Do you want to assign this vehicle to ' + $scope.selectedDriver.display)
    .then(function () {
      $scope.processInProgress = true;
      var data = {
        driver_id: $scope.selectedDriver.id,
        vehicle_id: $scope.selectedVehicle.id,
      };

      VehiclesService.assignVehicleToDriver(data)
      .then(function (response) {
        ToastsService.showToast('success', response.data.message,
        $scope.selectedDriver.display);
        $scope.processInProgress = false;
        doAfterVehicleOperation();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
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
    loadAllDrivers();
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
    var cache = 'vehicles?page=' + $scope.filterParams.page +
    'limit=' + $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    $rootScope.closeDialog();
    getAllVehicles();
  }

  ////////////////////// DRIVER SEARCH HELPER FUNCTIONS ////////////////////////
  function querySearch(query) {
    var results = query ? $scope.drivers.filter(createFilterFor(query)) : $scope.drivers;
    var deferred = $q.defer();
    $timeout(function () {
      deferred.resolve(results);
    }, Math.random() * 1000, false);
    return deferred.promise;
  }

  function loadAllDrivers() {
    $scope.loadingDrivers = true;
    DriversService.getAllDrivers({ limit: 50, page: 1 })
    .then(function (drivers) {
      $scope.drivers =
      drivers.data.data.all_drivers.data.map(function (driver) {
        return {
          id: driver.id,
          value: driver.first_name.toLowerCase() + ' ' + driver.last_name.toLowerCase(),
          display: driver.first_name + ' ' + driver.last_name,
        };
      });

      $scope.loadingDrivers = false;
    })
    .catch(function (error) {
      $scope.loadingDrivers = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  }

  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(driver) {
      return (driver.value.indexOf(lowercaseQuery) === 0);
    };
  }

}
})();
