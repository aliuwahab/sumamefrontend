(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('ValidationService', ValidationService);

  /** @ngInject */
  function ValidationService($q, lodash) {

    var _ = lodash;

    var requiredFields = {
      foreignPurchaseRequest: [
        { field: 'delivery_location_longitude', friendlyName: 'Delivery Location' },
        { field: 'delivery_location_latitude', friendlyName: 'Delivery Location' },
        { field: 'delivery_location_name', friendlyName: 'Delivery Location' },
        { field: 'online_tracking_number', friendlyName: 'Tracking Number' },
        { field: 'request_cost', friendlyName: 'Request Cost' },
        { field: 'item_cost_currency', friendlyName: 'Item Cost Currency' },
        { field: 'online_order_number', friendlyName: 'Order Number' },
        { field: 'online_store', friendlyName: 'Online Store Selection' },
        { field: 'pickup_location_longitude', friendlyName: 'Warehouse Selection' },
        { field: 'pickup_location_latitude', friendlyName: 'Warehouse Selection' },
        { field: 'pickup_location_name', friendlyName: 'Warehouse Selection' },
        { field: 'requester_id', friendlyName: 'Customer Name' },
      ],
      otherRequest: [
        { field: 'delivery_location_longitude', friendlyName: 'Delivery Location' },
        { field: 'delivery_location_latitude', friendlyName: 'Delivery Location' },
        { field: 'delivery_location_name', friendlyName: 'Delivery Location' },
        { field: 'request_cost', friendlyName: 'Request Cost' },
        { field: 'pickup_location_longitude', friendlyName: 'Warehouse Selection' },
        { field: 'pickup_location_latitude', friendlyName: 'Warehouse Selection' },
        { field: 'pickup_location_name', friendlyName: 'Warehouse Selection' },
        { field: 'requester_id', friendlyName: 'Customer Name' },
      ],
      driver: [
        { field: 'phone_number', friendlyName: 'Phone Number' },
        { field: 'username', friendlyName: 'Username' },
        { field: 'last_name', friendlyName: 'Last Name' },
        { field: 'first_name', friendlyName: 'First Name' },
      ],
      vehicle: [
        { field: 'vehicle_registration_number', friendlyName: 'Vehicle Registration Number' },
        { field: 'vehicle_category_id', friendlyName: 'Vehicle Category' },
        { field: 'vehicle_name', friendlyName: 'Vehicle Name' },
      ],
      equipment: [
        { field: 'terms_and_conditions', friendlyName: 'Equipment Terms and Conditions' },
        { field: 'equipment_description', friendlyName: 'Equipment Description' },
        { field: 'equipment_image', friendlyName: 'Equipment Image' },
        { field: 'equipment_price_per_day', friendlyName: 'Equipment Price Per Day' },
        { field: 'equipment_location_name', friendlyName: 'Equipment Location' },
        { field: 'equipment_location_latitude', friendlyName: 'Equipment Location' },
        { field: 'equipment_location_longitude', friendlyName: 'Equipment Location' },
        { field: 'equipment_category', friendlyName: 'Equipment Category' },
        { field: 'equipment_name', friendlyName: 'Equipment Name' },
      ],
      staff: [
        { field: 'phone_number', friendlyName: 'Phone Number' },
        { field: 'email', friendlyName: 'Email Address' },
        { field: 'username', friendlyName: 'Username' },
        { field: 'last_name', friendlyName: 'Last Name' },
        { field: 'first_name', friendlyName: 'First Name' },
        { field: 'admin_type', friendlyName: 'Permission Level' },
      ],
      pricePoint: [
        { field: 'fare', friendlyName: 'Fare' },
        { field: 'upper_bound', friendlyName: 'Upper Bound' },
        { field: 'lower_bound', friendlyName: 'Lower Bound' },
      ],
    };

    var service = {
      validate: validate,
      validatePricing: validatePricing,
    };

    return service;

    function validate(resourceObject, resourceName) {
      var deferred = $q.defer();

      var required = requiredFields[resourceName];
      var requiredFieldsResult = allRequiredParamProvided(resourceObject, required);
      var resolve = requiredFieldsResult.valid ? deferred.resolve(requiredFieldsResult) :
       deferred.reject(requiredFieldsResult);

      return deferred.promise;
    }

    function validatePricing(pricing, pricePoint) {
      var priceValidation = {
        valid: true,
      };

      if (isAfterInfinity(pricing)) {
        priceValidation.valid = false;
        priceValidation.message = 'You cannot add a price point after "infinity".';
      }else if (isNaN(parseInt(pricePoint.lower_bound)) || isNaN(parseInt(pricePoint.fare))  ||
      (isNaN(parseInt(pricePoint.upper_bound)) && pricePoint.upper_bound != 'infinity')) {
        priceValidation.valid = false;
        priceValidation.message = 'Only "infinity" is accepted as an Upper ' +
        'Bound value, any other value must be a number.';
      }else if (parseInt(pricePoint.lower_bound) >= parseInt(pricePoint.upper_bound)) {
        priceValidation.valid = false;
        priceValidation.message = 'Lower bound cannot be greater than or equal to upper bound.';
      } else if (isInRange(pricing, pricePoint)) {
        priceValidation.valid = false;
        priceValidation.message = 'This range conflicts with a previous range.';
      }

      return priceValidation;
    }

    ///// HELPER FUNCTIONS /////
    function allRequiredParamProvided(resource, required) {
      var result = {
        valid: true,
      };

      if (resource && required) {
        if (required.length > 0) {
          for (var i = 0; i < required.length; i++) {
            if (!resource[required[i].field]) {
              result.valid = false;
              result.message = required[i].friendlyName + ' is required';
            }
          }
        }
      }

      return result;
    }

    function isInRange(pricing, pricePoint) {
      var inRange = false;
      var testPricePoint = angular.copy(pricePoint);
      delete testPricePoint.fare;

      _.map(pricing, function (price) {
        var lowerbound = parseInt(price.lower_bound);
        var upperbound = parseInt(price.upper_bound);

        _.mapValues(testPricePoint, function (value) {
          if (!isNaN(value)) {
            var test = _.inRange(value, lowerbound, upperbound + 1) ? inRange = true : false;
          }
        });
      });

      return inRange;
    }

    function isAfterInfinity(pricing) {
      return _.some(pricing, function (price) {
        return price.upper_bound == 'infinity';
      });
    }

  }
})();
