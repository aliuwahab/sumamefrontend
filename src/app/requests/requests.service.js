(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('RequestsService', RequestsService);

/** @ngInject */
function RequestsService($http, AuthService, ENV) {

  var apiBaseURL = ENV.fakerAPIBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getRequests: getRequests,
  };

  return service;

  function getRequests() {
    return $http.get(apiBaseURL + '/requests');
  }

}
})();
