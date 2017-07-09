(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CancelledRequestsController', CancelledRequestsController);

/** @ngInject */
function CancelledRequestsController($scope) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_status', 'cancelled');
  }

}
})();
