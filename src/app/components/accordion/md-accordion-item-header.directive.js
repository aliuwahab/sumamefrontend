(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .directive('mdAccordionItemHeader', mdAccordionItemHeader);

  /** @ngInject */
  function mdAccordionItemHeader($timeout) {

    return {
        restrict: 'C',
        link: link,
      };

    function link(scope, element, attrs) {
      var isOne = element.parent().parent().attr('one');
      element.on('click', function () {
          if (isOne != undefined) {
            if (element.parent().find('.md-accordion-item-body').hasClass('item-open')) {
              element.parent().find('.md-accordion-item-body').addClass('item-closed');
              element.parent().find('.md-accordion-item-body').removeClass('item-open');

            } else {
              element.parent().parent().find('.md-accordion-item-body').removeClass('item-open');
              element.parent().parent().find('.md-accordion-item-body').addClass('item-closed');
              $timeout(function () {
                  element.parent().find('.md-accordion-item-body').toggleClass('item-closed');
                  element.parent().find('.md-accordion-item-body').toggleClass('item-open');
                }, 100);
            }
          } else {
            element.parent().find('.md-accordion-item-body').toggleClass('item-closed');
            element.parent().find('.md-accordion-item-body').toggleClass('item-open');
          }
        });
    }

  }

})();
