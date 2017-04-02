(function () {
  angular.module('somameAdmin')
    .filter('capitalize', function () {
      return function (input, format, separator) {
        if (!input) {
          return input;
        }

        format = format || 'all';
        separator = separator || ' ';
        if (format === 'first') {
          // Capitalize the first letter of a sentence
          var output = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
          if (separator === ' ') {
            return output;
          } else {
            return output.split(separator).join(' ');
          }
        } else {
          return input.split(separator).map(function (word) {
            if (word.length === 2 && format === 'team') {
              // Uppercase team abbreviations like FC, CD, SD
              return word.toUpperCase();
            } else {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
          }).join(' ');
        }
      };
    });
})();
