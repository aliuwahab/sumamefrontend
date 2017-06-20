(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StaffController', StaffController);

/** @ngInject */
function StaffController($scope, $rootScope, $state, $mdDialog, lodash, Dialog, ToastsService,
  SettingsService, CachingService, ValidationService) {

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
      $scope.staff ? $scope.staff.push($scope.newStaffMember) : false;
      $rootScope.closeDialog();

      SettingsService.addStaff($scope.newStaffMember)
      .then(function (response) {
        $scope.addingStaff = false;
        ToastsService.showToast('success', 'Staff member successfully added!');
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

  $scope.updateStaff = function () {
    ValidationService.validate($scope.selectedStaffMember, 'staff')
    .then(function (result) {
      $scope.addingStaff = true;
      SettingsService.updateStaff($scope.selectedStaffMember)
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

  // SHOW ADD DIALOG
  $scope.showAddStaffDialog = function (ev) {
    $scope.newStaffMember = {
      user_created_by: $rootScope.authenticatedUser.id,
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
