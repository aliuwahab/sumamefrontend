(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('QuestionController', QuestionController);

/** @ngInject */
function QuestionController($scope, $rootScope, $stateParams, $sce, $mdDialog, Dialog,
  GoTrendingService, UploadService, ToastsService, localStorageService, segment,
  ValidationService, $state) {

  $scope.s3Uploader = UploadService;

  activate();

  function activate() {
    getQuestion();
  }

  function getQuestion() {
    GoTrendingService.getQuestion($stateParams.questionId)
    .then(function (question) {
      if (question && question.data.data.all_students_questions.data[0]) {
        $scope.question = question.data.data.all_students_questions.data[0];
        $scope.questionAnswer = $scope.question.answers[0];
      }else {
        $scope.invalidQuestion = true;
      }

      $scope.questionLoaded = true;

      // VIDEO DISPLAY CONFIGS
      if ($scope.questionAnswer && $scope.questionAnswer.answer_video_url) {
        setVideoConfig('video_config', $scope.questionAnswer.answer_video_url);
      }
    })
    .catch(function (error) {
      debugger;
    });
  }

  // DELETE GOTRENDING QUESTION
  $scope.deleteQuestion = function (ev, question) {
    var title = 'Do you want to delete this question?';
    Dialog.confirmDelete(ev, title)
    .then(function () {
      GoTrendingService.deleteQuestion(question.id)
      .then(function (response) {
        $state.go('app.all_go_trending_questions');
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

  $scope.answerQuestion = function () {
    debugger;
    ValidationService.validate($scope.answer, 'goTrendingAnswer')
    .then(function (result) {
      if (result.valid) {
        $scope.answeringQuestion = true;
        GoTrendingService.answerQuestion($scope.answer)
        .then(function (response) {
          $scope.answeringQuestion = false;
          ToastsService.showToast('success', 'Answer has been successfully posted!');
          $mdDialog.hide();
          getQuestion();

          segment.track(segment.events.questionAnswered, {
            name: $rootScope.authenticatedUser.first_name + ' ' +
            $rootScope.authenticatedUser.last_name,
            studentName: $scope.question.asked_by.first_name + ' ' +
            $scope.question.asked_by.last_name,
            questionSubject: $scope.question.subject.subject_name,
          });
        })
        .catch(function (error) {
          $scope.answeringQuestion = false;
          ToastsService.showToast('error', error.message);
          debugger;
        });
      }
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  // EDIT ANSWER
  $scope.editAnswer = function (ev, answer) {

    $scope.answer = angular.copy(answer);

    if ($scope.answer && $scope.answer.answer_video_url) {
      setVideoConfig('edit_video_config', $scope.answer.answer_video_url);
    }

    Dialog.showCustomDialog(ev, 'edit_answer', $scope)
    .then(function (trigger) {
      if (trigger && trigger == 'edit_answer') {
        GoTrendingService.answerQuestion($scope.answer)
        .then(function (response) {
          ToastsService.showToast('success', 'Answer has been successfully posted!');
        })
        .catch(function (error) {
          ToastsService.showToast('error', error.message);
          debugger;
        });
      }else {
        $mdDialog.hide();
      }
    }, function () {
      // Dialog has been canccelled
    });
  };

  // TODO: Delete previous image when changing an image or when answering question is aborted
  var isUploading;

  $scope.uploadFile = function (file, fileType) {
    var fileSizeLimit = 104857600; //104MB in bytes

    if (file && (file.size <= fileSizeLimit)) {
      var param = 'answer_' + fileType + '_url';
      isUploading = 'uploading_' + fileType;

      $scope[isUploading] = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'answer', fileType)
      .then(function (url) {
        $scope.answer[param] = url;
        $scope[isUploading] = false;
        $scope.uploadProgress = 0;

        if ($scope.answer && $scope.answer.answer_video_url) {
          setVideoConfig('edit_video_config', $scope.answer.answer_video_url);
        }

      })
      .catch(function (error) {
        $scope[isUploading] = false;
        ToastsService.showToast('error', error);
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file. Either file type is ' +
      'not supported or file is bigger than ' + fileSizeLimit + 'MB');
    }
  };

  function setVideoConfig(scopeVarName, videoSource) {
    $scope[scopeVarName] = {
      sources: [
        {
          src: $sce.trustAsResourceUrl(
            videoSource
          ),
          type: 'video/mp4',
        },
      ],
      theme: 'http://www.videogular.com/styles/themes/default/latest/videogular.css',
      plugins: {
        poster: 'http://www.videogular.com/assets/images/videogular.png',
      },
    };
  }

  // OPEN ANSWER DIALOG
  $scope.openAnswerDialog = function (ev) {
    // RESET ANSWER
    $scope.answer = {
      subject_id: $scope.question.subject_id,
      topic_id: 1,
      user_type: localStorageService.get('profile').user_type,
      course_id: $scope.question.course_id,
      answerer_id: localStorageService.get('profile').id,
      student_question_id: $stateParams.questionId,
    };

    Dialog.showCustomDialog(ev, 'answer_question', $scope);
  };

  // CLOSE DIALOG
  $scope.closeDialog = function () {
    $mdDialog.hide();
    abortUploads();
  };

  // SPLIT URL
  $scope.splitDisplayPicUrl = function (string) {
    var urls = string.split(',');
    return urls[0];
  };

  function abortUploads() {
    $scope.uploadProgress = 0;
    $scope[isUploading] = false;
    UploadService.abortUpload();
  }

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
