(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('VouchersController', VouchersController);

/** @ngInject */
function VouchersController($scope, $rootScope, $mdDialog, Dialog, ValidationService,
  ToastsService, VouchersService, localStorageService, lodash, segment) {

  var _ = lodash;

  $scope.filterParams = {
    limit: 50,
    page: 1,
  };

  $scope.getAllVouchers = function () {
    $scope.vouchersPromise =
    VouchersService.getAllVouchers($scope.filterParams)
    .then(function (data) {
        $scope.vouchers = data.data.data.all_vouchers;
      })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.getAllVouchers();

  // SHOW GENERATE Dialog
  $scope.showVoucherGenerationDialog = function (ev) {
    $scope.newVoucher = {
      voucher_length: 15,
      generated_by: $rootScope.authenticatedUser.id,
      user_type: $rootScope.authenticatedUser.user_type,
    };

    Dialog.showCustomDialog(ev, 'generate_voucher', $scope);
  };

  $scope.showVoucherPrintDialog = function (ev, voucher, isSingleVoucher) {
    var vouchersToPrint = [];
    var arr = isSingleVoucher ? vouchersToPrint.push(voucher) : false;
    $scope.printableVouchers = (arr) ? vouchersToPrint : $scope.vouchers;
    Dialog.showCustomDialog(ev, 'print_voucher', $scope);
  };

  // GENERATE VOUCHERS
  $scope.generateVouchers = function () {

    ValidationService.validate($scope.newVoucher, 'voucher')
    .then(function (result) {
      $scope.generatingVouchers = true;
      $scope.newVoucher.duration_in_days = $scope.newVoucher.duration_in_months * 30;

      VouchersService.generateVouchers($scope.newVoucher)
      .then(function (response) {
        $scope.generatedVouchers = response.data.data;
        $scope.finishedGeneratingVouchers = true;
        $scope.generatingVouchers = false;
        $scope.getAllVouchers();
        ToastsService.showToast('success', response.data.message);

        segment.track(segment.events.vouchersGenerated, {
          name: $rootScope.authenticatedUser.first_name + ' ' +
          $rootScope.authenticatedUser.last_name,
          vouchersTotal: $scope.newVoucher.quantity_to_generate,
        });
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        $scope.generatingVouchers = false;
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });

  };

  $scope.changeVoucherStatus = function (voucher) {
    var title;
    var newStatus;

    if (voucher.voucher_status) {
      title = 'Do you want to block this voucher?';
      newStatus = 'false';
    }else {
      title = 'Do you want to unblock this voucher?';
      newStatus = 'true';
    }

    Dialog.confirmAction(title)
    .then(function () {
      $scope.loadingPromise = VouchersService.changeVoucherStatus(voucher, newStatus)
      .then(function (response) {
        ToastsService.showToast('success', 'Voucher status successfully changed!');
        $scope.getAllVouchers();

        segment.track(segment.events.voucherStatusChanged, {
          name: $rootScope.authenticatedUser.first_name + ' ' +
          $rootScope.authenticatedUser.last_name,
          currentStatus: newStatus,
        });
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);

        segment.track(segment.events.voucherStatusChangedFailed, {
          name: $rootScope.authenticatedUser.first_name + ' ' +
          $rootScope.authenticatedUser.last_name,
        });
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  // DIALOG TRIGGER
  $scope.closeDialog = function () {
    $mdDialog.hide();
    $scope.finishedGeneratingVouchers = false;
  };

}
})();
