(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('CustomersService', CustomersService);

/** @ngInject */
function CustomersService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {

  };

  return service;

}
})();
