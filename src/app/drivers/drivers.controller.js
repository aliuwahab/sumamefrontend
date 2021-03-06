(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $q, $rootScope, $timeout, $state, Dialog, DriversService,
  ToastsService, CachingService, UploadService, NgMap, localStorageService, $window,
  ValidationService) {

  var scopeVarName;
  var limit = localStorage.getItem('tablePageLimit') || 20;

  activate();

  function activate() {
    $scope.currentView = localStorageService.get('selectedDriversView') || 'app.drivers.approved';
    $state.transitionTo($scope.currentView);

    $scope.filterParams = {
      limit: limit,
      page: 1,
    };
  }

  $rootScope.pusher.subscribe('driver');
  $rootScope.pusher.subscribe('user');

  $rootScope.pusher.bind('driver-updated', function (data) {
    data.driver && data.driver.driver_approved ? refreshAllDrivers(1) : refreshAllDrivers(0);
  });

  $rootScope.pusher.bind('user-deleted', function (data) {
    refreshAllDrivers(1);
  });

  $scope.getAllDrivers = function (approvalStatus) {

    if (approvalStatus != undefined) {
      $scope.filterParams.driver_approved = approvalStatus;
      scopeVarName = 'drivers' + approvalStatus;
    }
    
    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.getDeletedDrivers = function () {
    $scope.deletedDriverParams = {
      limit: limit,
      page: 1,
    };

    $scope.requestsPromise = DriversService.getDeletedDrivers($scope.deletedDriverParams)
    .then(function (response) {
      $scope.deletedDrivers = response.data.data.all_deleted;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.paginate = function (page, limit) {
    localStorage.setItem('tablePageLimit', limit);

    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.searchDrivers = function () {
    if ($scope.searchText && $scope.searchText.length > 0) {
      $scope.searching = true;
      $scope.requestsPromise =
      DriversService.searchDrivers({ search_key: $scope.searchText, limit: 20, page: 1 })
      .then(function (results) {
        $scope.driverResults = results.data.data.search_results;
      })
      .catch(function (error) {
        debugger;
      });
    }
  };

  function refreshAllDrivers(approvalStatus, alternateCache) {
    approvalStatus ? $scope.filterParams.driver_approved = approvalStatus : false;
    var scopeVarName = 'drivers' + $scope.filterParams.driver_approved;
    var cache = 'drivers?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);

    DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope[scopeVarName] = response.data.data.all_drivers;

      if (alternateCache != undefined) {
        $scope.filterParams.driver_approved = alternateCache;
        CachingService.destroyOnCreateOperation('drivers?' +
        $.param($scope.filterParams));
      }

    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addDriver = function () {
    $scope.newDriver.username = $scope.newDriver.phone_number;
    $scope.newDriver.password_confirmation = $scope.newDriver.password;

    ValidationService.validate($scope.newDriver, 'driver')
    .then(function (result) {
      $scope.addingDriver = true;

      if (driverMeetsDocumentRequirements($scope.newDriver)) {
        $scope.newDriver.driver_approved = 1;
      }

      DriversService.addDriver($scope.newDriver)
      .then(function (response) {
        $scope.addingDriver = false;

        if (response.data.code == 200) {
          ToastsService.showToast('success', 'Driver successfully added!');
          refreshAllDrivers();
          $rootScope.closeDialog();
        }else {
          ToastsService.showToast('error', response.data.message);
        }
      })
      .catch(function (error) {
        $scope.addingDriver = false;
        if (error.data && error.data.errors) {
          var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
          ToastsService.showToast('error', errorList[0]);
        } else {
          ToastsService.showToast('error', error.data.message);
        }
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.updateDriver = function () {
    $scope.selectedDriver.driver_id = $scope.selectedDriver.id;
    $scope.selectedDriver.driver_approved ? $scope.selectedDriver.driver_approved = 1 :
    $scope.selectedDriver.driver_approved = 0;

    ValidationService.validate($scope.selectedDriver, 'driver')
    .then(function (result) {
      $scope.addingDriver = true;

      DriversService.updateDriver($scope.selectedDriver)
      .then(function (response) {
        $scope.addingDriver = false;
        if (response.data.code == 200) {
          $rootScope.closeDialog();
          ToastsService.showToast('success', 'Driver successfully updated!');
          refreshAllDrivers();
        } else {
          ToastsService.showToast('error', response.data.message);
        }
      })
      .catch(function (error) {
        $scope.addingDriver = false;
        if (error.data) {
          ToastsService.showToast('error', error.data[Object.keys(error.data)[0]][0]);
        }else {
          ToastsService.showToast('error', 'There was an issue updating driver. Try again.');
        }
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
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
      if (action == 'approve' && !driverMeetsDocumentRequirements(driver)) {
        return ToastsService.showToast('error',
        driver.full_name + ' does not meet document requirements.');
      }

      $scope.processInProgress = true;

      DriversService.approveUnapproveDriver(driver.id, action)
      .then(function (response) {
        ToastsService.showToast('success', driver.first_name + ' '
        + driver.last_name + ' is now ' + action + 'd!');
        $scope.processInProgress = false;
        action == 'approve' ? refreshAllDrivers(0, 1) : refreshAllDrivers(1, 0);
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        if (error.data && error.data.errors) {
          var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
          ToastsService.showToast('error', errorList[0]);
        } else {
          ToastsService.showToast('error', error.data.message);
        }
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

        if (response.data.code == 200) {
          ToastsService.showToast('success', 'Driver successfully deleted!');
        } else {
          ToastsService.showToast('error', response.data.message);
        }

        $scope.processInProgress = false;
        CachingService.destroyOnCreateOperation('deletedDrivers?' +
        $.param($scope.deletedDriverParams));
        driver.driver_approved ? $scope.filterParams.driver_approved = 1 :
        $scope.filterParams.driver_approved = 0;
        CachingService.destroyOnCreateOperation('drivers?' +
        $.param($scope.filterParams));
        $scope.getAllDrivers();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        if (error.data && error.data.errors) {
          var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
          ToastsService.showToast('error', errorList[0]);
        } else {
          ToastsService.showToast('error', error.data.message);
        }
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.restoreDeletedDriver = function (ev, driver) {
    Dialog.confirmAction('Do you want to restore this deleted driver?')
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        user_id: driver.id,
      };

      DriversService.restoreDeletedDriver(data)
      .then(function (response) {

        if (response.data.code == 200) {
          ToastsService.showToast('success', 'Driver successfully restored!');
        } else {
          ToastsService.showToast('error', response.data.message);
        }

        CachingService.destroyOnCreateOperation('deletedDrivers?' +
        $.param($scope.deletedDriverParams));
        driver.driver_approved ? $scope.filterParams.driver_approved = 1 :
        $scope.filterParams.driver_approved = 0;
        CachingService.destroyOnCreateOperation('drivers?' +
        $.param($scope.filterParams));

        $scope.processInProgress = false;
        $scope.getDeletedDrivers();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        if (error.data && error.data.errors) {
          var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
          ToastsService.showToast('error', errorList[0]);
        } else {
          ToastsService.showToast('error', error.data.message);
        }
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.exportToCSV = function(itemFilter) {
    var params = angular.copy($scope.filterParams);

    params.driver_approved = itemFilter;
    params.limit = 1000;

    itemFilter == 'all' ? delete params.driver_approved : false;

    $scope.processInProgress = true;

    var deferred = $q.defer();
    
    DriversService.getAllDrivers(params)
    .then(function (response) {
      var dataToExport = response.data.data.all_drivers.data;
      $scope.processInProgress = false;
      deferred.resolve(dataToExport);
    })
    .catch(function (error) {;
      $scope.processInProgress = false;
      ToastsService.showToast('error', 'There was an error in the export process');
      deferred.reject('There was an error generating data');
    });

    return deferred.promise;
  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  function driverMeetsDocumentRequirements(driver) {
    var requiredDriverDocs = [
      'drivers_licence',
      'drivers_insurance',
      'drivers_vehicle_photo',
      'drivers_vehicle_registration',
    ];

    for (var i = 0; i < requiredDriverDocs.length; i++) {
      if (!driver[requiredDriverDocs[i]]) {
        return false;
      }
    }

    return true;
  }

  // SHOW ADD DRIVER DIALOG
  $scope.showAddDriverDialog = function (ev) {
    $scope.newDriver = {
      user_created_by: $rootScope.authenticatedUser.id,
      user_type: 'driver',
    };

    Dialog.showCustomDialog(ev, 'add_driver', $scope);
  };

  // SHOW DRIVER DIALOG
  $scope.showDriverDialog = function (ev, driver, dialog) {
    $scope.selectedDriver = angular.copy(driver);

    if ($scope.selectedDriver.user_current_latitude &&
      $scope.selectedDriver.user_current_longitude) {
      $scope.validCoordinates = true;

      NgMap.getMap().then(function (map) {
        google.maps.event.trigger(map, 'resize');
        map.setCenter({ lat: $scope.selectedDriver.user_current_latitude,
          lng: $scope.selectedDriver.user_current_longitude, });
      });
    } else {
      $scope.validCoordinates = false;
    }

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

  // UPLOAD IMAGE
  $scope.uploadItem = function (file, field, category, type, MIMEtypes, editing) {
    var fileType = (file.name.substring(file.name.lastIndexOf('.') + 1)).toLowerCase();

    if (file && _.includes(MIMEtypes, fileType)) {
      $scope.s3Uploader = UploadService;
      var uploadProgress = field + '_progress';
      var uploadToggle = 'uploading_' + field;

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
