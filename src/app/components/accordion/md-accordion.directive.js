(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .directive('mdAccordion', mdAccordion);

  /** @ngInject */
  function mdAccordion($timeout) {

    return {
        restrict: 'C',
        replace: false,
        link: link,
      };

    function link(scope, element, attrs) {
      element.find('.md-accordion-item-body').addClass('item-closed');
    }

  }

})();
