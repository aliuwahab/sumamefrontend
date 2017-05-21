(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, EquipmentService, ENV) {

  activate();

  function activate() {

    $scope.filterParams = {
      limit: 20,
      page: 1,
    };

    if ($stateParams && ($stateParams.referer == 'dashboard')) {
      $scope.viewName = $stateParams.viewName;
      $scope.filterParams.request_status = $stateParams.requestStatus;
      $scope.selectedStatus = $stateParams.requestStatus;
    }

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher(ENV.pusherApiKey, {
      cluster: 'eu',
      encrypted: true,
    });

    var channel = pusher.subscribe('requests');
    channel.bind('request_added', function (data) {
      debugger;
    });

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

  $scope.filterByRequestStatus = function () {
    switch ($scope.selectedStatus) {
      case 'pending':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Pending Requests';
        getAllRequests();
        break;
      case 'assigned':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Assigned Requests';
        getAllRequests();
        break;
      case 'delivery-in-progress':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'In-Progress Requests';
        getAllRequests();
        break;
      case 'delivered':
        $scope.filterParams.request_status = $scope.selectedStatus;
        $scope.viewName = 'Completed Requests';
        getAllRequests();
        break;
      default:
        delete $scope.filterParams.request_status;
        $scope.viewName = 'Requests';
        getAllRequests();
    }
  };

  $scope.cancelRequest = function (request) {
    if (request.request_status != 'pending' && request.request_status != 'declined') {
      ToastsService.showToast('error', request.request_status +
      ' requests cannot be deleted');
    } else {
      Dialog.confirmAction('Do you want to cancel this request?')
      .then(function () {
        $scope.processInProgress = true;
        var data = {
          admin_id: $rootScope.authenticatedUser.id,
          request_id: request.id,
        };

        RequestsService.cancelRequest(data)
        .then(function (response) {
          ToastsService.showToast('success', 'Request has been successfully cancelled');
          $scope.processInProgress = false;
          reloadRequests();
        })
        .catch(function (error) {
          $scope.processInProgress = false;
          debugger;
        });
      }, function () {
        // Dialog has been canccelled
      });
    }
  };

  ////////////////////// HELPER FUNCTIONS ///////////////////////////

  $scope.openMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  // SHOW ADD REQUEST DIALOG
  $scope.showAddRequestDialog = function (ev, requestType) {
    Dialog.showCustomDialog(ev, requestType, $scope);
  };

  $rootScope.$on('newRequestAdded', function () {
    ToastsService.showToast('success', 'Request successfully added');
    $rootScope.closeDialog();
    reloadRequests();
  });

  function reloadRequests() {
    var requestsCache = 'requests?page=' +
    $scope.filterParams.page + 'limit=' + $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(requestsCache);
    getAllRequests();
  }

}
})();
