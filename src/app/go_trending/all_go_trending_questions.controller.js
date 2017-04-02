(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('AllGoTrendingQuestionsController', AllGoTrendingQuestionsController);

/** @ngInject */
function AllGoTrendingQuestionsController($scope, $rootScope, $state, Dialog,
  $moment, lodash, ToastsService, GoTrendingService, SettingsService, DateService) {

  var _ = lodash;

  activate();

  function activate() {
    $scope.filterParams = {
      week_number: DateService.getCurrentWeek(),
    };

    $scope.goTrendingQuestionsLoaded = false;
    getAllSubjects();
  }

  // GET ALL SUBJECTS
  function getAllSubjects() {
    $scope.goTrendingQuestionsLoaded = false;
    SettingsService.peformGetOperation('get_subjects')
    .then(function (data) {
      $scope.subjects = data.data.data.subjects;
      var currentUser = $rootScope.authenticatedUser;

      if (currentUser.user_type != 'admin') {
        $scope.selectedSubject =
        _.find(data.data.data.subjects, function (o) { return o.id = currentUser.subject_id;});

        console.log($scope.selectedSubject);
        $scope.filterParams.subject_id = $scope.selectedSubject.id;
      }else {
        var randomIndex = _.random($scope.subjects.length - 1, false);
        $scope.selectedSubject = $scope.subjects[randomIndex];
        $scope.filterParams.subject_id = $scope.selectedSubject.id;
      }

      getCurrentWeekTrendingQuestions();
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  }

  // GET QUESTIONS FOR SELECTED WEEK
  function getCurrentWeekTrendingQuestions() {
    GoTrendingService.getTrends($scope.filterParams)
    .then(function (trends) {
      var goTrendingQuestions = trends.data.data.all_students_questions.data;
      rankQuestions(goTrendingQuestions);
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  }

  // FILTER BY SUBJECT
  $scope.filterBySubject = function (subject) {
    $scope.filteringQuestions = true;
    $scope.filterParams.subject_id = subject.id;
    getCurrentWeekTrendingQuestions();
  };

  // FILTER BY WEEK
  $scope.filterByWeek = function (oldDate, newDate) {
    $scope.filteringQuestions = true;
    var week = DateService.convertToWeekFormat(newDate);
    $scope.filterParams.week_number = week;
    getCurrentWeekTrendingQuestions();
  };

  // DELETE GOTRENDING QUESTION
  $scope.deleteQuestion = function (ev, question) {
    var title = 'Do you want to delete this question?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      GoTrendingService.deleteQuestion(question.id)
      .then(function (response) {
        getCurrentWeekTrendingQuestions();
        ToastsService.showToast('success', 'Question has been successfully deleted!');
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        debugger;
      });
    }, function () {
      // Delete operation cancelled
    });
  };

  // ASSIGN QUESTIONS
  function rankQuestions(allQuestions) {
    if (allQuestions.length == 1) {
      $scope.trendingQuestion = allQuestions[0];
      $scope.otherQuestions = [];
    }else {
      var sorted = _.orderBy(allQuestions, ['number_of_followers'], ['desc']);

      var trendingQuestion;
      var otherQuestions = [];

      if (sorted.length > 0) {
        trendingQuestion = sorted[0];
        sorted.shift();
      }

      $scope.trendingQuestion = trendingQuestion;
      $scope.otherQuestions = sorted;
    }

    $scope.goTrendingQuestionsLoaded = true;
    $scope.filteringQuestions = false;
  }

  // SPLIT DISPLAY URLS
  $scope.splitDisplayPicUrl = function (string) {
    var urls = string.split(',');
    return urls[0];
  };

}
})();
