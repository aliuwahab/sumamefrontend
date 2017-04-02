(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('GoTrendingController', GoTrendingController);

/** @ngInject */
function GoTrendingController($scope, $rootScope, $state, lodash, ToastsService, GoTrendingService,
  SettingsService, DateService) {

  var _ = lodash;

  activate();

  function activate() {
    getAllTrendingQuestions();
  }

  function getAllTrendingQuestions() {
    $scope.goTrendingLoaded = false;

    var filterParams = {
      week_number: DateService.getCurrentWeek(),
    };

    GoTrendingService.getWinnerTrenders(filterParams)
    .then(function (trends) {

      var user = $rootScope.authenticatedUser;
      var cleanedTrends = _.reject(trends.data.data, _.isNull);

      if (user && user.user_type == 'consultant') {
        $scope.trends = _.filter(cleanedTrends, function (trend) {return trend.subject.id == user.subject_id;});
      } else {
        $scope.trends = cleanedTrends;
      }

      $scope.goTrendingLoaded = true;
    })
    .catch(function (error) {
      ToastsService.showToast('error', error.message);
      debugger;
    });
  }

  $scope.splitDisplayPicUrl = function (string) {
    var urls = string.split(',');
    return urls[0];
  };

}
})();
