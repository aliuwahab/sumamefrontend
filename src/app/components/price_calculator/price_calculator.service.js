(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('PriceCalculator', PriceCalculator);

  /** @ngInject */
  function PriceCalculator($q, uiGmapGoogleMapApi) {

    var service = {
      calculateOfflineDeliveryFare: calculateOfflineDeliveryFare,
      calculateOnlineDeliveryFare: calculateOnlineDeliveryFare,
      calculateDeliveryDistance: calculateDeliveryDistance,
    };

    return service;

    // CALCULATE OFFLINE DELIVERY PRICING
    function calculateOfflineDeliveryFare(distance, pricingString, baseFare) {
      var pricing = JSON.parse(pricingString);
      var distanceRemainder = distance;
      var totalFare = 0;

      // Reset all calculated fares to 0
      for (var i = 0; i < pricing.length; i++) {
        pricing[i].calculated_fare = 0;
      };

      for (var i = 0; i < pricing.length; i++) {
        var multiplierDistance;

        if (i == (pricing.length - 1) || isNaN(pricing[i].upper_bound)) {
          pricing[i].calculatedFare = pricing[i].fare * distanceRemainder;
          totalFare += pricing[i].calculatedFare;
          break;
        }else {
          if (distanceRemainder > pricing[i].upper_bound) {
            multiplierDistance = pricing[i].upper_bound - pricing[i].lower_bound;
            pricing[i].calculatedFare = pricing[i].fare * multiplierDistance;
            totalFare += pricing[i].calculatedFare;
            distanceRemainder -= multiplierDistance;
          }else {
            pricing[i].calculatedFare = pricing[i].fare * distanceRemainder;
            totalFare += pricing[i].calculatedFare;
            break;
          }
        }
      };

      totalFare += baseFare;

      return {
        totalFare: totalFare,
        pricingDetails: pricing,
      };
    }

    function calculateOnlineDeliveryFare(percentagePrice, itemValue) {
      return percentagePrice * itemValue;
    }

    function calculateDeliveryDistance(pickupLocation, deliveryLocation) {
      var deferred = $q.defer();

      uiGmapGoogleMapApi.then(function (maps) {
        var directionsService = new maps.DirectionsService();

        var request = {
          origin: new maps.LatLng(
            pickupLocation.latitude,
            pickupLocation.longitude
          ),
          destination: new maps.LatLng(
            deliveryLocation.latitude,
            deliveryLocation.longitude
          ),
          travelMode: maps.TravelMode['DRIVING'],
          optimizeWaypoints: true,
        };

        directionsService.route(request, function (response, status) {
          status == 'OK' ?  deferred.resolve((response.routes[0].legs[0].distance.value) / 1000) : deferred.reject('There was an error in distance calculation. Try again or contact Klloyds directly.');
        });
      });

      return deferred.promise;
    }

  }
})();
