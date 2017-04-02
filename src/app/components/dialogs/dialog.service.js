(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('Dialog', Dialog);

  /** @ngInject */
  function Dialog($mdDialog, $timeout) {

    var dialogTemplates = {

      // INDEX DIALOGS
      edit_user: 'app/components/dialogs/partials/index-edit_user.tpl.html',

      // CONSULTANT DIALOGS
      add_consultant: 'app/components/dialogs/partials/consultants-add_consultant.tpl.html',
      edit_consultant: 'app/components/dialogs/partials/consultants-edit_consultant.tpl.html',
      view_consultant: 'app/components/dialogs/partials/consultants-view_consultant.tpl.html',

      // GO TRENDING DIALOGS
      answer_question: 'app/components/dialogs/partials/go_trending-answer_question.tpl.html',
      edit_answer: 'app/components/dialogs/partials/go_trending-edit_answer.tpl.html',
      add_LRQuestion: 'app/components/dialogs/partials/lr_qtns-add_question.tpl.html',

      // SCHOOL DIALOGS
      add_school: 'app/components/dialogs/partials/settings-schools-add_school.tpl.html',
      edit_school: 'app/components/dialogs/partials/settings-schools-edit_school.tpl.html',

      // PROGRAMME DIALOGS
      add_course: 'app/components/dialogs/partials/settings-programmes-add_programme.tpl.html',
      edit_course: 'app/components/dialogs/partials/settings-programmes-edit_programme.tpl.html',

      // SUBJECT DIALOGS
      add_subject: 'app/components/dialogs/partials/settings-subjects-add_subject.tpl.html',
      edit_subject: 'app/components/dialogs/partials/settings-subjects-edit_subject.tpl.html',

      // TOPIC DIALOGS
      add_topic: 'app/components/dialogs/partials/settings-topics-add_topic.tpl.html',
      edit_topic: 'app/components/dialogs/partials/settings-topics-edit_topic.tpl.html',

      // COUNTRY DIALOGS
      add_country: 'app/components/dialogs/partials/settings-countries-add_country.tpl.html',
      edit_country: 'app/components/dialogs/partials/settings-countries-edit_country.tpl.html',

      // VOUCHERS DIALOGS
      generate_voucher: 'app/components/dialogs/partials/vouchers-generate_voucher.tpl.html',
      print_voucher: 'app/components/dialogs/partials/vouchers-print_voucher.tpl.html',

      // LIKELY WASSCE QUESTIONS
      add_lr_question: 'app/components/dialogs/partials/lr_qtns-add_question.tpl.html',
      view_lr_question: 'app/components/dialogs/partials/lr_qtns-view_question.tpl.html',
      edit_lr_question: 'app/components/dialogs/partials/lr_qtns-edit_question.tpl.html',

      // PAST WASSCE QUESTIONS
      add_past_wassce_question: 'app/components/dialogs/partials/wassce_qtns-add_question.tpl.html',
      view_past_wassce_question: 'app/components/dialogs/partials/wassce_qtns-view_question.tpl.html',
      edit_past_wassce_question: 'app/components/dialogs/partials/wassce_qtns-edit_question.tpl.html',

      // COUNTRY DIALOGS
      add_sound: 'app/components/dialogs/partials/settings-sounds-add_sound.tpl.html',

      // STUDENTS
      view_student_profile: 'app/components/dialogs/partials/students-view_student.tpl.html',
    };

    // CUSTOMIZE DEFAULT CONFIRM BUTTONS
    var fixButtons = function () {
      var foundCancelButton = false;
      var $dialog = angular.element(document.querySelector('md-dialog'));
      var $actionsSection = $dialog.find('md-dialog-actions');
      var $cancelButton = $actionsSection.children()[0];
      var $confirmButton = $actionsSection.children()[1];
      angular.element($confirmButton).addClass('md-raised md-warn');
      return foundCancelButton;
    };

    // SERVICE OBJECT TO RETURN
    var service = {
      showCustomDialog: showCustomDialog,
      confirmDelete: confirmDelete,
      confirmAction: confirmAction,
    };

    return service;

    // CUSTOM DIALOGS
    function showCustomDialog(ev, templateName, scope) {
      return $mdDialog.show({
        scope: scope,
        preserveScope: true,
        bindToController: true,
        templateUrl: dialogTemplates[templateName],
        parent: angular.element(document.body),
        ariaLabel: templateName,
        targetEvent: ev,
        clickOutsideToClose: false,
        escapeToClose: false,
        fullscreen: false,
        autoWrap: false,
      });
    };

    // DIALOG FOR CONFIRMING DELETE ACTIONS
    function confirmDelete(ev, title) {
      var confirm = $mdDialog.confirm({
        onShowing: function onShowAnimation() {
          if (!fixButtons())
          {
            $timeout(function () {
              fixButtons();
            });
          }
        },

        onComplete: function afterShowAnimation() {
          fixButtons();
        },
      })
      .title(title)
      .targetEvent(ev)
      .theme('default')
      .ok('Delete')
      .cancel('Cancel');

      return $mdDialog.show(confirm);
    }

    function confirmAction(title) {
      var confirm = $mdDialog.confirm({
        onShowing: function onShowAnimation() {
          if (!fixButtons())
          {
            $timeout(function () {
              fixButtons();
            });
          }
        },

        onComplete: function afterShowAnimation() {
          fixButtons();
        },
      })
      .title(title)

      // .targetEvent(ev)
      .theme('default')
      .ok('Yes')
      .cancel('No');

      return $mdDialog.show(confirm);
    }
  }
})();
