(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('SomameQuestionsService', SomameQuestionsService);

/** @ngInject */
function SomameQuestionsService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getLRQuestions: getLRQuestions,
    addQuestion: addQuestion,
    deleteQuestion: deleteQuestion,
    updateQuestion: updateQuestion,
  };

  return service;

  // RETRIEVE ALL CONSULTANTS
  function getLRQuestions(options) {
    var queryParams = $.param(options);
    return $http.get(apiBaseURL + '/all/learnrite/questions?' +
    authDataString + '&' + queryParams);
  }

  // ADD QUESTION
  function addQuestion(newQuestion) {
    var dataString = $.param(newQuestion);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/create/learnrite/question?' + authDataString + '&' + dataString,
    });
  }

  // UPDATE QUESTION
  function updateQuestion(question, answerOptions) {
    var answerOptionString = JSON.stringify(answerOptions);
    question.answer_options = answerOptionString;
    question.course_id = question.course_id || 1;
    debugger;
    var cleanedData = _.omit(question, [
      'created_at',
      'created_by',
      'subject',
      'topic',
      'updated_at',
    ]);
    debugger;
    var dataString = $.param(cleanedData);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/update/learnrite/question?' + authDataString + '&' + dataString,
    });
  }

  // DELETE QUESTION
  function deleteQuestion(id) {
    return $http.post(apiBaseURL + '/delete/learnrite/question?' +
    authDataString + '&question_id=' + id + '&delete_status=true');
  }

}
})();
