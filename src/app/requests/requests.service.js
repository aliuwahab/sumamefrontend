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

    return $http.get(apiBaseURL + '/requests?limit=1&page=1&' + authDataString + '&id' + id, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
