(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('AuthService', AuthService);

  /** @ngInject */
  function AuthService($rootScope, $q, localStorageService) {

    var service = {
      getAuthData: getAuthData,
    };

    return service;

    function getAuthData() {

      var data = {
        token: localStorageService.get('token'),
      };

      return data;
    }

  }
})();
