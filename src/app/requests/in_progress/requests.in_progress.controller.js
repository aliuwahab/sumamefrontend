(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('InProgressRequestsController', InProgressRequestsController);

/** @ngInject */
function InProgressRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_status', 'delivery-in-progress');
  }

}
})();
