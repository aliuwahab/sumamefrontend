(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('PricingController', PricingController);

/** @ngInject */
function PricingController($scope, $rootScope, $state, $mdDialog, lodash, Dialog) {

  activate();

  function activate() {

  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD DIALOG
  $scope.showAddStaffDialog = function (ev) {
    $scope.newPricing = {};
    Dialog.showCustomDialog(ev, 'add_pricing', $scope);
  };

}
})();
