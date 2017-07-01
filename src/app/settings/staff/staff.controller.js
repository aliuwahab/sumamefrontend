(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StaffController', StaffController);

/** @ngInject */
function StaffController($scope, $rootScope, $state, $mdDialog, lodash, Dialog, ToastsService,
  SettingsService, CachingService, ValidationService, UserService, UploadService) {

  activate();

  function activate() {
    $scope.loadingStaff = true;
    getAllStaff();
  }

  function getAllStaff() {
    SettingsService.getAllStaff()
    .then(function (response) {
      $scope.staff = response.data.data.admins;
      $scope.loadingStaff = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingStaff = false;
      debugger;
    });
  }

  $scope.addStaff = function () {
    $scope.newStaffMember.username = $scope.newStaffMember.phone_number;
    ValidationService.validate($scope.newStaffMember, 'staff')
    .then(function (result) {
      $scope.addingStaff = true;
      // $scope.staff ? $scope.staff.push($scope.newStaffMember) : false;

      SettingsService.addStaff($scope.newStaffMember)
      .then(function (response) {
        $scope.addingStaff = false;
        ToastsService.showToast('success', 'Staff member successfully added!');
        reloadStaff();
        $rootScope.closeDialog();
      })
      .catch(function (error) {
        $scope.addingStaff = false;
        if (error.data && error.data.errors) {
          var errorList = error.data.errors[Object.keys(error.data.errors)[0]];
          ToastsService.showToast('error', errorList[0]);
        } else {
          ToastsService.showToast('error', error.data.message);
        }
      });
    })
    .catch(function (error) {
      debugger;
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.updateStaff = function () {
    $scope.selectedStaffMember.user_type = 'admin';

    ValidationService.validate($scope.selectedStaffMember, 'staff')
    .then(function (result) {
      $scope.addingStaff = true;
      UserService.updateUser($scope.selectedStaffMember)
      .then(function (response) {
        $scope.addingStaff = false;
        ToastsService.showToast('success', 'Staff member successfully updated!');
        reloadStaff();
        $rootScope.closeDialog();
      })
      .catch(function (error) {
        $scope.addingStaff = false;
        ToastsService.showToast('error', error.data.message);
        debugger;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.deleteStaff = function (ev, staff) {
    Dialog.confirmAction('Do you want to delete this staff?')
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        user_id: staff.id,
      };

      SettingsService.deleteStaff(data)
      .then(function (response) {
        ToastsService.showToast('success', 'Staff has been successfully deleted!');
        $scope.processInProgress = false;
        reloadStaff();
        $rootScope.closeDialog();
      })
      .catch(function (error) {
        debugger;
        $scope.processInProgress = false;
        ToastsService.showToast('error', error.data.message);
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // UPLOAD  IMAGE
  $scope.uploadProfileImage = function (file, variable) {
    $scope.s3Uploader = UploadService;

    if (file) {
      $scope.uploadingImage = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'profile', 'image')
      .then(function (url) {
        $scope[variable].user_profile_image_url = url;
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

  // SHOW ADD DIALOG
  $scope.showAddStaffDialog = function (ev) {
    $scope.newStaffMember = {
      user_created_by: $rootScope.authenticatedUser.id,
      user_type: 'admin',
    };
    Dialog.showCustomDialog(ev, 'add_staff', $scope);
  };

  // SHOW UPDATE DIALOG
  $scope.showUpdateStaffDialog = function (ev, staffMember) {
    $scope.selectedStaffMember = angular.copy(staffMember);
    Dialog.showCustomDialog(ev, 'update_staff', $scope);
  };

  function reloadStaff() {
    var cache = 'staff';
    CachingService.destroyOnCreateOperation(cache);
    getAllStaff();
  }
}
})();
