(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('WASSCEQuestionsController', WASSCEQuestionsController);

/** @ngInject */
function WASSCEQuestionsController($scope, $rootScope, $q, $timeout, $mdDialog, $moment,
  Dialog, lodash, ToastsService, WASSCEQuestionsService, UploadService, SettingsService,
  localStorageService, mcqOptions, ValidationService) {

  var _ = lodash;
  var currentUser = $rootScope.authenticatedUser;
  $scope.s3Uploader = UploadService;
  $scope.answerOptions = [];
  $scope.newAnswerOption = {};
  $scope.optionLetters = mcqOptions;

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 20,
      page: 1,
    };

    getAllSubjects();
  }

  // GET ALL SUBJECTS
  function getAllSubjects() {
    $scope.wassceQuestionsLoaded = false;
    SettingsService.peformGetOperation('get_subjects')
    .then(function (data) {
      $scope.subjects = data.data.data.subjects;

      if (currentUser.user_type != 'admin') {
        $scope.selectedSubject =
        _.find(data.data.data.subjects, function (o) { return o.id = currentUser.subject_id;});

        $scope.filterParams.subject_id = $scope.selectedSubject.id;
      }else {
        var randomIndex = _.random($scope.subjects.length - 1, false);
        $scope.selectedSubject = $scope.subjects[randomIndex];
        $scope.filterParams.subject_id = $scope.selectedSubject.id;
      }

      filterQuestions();
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  }

  // SHOW ADD PAST WASSCE QUESTION DIALOG
  $scope.showAddPastWassceQtnDialog = function (ev) {
    $scope.newQuestion = {
      question_type: 'close_ended',
      created_by: localStorageService.get('profile').id,
      user_type: localStorageService.get('profile').user_type,
    };

    if (currentUser.user_type != 'admin') {
      $scope.subjectToAdd = currentUser.subject;
      $scope.selectTopic($scope.subjectToAdd);
    }

    Dialog.showCustomDialog(ev, 'add_past_wassce_question', $scope);
  };

  // SHOW EDIT DIALOG
  $scope.showEditPastWassceQtnDialog = function (ev, question) {

    $scope.selectedQuestion = angular.copy(question);
    $scope.subjectToAdd = question.subject;
    $scope.selectTopic($scope.subjectToAdd);
    $scope.answerOptions =
    _.isArray($scope.selectedQuestion.answer_options) ? $scope.selectedQuestion.answer_options :
     JSON.parse($scope.selectedQuestion.answer_options);

    if (currentUser.user_type != 'admin') {
      $scope.subjectToAdd = currentUser.subject;
      $scope.selectTopic($scope.subjectToAdd);
    }

    Dialog.showCustomDialog(ev, 'edit_past_wassce_question', $scope);
  };

  // DELETE ANSWER OPTION
  $scope.deleteAnswerOption = function (index) {
    $scope.newQuestion.answer_options.splice(index, 1);
  };

  // ADD ANSWER OPTION
  $scope.addAnswerOption = function () {
    $scope.answerOptions.push($scope.newAnswerOption);
    $scope.newAnswerOption = {};
  };

  // VALIDATE SELECTED LETTER
  $scope.validateChosenLetter = function (letter) {
    var usedLetters = _.map($scope.answerOptions, 'answer_letter');
    var unusedLetters = _.difference($scope.optionLetters, usedLetters);

    if (_.includes(usedLetters, letter)) {
      $scope.newAnswerOption.answer_letter = unusedLetters[0];
      ToastsService.showToast('error', 'Letter "' + letter + '" has already been used');
    }
  };

  // CHANGE YEAR
  $scope.changeYear = function (oldDate, newDate, editing) {
    var tagrgetObject = editing ? $scope.selectedQuestion : $scope.newQuestion;
    tagrgetObject.question_year = $moment(newDate).format('YYYY');
  };

  // ADD PAST WASSCE QUESTION
  $scope.addPastWassceQtn = function () {
    if ($scope.answerOptions && $scope.answerOptions.length > 0) {
      var answerOptionString = JSON.stringify($scope.answerOptions);
      $scope.newQuestion.answer_options = answerOptionString;
    }

    ValidationService.validate($scope.newQuestion, 'pastWassceQuestion')
    .then(function (result) {
      $scope.addingQuestion = true;
      WASSCEQuestionsService.addQuestion($scope.newQuestion)
      .then(function (response) {
        $scope.addingQuestion = false;
        filterQuestions();
        $scope.closeDialog();
        ToastsService.showToast('success', 'Question has been successfully added!');
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });

  };

  // TODO: change delete image from s3 when image is being changed

  // UPLOAD IMAGE
  $scope.uploadImage = function (file) {
    if (file) {
      $scope.uploadingImage = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'question', 'image')
      .then(function (url) {
        $scope.newQuestion.question_image_url = url;
        $scope.uploadingImage = false;
        $scope.uploadProgress = 0;
      })
      .catch(function (error) {
        $scope.uploadingImage = false;
        debugger;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

  // EDIT QUESTION
  $scope.updatePastWassceQtn = function () {
    $scope.addingQuestion = true;
    debugger;
    WASSCEQuestionsService.updateQuestion($scope.selectedQuestion, $scope.answerOptions)
    .then(function (response) {
      debugger;
      $scope.addingQuestion = false;
      getLRQuestions($scope.filterParams);
      $scope.closeDialog();
      ToastsService.showToast('success', 'Question has been successfully updated!');
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  };

  // VIEW QUESTION DETAILS
  $scope.viewQuestionDetails = function (ev, question) {
    $scope.selectedQuestion = angular.copy(question);

    if (_.isArray(question.answer_options)) {
      $scope.selectedQuestionAnswers = question.answer_options;
    }else {
      $scope.selectedQuestionAnswers = JSON.parse(question.answer_options);
    }

    Dialog.showCustomDialog(ev, 'view_past_wassce_question', $scope);
  };

  // DELETE QUESTION
  $scope.deleteWASSCEQuestion = function (ev, question) {
    var title = 'Do you want to delete this question?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      WASSCEQuestionsService.deleteQuestion(question.id)
      .then(function (response) {
        filterQuestions();
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

  // SELECT TOPIC
  $scope.selectTopic = function (subjectToAdd) {
    if ($scope.newQuestion) {
      $scope.newQuestion.subject_id = subjectToAdd.id;
      $scope.newQuestion.course_id = subjectToAdd.course_id;
    }else if ($scope.selectedQuestion) {
      $scope.selectedQuestion.subject_id = subjectToAdd.id;
      $scope.selectedQuestion.course_id = subjectToAdd.course_id;
    }
  };

  // FILTER QUESTIONS BY USING ALL QUERY PARAMS
  function filterQuestions() {
    WASSCEQuestionsService.getWASSCEQuestions($scope.filterParams)
    .then(function (data) {
      $scope.questions = data.data.data.wassce_questions;
      $scope.wassceQuestionsLoaded = true;
      $scope.filteringQuestions = false;
    })
    .catch(function (error) {

    });
  }

  // FILTER BY SUBJECT
  $scope.filterBySubject = function (subject) {
    $scope.filteringQuestions = true;
    $scope.filterParams.subject_id = subject.id;
    filterQuestions();
  };

  // FILTER BY YEAR
  $scope.filterByYear = function (oldDate, newDate) {
    $scope.filteringQuestions = true;
    $scope.filterParams.question_year = $moment(newDate).format('YYYY');
    filterQuestions();
  };

  // PAGINATION CALL BACK FUNCTION
  $scope.changePage = function () {
    $scope.filteringQuestions = true;
    filterQuestions();
  };

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
    $scope.answerOptions = [];
    $scope.newAnswerOption = {};
    $scope.subjectToAdd = null;
  };

  tinymce.PluginManager.load('equationeditor', 'src/app/components/equation_editor/plugin.min.js');

  $scope.tinymceOptions = {
    plugins: 'equationeditor charmap paste anchor spellchecker table link',
    content_css: 'app/components/equation_editor/mathquill.css',
    toolbar: [
      'bold italic underline alignleft aligncenter alignright alignjustify | cut copy paste pastetext | blockquote',
      ' link | subscript superscript | equationeditor | charmap spellchecker | table |',
    ],
    theme: 'modern',
  };

}
})();
