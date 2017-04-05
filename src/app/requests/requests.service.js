(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('RequestsService', RequestsService);

/** @ngInject */
function RequestsService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {

  };

  return service;

}
})();
