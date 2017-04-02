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
  var _ = lodash;

  var endpoints = {

    // Countries
    get_countries: 'all/countries',
    add_countries: 'create/country',
    edit_countries: 'update/country',

    // Grading
    get_gradingSystem: 'grading/system',
    add_gradingSystem: 'create/grade',

    //Schools
    get_schools: 'all/schools',
    add_schools: 'create/school',
    edit_schools: 'update/school',

    // Courses
    get_courses: 'all/courses',
    add_courses: 'create/course',
    edit_courses: 'update/course',

    // Subjects
    get_subjects: 'all/subjects',
    add_subjects: 'create/subject',
    edit_subjects: 'update/subject',

    // Topics
    get_topics: 'all/topics',
    add_topics: 'create/topic',
    edit_topics: 'update/topic',

    // Sounds
    get_sounds: 'all/sounds',
    add_sound: 'create/sound',
    edit_sound: 'update/sound',
  };

  var service = {
    peformGetOperation: peformGetOperation,
    performCreateOperation: performCreateOperation,
    performEditOperation: performEditOperation,
    performDeleteOperation: performDeleteOperation,
    addGradingSystem: addGradingSystem,
    addSound: addSound,
  };

  return service;

  // HELPER FUNCTIONS
  function peformGetOperation(endpointName) {
    if (!CacheFactory.get(endpointName)) {
      CacheFactory(endpointName);
    };

    return $http.get(apiBaseURL + '/' + endpoints[endpointName] + '?' + authDataString, {
      cache: CacheFactory.get(endpointName),
    });
  };

  // ALL CREATE OPERATIONS
  function performCreateOperation(endpointName, data) {
    var dataString = $.param(data);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/' + endpoints[endpointName] + '?' + authDataString + '&' + dataString,
    });
  };

  // ALL EDIT OPERATIONS
  function performEditOperation(endpointName, data) {
    data.created_by = data.created_by || 1;

    var cleanedData = _.omit(data, [
      '$$hashKey',
      'created_at',
      'updated_at',
      'is_deleted',
      'subject',
      'subjects',
      'number_of_subjects',
    ]);

    var dataString = $.param(cleanedData);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/' + endpoints[endpointName] + '?' + authDataString + '&' + dataString,
    });
  };

  // ALL DELETE OPERATIONS
  function performDeleteOperation(endpointName, id) {
    return $http.post(apiBaseURL + '/delete/' + endpointName + '?' +
    authDataString + '&' + endpointName + '_id=' + id);
  };

  // ADD GRADING SYSTEM
  function addGradingSystem(grades) {
    var cleanedGrades = _.map(grades, function (grade) {
      return _.pick(grade, [
        'description', 'grade_letter', 'lower_bound', 'upper_bound', 'interpretation',
      ]);
    });

    var dataString = JSON.stringify(cleanedGrades);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/' + endpoints.add_gradingSystem + '?' + authDataString +
      '&grading_system=' + dataString,
    });
  }

  // ADD SOUND
  function addSound(data) {
    var dataString = $.param(data);
    debugger;
    return $http({
      method: 'POST',
      url: apiBaseURL + '/' + endpoints.add_sound + '?' + authDataString + '&' + dataString,
    });
  };

}
})();
