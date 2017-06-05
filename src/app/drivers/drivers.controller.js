(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $rootScope, $state, Dialog, DriversService, ToastsService,
CachingService, UploadService, NgMap, localStorageService, $window) {

  activate();

  function activate() {
    $scope.currentView = localStorageService.get('selectedDriversView') || 'app.drivers.approved';
    $state.transitionTo($scope.currentView);

    $scope.filterParams = {
      limit: 50,
      page: 1,
    };
  }

  $rootScope.pusher.subscribe('driver');
  $rootScope.pusher.subscribe('user');

  $rootScope.pusher.bind('driver-updated', function (data) {
    data.driver && data.driver.driver_approved ? reloadDrivers(1) : reloadDrivers(0);
  });

  $rootScope.pusher.bind('user-deleted', function (data) {
    reloadDrivers(1);
  });

  $scope.getAllDrivers = function (approvalStatus) {
    $scope.filterParams.driver_approved = approvalStatus;
    var scopeVarName = 'drivers' + approvalStatus;

    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  function refreshAllDrivers(approvalStatus) {
    $scope.filterParams.driver_approved = approvalStatus;
    var scopeVarName = 'drivers' + approvalStatus;

    DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_drivers;
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
      })
      .catch(function (error) {
        $scope.activateTopProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.deleteDriver = function (ev, driver) {
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
        reloadDrivers();
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

    NgMap.getMap().then(function (map) {
      google.maps.event.trigger(map, 'resize');
      map.setCenter({ lat: $scope.selectedDriver.user_current_latitude,
        lng: $scope.selectedDriver.user_current_longitude, });
    });

    Dialog.showCustomDialog(ev, dialog, $scope);
  };

  $scope.changeDriversTab = function (stateName) {
    $scope.currentView = stateName;
    localStorageService.set('selectedDriversView', stateName);
    $state.go(stateName);
  };

  $scope.openDriverDoc = function (url) {
    if ($rootScope.authenticatedUser.admin_type == 'super') {
      $window.open(url, '_blank');
    }else {
      ToastsService.showToast('error', 'You do not have permission to view this file');
    }
  };

  function reloadDrivers(approvalStatus) {
    var cache = 'drivers?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);
    refreshAllDrivers(approvalStatus);
  }

  // UPLOAD IMAGE
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
        editing ? $scope.selectedDriver[field] = url : $scope.newDriver[field] = url;
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

}
})();
