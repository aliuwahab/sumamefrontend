(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('InvoicesController', InvoicesController);

/** @ngInject */
function InvoicesController($scope, $q, $rootScope, $state, Dialog, InvoicesService,
  ToastsService) {

  activate();

  function activate() {
    var limit = localStorage.getItem('tablePageLimit') || 20;

    $scope.filterParams = {
      limit: limit,
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

  $scope.paginate = function (page, limit) {
    localStorage.setItem('tablePageLimit', limit);

    $scope.requestsPromise = InvoicesService.getAllInvoices($scope.filterParams)
    .then(function (response) {
      $scope.invoices = response.data.data.invoices;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  };

  $scope.exportToCSV = function() {
    var params = angular.copy($scope.filterParams);
    params.limit = 1000;
    $scope.processInProgress = true;

    var deferred = $q.defer();
    
    InvoicesService.getAllInvoices(params)
    .then(function (response) {
      var dataToExport = response.data.data.invoices.data;
      $scope.processInProgress = false;
      deferred.resolve(dataToExport);
    })
    .catch(function (error) {
      $scope.processInProgress = false;
      ToastsService.showToast('error', 'There was an error in the export process');
      deferred.reject('There was an error generating data');
    });

    return deferred.promise;
  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  function reloadInvoices() {
    var cache = 'invoices?page=' + $scope.filterParams.page + 'limit=' +
    $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    getAllInvoices();
  }

}
})();
