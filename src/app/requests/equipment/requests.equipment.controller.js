(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentTypeRequestsController', EquipmentTypeRequestsController);

/** @ngInject */
function EquipmentTypeRequestsController($scope, $timeout) {

  activate();

  function activate() {
    $scope.getAllRequests('request_type', 'equipment_request');
  }

}
})();
