(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('StudentsController', StudentsController);

/** @ngInject */
function StudentsController($scope, $rootScope, ToastsService, Dialog, StudentsService, segment) {

  $scope.queryParams = {
    limit: 50,
    page: 1,
  };

  $scope.getStudents = function () {
    $scope.studentsPromise = StudentsService.getAllStudents($scope.queryParams)
    .then(function (students) {
      $scope.students = students.data.data.all_students;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
    });
  };

  $scope.getStudents();

  $scope.changeAccountStatus = function (ev, student) {
    var title;
    var status;

    if (student.user_block_status == 'unblocked') {
      title = 'Do you want to block ' + student.first_name +  ' ' + student.last_name + '?';
      status = 'blocked';
    }else {
      title = 'Do you want to unblock ' + student.first_name +  ' ' + student.last_name + '?';
      status = 'unblocked';
    }

    Dialog.confirmAction(title)
    .then(function () {
      $scope.studentsPromise = StudentsService.changeStudentAccountStatus(student.id, status)
      .then(function (response) {
        $scope.getStudents();
        ToastsService.showToast('success', 'Student account status successfully changed!');

        segment.track(segment.events.studentBlocked, {
          name: $rootScope.authenticatedUser.first_name + ' ' + $rootScope.authenticatedUser.last_name,
          studentPhoneNumber: student.phone_number,
          studentAccountStatus: status,
        });
      })
      .catch(function (error) {
        ToastsService.showToast('error', error.message);
        debugger;
      });
    }, function () {
      // Dialog has been canccelled
    });
  };

  $scope.viewStudentDetails = function (ev, student) {
    $scope.selectedStudent = angular.copy(student);
    debugger;
    Dialog.showCustomDialog(ev, 'view_student_profile', $scope)
    .then(function (trigger) {

    }, function () {

    });
  };

}
})();
