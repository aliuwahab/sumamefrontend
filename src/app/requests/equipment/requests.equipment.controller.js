(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentRequestsController', EquipmentRequestsController);

/** @ngInject */
function EquipmentRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.$parent.getAllRequests('request_type', 'equipment_request');
  }

}
})();
