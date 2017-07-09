(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('IndividualRequestsController', IndividualRequestsController);

/** @ngInject */
function IndividualRequestsController($scope) {

  activate();

  function activate() {
    $scope.$parent.getRequestsByUserType('individual');
  }

}
})();
