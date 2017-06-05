(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DashboardController', DashboardController);

/** @ngInject */
function DashboardController($scope, $rootScope, $state, $location, DashboardService) {

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

  $scope.gotoMetricPage = function (metricPage) {
    switch (metricPage) {
      case 'requests_pending':
        $state.go('app.requests', {
          requestStatus: 'pending',
          viewName: 'Requests Pending',
          referer: 'dashboard',
        });
        break;
      case 'requests_inprogress':
        $state.go('app.requests', {
          requestStatus: 'delivery-in-progress',
          viewName: 'Requests In Progress',
          referer: 'dashboard',
        });
        break;
      case 'drivers':
        $state.go('app.drivers');
        break;
      case 'vehicles':
        $state.go('app.vehicles');
        break;
      default:

        // Default
    }
  };

  $scope.labels = ['December', 'January', 'February', 'March', 'April', 'May'];
  $scope.series = ['All Requests', 'Successfully Completed'];
  $scope.data = [
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 5],
  ];

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
