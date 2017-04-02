(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('ToastsService', ToastsService);

  /** @ngInject */
  function ToastsService($mdToast) {

    // SERVICE OBJECT TO RETURN
    var service = {
      showToast: showToast,
    };

    return service;

    // SHOW TOAST
    function showToast(type, message) {
      return $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('top right')
          .theme(type + '-toast')
          .hideDelay(2000)
      );
    }

  }
})();
