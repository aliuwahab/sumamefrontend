(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('ValidationService', ValidationService);

  /** @ngInject */
  function ValidationService($q, lodash) {

    var _ = lodash;

    var requiredFields = {
      goTrendingAnswer: [
        { field: 'answer_video_url', friendlyName: 'Answer Video', },
      ],
      consultant: [
        { field: 'subject_id', friendlyName: 'Assigned Subject' },
        { field: 'user_subtitle', friendlyName: 'Subtitle' },
        { field: 'user_title', friendlyName: 'Title' },
        { field: 'phone_number', friendlyName: 'Phone Number' },
        { field: 'email', friendlyName: 'Email Address' },
        { field: 'last_name', friendlyName: 'Last Name' },
        { field: 'first_name', friendlyName: 'First Name' },
        { field: 'type_of_consultant', friendlyName: 'Type of Consultant' },
      ],
      likeWassceQuestion: [
        { field: 'correct_answer', friendlyName: 'Correct Answer' },
        { field: 'answer_options', friendlyName: 'At least one Answer Option' },
        { field: 'question_in_text', friendlyName: 'Question Text' },
        { field: 'topic_id', friendlyName: 'Topic' },
        { field: 'subject_id', friendlyName: 'Subject' },
      ],
      pastWassceQuestion: [
        { field: 'correct_answer', friendlyName: 'Correct Answer' },
        { field: 'answer_options', friendlyName: 'At least one Answer Option' },
        { field: 'question_in_text', friendlyName: 'Question Text' },
        { field: 'topic_id', friendlyName: 'Topic' },
        { field: 'subject_id', friendlyName: 'Subject' },
        { field: 'question_year', friendlyName: 'Question Year' },
      ],
      voucher: [
        { field: 'quantity_to_generate', friendlyName: 'Number of Vouchers' },
        { field: 'duration_in_months', friendlyName: 'Voucher Duration' },
      ],
      countries: [
        { field: 'country_call_code', friendlyName: 'Country Code' },
        { field: 'country_short_name', friendlyName: 'Country Short Name' },
        { field: 'country_full_name', friendlyName: 'Country Full Name' },
      ],
      schools: [
        { field: 'country_id', friendlyName: 'Country' },
        { field: 'school_location', friendlyName: 'School Location' },
        { field: 'school_name', friendlyName: 'School Name' },
      ],
      courses: [
        { field: 'course_name', friendlyName: 'Programme Name' },
      ],
      subjects: [
        { field: 'subject_type', friendlyName: 'Subject Type' },
        { field: 'subject_name', friendlyName: 'Subject Name' },
      ],
      topics: [
        { field: 'subject_id', friendlyName: 'Subject' },
        { field: 'topic_name', friendlyName: 'Topic Name' },
      ],
      sound: [
        { field: 'sound_url', friendlyName: 'A sound file' },
        { field: 'sound_name', friendlyName: 'Subject' },
      ],
      grade: [
        { field: 'interpretation', friendlyName: 'Grade Interpretation' },
        { field: 'description', friendlyName: 'Grade Description' },
        { field: 'grade_letter', friendlyName: 'Grade Letter' },
        { field: 'upper_bound', friendlyName: 'Grade Upper Bound' },
        { field: 'lower_bound', friendlyName: 'Grade Lower Bound' },
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
