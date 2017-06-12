(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('UserService', UserService);

  /** @ngInject */
  function UserService($http, lodash, AuthService, ENV) {

    var apiBaseURL = ENV.apiBaseURL;
    var _ = lodash;

    var service = {
      getUserProfile: getUserProfile,
      updateUser: updateUser,
      resetPassword: resetPassword,
    };

    return service;

    function getUserProfile(token) {
      return $http.get(apiBaseURL + '/authenticated/user?token=' + token);
    }

    function updateUser(user) {
      var cleanedData;
      var params = [
        'id',
        'first_name',
        'last_name',
        'email',
        'user_profile_title',
        'user_profile_image_url',
        'user_profile_description',
        'phone_number',
        'user_type',
      ];

      if (user.user_type == 'admin') {
        params.push('admin_type', 'created_by');
        user.created_by = user.created_by || 1;
      }

      cleanedData = _.pick(user, params);
      debugger;
      var dataString = $.param(cleanedData);
      var authDataString = $.param(AuthService.getAuthData());
      debugger;
      return $http({
        method: 'POST',
        url: apiBaseURL + '/update/user?' + authDataString + '&' + dataString,
      });
    }

    function resetPassword(email) {
      return $http({
        method: 'POST',
        url: apiBaseURL + '/password/reset?email=' + email,
      });
    }

  }

})();
