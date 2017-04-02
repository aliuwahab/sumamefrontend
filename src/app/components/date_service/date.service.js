(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('DateService', DateService);

  /** @ngInject */
  function DateService($moment) {

    var service = {
      getCurrentWeek: getCurrentWeek,
      convertToWeekFormat: convertToWeekFormat,
    };

    return service;

    function getCurrentWeek() {
      var date = $moment().format();
      var formattedDate = $moment(date).format('w-M-YYYY');

      var week = convertToWeek(formattedDate);

      return week;
    }

    function convertToWeekFormat(date) {
      var formattedDate = $moment(date).format('w-M-YYYY');
      var week = convertToWeek(formattedDate);

      return week;
    }

    function convertToWeek(date) {
      var dateArr = date.split('-');
      var week = 'week-' + dateArr[0] + '-year-' + dateArr[2];

      return week;
    }

  }
})();
