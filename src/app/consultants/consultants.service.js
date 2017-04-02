(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('ConsultantsService', ConsultantsService);

  /** @ngInject */
  function ConsultantsService($rootScope, $q, $http, AuthService, ENV) {

    var apiBaseURL = ENV.apiBaseURL;
    var fakeApiBaseURL = ENV.fakerAPIBaseURL;
    var authDataString = $.param(AuthService.getAuthData());

    var service = {
      getAllConsultants: getAllConsultants,
      addConsultant: addConsultant,
      deleteConsultant: deleteConsultant,
      editConsultant: editConsultant,
    };

    return service;

    // RETRIEVE ALL CONSULTANTS
    function getAllConsultants() {
      return $http.get(apiBaseURL + '/all/consultants?' + authDataString);
    }

    // ADD CONSULTANT
    function addConsultant(data) {
      var dataString = $.param(data);
      return $http.post(apiBaseURL + '/create/user?' + authDataString + '&' + dataString);
    }

    // EDIT CONSULTANT
    function editConsultant(consultant) {
      var cleanedData = _.pick(consultant, [
        'id',
        'first_name',
        'last_name',
        'email',
        'user_title',
        'user_subtitle',
        'display_pictures_urls',
        'user_profile',
        'phone_number',
        'user_type',
        'type_of_consultant',
        'subject_id',
      ]);

      var dataString = $.param(cleanedData);

      return $http({
        method: 'POST',
        url: apiBaseURL + '/update/user?' + authDataString + '&' + dataString,
      });
    }

    // REMOVE CONSULTANT
    function deleteConsultant(id) {
      debugger;
      return $http.post(apiBaseURL + '/delete/user?' + authDataString + '&user_id=' + id);
    }

  }
})();
