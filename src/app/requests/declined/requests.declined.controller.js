(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DeclinedRequestsController', DeclinedRequestsController);

/** @ngInject */
function DeclinedRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_status', 'declined');
  }

}
})();
