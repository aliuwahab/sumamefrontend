(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SettingsController', SettingsController);

/** @ngInject */
function SettingsController($scope, $rootScope, $mdDialog, lodash, Dialog) {

  var _ = lodash;

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
