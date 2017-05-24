(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('RequestsController', RequestsController);

/** @ngInject */
function RequestsController($scope, $rootScope, $state, localStorageService) {

  activate();

  function activate() {

  }

  var currentView = localStorageService.get('mainRequestsView') || 'app.requests.all';
  $state.transitionTo(currentView);

}
})();
