(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StaffController', StaffController);

/** @ngInject */
function StaffController($scope, $rootScope, $state, $mdDialog, lodash, Dialog, ToastsService,
  SettingsService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    // getAllStaff();
  }

  function getAllStaff() {
    $scope.loadingStaff = true;
    SettingsService.getAllStaff($scope.filterParams)
    .then(function (response) {
      $scope.staff = response.data.data.all_staff;
      $scope.loadingStaff = false;
      debugger;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingStaff = false;
      debugger;
    });
  }

  $scope.addStaff = function () {
    debugger;
    $scope.addingStaff = true;
    SettingsService.addStaff($scope.newStaffMember)
    .then(function (response) {
      $scope.addingStaff = false;
      $rootScope.closeDialog();
      ToastsService.showToast('success', 'Staff member successfully added!');

      // getAllStaff();
    })
    .catch(function (error) {
      $scope.addingStaff = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD DIALOG
  $scope.showAddStaffDialog = function (ev) {
    $scope.newStaffMember = {
      user_created_by: $rootScope.authenticatedUser.id,
    };
    Dialog.showCustomDialog(ev, 'add_staff', $scope);
  };

}
})();
