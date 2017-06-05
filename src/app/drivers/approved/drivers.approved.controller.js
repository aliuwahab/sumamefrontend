(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('ApprovedDriversController', ApprovedDriversController);

/** @ngInject */
function ApprovedDriversController($scope) {

  activate();

  function activate() {
    $scope.getAllDrivers(1);
  }

}
})();
