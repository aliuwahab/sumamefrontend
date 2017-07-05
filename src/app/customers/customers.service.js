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
    addCustomer: addCustomer,
    changeCustomerStatus: changeCustomerStatus,
    searchCustomers: searchCustomers,
  };

  return service;

  function getAllCustomers(params, customerType) {
    var endpoint;
    var queryOptions = $.param(params);
    var cache = customerType + queryOptions;

    switch (customerType) {
      case 'individualCustomers':
        endpoint = '/all/consumers?consumer_type=individual&';
        break;
      case 'businessCustomers':
        endpoint = '/all/business/consumers?';
        break;
      case 'deletedCustomers':
        endpoint = '/all/deleted/accounts?';
        break;
      default:
        endpoint = '/all/consumers?consumer_type=individual&';
    }

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + endpoint + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function addCustomer(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/create/consumer?' + authDataString + '&' + params);
  }

  function changeCustomerStatus(data, action) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/' + action + '/user?' + authDataString + '&' + params);
  }

  function searchCustomers(params) {
    var queryOptions = $.param(params);
    var cache = 'customers?' + queryOptions;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.post(apiBaseURL + '/search/consumers?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

}
})();
