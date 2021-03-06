(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('EquipmentService', EquipmentService);

/** @ngInject */
function EquipmentService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllEquipment: getAllEquipment,
    addEquipment: addEquipment,
    updateEquipment: updateEquipment,
    deleteEquipment: deleteEquipment,
    searchEquipment: searchEquipment,
  };

  return service;

  function getAllEquipment(params) {
    var queryOptions = $.param(params);
    var cache = 'equipment?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/rental/equipment?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function addEquipment(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/add/rental/equipment?' + authDataString + '&' + params);
  }

  function updateEquipment(data) {
    var cleanedData = _.omit(data, [
      'created_at',
      'updated_at',
      '$$hashKey',
    ]);
    var params = $.param(cleanedData);

    return $http.post(apiBaseURL + '/update/rental/equipment?' + authDataString + '&' + params);
  }

  function deleteEquipment(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/delete/equipment?' + authDataString + '&' + params);
  }

  function searchEquipment(params) {
    var queryOptions = $.param(params);
    var cache = 'equipment?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.post(apiBaseURL + '/search/equipment?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }
}
})();
