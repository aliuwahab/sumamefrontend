(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('CustomersService', CustomersService);

/** @ngInject */
function CustomersService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllCustomers: getAllCustomers,
  };

  return service;

  function getAllCustomers(params) {
    var queryOptions = $.param(params);
    var cache = 'customers?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/consumers?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
