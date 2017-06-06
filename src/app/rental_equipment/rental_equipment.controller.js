(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('EquipmentController', EquipmentController);

/** @ngInject */
function EquipmentController($scope, $rootScope, $state, Dialog, EquipmentService, UploadService,
  CachingService, ToastsService, ValidationService) {

  activate();

  function activate() {
    $scope.filterParams = {
      limit: 30,
      page: 1,
    };

    getAllEquipment();
  }

  $rootScope.pusher.subscribe('equipment');

  $rootScope.pusher.bind('equipment-created', function (data) {
    reloadEquipment();
  });

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

    ValidationService.validate($scope.newEquipment, 'equipment')
    .then(function (result) {
      $scope.equipment.data.unshift($scope.newEquipment);
      $rootScope.closeDialog();

      $scope.addingEquipment = true;
      EquipmentService.addEquipment($scope.newEquipment)
      .then(function (response) {
        $scope.addingEquipment = false;
        ToastsService.showToast('success', 'Equipment successfully added');
        reloadEquipment();
      })
      .catch(function (error) {
        $scope.addingEquipment = false;
        ToastsService.showToast('error', error.data.message);
      });
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
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

  // SHOW VIEW VEHICLE DIALOG
  $scope.showViewEquipmentDialog = function (ev, equipment) {
    $scope.selectedEquipment = equipment;
    Dialog.showCustomDialog(ev, 'view_equipment', $scope);
  };

  $scope.openEquipmentDoc = function (url) {
    if ($rootScope.authenticatedUser.admin_type == 'super') {
      $window.open(url, '_blank');
    }else {
      ToastsService.showToast('error', 'You do not have permission to view this file');
    }
  };

  // UPLOAD ITEM
  $scope.uploadItem = function (file, field, category, type, editing) {
    $scope.s3Uploader = UploadService;
    var uploadProgress = field + '_progress';
    var uploadToggle = 'uploading_' + field;

    if (file) {
      $scope[uploadToggle] = true;

      $scope.$watch('s3Uploader.getUploadProgress()', function (newVal) {
        console.log('Progress', newVal);
        $scope[uploadProgress] = newVal;
      });

      UploadService.uploadFileToS3(file, '', 'image')
      .then(function (url) {
        editing ? $scope.selectedEquipment[field] = url : $scope.newEquipment[field] = url;
        $scope[uploadToggle] = false;
        $scope[uploadProgress] = 0;
      })
      .catch(function (error) {
        $scope[uploadToggle] = false;
      });
    }else {
      ToastsService.showToast('error', 'Please select a valid file');
    }
  };

  function reloadEquipment() {
    var cache = 'equipment?' + $.param($scope.filterParams);
    CachingService.destroyOnCreateOperation(cache);
    getAllEquipment();
  }

}
})();
