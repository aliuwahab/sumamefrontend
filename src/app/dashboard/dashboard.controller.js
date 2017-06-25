(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('DashboardController', DashboardController);

/** @ngInject */
function DashboardController($scope, $rootScope, $state, $location, DashboardService, Webworker) {

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

      var grapStatsWorker = Webworker.create(processGraphData);

      grapStatsWorker.run($scope.statistics.past_six_months_requests)
      .then(function (result) {
        $scope.series = ['All Requests'];
        $scope.labels = result.months;
        $scope.data = [
          result.requestsData,
        ];
      });
    })
    .catch(function (error) {
      $scope.dataLoaded = true;
      debugger;
    });
  }

  function processGraphData(requestStats) {
    var allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    var months = Object.keys(requestStats);

    months.sort(function (a, b) {
      return allMonths.indexOf(a) > allMonths.indexOf(b);
    });

    var requestsData = [];

    for (var i = 0; i < months.length; i++) {
      requestsData.push(requestStats[months[i]]);
    }

    return {
      months: months,
      requestsData: requestsData,
    };
  }

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

  /////////////////// HELPER FUNCTIONS //////////////////////
  $scope.gotoMetricPage = function (metricPage) {
    $state.transitionTo(metricPage);
  };

}
})();
