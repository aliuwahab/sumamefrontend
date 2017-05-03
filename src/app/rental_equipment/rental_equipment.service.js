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
  };

  return service;

  function getAllEquipment(params) {
    var queryOptions = $.param(params);
    var cache = 'equipment?page=' + params.page + 'limit=' + params.limit;

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
}
})();
