(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('UserService', UserService);

  /** @ngInject */
  function UserService($http, lodash, AuthService, ENV) {

    var apiBaseURL = ENV.apiBaseURL;
    var absoluteApiBaseURL = ENV.absoluteApiBaseURL;
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
      user.user_id = user.id;
      var cleanedData;
      var params = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'user_profile_title',
        'user_profile_image_url',
        'user_profile_description',
        'phone_number',
        'user_type',
        'username',
      ];

      cleanedData = _.pick(user, params);
      var dataString = $.param(cleanedData);
      var authDataString = $.param(AuthService.getAuthData());

      return $http({
        method: 'POST',
        url: apiBaseURL + '/update/admin/user?' + authDataString + '&' + dataString,
      });
    }

    function resetPassword(data) {
      var params = $.param(data);
      return $http.post(absoluteApiBaseURL + '/request/password/reset?' + params);
    }
  }

})();
