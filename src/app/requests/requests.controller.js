(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, Dialog, RequestsService, NgMap) {

  $scope.types = "['establishment']";
  $scope.placeChanged = function () {
    $scope.place = this.getPlace();
    console.log('location', $scope.place.geometry.location);
    $scope.map.setCenter($scope.place.geometry.location);
  };

  NgMap.getMap().then(function (map) {
    $scope.map = map;
  });

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllRequests();
  }

  // GET ALL REQUESTS
  function getAllRequests() {
    $scope.requestsPromise = RequestsService.getRequests($scope.filterParams)
    .then(function (response) {
      $scope.requests = response.data.data.all_request;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  /////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    $scope.newRequest = {

    };

    Dialog.showCustomDialog(ev, requestType, $scope);
  };

  $scope.openMenu = function ($mdMenu, ev) {
    // originatorEv = ev;
    $mdMenu.open(ev);
  };

}
})();
