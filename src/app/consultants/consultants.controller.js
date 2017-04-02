(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('ConsultantsController', ConsultantsController);

/** @ngInject */
function ConsultantsController($scope, $q, $rootScope, $timeout, $mdDialog, Dialog, ToastsService,
  Rollbar, ConsultantsService, SettingsService, UploadService, segment, ValidationService) {

  activate();

  function activate() {
    getAllConsultants();
  }

  // RETRIEVE ALL CONSULTANTS
  function getAllConsultants() {
    ConsultantsService.getAllConsultants()
    .then(function (consultants) {
      $scope.consultants = consultants.data.data.all_consultants;
      $scope.consultantsLoaded = true;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  }

  // SHOW ADD CONSULTANT DIALOG
  $scope.showAddConsultantDialog = function (ev) {
    $scope.newConsultant = {
      user_type: 'consultant',
    };

    loadAllSubjects();
    Dialog.showCustomDialog(ev, 'add_consultant', $scope);
  };

  // LOAD ALL SUBJECTS
  function loadAllSubjects() {
    SettingsService.peformGetOperation('get_subjects')
    .then(function (data) {
      $scope.subjects = data.data.data.subjects;
      $scope.allRequiredDataLoaded = true;
    })
    .catch(function () {
      debugger;
    });
  }

  // ADD CONSULTANT
  $scope.addConsultant = function () {
    ValidationService.validate($scope.newConsultant, 'consultant')
    .then(function (result) {
      if (result.valid) {
        $scope.addingConsultant = true;
        ConsultantsService.addConsultant($scope.newConsultant)
        .then(function (response) {
          getAllConsultants();
          ToastsService.showToast('success', 'Consultant has been successfully added!' +
          ' An email will be sent for them to create a password');
          $scope.closeDialog();
          $scope.addingConsultant = false;

          segment.track(segment.events.consultantAdded, {
            name: $rootScope.authenticatedUser.first_name + ' ' + $rootScope.authenticatedUser.last_name,
            consultantName: $scope.newConsultant.first_name + ' ' + $scope.newConsultant.last_name,
            consultantType: $scope.newConsultant.type_of_consultant,
          });
        })
        .catch(function (error) {
          ToastsService.showToast('error', error.message);
          $scope.addingConsultant = false;
          debugger;
        });
      }
    })
    .catch(function (error) {
      ToastsService.showToast('info', error.message);
    });
  };

  // SHOW EDIT CONSULTANT Dialog
  $scope.showEditConsultantDialog = function (ev, consultant) {
    loadAllSubjects();
    $scope.selectedConsultant = angular.copy(consultant);
    Dialog.showCustomDialog(ev, 'edit_consultant', $scope);
  };

  $scope.editConsultant = function () {
    ValidationService.validate($scope.selectedConsultant, 'consultant')
    .then(function (result) {
      if (result.valid) {
        $scope.addingConsultant = true;
        ConsultantsService.editConsultant($scope.selectedConsultant)
        .then(function (response) {
          ToastsService.showToast('success', 'Consultant has been successfully updated!');
          $scope.closeDialog();
          $scope.addingConsultant = false;
          getAllConsultants();
        })
        .catch(function (error) {
          ToastsService.showToast('error', error.message);
          debugger;
        });
      }
    })
    .catch(function (error) {
      ToastsService.showToast('info', error.message);
    });
  };

  // VIEW CONSULTANT DETAILS
  $scope.viewConsultantDetails = function (ev, consultant) {
    $scope.selectedConsultant = angular.copy(consultant);
    Dialog.showCustomDialog(ev, 'view_consultant', $scope)
    .then(function (trigger) {

    }, function () {

    });
  };

  // DELETE CONSULTANT
  $scope.deleteConsultant = function (ev, consultant) {
    var title = 'You\'re to delete ' + consultant.firstname + ' ' + consultant.lastname + '?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      ConsultantsService.deleteConsultant(consultant.id)
      .then(function (response) {
        $scope.consultants.data.splice($scope.consultants.data.indexOf(consultant), 1);
        ToastsService.showToast('success', 'Consultant has been successfully deleted!');

        segment.track(segment.events.consultantDeleted, {
          name: $rootScope.authenticatedUser.first_name + ' ' + $rootScope.authenticatedUser.last_name,
        });
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  // TODO: change delete image from s3 when image is being changed
  $scope.uploadProfileImage = function (file) {
    $scope.s3Uploader = UploadService;

    if (file) {
      $scope.uploadingImage = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'profile', 'image')
      .then(function (url) {

        if ($scope.newConsultant) {
          $scope.newConsultant.display_pictures_urls = url;
        }

        if ($scope.selectedConsultant) {
          $scope.selectedConsultant.display_pictures_urls = url;
        }

        $scope.uploadingImage = false;
        $scope.uploadProgress = 0;
      })
      .catch(function (error) {
        $scope.uploadingImage = false;
        debugger;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

  // SPLIT PROFILE IMAGE URLS
  $scope.splitDisplayPicUrl = function (string) {
    var urls = string.split(',');
    return urls[0];
  };

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
