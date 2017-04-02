(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .directive('file', file);

  /** @ngInject */
  function file() {
    return {
      restrict: 'AE',
      scope: {
        file: '@',
      },
      link: function (scope, el, attrs) {
        el.bind('change', function (event) {
          var files = event.target.files;
          var file = files[0];
          scope.file = file;
          scope.$parent.file = file;
          scope.$apply();
        });
      },
    };
  }
})();
