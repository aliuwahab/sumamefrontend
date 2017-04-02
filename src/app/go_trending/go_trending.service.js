(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('GoTrendingService', GoTrendingService);

/** @ngInject */
function GoTrendingService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getQuestion: getQuestion,
    getTrends: getTrends,
    getWinnerTrenders: getWinnerTrenders,
    answerQuestion: answerQuestion,
    deleteQuestion: deleteQuestion,
  };

  return service;

  function getQuestion(id) {
    return $http.get(apiBaseURL + '/gotrending/all/questions?id=' + id + '&' + authDataString);
  }

  function getTrends(filters) {
    if (filters) {
      var filterParams = $.param(filters);
      return $http.get(apiBaseURL + '/gotrending/all/questions?' +
      authDataString + '&' + filterParams);
    }else {
      return $http.get(apiBaseURL + '/gotrending/all/questions?' +
      authDataString);
    }
  }

  function getWinnerTrenders(filters) {
    if (filters) {
      var filterParams = $.param(filters);
      return $http.get(apiBaseURL + '/gotrending/winner/trenders?' +
      authDataString + '&' + filterParams);
    }else {
      return $http.get(apiBaseURL + '/gotrending/winner/trenders?' +
      authDataString);
    }
  }

  function answerQuestion(answer) {
    var answerParams = $.param(answer);

    return $http.post(apiBaseURL + '/gotrending/answer/question?' +
    authDataString + '&' + answerParams);
  }

  function deleteQuestion(id) {
    return $http.post(apiBaseURL + '/gotrending/delete/question?' +
    authDataString + '&question_id=' + id);
  }

}
})();
