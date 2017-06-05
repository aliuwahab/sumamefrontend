(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('ForeignRequestsController', ForeignRequestsController);

/** @ngInject */
function ForeignRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_type', 'online_purchase_delivery');
  }

}
})();
