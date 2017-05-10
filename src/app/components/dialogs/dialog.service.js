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
      assign_request: 'app/components/dialogs/partials/request-assign_request.tpl.html',

      // DRIVER DIALOGS
      add_driver: 'app/components/dialogs/partials/drivers-add_driver.tpl.html',
      update_driver: 'app/components/dialogs/partials/drivers-update_driver.tpl.html',
      view_driver: 'app/components/dialogs/partials/drivers-view_driver.tpl.html',

      // VEHICLE DIALOGS
      add_vehicle: 'app/components/dialogs/partials/vehicles-add_vehicle.tpl.html',
      update_vehicle: 'app/components/dialogs/partials/vehicles-update_vehicle.tpl.html',

      // EQUIPMENT DIALOGS
      add_equipment: 'app/components/dialogs/partials/equipment-add_equipment.tpl.html',
      update_equipment: 'app/components/dialogs/partials/equipment-update_equipment.tpl.html',

      // WAREHOUSE DIALOGS
      add_warehouse: 'app/components/dialogs/partials/warehouses-add_warehouse.tpl.html',
      update_warehouse: 'app/components/dialogs/partials/warehouses-update_warehouse.tpl.html',

      // STAFF DIALOGS
      add_staff: 'app/components/dialogs/partials/staff-add_staff.tpl.html',

      // PRICING DIALOGS
      add_service_category: 'app/components/dialogs/partials/pricing-add_service_category.tpl.html',
      update_service_category: 'app/components/dialogs/partials/pricing-update_service_category.tpl.html',

      // SMS
      send_message: 'app/components/dialogs/partials/request-send-sms.tpl.html',

      // CUSTOMERS DIALOGS
      view_customer: 'app/components/dialogs/partials/customers-view_customer.tpl.html',
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
      closeDialog: closeDialog,
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

    function closeDialog() {
      $mdDialog.hide();
    }
  }
})();
