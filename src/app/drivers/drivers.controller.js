(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DriversController', DriversController);

/** @ngInject */
function DriversController($scope, $rootScope, $state, Dialog, DriversService, ToastsService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllRequests();
  }

  function getAllRequests() {
    $scope.requestsPromise = DriversService.getAllDrivers($scope.filterParams)
    .then(function (response) {
      $scope.drivers = response.data.data.all_drivers;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.approveDisapproveDriver = function (driver) {
    var title;

    if (!driver.driver_approved) {
      title = 'Do you want to approve this driver?';
    }else {
      title = 'Do you want to unapprove this driver?';
    }

    Dialog.confirmAction(title)
    .then(function () {
      $scope.activateTopProgress = true;

      DriversService.approveDisapproveDriver(driver.id)
      .then(function (response) {
        ToastsService.showToast('success', driver.first_name + ' '
        + driver.last_name + ' is now approved!');
        $scope.activateTopProgress = false;
        getAllRequests();
      })
      .catch(function (error) {
        $scope.activateTopProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

}
})();
