(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SomameQuestionsController', SomameQuestionsController);

/** @ngInject */
function SomameQuestionsController($scope, $rootScope, $q, $timeout, $mdDialog, $moment,
  Dialog, lodash, ToastsService, SomameQuestionsService, UploadService, SettingsService,
  localStorageService, mcqOptions, ValidationService) {

  var _ = lodash;
  var currentUser = $rootScope.authenticatedUser;
  $scope.s3Uploader = UploadService;
  $scope.newAnswerOption = {};
  $scope.answerOptions = [];

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 20,
      page: 1,
    };

    getAllSubjects();
  }

  // PULL DOWN SUBJECTS
  function getAllSubjects() {
    $scope.lrQuestionsLoaded = false;
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

      getLRQuestions($scope.filterParams);
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  }

  // PULL DOWN QUESTIONS
  function getLRQuestions(query) {
    SomameQuestionsService.getLRQuestions(query)
    .then(function (questions) {
      $scope.questions = questions.data.data.learnrite_questions;
      $scope.lrQuestionsLoaded = true;
      $scope.filteringQuestions = false;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  }

  // SHOW ADD PAST WASSCE QUESTION DIALOG
  $scope.showAddLRQtnDialog = function (ev) {
    $scope.optionLetters = mcqOptions;

    $scope.newQuestion = {
      question_type: 'close_ended',
      created_by: localStorageService.get('profile').id,
      user_type: localStorageService.get('profile').user_type,
    };

    if (currentUser.user_type != 'admin') {
      $scope.subjectToAdd = currentUser.subject;
      $scope.selectTopic($scope.subjectToAdd);
    }

    Dialog.showCustomDialog(ev, 'add_lr_question', $scope);
  };

  // SHOW EDIT DIALOG
  $scope.showEditLRQtnDialog = function (ev, question) {
    $scope.optionLetters = mcqOptions;
    $scope.selectedQuestion = angular.copy(question);
    $scope.subjectToAdd = question.subject;
    $scope.selectTopic($scope.subjectToAdd);
    $scope.answerOptions = JSON.parse($scope.selectedQuestion.answer_options);

    if (currentUser.user_type != 'admin') {
      $scope.subjectToAdd = currentUser.subject;
      $scope.selectTopic($scope.subjectToAdd);
    }

    Dialog.showCustomDialog(ev, 'edit_lr_question', $scope);
  };

  // DELETE ANSWER OPTION
  $scope.deleteAnswerOption = function (index) {
    $scope.answerOptions.splice(index, 1);
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

  // SELECT TOPIC
  $scope.selectTopic = function (subjectToAdd) {
    if ($scope.newQuestion) {
      $scope.newQuestion.subject_id = subjectToAdd.id;
    }else if ($scope.selectedQuestion) {
      $scope.selectedQuestion.subject_id = subjectToAdd.id;
    }
  };

  // ADD LEARNRITE QUESTION
  $scope.addLRQtn = function () {
    if ($scope.answerOptions && $scope.answerOptions.length > 0) {
      var answerOptionString = JSON.stringify($scope.answerOptions);
      $scope.newQuestion.answer_options = answerOptionString;
    }

    ValidationService.validate($scope.newQuestion, 'likeWassceQuestion')
    .then(function (result) {
      $scope.addingQuestion = true;
      SomameQuestionsService.addQuestion($scope.newQuestion)
      .then(function (response) {
        $scope.addingQuestion = false;
        getLRQuestions($scope.filterParams);
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

  // UPDATE LEARNRITE QUESTION
  $scope.updateLRQtn = function () {
    $scope.addingQuestion = true;
    debugger;
    SomameQuestionsService.updateQuestion($scope.selectedQuestion, $scope.answerOptions)
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

  // DELETE LEARNRITE QUESTION
  $scope.deleteLRQuestion = function (ev, question) {
    var title = 'Do you want to delete this question?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      SomameQuestionsService.deleteQuestion(question.id)
      .then(function (response) {
        debugger;
        getLRQuestions($scope.filterParams);
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

  // VIEW QUESTION DETAILS
  $scope.viewQuestionDetails = function (ev, question) {
    $scope.selectedQuestion = angular.copy(question);

    if (_.isArray(question.answer_options)) {
      $scope.selectedQuestionAnswers = question.answer_options;
    }else {
      $scope.selectedQuestionAnswers = JSON.parse(question.answer_options);
    }

    Dialog.showCustomDialog(ev, 'view_lr_question', $scope);
  };

  // FILETER BY SUBJECT
  $scope.filterBySubject = function (subject) {
    $scope.filteringQuestions = true;

    $scope.filterParams.subject_id = subject.id;

    SomameQuestionsService.getLRQuestions($scope.filterParams)
    .then(function (data) {
      $scope.questions = data.data.data.learnrite_questions;
      $scope.filteringQuestions = false;
    })
    .catch(function (error) {

    });
  };

  // CHANGE PAGE
  $scope.changePage = function () {
    $scope.filteringQuestions = true;
    getLRQuestions($scope.filterParams);
  };

  ///////////////// HELPER FUNCTIONS ////////////////////////
  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
    $scope.answerOptions = [];
    $scope.newAnswerOption = {};
    $scope.subjectToAdd = null;
  };

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

  // TINY MCE CONFIGURATION
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
