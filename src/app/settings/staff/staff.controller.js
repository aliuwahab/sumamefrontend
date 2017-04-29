(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StaffController', StaffController);

/** @ngInject */
function StaffController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  activate();

  function activate() {

  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD DIALOG
  $scope.showAddStaffDialog = function (ev) {
    $scope.newStaff = {};
    Dialog.showCustomDialog(ev, 'add_staff', $scope);
  };

}
})();
