(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('VouchersService', VouchersService);

/** @ngInject */
function VouchersService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllVouchers: getAllVouchers,
    generateVouchers: generateVouchers,
    changeVoucherStatus: changeVoucherStatus,
  };

  return service;

  // GET VOUCHERS
  function getAllVouchers(query) {
    var filterParams = $.param(query);

    return $http.get(apiBaseURL + '/all/vouchers?' + authDataString + '&' + filterParams);
  }

  // GENERATE VOUCHERS
  function generateVouchers(data) {
    var dataString = $.param(data);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/generate/vouchers?' + authDataString + '&' + dataString,
    });
  };

  function changeVoucherStatus(voucher, newStatus) {
    return $http({
      method: 'POST',
      url: apiBaseURL + '/change/voucher/status?' + authDataString +
      '&voucher_status=' + newStatus + '&voucher_code=' +
      voucher.voucher_code + '&id=' + voucher.id,
    });
  }

}
})();
