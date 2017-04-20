(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $mdSidenav, $mdDialog, $timeout, $rootScope, $state,
    Dialog, ssSideNav, UserService, UploadService, ToastsService, SettingsService,
    localStorageService, ValidationService) {

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
          $scope.user.display_pictures_urls = url;
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

    // UPDATE USRE DETAILS
    $scope.updateUserDetails = function () {
      ValidationService.validate($scope.user, 'consultant')
      .then(function (result) {
        $scope.updatingUser = true;
        UserService.updateUser($scope.user)
        .then(function (response) {
          var updatedUser = response.data.data.user;
          localStorageService.set('profile', updatedUser);
          $rootScope.authenticatedUser = updatedUser;
          $scope.updatingUser = false;
          ToastsService.showToast('success', 'Updated was successful');
          $mdDialog.hide();
        })
        .catch(function (error) {
          $scope.updatingUser = false;
          debugger;
        });
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
      });
    };

    // SPLIT PROFILE IMAGE URLS
    $scope.splitDisplayPicUrl = function (string) {
      var urls = string.split(',');
      return urls[0];
    };

  }
})();
