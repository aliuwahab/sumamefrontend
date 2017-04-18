(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StaffController', StaffController);

/** @ngInject */
function StaffController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  var _ = lodash;

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
