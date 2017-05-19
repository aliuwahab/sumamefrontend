(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('InvoiceDetailController', InvoiceDetailController);

/** @ngInject */
function InvoiceDetailController($scope, $rootScope, $state, $stateParams, Dialog, InvoicesService,
  ToastsService, CachingService) {

  activate();

  function activate() {
    getInvoice();
    $scope.loadingInvoice = true;
  }

  function getInvoice() {
    InvoicesService.getInvoice($stateParams.invoiceId)
    .then(function (response) {
      $scope.invoice = response.data.data.invoice;
      $scope.loadingInvoice = false;
      $scope.processInProgress = false;
    })
    .catch(function (error) {
      $scope.loadingInvoice = false;
      ToastsService.showToast('error', error.data.message);
      debugger;
    });
  }

  $scope.changeInvoiceStatus = function (status) {
    var message = null;
    status == 1 ? message = 'Do you want to mark this invoice as paid?' :
    message = 'Do you want to mark this invoice as unpaid?';

    Dialog.confirmAction(message)
    .then(function () {
      $scope.processInProgress = true;

      var data = {
        invoice_id: $scope.invoice.id,
        invoice_paid: status,
      };

      InvoicesService.changeInvoicePaymentStatus(data)
      .then(function (response) {
        ToastsService.showToast('success', 'Inovice status successfully changed!');
        reloadInvoice();
      })
      .catch(function (error) {
        ToastsService.showToast('error', 'There was a problem changing invoice status!');
        $scope.processInProgress = false;
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  function reloadInvoice() {
    var cache = 'invoice?id=' + $scope.invoice.id;
    CachingService.destroyOnCreateOperation(cache);
    getInvoice();
  }

}
})();
