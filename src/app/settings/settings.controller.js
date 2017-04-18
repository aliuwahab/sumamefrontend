(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SettingsController', SettingsController);

/** @ngInject */
function SettingsController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  var _ = lodash;

  $state.transitionTo('app.settings.staff');
  $scope.currentView = 'Staff';

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

  $scope.changeSettingsTab = function (stateName) {
    switch (stateName){
      case 'staff':
        $state.go('app.settings.staff');
        $scope.currentView = 'Staff';
        break;
      case 'warehouses':
        $state.go('app.settings.warehouses');
        $scope.currentView = 'Warehouses';
        break;
      case 'pricing':
        $state.go('app.settings.pricing');
        $scope.currentView = 'Pricing';
        break;
      default:

        //
    }
  };

}
})();
