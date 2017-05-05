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
    getRequest: getRequest,
    assignRequestToDriver: assignRequestToDriver,
    addRequest: addRequest,
    cancelRequest: cancelRequest,
  };

  return service;

  function getRequests(params) {
    var queryOptions = $.param(params);
    var cache = 'requests?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/requests?' + authDataString + '&' + queryOptions, {
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

  function changeRequestStatus(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/change/request/status?' + authDataString + '&' + params);
  }

  function addRequest(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/make/request?' + authDataString + '&' + params);
  }

  function cancelRequest(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/cancel/request?' + authDataString + '&' + params);
  }

}
})();
