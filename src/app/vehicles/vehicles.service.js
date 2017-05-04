(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('VehiclesService', VehiclesService);

/** @ngInject */
function VehiclesService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllVehicles: getAllVehicles,
    addVehicle: addVehicle,
  };

  return service;

  function getAllVehicles(params) {
    var queryOptions = $.param(params);
    var cache = 'vehicles?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/vehicles?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function addVehicle(data) {
    var params = $.param(data);
    debugger;

    return $http.post(apiBaseURL + '/create/vehicle?' + authDataString + '&' + params);
  }

}
})();
