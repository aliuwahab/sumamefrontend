/* global malarkey:false, moment:false */
(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .constant('moment', moment)
    .constant('logOutAfterSeconds', 1800);
})();
