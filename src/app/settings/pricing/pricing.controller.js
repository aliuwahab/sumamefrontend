(function () {
'use strict';

angular
  .module('somameAdmin')
  .controller('PricingController', PricingController);

/** @ngInject */
function PricingController($scope, $rootScope, $state, $mdDialog, lodash, Dialog,
SettingsService, ToastsService, ValidationService, UploadService, CachingService) {

  activate();

  function activate() {
    getAllVehicleCategories();
  }

  $rootScope.pusher.subscribe('equipment-category');

  $rootScope.pusher.bind('price-category-created', function (data) {
    reloadPriceCategories();
  });

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
    $scope.loadingPricePercentage = true;
    $scope.editingOnlinePercentage = false;

    SettingsService.getPricingDetails()
    .then(function (response) {
      $scope.pricingDetails = response.data.data.price_estaimates[0];
      $scope.loadingPricePercentage = false;
    })
    .catch(function (error) {
      $scope.error = error.message;
      $scope.loadingPricePercentage = false;
      debugger;
    });
  };

  $scope.updateOnlinePurchasePricePercentage = function () {
    $scope.updatingPrecentagePricing = true;
    SettingsService.updateOnlinePurchasePricePercentage({
      price_percentage_per_value: $scope.pricingDetails.price_percentage_per_value,
    })
    .then(function (response) {
      $scope.updatingPrecentagePricing = false;
      $scope.percentageEdited = false;
      CachingService.destroyOnCreateOperation('pricingDetails');
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

    ValidationService.validate($scope.newCategory, 'price_category')
    .then(function (result) {
      if ($scope.categoryPricing.length == 0) {
        ToastsService.showToast('error', 'Please add at least one price range');
      }else {
        $scope.addingPriceCategory = true;

        SettingsService.addPriceCategory($scope.newCategory)
        .then(function (response) {
          $scope.addingPriceCategory = false;

          if (response.data.code == 200) {
            ToastsService.showToast('success', 'New category successfully created!');
            $rootScope.closeDialog();
          }else {
            ToastsService.showToast('error', response.data.message);
          }
        })
        .catch(function (error) {
          $scope.addingPriceCategory = false;
          ToastsService.showToast('error', error.data.message);
          $rootScope.closeDialog();
          debugger;
        });
      }
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.updatePriceCategory = function () {
    var stringifiedCategoryPricing = JSON.stringify($scope.categoryPricing);
    $scope.selectedCategory.category_pricing = stringifiedCategoryPricing;
    $scope.selectedCategory.category_id = $scope.selectedCategory.id;

    ValidationService.validate($scope.selectedCategory, 'price_category')
    .then(function (result) {
      if ($scope.categoryPricing.length == 0) {
        ToastsService.showToast('error', 'Please add at least one price range');
      }else {
        $scope.addingPriceCategory = true;

        SettingsService.updatePriceCategory($scope.selectedCategory)
        .then(function (response) {
          $scope.addingPriceCategory = false;
          ToastsService.showToast('success', 'Category successfully updated!');
          $rootScope.closeDialog();
          reloadPriceCategories();
        })
        .catch(function (error) {
          $scope.addingPriceCategory = false;
          ToastsService.showToast('error', error.data.message);
          $rootScope.closeDialog();
          debugger;
        });
      }
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.deletePriceCategory = function (ev, category, index) {
    Dialog.confirmAction('Do you want to delete this category?')
    .then(function () {

      var data = {
        vehicle_category_id: category.id,
      };

      $scope.categories.splice(index, 1);
      ToastsService.showToast('success', 'Price category has been successfully deleted!');

      SettingsService.deletePriceCategory(data)
      .then(function (response) {
        // reloadPriceCategories();
      })
      .catch(function (error) {
        $scope.processInProgress = false;
        reloadPriceCategories();
        ToastsService.showToast('error', error.data.message);
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  // SHOW ADD CATEGORY DIALOG
  $scope.showAddServiceCategoryDialog = function (ev) {
    $scope.newCategory = {
      created_by: $rootScope.authenticatedUser.id,
    };
    $scope.categoryPricing = [];
    $scope.pricingPristine = true;
    $scope.newPricePoint = {};
    Dialog.showCustomDialog(ev, 'add_service_category', $scope);
  };

  // SHOW UPDATE CATEGORY DIALOG
  $scope.showUpateCategoryDialog = function (ev, category) {
    $scope.selectedCategory = category;
    $scope.categoryPricing = JSON.parse(category.category_pricing);
    Dialog.showCustomDialog(ev, 'update_service_category', $scope);
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

  function reloadPriceCategories() {
    var cache = 'priceCategories';
    CachingService.destroyOnCreateOperation(cache);
    getAllVehicleCategories();
  }

}
})();
