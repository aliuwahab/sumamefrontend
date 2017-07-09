(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('IndividualCustomersController', IndividualCustomersController);

/** @ngInject */
function IndividualCustomersController($scope) {

  activate();

  function activate() {
    $scope.getAllCustomers('individualCustomers');
  }

}
})();
