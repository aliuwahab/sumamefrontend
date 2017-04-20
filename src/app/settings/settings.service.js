(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('SettingsService', SettingsService);

/** @ngInject */
function SettingsService($http, localStorageService, AuthService, CacheFactory,
  lodash, CachingService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllWarehouses: getAllWarehouses,
  };

  return service;

  function getAllWarehouses(params) {
    var queryOptions = $.param(params);
    var cache = 'warehouses?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/sumame/addresses?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
