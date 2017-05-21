(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('SettingsService', SettingsService);

/** @ngInject */
function SettingsService($http, localStorageService, AuthService, CacheFactory,
  lodash, CachingService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllWarehouses: getAllWarehouses,
    addWarehouse: addWarehouse,
    updateWarehouse: updateWarehouse,
    getAllStaff: getAllStaff,
    addStaff: addStaff,
    deleteStaff: deleteStaff,
    getPricingDetails: getPricingDetails,
    getAllVehicleCategories: getAllVehicleCategories,
    addPriceCategory: addPriceCategory,
    updatePriceCategory: updatePriceCategory,
    deletePriceCategory: deletePriceCategory,
    updateOnlinePurchasePricePercentage: updateOnlinePurchasePricePercentage,
  };

  return service;

  /////// STAFF FUNCTIONS ////////////
  function getAllStaff() {
    var cache = 'staff';

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all?' + authDataString, {
      cache: CacheFactory.get(cache),
    });
  }

  function addStaff(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/create/admin/user?' + authDataString + '&' + params);
  }

  /////// WAREHOUSE FUNCTIONS ////////////
  function getAllWarehouses(params) {
    var queryOptions = $.param(params);
    var cache = 'warehouses?page=' + params.page + 'limit=' + params.limit;

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/sumame/addresses?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get(cache),
    });
  }

  function addWarehouse(data) {
    var params = $.param(data);

    return $http.post(apiBaseURL + '/create/sumame/address?' + authDataString + '&' + params);
  }

  function updateWarehouse(data) {
    var cleanedData = _.omit(data, [
      'created_at',
      'updated_at',
      '$$hashKey',
    ]);
    var params = $.param(cleanedData);

    return $http.post(apiBaseURL + '/update/sumame/address?' + authDataString + '&' + params);
  }

  function deleteStaff(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/delete/user?' + authDataString + '&' + params);
  }

  /////// PRICING FUNCTIONS ////////////
  function getPricingDetails() {

    var cache = 'pricingDetails';

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/price/estimates?' + authDataString, {
      cache: CacheFactory.get(cache),
    });
  }

  function getAllVehicleCategories() {

    var cache = 'priceCategories';

    if (!CacheFactory.get(cache)) {
      CacheFactory(cache);
    };

    return $http.get(apiBaseURL + '/all/vehicles/categories?' + authDataString, {
      cache: CacheFactory.get(cache),
    });
  }

  function addPriceCategory(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/create/vehicle/category?' + authDataString + '&' + params);
  }

  function updatePriceCategory(data) {
    var cleanedData = _.omit(data, [
      'created_at',
      'updated_at',
      'status',
      '$$hashKey',
    ]);

    var params = $.param(cleanedData);
    return $http.post(apiBaseURL + '/update/vehicle/category?' + authDataString + '&' + params);
  }

  function deletePriceCategory(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/delete/vehicle/category?' + authDataString + '&' + params);
  }

  function updateOnlinePurchasePricePercentage(data) {
    var params = $.param(data);
    return $http.post(apiBaseURL + '/create/price/percentage?' + authDataString + '&' + params);
  }

}
})();
