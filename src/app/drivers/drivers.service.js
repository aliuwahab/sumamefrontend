(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('DriversService', DriversService);

/** @ngInject */
function DriversService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllDrivers: getAllDrivers,
    approveUnapproveDriver: approveUnapproveDriver,
  };

  return service;

  function getAllDrivers(params) {
    var queryOptions = $.param(params);
    var cache = 'drivers?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/drivers?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function approveUnapproveDriver(id, action) {
    return $http.post(apiBaseURL + '/' + action + '/driver?driver_id=' + id + '&' + authDataString);
  }

}
})();
