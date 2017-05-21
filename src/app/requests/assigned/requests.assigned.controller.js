(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('AssignedRequestsController', AssignedRequestsController);

/** @ngInject */
function AssignedRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('assigned');
  }

}
})();
