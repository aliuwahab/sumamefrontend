(function () {
  angular.module('somameAdmin')
    .directive('backgroundImg', function () {
      return function (scope, element, attrs) {
        var url = attrs.backgroundImg;
        element.css({
            'background-image': 'url(' + url + ')',
            'background-size': 'cover',
          });
      };
    });
})();
