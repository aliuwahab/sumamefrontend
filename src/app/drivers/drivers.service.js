(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('DriversService', DriversService);

/** @ngInject */
function DriversService($http, AuthService, ENV) {

  var apiBaseURL = ENV.fakerAPIBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllDrivers: getAllDrivers,
  };

  return service;

  function getAllDrivers() {
    return $http.get(apiBaseURL + '/drivers');
  }

}
})();
