(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('PricingController', PricingController);

/** @ngInject */
function PricingController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  var _ = lodash;

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
  };

}
})();
