(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CompletedRequestsController', CompletedRequestsController);

/** @ngInject */
function CompletedRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('completed');
  }

}
})();
