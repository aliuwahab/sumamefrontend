(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('AuthInterceptor', AuthInterceptor);

  /** @ngInject */
  function AuthInterceptor($rootScope, $q, $location) {

    var authInterceptor = {
        request: function (config) {
          delete config.headers.token;
          return config;
        },

        responseError: function (response) {
          if (response.status == 401) {
            // $location.path('/logout');
          }

          return $q.reject(response);
        },
      };
    return authInterceptor;

  }
})();
