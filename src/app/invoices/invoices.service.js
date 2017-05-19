(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('InvoicesService', InvoicesService);

/** @ngInject */
function InvoicesService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllInvoices: getAllInvoices,
    getInvoice: getInvoice,
    changeInvoicePaymentStatus: changeInvoicePaymentStatus,
  };

  return service;

  function getAllInvoices(params) {
    var queryOptions = $.param(params);
    var cache = 'invoices?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/invoices?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function getInvoice(id) {
    var cache = 'invoice?id=' + id;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/view/invoice?' + authDataString + '&invoice_id=' + id, {
      cache: CacheFactory.get(cache),
    });
  }

  function changeInvoicePaymentStatus(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/update/invoice?' + authDataString + '&' + params);
  }
}
})();
