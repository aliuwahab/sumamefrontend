(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestDetailController', RequestDetailController);

/** @ngInject */
function RequestDetailController($scope, $rootScope, $timeout, $q, $state, $stateParams,
  Dialog, RequestsService, ToastsService, DriversService, Twilio, EquipmentService) {

  activate();

  function activate() {
    $scope.searchText    = null;
    $scope.querySearch   = querySearch;

    getRequest();
  }

  function getRequest() {
    RequestsService.getRequest($stateParams.requestId)
    .then(function (response) {
      $scope.request = response.data.data.request_details;

      if ($scope.request.request_type == 'equipment_request') {
        // getEquipment();
        $scope.requestLoaded = true;
      } else {
        $scope.requestLoaded = true;
      }
    })
    .catch(function (error) {
      debugger;
    });
  }

  // TODO: Dispaly driver for already assigned requests
  $scope.assignRequest = function (driver) {
    Dialog.confirmAction('Do you want to assign this request to ' + driver.display)
    .then(function () {
      $scope.processInProgress = true;
      var data = {
        driver_id: driver.id,
        request_id: $scope.request.id,
      };

      RequestsService.assignRequestToDriver(data)
      .then(function (response) {
        ToastsService.showToast('success', 'Request has been successfully assigned to',
        driver.display);
        $scope.processInProgress = false;
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.changeRequestStatus = function (status) {
    Dialog.confirmAction('Do you want to change the status of this request?')
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        request_id: $scope.request.id,
        request_status: status,
      };

      RequestsService.changeRequestStatus(data)
      .then(function (response) {
        ToastsService.showToast('success', 'Request status successfully changed!');
        $scope.processInProgress = false;
        getAllRequests();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.showMessageDialog = function (ev) {
    Dialog.showCustomDialog(ev, 'send_message', $scope);
  };

  $scope.sendSMS = function () {
    $scope.sendingSMS = true;

    Twilio.create('Messages', {
      From: '+14248885615',
      To: $scope.request.requester.phone_number,
      Body: $scope.messageToCustomer,
    })
    .success(function (data, status, headers, config) {
      $scope.sendingSMS = false;
      ToastsService.showToast('success', 'Message successfully sent!');
      Dialog.closeDialog();
    })
    .error(function (data, status, headers, config) {
      $scope.sendingSMS = false;
      ToastsService.showToast('error', 'There was an error sending message!');
    });
  };

  // GET EQUIPMENT
  function getEquipment() {
    EquipmentService.getAllEquipment({
      equipment_id: $scope.request.equipment_id,
    })
    .then(function (response) {
      debugger;
      $scope.equipment = response.data.data.rental_equipment;
      $scope.requestLoaded = true;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.requestLoaded = true;
      debugger;
    });
  }

  ///////////////// HELPER FUNCTIONS /////////////////
  function querySearch(query) {
    var results = query ? $scope.drivers.filter(createFilterFor(query)) : $scope.drivers;
    var deferred = $q.defer();
    $timeout(function () {
      deferred.resolve(results);
    }, Math.random() * 1000, false);
    return deferred.promise;
  }

  function loadAllDrivers() {
    DriversService.getAllDrivers({ limit: 50, page: 1 })
    .then(function (drivers) {
      $scope.drivers =
      drivers.data.data.all_drivers.data.map(function (driver) {
        return {
          id: driver.id,
          value: driver.first_name.toLowerCase() + ' ' + driver.last_name.toLowerCase(),
          display: driver.first_name + ' ' + driver.last_name,
        };
      });
    })
    .catch(function () {
      debugger;
    });
  }

  loadAllDrivers();

  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(driver) {
      return (driver.value.indexOf(lowercaseQuery) === 0);
    };
  }

  $scope.showAssignRequestDialog = function (ev) {
    Dialog.showCustomDialog(ev, 'assign_request', $scope);
  };

  $scope.openStatusMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

}
})();
