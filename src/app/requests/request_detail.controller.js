(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestDetailController', RequestDetailController);

/** @ngInject */
function RequestDetailController($scope, $rootScope, $state, $stateParams, RequestsService,
  uiGmapGoogleMapApi) {

  $scope.map = { center: { latitude: 5.626292, longitude: -0.164058 }, zoom: 8, bounds: {} };
  $scope.polylines = [];
  uiGmapGoogleMapApi.then(function () {
    $scope.polylines = [
      {
          id: 2,
          path: [
            {
              latitude: 6.704815,
              longitude: -1.629982,
            },
            {
              latitude: 5.626292,
              longitude: -0.164058,
            },
          ],
          stroke: {
              color: '#019ad6',
              weight: 6,
            },
          editable: false,
          draggable: false,
          geodesic: true,
          visible: true,
          fit: true,
          // icons: [{
          //     icon: {
          //         path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
          //       },
          //     offset: '25px',
          //     repeat: '100px',
          //   },
          // ],
        },
  ];
  });

  activate();

  function activate() {
    // getRequest();
  }

  function getRequest() {
    RequestsService.getRequest($stateParams.requestId)
    .then(function (response) {
      debugger;
    })
    .catch(function (error) {
      debugger;
    });
  }

}
})();
