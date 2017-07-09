(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('BusinessRequestsController', BusinessRequestsController);

/** @ngInject */
function BusinessRequestsController($scope) {

  activate();

  function activate() {
    $scope.$parent.getRequestsByUserType('business');
  }

}
})();
