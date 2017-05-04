(function () {
'use strict';

angular
  .module('somameAdmin')
  .controller('PricingController', PricingController);

/** @ngInject */
function PricingController($scope, $rootScope, $state, $mdDialog, lodash, Dialog,
SettingsService, ToastsService, ValidationService, UploadService) {

  activate();

  function activate() {
    getAllVehicleCategories();
  }

  function getAllVehicleCategories() {
    $scope.loadingCategories = SettingsService.getAllVehicleCategories()
    .then(function (response) {
      $scope.categories = response.data.data.categories;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  }

  $scope.getPercentagePricingDetails = function () {
    $scope.loadingPricing = true;
    $scope.editingOnlinePercentage = false;

    SettingsService.getPricingDetails()
    .then(function (response) {
      $scope.pricingDetails = response.data.data.price_estaimates[0];
      $scope.loadingWarehouses = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingWarehouses = false;
      debugger;
    });
  };

  $scope.updateOnlinePurchasePricePercentage = function () {
    $scope.updatingPrecentagePricing = true;
    SettingsService.updateOnlinePurchasePricePercentage($scope.pricingDetails)
    .then(function (response) {
      debugger;
      $scope.updatingPrecentagePricing = false;
      $scope.percentageEdited = false;
      ToastsService.showToast('success', 'Percentage successfully updated');
    })
    .catch(function (error) {
      debugger;
      $scope.updatingPrecentagePricing = false;
      $scope.percentageEdited = false;
      ToastsService.showToast('error', error.data.message);
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  $scope.deletePricePoint = function (index) {
    $scope.categoryPricing.splice(index, 1);
    $scope.pricingPristine = false;
  };

  $scope.addPricePoint = function () {
    ValidationService.validate($scope.newPricePoint, 'pricePoint')
    .then(function (result) {
      var pricePointValidation =
      ValidationService.validatePricing($scope.categoryPricing, $scope.newPricePoint);

      if (pricePointValidation.valid) {
        $scope.categoryPricing.push($scope.newPricePoint);
        $scope.pricingPristine = false;
        $scope.newPricePoint = {};
      }else {
        ToastsService.showToast('error', pricePointValidation.message);
      }

    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.addPriceCategory = function () {
    var stringifiedCategoryPricing = JSON.stringify($scope.categoryPricing);
    $scope.newCategory.category_pricing = stringifiedCategoryPricing;
    $scope.addingPriceCategory = true;

    SettingsService.addPriceCategory($scope.newCategory)
    .then(function (response) {
      $scope.addingPriceCategory = false;
      ToastsService.showToast('success', 'New category successfully created!');
      $rootScope.closeDialog();
    })
    .catch(function (error) {
      $scope.addingPriceCategory = false;
      ToastsService.showToast('error', error.data.message);
      $rootScope.closeDialog();
      debugger;
    });
  };

  // SHOW ADD DIALOG
  $scope.showAddServiceCategoryDialog = function (ev) {
    $scope.newCategory = {
      created_by: $rootScope.authenticatedUser.id,
    };
    $scope.categoryPricing = [];
    $scope.pricingPristine = true;
    $scope.newPricePoint = {};
    Dialog.showCustomDialog(ev, 'add_service_category', $scope);
  };

  // UPLOAD IMAGE
  $scope.uploadImage = function (file) {
    $scope.s3Uploader = UploadService;

    if (file) {
      $scope.uploadingImage = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope.uploadProgress = newVal;
      });

      UploadService.uploadFileToS3(file, 'category', 'image')
      .then(function (url) {
        $scope.newCategory.category_image = url;
        $scope.uploadingImage = false;
        $scope.uploadProgress = 0;
      })
      .catch(function (error) {
        $scope.uploadingImage = false;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

}
})();
