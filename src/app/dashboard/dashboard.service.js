(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('DashboardService', DashboardService);

/** @ngInject */
function DashboardService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getStatistics: getStatistics,
  };

  return service;

  function getStatistics() {
    return $http.get(apiBaseURL + '/dashboard/statistics?' + authDataString);
  }

}
})();
