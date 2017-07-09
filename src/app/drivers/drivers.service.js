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
    getDeletedDrivers: getDeletedDrivers,
    addDriver: addDriver,
    deleteDriver: deleteDriver,
    restoreDeletedDriver: restoreDeletedDriver,
    updateDriver: updateDriver,
    approveUnapproveDriver: approveUnapproveDriver,
    searchDrivers: searchDrivers,
  };

  return service;

  function getAllDrivers(params) {
    var queryOptions = $.param(params);
    var cache = 'drivers?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/drivers?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function getDeletedDrivers(params) {
    var queryOptions = $.param(params);
    var cache = 'deletedDrivers?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/deleted/accounts?user_type=driver&' +
    authDataString + '&' + queryOptions, {
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

  function restoreDeletedDriver(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/restore/deleted/account?' + authDataString + '&' + params);
  }

  function updateDriver(driver) {
    driver.driver_id = driver.id;
    var cleanedData;
    var params = [
      'driver_id',
      'first_name',
      'last_name',
      'username',
      'phone_number',
      'user_profile_image_url',
      'user_profile_description',
      'phone_number',
      'drivers_licence',
      'drivers_insurance',
      'drivers_vehicle_photo',
      'drivers_vehicle_registration',
    ];

    cleanedData = _.pick(driver, params);
    var dataString = $.param(cleanedData);
    return $http.post(apiBaseURL + '/update/driver/account?' + authDataString + '&' + dataString);
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
