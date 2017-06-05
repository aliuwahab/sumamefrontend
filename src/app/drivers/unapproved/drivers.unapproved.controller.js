(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('UnapprovedDriversController', UnapprovedDriversController);

/** @ngInject */
function UnapprovedDriversController($scope) {

  activate();

  function activate() {
    $scope.getAllDrivers(0);
  }

}
})();
