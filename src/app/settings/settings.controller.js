(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SettingsController', SettingsController);

/** @ngInject */
function SettingsController($scope, $rootScope, $mdDialog, lodash, Dialog, ToastsService,
  SettingsService, CachingService, localStorageService, UploadService, ValidationService) {

  var _ = lodash;
  $scope.selectedSettingsTab = localStorageService.get('selectedSettingsTab') || 0;

  // GET A SPECIFIED COLLECTION OF SETTINGS
  function getList(endpoint) {
    $scope.loadingPromise = SettingsService.peformGetOperation(endpoint)
    .then(function (data) {
      $scope[endpoint] = data.data;
      $scope.loadingPrerequiredData = false;

      if ($scope.get_gradingSystem && $scope.get_gradingSystem.data.gradings.length > 0) {
        $scope.gradingLoaded = true;
        $scope.gradingSystem = JSON.parse($scope.get_gradingSystem.data.gradings[0].grading_system);
      } else {
        $scope.gradingLoaded = true;
        $scope.gradingSystem = [];
      }
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  // SHOW ADD DIALOG
  $scope.showDialog = function (ev, endpoint, dialogTemplate) {
    loadPrerequiredData(endpoint);
    $scope.newSettingsObject = {
      created_by: localStorageService.get('profile').id,
      user_type: localStorageService.get('profile').user_type,
    };

    var newSettingsObjectStatusKey = dialogTemplate.split('_').pop() + '_status';
    $scope.newSettingsObject[newSettingsObjectStatusKey] = 1;
    Dialog.showCustomDialog(ev, dialogTemplate, $scope);
  };

  // PERFORM ADD OPERATION
  $scope.performCreateOperation = function (endpoint) {
    var resourceName = endpoint.split('_')[1];
    ValidationService.validate($scope.newSettingsObject, resourceName)
    .then(function (result) {
      $scope.processingData = true;
      SettingsService.performCreateOperation(endpoint, $scope.newSettingsObject)
      .then(function (response) {
        $scope.processingData = false;
        refreshChangedItem(endpoint);
        $scope.closeDialog();
        ToastsService.showToast('success', 'Successfully added!');
      })
      .catch(function (error) {
        $scope.processingData = false;
        ToastsService.showToast('error', error.message);
        $scope.closeDialog();
        debugger;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  // SHOW EDIT DIALOG
  $scope.showEditDialog = function (ev, targetObject, endpoint, dialogTemplate) {
    $scope.editedObject = angular.copy(targetObject);
    if (endpoint == 'edit_topics') {
      $scope.editedObject.user_type = $rootScope.authenticatedUser.user_type;
    }

    loadPrerequiredData(endpoint);
    Dialog.showCustomDialog(ev, dialogTemplate, $scope);
  };

  // PERFORM EDIT OPERATION
  $scope.performEditOperation = function (endpoint) {
    var resourceName = endpoint.split('_')[1];
    ValidationService.validate($scope.editedObject, resourceName)
    .then(function (result) {
      $scope.processingData = true;
      SettingsService.performEditOperation(endpoint, $scope.editedObject)
      .then(function (response) {
        $scope.processingData = false;
        refreshChangedItem(endpoint);
        $scope.closeDialog();
        ToastsService.showToast('success', 'Update successful!');
      })
      .catch(function (error) {
        $scope.processingData = false;
        ToastsService.showToast('error', error.message);
        debugger;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  // PERFORM DELETE OPERATION
  $scope.performDeleteOperation = function (ev, item, endpointName, collectionName) {
    var title = 'Do you want to delete this ' + endpointName + '?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      $scope.loadingPromise = SettingsService.performDeleteOperation(endpointName, item.id)
      .then(function (response) {

        var scopeVarName = 'get_' + collectionName;
        $scope[scopeVarName].data[collectionName]
        .splice($scope[scopeVarName].data[collectionName].indexOf(item), 1);

        ToastsService.showToast('success', 'Delete operation successful!');
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  // SHOW SOUND DIALOG
  $scope.showSoundDialog = function (ev, endpoint, dialogTemplate) {

    $scope.newSoundObject = {
      sound_purpose: 'quiz_background',
      created_by: localStorageService.get('profile').id,
    };

    $scope.newSoundObject.sound_status =
    ($scope.get_sounds.data.sound.length == 0) ? 'default' : 'general';

    Dialog.showCustomDialog(ev, dialogTemplate, $scope);
  };

  // UPLOAD SOUND TO S3
  $scope.uploadSound = function (file) {
    $scope.s3Uploader = UploadService;

    if (file) {
      $scope.uploadingSound = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'sound', 'sound')
      .then(function (url) {
        $scope.newSoundObject.sound_url = url;
        $scope.uploadingSound = false;

        $scope.uploadProgress = 0;
      })
      .catch(function (error) {
        $scope.uploadingSound = false;
        debugger;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

  // ADD SOUND
  $scope.addSound = function () {
    ValidationService.validate($scope.newSoundObject, 'sound')
    .then(function (result) {
      SettingsService.addSound($scope.newSoundObject)
      .then(function (response) {
        debugger;
        CachingService.destroy('get_sounds');
        getList('get_sounds');
        $scope.closeDialog();
        ToastsService.showToast('success', 'Successfully added!');
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        $scope.closeDialog();
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  // CHANGE SOUND STATUS
  $scope.changeSoundStatus = function (sound) {
    if (sound.sound_status == 'default') {
      var filteredArray = _.filter($scope.get_sounds.data.sound, function (o) {return o.id != sound.id;});

      var currentDefault = _.find(filteredArray, ['sound_status', 'default']);

      if (currentDefault) {
        currentDefault.sound_status = 'general';
      };

      $scope.loadingPromise = SettingsService.performEditOperation('edit_sound', sound)
      .then(function (response) {
        if (currentDefault) {
          $scope.loadingPromise = SettingsService.performEditOperation('edit_sound', currentDefault)
          .then(function (response) {
            ToastsService.showToast('success', 'Default sound successfully changed');
          })
          .catch(function (error) {
            debugger;
            getList('get_sounds');
          });
        }else {
          ToastsService.showToast('success', 'Default sound successfully changed');
        }
      })
      .catch(function (error) {
        debugger;
        getList('get_sounds');
      });
    }else {
      debugger;
      ToastsService.showToast('error', 'Change this by making making another sound the default');
      sound.sound_status = 'default';
    }
  };

  ///////////////// GRADES ////////////////////
  $scope.gradingPristine = true;
  $scope.newGrading = {};

  $scope.deleteGrading = function (index) {
    $scope.gradingSystem.splice(index, 1);
    $scope.gradingPristine = false;
  };

  $scope.addGrading = function () {
    ValidationService.validate($scope.newGrading, 'grade')
    .then(function (result) {
      var gradeValidation =
      ValidationService.validateGrading($scope.gradingSystem, $scope.newGrading);

      if (gradeValidation.valid) {
        $scope.gradingSystem.push($scope.newGrading);
        $scope.gradingPristine = false;
        $scope.newGrading = {};
      }else {
        ToastsService.showToast('error', gradeValidation.message);
      }

    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.saveGradingSystem = function () {
    $scope.gradingLoaded = false;
    SettingsService.addGradingSystem($scope.gradingSystem)
    .then(function (response) {
      CachingService.destroy('get_gradingSystem');
      getList('get_gradingSystem');
      ToastsService.showToast('success', 'Success! Grading system successfully updated!');
    })
    .catch(function (error) {
      $scope.gradingLoaded = true;
      ToastsService.showToast('error', error.data.message);
    });
  };

  /////////////////////  GENERAL HELPER FUNCTIONS //////////////////

  // TAB CHANGE LISTENER
  $scope.onTabChange = function (currentTabName) {
    $scope.currentTab = currentTabName;

    switch (currentTabName){
      case 'countries':
        getList('get_countries');
        break;
      case 'schools':
        getList('get_schools');
        $scope.setSeletedSettingsTab(1);
        break;
      case 'programmes':
        getList('get_courses');
        $scope.setSeletedSettingsTab(2);
        break;
      case 'subjects':
        getList('get_subjects');
        $scope.setSeletedSettingsTab(3);
        break;
      case 'topics':
        getList('get_topics');
        $scope.setSeletedSettingsTab(4);
        break;
      case 'grading':
        $scope.gradingLoaded = false;
        getList('get_gradingSystem');
      case 'sounds':
        getList('get_sounds');
        break;
      default:

        //
    }
  };

  // LOAD ALL PREREQUIRED data
  function loadPrerequiredData(endpoint) {
    if (endpoint == 'add_schools' || endpoint == 'edit_schools') {
      $scope.loadingPrerequiredData = true;
      getList('get_countries');
    }else if (endpoint == 'add_subjects' || endpoint == 'edit_subjects') {
      $scope.loadingPrerequiredData = true;
      getList('get_courses');
    }else if (endpoint == 'add_topics' || endpoint == 'edit_topics') {
      $scope.loadingPrerequiredData = true;
      getList('get_subjects');
    }
  }

  function refreshChangedItem(endpoint) {
    var targetCollection = endpoint.split('_').pop();
    var getEndpoint = 'get_' + targetCollection;
    CachingService.destroy(getEndpoint);
    getList(getEndpoint);
  }

  // SAVE SELECTED TAB TO LOCAL STORAGE
  $scope.setSeletedSettingsTab = function (tabIndex) {
    localStorageService.set('selectedSettingsTab', tabIndex);
  };

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
