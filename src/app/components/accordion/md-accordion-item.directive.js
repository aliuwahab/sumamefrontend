(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .directive('mdAccordionItem', mdAccordionItem);

  /** @ngInject */
  function mdAccordionItem($timeout) {

    return {
        restrict: 'E',
        link: link,
      };

    function link(scope, element, attrs) {

    }

  }

})();
