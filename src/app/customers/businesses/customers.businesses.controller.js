(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('BusinessCustomersController', BusinessCustomersController);

/** @ngInject */
function BusinessCustomersController($scope) {

  activate();

  function activate() {
    $scope.getAllCustomers('businessCustomers');
  }

}
})();
