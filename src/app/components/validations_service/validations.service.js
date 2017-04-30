(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('ValidationService', ValidationService);

  /** @ngInject */
  function ValidationService($q, lodash) {

    var _ = lodash;

    var requiredFields = {
      offlineRequest: [
        { field: 'answer_video_url', friendlyName: 'Answer Video', },
      ],
      consultant: [
        { field: 'subject_id', friendlyName: 'Assigned Subject' },
        { field: 'user_subtitle', friendlyName: 'Subtitle' },
      ],
    };

    var service = {
      validate: validate,
      validateGrading: validateGrading,
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

    function validateGrading(gradingSystem, gradePoint) {
      var gradeValidation = {
        valid: true,
      };

      if (isNaN(parseInt(gradePoint.lower_bound)) || isNaN(parseInt(gradePoint.upper_bound))) {
        gradeValidation.valid = false;
        gradeValidation.message = 'Upper Bound and Lower Bound must be numbers';
      }else if (parseInt(gradePoint.lower_bound) >= parseInt(gradePoint.upper_bound)) {
        gradeValidation.valid = false;
        gradeValidation.message = 'Lower bound cannot be greater than or equal to upper bound';
      } else if (isInRange(gradingSystem, gradePoint)) {
        gradeValidation.valid = false;
        gradeValidation.message = 'This range conflicts with a previous range';
      }

      return gradeValidation;
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

    function isInRange(gradingSystem, gradePoint) {

      var inRange = false;

      _.map(gradingSystem, function (grade) {

        var lowerbound = parseInt(grade.lower_bound);
        var upperbound = parseInt(grade.upper_bound);

        _.mapValues(gradePoint, function (value) {
          if (!isNaN(value)) {
            var test = _.inRange(value, lowerbound, upperbound + 1) ? inRange = true : false;
          }
        });

      });

      return inRange;
    }

  }
})();
