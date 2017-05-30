(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('LocalRequestsController', LocalRequestsController);

/** @ngInject */
function LocalRequestsController($scope) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_type', 'offline_delivery');
  }

}
})();
