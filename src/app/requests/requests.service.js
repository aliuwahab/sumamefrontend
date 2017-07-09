(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('RequestsService', RequestsService);

/** @ngInject */
function RequestsService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getRequests: getRequests,
    getRequestsByUserType: getRequestsByUserType,
    getRequest: getRequest,
    assignRequestToDriver: assignRequestToDriver,
    searchNearbyDrivers: searchNearbyDrivers,
    addRequest: addRequest,
    addNotes: addNotes,
    cancelRequest: cancelRequest,
    changeRequestStatus: changeRequestStatus,
    changeRequestCost: changeRequestCost,
  };

  return service;

  function getRequests(params) {
    var queryOptions = $.param(params);
    var cache = 'requests?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/requests?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function getRequestsByUserType(params, userType) {
    var queryOptions = $.param(params);
    var cache = 'requests?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/' + userType + '/consumers/requests?' +
    authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function getRequest(id) {
    var cache = 'request?id=' + id;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/view/request?' + authDataString + '&request_id=' + id, {
      cache: CacheFactory.get(cache),
    });
  }

  function assignRequestToDriver(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/assign/request?' + authDataString + '&' + params);
  }

  function searchNearbyDrivers(data) {
    var params = $.param(data);
    return $http.get(apiBaseURL + '/request/nearest/drivers?' + authDataString + '&' + params);
  }

  function changeRequestStatus(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/change/request/status?' + authDataString + '&' + params);
  }

  function changeRequestCost(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/change/request/cost?' + authDataString + '&' + params);
  }

  function addRequest(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/make/request?' + authDataString + '&' + params);
  }

  function addNotes(data, noteType) {
    var params = $.param(data);
    var endpoint;

    if (noteType == 'internal') {
      endpoint = '/add/request/comment?';
    }else if (noteType == 'driver') {
      endpoint = '/add/request/driver/notes?';
    }

    return $http.post(apiBaseURL + endpoint + authDataString + '&' + params);
  }

  function cancelRequest(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/cancel/request?' + authDataString + '&' + params);
  }

}
})();
