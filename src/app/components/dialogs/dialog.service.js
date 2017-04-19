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

      // REQUEST DIALOGS
      add_offline_request: 'app/components/dialogs/partials/request-add_offline_request.tpl.html',
      add_online_request: 'app/components/dialogs/partials/request-add_online_request.tpl.html',
      add_equipment_request: 'app/components/dialogs/partials/request-add_equipment_request.tpl.html',

      edit_consultant: 'app/components/dialogs/partials/consultants-edit_consultant.tpl.html',
      view_consultant: 'app/components/dialogs/partials/consultants-view_consultant.tpl.html',

      // GO TRENDING DIALOGS
      answer_question: 'app/components/dialogs/partials/go_trending-answer_question.tpl.html',
      edit_answer: 'app/components/dialogs/partials/go_trending-edit_answer.tpl.html',
      add_LRQuestion: 'app/components/dialogs/partials/lr_qtns-add_question.tpl.html',

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
