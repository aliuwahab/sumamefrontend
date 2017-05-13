(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('InvoicesController', InvoicesController);

/** @ngInject */
function InvoicesController($scope, $rootScope, $state, Dialog, InvoicesService, ToastsService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllInvoices();
  }

  function getAllInvoices() {
    $scope.requestsPromise = InvoicesService.getAllInvoices($scope.filterParams)
    .then(function (response) {
      $scope.invoices = response.data.data.invoices;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD VEHICLE DIALOG
  $scope.showAddEquipmentDialog = function (ev, invoice) {
    $scope.selectedInvoice = invoice;
    Dialog.showCustomDialog(ev, 'add_equipment', $scope);
  };

  $scope.showInvoiceDetails = function () {

  };

  function reloadInvoices() {
    var cache = 'invoices?page=' + $scope.filterParams.page + 'limit=' +
    $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    getAllInvoices();
  }

}
})();
