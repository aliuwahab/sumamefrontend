(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('CustomersService', CustomersService);

/** @ngInject */
function CustomersService($http, AuthService, ENV) {

  var apiBaseURL = ENV.fakerAPIBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllCustomers: getAllCustomers,
  };

  return service;

  function getAllCustomers() {
    return $http.get(apiBaseURL + '/consumers');
  }

}
})();
