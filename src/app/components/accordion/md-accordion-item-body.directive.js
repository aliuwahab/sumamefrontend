(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .directive('mdAccordionItemBody', mdAccordionItemBody);

  /** @ngInject */
  function mdAccordionItemBody($timeout) {
    return {
        restrict: 'C',
        link: link,
      };

    function link(scope, element, attrs) {
    }
  }

})();
