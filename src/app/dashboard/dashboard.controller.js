(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DashboardController', DashboardController);

/** @ngInject */
function DashboardController($scope, $rootScope, $state, DashboardService) {

  activate();

  function activate() {
    getStatistics();
  }

  function getStatistics() {
    $scope.dataLoaded = false;

    DashboardService.getStatistics()
    .then(function (response) {
      $scope.statistics = response.data.data.statistics;
      $scope.dataLoaded = true;
    })
    .catch(function (error) {
      $scope.dataLoaded = true;
      debugger;
    });
  }

  $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  $scope.series = ['All Requests', 'Successfully Completed'];
  $scope.data = [
    [65, 79, 80, 81, 106, 225, 300],
    [28, 48, 40, 19, 86, 27, 90],
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left',
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right',
        },
      ],
    },
  };

}
})();
