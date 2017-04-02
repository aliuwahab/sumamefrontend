(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('WASSCEQuestionsService', WASSCEQuestionsService);

/** @ngInject */
function WASSCEQuestionsService($http, AuthService, CacheFactory, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getWASSCEQuestions: getWASSCEQuestions,
    getTopicsBySubject: getTopicsBySubject,
    addQuestion: addQuestion,
    updateQuestion: updateQuestion,
    deleteQuestion: deleteQuestion,
  };

  return service;

  // RETRIEVE ALL CONSULTANTS
  function getWASSCEQuestions(options) {
    var queryOptions = $.param(options);

    if (!CacheFactory.get('wassceQuestions')) {
      CacheFactory('wassceQuestions');
    };

    return $http.get(apiBaseURL + '/all/wassce/questions?' + authDataString + '&' + queryOptions, {
      cache: CacheFactory.get('wassceQuestions'),
    });
  };

  // GET TOPICS BY SUBJECT
  function getTopicsBySubject(subjectId) {
    return $http.get(apiBaseURL + '/all/topics?' + authDataString + '&subject_id=' + subjectId);
  }

  // ADD QUESTION
  function addQuestion(newQuestion) {
    var dataString = $.param(newQuestion);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/create/wassce/question?' + authDataString + '&' + dataString,
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
      'course',
      'question_approval_status',
      'question_solution_image',
      'question_solution_text',
    ]);
    debugger;
    var dataString = $.param(cleanedData);

    return $http({
      method: 'POST',
      url: apiBaseURL + '/update/wassce/question?' + authDataString + '&' + dataString,
    });
  }

  // DELETE QUESTION
  function deleteQuestion(id) {
    return $http.post(apiBaseURL + '/delete/wassce/question?' +
    authDataString + '&question_id=' + id + '&delete_status=true');
  }

}
})();
