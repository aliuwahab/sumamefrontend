(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('PendingRequestsController', PendingRequestsController);

/** @ngInject */
function PendingRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_status', 'pending');
  }

}
})();
