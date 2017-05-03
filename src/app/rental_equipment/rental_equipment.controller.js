(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentController', EquipmentController);

/** @ngInject */
function EquipmentController($scope, $rootScope, $state, Dialog, EquipmentService, UploadService,
  CachingService, ToastsService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 50,
      page: 1,
    };

    getAllEquipment();
  }

  function getAllEquipment() {
    $scope.requestsPromise = EquipmentService.getAllEquipment($scope.filterParams)
    .then(function (response) {
      $scope.equipment = response.data.data.rental_equipment;
    })
    .catch(function (error) {
      $scope.error = error.message;
      debugger;
    });
  }

  $scope.addEquipment = function () {
    $scope.newEquipment.equipment_location_name = $scope.equipmentLocation.name;
    $scope.newEquipment.equipment_location_latitude = $scope.equipmentLocation.latitude;
    $scope.newEquipment.equipment_location_longitude = $scope.equipmentLocation.longitude;

    $scope.addingEquipment = true;
    EquipmentService.addEquipment($scope.newEquipment)
    .then(function (response) {
      $scope.addingEquipment = false;
      ToastsService.showToast('success', 'Equipment successfully added');
      var cache = 'equipment?page=' + $scope.filterParams.page + 'limit=' +
      $scope.filterParams.limit;
      CachingService.destroyOnCreateOperation(cache);
      $rootScope.closeDialog();
      getAllEquipment();
    })
    .catch(function (error) {
      $scope.addingEquipment = false;
      ToastsService.showToast('error', error.data.message);
    });
  };

  ///////////////////// HELPER FUNCTIONS ///////////////////////

  // SHOW ADD VEHICLE DIALOG
  $scope.showAddEquipmentDialog = function (ev) {
    $scope.newEquipment = {
      created_by: $rootScope.authenticatedUser.id,
    };
    Dialog.showCustomDialog(ev, 'add_equipment', $scope);
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

      UploadService.uploadFileToS3(file, 'equipment', 'image')
      .then(function (url) {
        $scope.newEquipment.equipment_image = url;
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
