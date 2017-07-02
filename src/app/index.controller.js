(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $mdSidenav, $rootScope, Dialog, ssSideNav, UserService,
    UploadService, ToastsService, localStorageService, ValidationService) {

    $scope.onClickMenu = function () {
      $mdSidenav('left').toggle();
    };

    $scope.menu = ssSideNav;

    // SHOW USER EDIT DIALOG
    $scope.showUserEditDialog = function (ev) {
      $scope.user = angular.copy($rootScope.authenticatedUser);
      Dialog.showCustomDialog(ev, 'edit_user', $scope);
    };

    // UPLOAD PROFILE IMAGE
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
          $scope.user.user_profile_image_url = url;
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

    // UPDATE USER DETAILS
    $scope.updateUserDetails = function () {
      ValidationService.validate($scope.user, 'staff')
      .then(function (result) {
        $scope.updatingUser = true;
        $scope.updatedUser = $scope.user;

        UserService.updateUser($scope.user)
        .then(function (response) {
          if (response.data.code == 200) {
            localStorageService.set('profile', $scope.updatedUser);
            $rootScope.authenticatedUser = $scope.updatedUser;
            $scope.updatingUser = false;
            ToastsService.showToast('success', 'Updated was successful');
            $rootScope.closeDialog();
          }else {
            ToastsService.showToast('error', 'There was a problem updating your details');
            $rootScope.closeDialog();
          }
        })
        .catch(function (error) {
          $scope.updatingUser = false;
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
  }
})();
