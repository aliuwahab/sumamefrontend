(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('VehiclesService', VehiclesService);

/** @ngInject */
function VehiclesService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {

  };

  return service;

}
})();
