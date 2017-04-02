(function () {
'use strict';

angular
    .module('somameAdmin')
    .factory('StudentsService', StudentsService);

/** @ngInject */
function StudentsService($http, AuthService, ENV) {

  var apiBaseURL = ENV.apiBaseURL;
  var authDataString = $.param(AuthService.getAuthData());

  var service = {
    getAllStudents: getAllStudents,
    changeStudentAccountStatus: changeStudentAccountStatus,
  };

  return service;

  function getAllStudents(query) {
    var queryParams = $.param(query);
    debugger;
    return $http.get(apiBaseURL + '/all/students?' + authDataString + '&' + queryParams);
  }

  function changeStudentAccountStatus(id, status) {
    return $http({
      method: 'POST',
      url: apiBaseURL + '/block/user?' + authDataString +
      '&user_block_status=' + status + '&user_id=' + id,
    });
  }
}
})();
