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

  $rootScope.pusher.subscribe('driver');

  $rootScope.pusher.bind('driver-updated', function (data) {
    reloadDrivers();
  });

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
      ToastsService.showToast('success', 'Driver successfully added!');
      $scope.addingDriver = false;
      $rootScope.closeDialog();
      // reloadDrivers();
    })
    .catch(function (error) {
      $scope.addingDriver = false;
      debugger;
    });
  };

  $scope.updateDriver = function () {

    $scope.addingDriver = true;
    $scope.selectedDriver.driver_id = $scope.selectedDriver.id;

    DriversService.updateDriver($scope.selectedDriver)
    .then(function (response) {
      ToastsService.showToast('success', 'Driver successfully added!');
      $scope.addingDriver = false;
      $rootScope.closeDialog();
      // reloadDrivers();
    })
    .catch(function (error) {
      $scope.addingDriver = false;
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
        // reloadDrivers();
      })
      .catch(function (error) {
        $scope.activateTopProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.deleteDriver = function (driver) {
    Dialog.confirmAction('Do you want to delete this driver?')
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        user_id: driver.id,
      };

      DriversService.deleteDriver(data)
      .then(function (response) {

        if (response.data == 200) {
          ToastsService.showToast('success', 'Driver successfully deleted!');
        } else {
          ToastsService.showToast('error', response.data.message);
        }

        $scope.processInProgress = false;
        // reloadDrivers();
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

  // SHOW ADD DRIVER DIALOG
  $scope.showAddDriverDialog = function (ev) {
    $scope.newDriver = {
      user_created_by: $rootScope.authenticatedUser.id,
      user_type: 'driver',
      driver_approved: true,
    };

    Dialog.showCustomDialog(ev, 'add_driver', $scope);
  };

  // SHOW DRIVER DIALOG
  $scope.showDriverDialog = function (ev, driver, dialog) {
    $scope.selectedDriver = driver;
    Dialog.showCustomDialog(ev, dialog, $scope);
  };

  function reloadDrivers() {
    var cache = 'drivers?' + $.param($scope.filterParams);
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
