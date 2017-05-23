(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('CustomizationsController', CustomizationsController);

/** @ngInject */
function CustomizationsController($scope, $rootScope) {

  activate();

  function activate() {

  }

  $scope.previewPattern = function (pattern) {
    $scope.viewBackgroundImage = pattern.url;
  };

  $scope.backgroundPatterns = [
    {
      id: 'brickwall',
      name: 'Brick Wall',
      url: '../assets/patterns/brickwall.png',
    },
    {
      id: 'cheap_diagonal_fabric',
      name: 'Cheap Diagonal Fabric',
      url: '../assets/patterns/cheap_diagonal_fabric.png',
    },
    {
      id: 'crossword',
      name: 'Crossword',
      url: '../assets/patterns/crossword.png',
    },
    {
      id: 'gray_jean',
      name: 'Gray Jean',
      url: '../assets/patterns/gray_jean.png',
    },
    {
      id: 'grey',
      name: 'Grey',
      url: '../assets/patterns/grey.png',
    },
    {
      id: 'p5',
      name: 'P5',
      url: '../assets/patterns/p5.png',
    },
    {
      id: 'sativa',
      name: 'Sativa',
      url: '../assets/patterns/sativa.png',
    },
    {
      id: 'sports',
      name: 'Sports',
      url: '../assets/patterns/sports.png',
    },
    {
      id: 'subtle_white_feathers',
      name: 'Subtle White Feathers',
      url: '../assets/patterns/subtle_white_feathers.png',
    },
    {
      id: 'textured_paper',
      name: 'Textured Paper',
      url: '../assets/patterns/textured_paper.png',
    },
    {
      id: 'tweed',
      name: 'Tweed',
      url: '../assets/patterns/tweed.png',
    },
  ];

}
})();
