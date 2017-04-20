(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestDetailController', RequestDetailController);

/** @ngInject */
function RequestDetailController($scope, $rootScope, $state, $stateParams, RequestsService) {

  activate();

  function activate() {
    getRequest();
  }

  function getRequest() {
    RequestsService.getRequest($stateParams.requestId)
    .then(function (response) {
      $scope.request = response.data.data.request_details;
      debugger;
    })
    .catch(function (error) {
      debugger;
    });
  }

}
})();
