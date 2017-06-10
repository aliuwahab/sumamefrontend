(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestDetailController', RequestDetailController);

/** @ngInject */
function RequestDetailController($scope, $rootScope, $timeout, $q, $state, $stateParams,
  Dialog, RequestsService, ToastsService, DriversService, Twilio, EquipmentService,
  CachingService) {

  activate();

  function activate() {
    getRequest();
  }

  $rootScope.pusher.bind('request-updated', function (data) {
    reloadRequest();
  });

  function getRequest() {
    RequestsService.getRequest($stateParams.requestId)
    .then(function (response) {
      $scope.request = response.data.data.request_details;
      $scope.requestLoaded = true;
      $scope.processInProgress = false;

      if ($scope.request && $scope.request.comments) {
        $scope.comments = JSON.parse($scope.request.comments);
      }else {
        $scope.comments = [];
      }
    })
    .catch(function (error) {
      debugger;
    });
  }

  $scope.assignRequest = function () {
    Dialog.confirmAction('Do you want to assign this request to ' +
    $scope.data.selectedDriver.full_name)
    .then(function () {
      $scope.processInProgress = true;
      var data = {
        driver_id: $scope.data.selectedDriver.id,
        request_id: $scope.request.id,
      };

      RequestsService.assignRequestToDriver(data)
      .then(function (response) {
        response.data.code == 200 ? ToastsService.showToast('success', response.data.message) :
        ToastsService.showToast('error', response.data.message);
        reloadRequest();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.assignNearbyDriver = function (driver) {
    $scope.data.selectedDriver = driver;
    $scope.assignRequest();
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
        reloadRequest();
      })
      .catch(function (error) {
        ToastsService.showToast('success', 'Request status successfully changed!');
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.changeRequestCost = function () {
    Dialog.confirmAction('Do you want to change the cost of this request?')
    .then(function () {
      $scope.processInProgress = true;
      $scope.newRequestData.request_id = $scope.request.id;

      RequestsService.changeRequestCost($scope.newRequestData)
      .then(function (response) {
        ToastsService.showToast('success', 'Request cost successfully changed!');
        $scope.showInput = false;

        // reloadRequest();
      })
      .catch(function (error) {
        ToastsService.showToast('success', 'Request cost successfully changed!');
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

  $scope.addNote = function () {
    if ($scope.note && $scope.note.newNote) {
      $scope.comments.unshift({
        id: $scope.comments.length + 1,
        commentor_id: $rootScope.authenticatedUser.id,
        commentor_name: $rootScope.authenticatedUser.first_name + ' ' +
        $rootScope.authenticatedUser.last_name,
        date: new Date(),
        note: $scope.note.newNote,
      });

      updateNotes();
      $rootScope.closeDialog();

    }else {
      ToastsService.showToast('error', 'There was no note created');
    }
  };

  $scope.deleteNote = function (index) {
    Dialog.confirmAction('Do you want to delete this note?')
    .then(function () {
      $scope.comments.splice(index, 1);
      updateNotes();
    }, function () {
      // Dialog has been canccelled
    });

  };

  function updateNotes() {
    var stringifiedComments = JSON.stringify($scope.comments);

    var data = {
      request_id: $scope.request.id,
      request_comments: stringifiedComments,
    };

    RequestsService.addNotes(data)
    .then(function (response) {
      // Note added successfully
      reloadRequest();
    })
    .catch(function (error) {
      ToastsService.showToast('error', 'There was an error adding your most recent note');
    });
  }

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

  // SEARCH FOR NEARBY DRIVERS
  function searchNearbyDrivers() {
    $scope.loadingNearestDrivers = true;
    RequestsService.searchNearbyDrivers({
      latitude: $scope.request.pickup_location_latitude,
      longitude: $scope.request.pickup_location_longitude,
    })
    .then(function (response) {
      $scope.nearbyDrivers = response.data.data.nearest_drivers;
      $scope.loadingNearestDrivers = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingNearestDrivers = false;
      debugger;
    });
  }

  ///////////////// HELPER FUNCTIONS /////////////////

  $scope.showAssignRequestDialog = function (ev) {
    Dialog.showCustomDialog(ev, 'assign_request', $scope);
    searchNearbyDrivers();
  };

  $scope.showDialog = function (ev, dialog) {
    Dialog.showCustomDialog(ev, dialog, $scope);
  };

  $scope.openStatusMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  $scope.querySearch = function (query) {
    return DriversService.searchDrivers({ search_key: query, limit: 10, page: 1 })
    .then(function (driverResults) {
      return driverResults.data.data.search_results.data;
    })
    .catch(function (error) {
      debugger;
    });
  };

  function reloadRequest() {
    var cache = 'request?id=' + $scope.request.id;
    CachingService.destroyOnCreateOperation(cache);
    getRequest();
  }

}
})();