(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, $timeout, $stateParams, Dialog,
  ToastsService, RequestsService, NgMap, WizardHandler, PriceCalculator, CachingService,
  SettingsService, EquipmentService, localStorageService, ngAudio, CustomersService, ENV) {

  var requestsName;
  var promiseName;
  var limit = localStorage.getItem('tablePageLimit') || 20;

  activate();

  function activate() {

    $scope.currentView = localStorageService.get('selectedRequestsView') || 'app.requests.pending';
    $scope.viewName = getStateName($scope.currentView);

    $state.current.name != 'app.requests.details' ? $state.transitionTo($scope.currentView) : false;

    $scope.filterParams = {
      limit: limit,
      page: 1,
      request_status: $scope.viewName,
    };

    $scope.newRequestSound = ngAudio.load('../assets/sounds/bbm.mp3');
  }

  // GET ALL REQUESTS
  $scope.getAllRequests = function (param, value) {
    param == 'request_type' && $scope.filterParams.request_status ?
    delete $scope.filterParams.request_status : false;

    param == 'request_status' && $scope.filterParams.request_type ?
    delete $scope.filterParams.request_type : false;

    value ? $scope.filterParams[param] = value : false;
    requestsName = value + 'Requests';
    promiseName = value + 'RequestsPromise';

    $scope.filterParams.page = 1;

    $scope[promiseName] = RequestsService.getRequests($scope.filterParams)
    .then(function (response) {
      $scope[requestsName] = response.data.data.all_request;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.getRequestsByUserType = function (userType) {

  };

  $scope.paginate = function (page, limit) {
    localStorage.setItem('tablePageLimit', limit);

    $scope[promiseName] = RequestsService.getRequests($scope.filterParams)
    .then(function (response) {
      $scope[requestsName] = response.data.data.all_request;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
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
          reloadRequests('pending');
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

  $scope.changeRequestsTab = function (stateName) {
    $scope.currentView = stateName;
    setCurrentView(stateName);
    $scope.viewName = getStateName(stateName);
    $state.go(stateName);
  };

  function setCurrentView(stateName) {
    localStorageService.set('selectedRequestsView', stateName);
  }

  function getStateName(state) {
    var pointIndex = state.lastIndexOf('.');
    var stateName = state.substring(pointIndex + 1);
    return stateName;
  }

  function reloadRequests(status, alternateCache) {
    status != undefined ? $scope.filterParams.request_status = status : false;
    var requestsCache = 'requests?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(requestsCache);
    var requestsName = $scope.filterParams.request_status + 'Requests';

    RequestsService.getRequests($scope.filterParams)
    .then(function (response) {
      $scope[requestsName] = response.data.data.all_request;

      if (alternateCache != undefined) {
        $scope.filterParams.request_status = alternateCache;
        CachingService.destroyOnCreateOperation('requests?' +
        $.param($scope.filterParams));
      }
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  //////////// PUSHER BINDINGS /////////////////

  $rootScope.pusher.bind('request-made', function (data) {
    if (!data.request.request_source || data.request.request_source != 'admin') {
      $scope.newRequestSound.play();
    }

    reloadRequests(data.request.request_status);
  });

  $rootScope.pusher.bind('request-updated', function (data) {
    reloadRequests(data.request.request_status);
  });

}
})();
