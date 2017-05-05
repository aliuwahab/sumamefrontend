(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $rootScope, $state, Dialog, DriversService, ToastsService,
CachingService, UploadService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllDrivers();
  }

  function getAllDrivers() {
    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope.drivers = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addDriver = function () {
    $scope.newDriver.password_confirmation = $scope.newDriver.password;
    $scope.addingDriver = true;

    DriversService.addDriver($scope.newDriver)
    .then(function (response) {
      debugger;
      ToastsService.showToast('success', 'Driver successfully added!');
      $scope.addingDriver = false;
      reloadDrivers();
    })
    .catch(function (error) {
      $scope.addingDriver = false;
      debugger;
    });
  };

  $scope.updateDriver = function () {

    $scope.addingDriver = true;

    DriversService.updateDriver($scope.selectedDriver)
    .then(function (response) {
      debugger;
      ToastsService.showToast('success', 'Driver successfully added!');
      $scope.addingDriver = false;
      reloadDrivers();
    })
    .catch(function (error) {
      $scope.addingDriver = false;
      debugger;
    });
  };

  $scope.approveUnapproveDriver = function (driver, action) {
    var title;

    if (!driver.driver_approved) {
      title = 'Do you want to approve this driver?';
    }else {
      title = 'Do you want to unapprove this driver?';
    }

    Dialog.confirmAction(title)
    .then(function () {
      $scope.activateTopProgress = true;

      DriversService.approveUnapproveDriver(driver.id, action)
      .then(function (response) {
        ToastsService.showToast('success', driver.first_name + ' '
        + driver.last_name + ' is now ' + action + 'd!');
        $scope.activateTopProgress = false;
        reloadDrivers();
      })
      .catch(function (error) {
        $scope.activateTopProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD DRIVER DIALOG
  $scope.showAddDriverDialog = function (ev) {
    $scope.newDriver = {
      user_created_by: $rootScope.authenticatedUser.id,
      user_type: 'driver',
      driver_approved: true,
    };

    Dialog.showCustomDialog(ev, 'add_driver', $scope);
  };

  // SHOW UPDATE DRIVER DIALOG
  $scope.showUpdateDriverDialog = function (ev, driver) {
    $scope.selectedDriver = driver;
    Dialog.showCustomDialog(ev, 'update_driver', $scope);
  };

  function reloadDrivers() {
    var cache = 'drivers?page=' + $scope.filterParams.page +
    'limit=' + $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    getAllDrivers();
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
        $scope.newDriver.user_profile_image_url = url;
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

}
})();
