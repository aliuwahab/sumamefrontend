(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('GoTrendingService', GoTrendingService);

/** @ngInject */
function GoTrendingService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {

  };

  return service;

}
})();
