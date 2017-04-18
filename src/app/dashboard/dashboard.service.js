(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('DashboardService', DashboardService);

/** @ngInject */
function DashboardService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getStatistics: getStatistics,
  };

  return service;

  function getStatistics() {
    var cache = 'dashboardStats';

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/dashboard/statistics?' + authDataString, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
