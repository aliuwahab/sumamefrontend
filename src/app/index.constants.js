/* global malarkey:false, moment:false */
(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .constant('moment', moment)
    .constant('mcqOptions', ['A', 'B', 'C', 'D', 'E', 'F'])
    .constant('logOutAfterSeconds', 1800)
    .constant('segmentEvents', {
      login: 'LR_ADMIN_USER_LOGGED_IN',
      logout: 'LR_ADMIN_USER_LOGGED_OUT',
      questionAnswered: 'LR_ADMIN_USER_ANSWERRED_QUESTION',
      consultantAdded: 'LR_ADMIN_USER_ADDED_CONSULTANT',
      consultantDeleted: 'LR_ADMIN_USER_DELETED_CONSULTANT',
      studentBlocked: 'LR_ADMIN_USER_BLOCKED_STUDENT',
      vouchersGenerated: 'LR_ADMIN_USER_GENERATED_VOUCHERS',
      voucherStatusChanged: 'LR_ADMIN_USER_CHANGED_VOUCHER_STATUS',
      voucherStatusChangedFailed: 'LR_ADMIN_USER_CHANGE_VOUCHER_STATUS_FAILED',
    });

})();
