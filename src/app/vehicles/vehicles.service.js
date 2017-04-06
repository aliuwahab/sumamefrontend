(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('VehiclesService', VehiclesService);

/** @ngInject */
function VehiclesService($http, AuthService, ENV) {

  var apiBaseURL = ENV.fakerAPIBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllVehicles: getAllVehicles,
  };

  return service;

  function getAllVehicles() {
    return $http.get(apiBaseURL + '/vehicles');
  }

}
})();
