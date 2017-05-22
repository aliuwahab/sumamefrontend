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
    addDriver: addDriver,
    deleteDriver: deleteDriver,
    updateDriver: updateDriver,
    approveUnapproveDriver: approveUnapproveDriver,
    searchDrivers: searchDrivers,
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

  function addDriver(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/create/driver?' + authDataString + '&' + params);
  }

  function deleteDriver(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/delete/user?' + authDataString + '&' + params);
  }

  function updateDriver(data) {
    var cleanedData = _.omit(data, [
      'created_at',
      'updated_at',
      '$$hashKey',
    ]);
    var params = $.param(cleanedData);
    return $http.post(apiBaseURL + '/update/driver/account?' + authDataString + '&' + params);
  }

  function approveUnapproveDriver(id, action) {
    return $http.post(apiBaseURL + '/' + action + '/driver?driver_id=' + id + '&' + authDataString);
  }

  function searchDrivers(params) {
    var queryOptions = $.param(params);
    var cache = 'drivers?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.post(apiBaseURL + '/search/drivers?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
