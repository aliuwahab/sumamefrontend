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
    updateVehicle: updateVehicle,
    deleteVehicle: deleteVehicle,
    assignVehicleToDriver: assignVehicleToDriver,
  };

  return service;

  function getAllVehicles(params) {
    var queryOptions = $.param(params);
    var cache = 'vehicles?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/vehicles?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function addVehicle(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/create/vehicle?' + authDataString + '&' + params);
  }

  function deleteVehicle(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/delete/vehicle?' + authDataString + '&' + params);
  }

  function assignVehicleToDriver(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/assign/vehicle/driver?' + authDataString + '&' + params);
  }

  function updateVehicle(data) {
    var cleanedData = _.omit(data, [
      'created_at',
      'updated_at',
      'vehicle_current_latitude',
      'vehicle_current_longitude',
      'status',
      'in_delivery',
      'driver',
      'deleted',
      '$$hashKey',
    ]);
    var params = $.param(cleanedData);

    return $http.post(apiBaseURL + '/update/vehicle?' + authDataString + '&' + params);
  }

}
})();
