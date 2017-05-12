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
      reloadEquipment();
      $rootScope.closeDialog();
    })
    .catch(function (error) {
      $scope.addingEquipment = false;
      ToastsService.showToast('error', error.data.message);
    });
  };

  $scope.updateEquipment = function () {

    if ($scope.equipmentLocation && $scope.equipmentLocation.latitude) {
      $scope.selectedEquipment.equipment_location_name = $scope.equipmentLocation.name;
      $scope.selectedEquipment.equipment_location_latitude = $scope.equipmentLocation.latitude;
      $scope.selectedEquipment.equipment_location_longitude = $scope.equipmentLocation.longitude;
    }else {
      $scope.selectedEquipment.equipment_location_name = $scope.existingEquipmentLocation.name;
      $scope.selectedEquipment.equipment_location_latitude =
      $scope.existingEquipmentLocation.latitude;
      $scope.selectedEquipment.equipment_location_longitude =
      $scope.existingEquipmentLocation.longitude;
    }

    $scope.selectedEquipment.equipment_id = $scope.selectedEquipment.id;

    $scope.addingEquipment = true;
    EquipmentService.updateEquipment($scope.selectedEquipment)
    .then(function (response) {
      $scope.addingEquipment = false;
      ToastsService.showToast('success', 'Equipment successfully updated');
      reloadEquipment();
      $rootScope.closeDialog();
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

  // SHOW UPDATE VEHICLE DIALOG
  $scope.showUpdateEquipmentDialog = function (ev, equipment) {
    $scope.selectedEquipment = equipment;
    $scope.existingEquipmentLocation = {
      name: equipment.equipment_location_name,
      latitude: equipment.equipment_location_latitude,
      longitude: equipment.equipment_location_longitude,
    };
    Dialog.showCustomDialog(ev, 'update_equipment', $scope);
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

  function reloadEquipment() {
    var cache = 'equipment?page=' + $scope.filterParams.page + 'limit=' +
    $scope.filterParams.limit;
    CachingService.destroyOnCreateOperation(cache);
    getAllEquipment();
  }

}
})();
