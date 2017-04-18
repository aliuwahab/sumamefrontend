(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WarehousesController', WarehousesController);

/** @ngInject */
function WarehousesController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  var _ = lodash;

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
