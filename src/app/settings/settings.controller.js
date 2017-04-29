(function () {
'use strict';

angular
    .module('somameAdmin')
    .controller('SettingsController', SettingsController);

/** @ngInject */
function SettingsController($scope, $rootScope, $state, $mdDialog, lodash, localStorageService,
  Dialog) {

  var currentView = localStorageService.get('selectedSettingsView') || 'app.settings.staff';
  $scope.viewName = getStateName(currentView);
  $state.transitionTo(currentView);

  $scope.changeSettingsTab = function (stateName) {
    $state.go(stateName);
    setCurrentView(stateName);
    $scope.viewName = getStateName(stateName);
  };

  function setCurrentView(stateName) {
    localStorageService.set('selectedSettingsView', stateName);
  }

  function getStateName(state) {
    var pointIndex = state.lastIndexOf('.');
    var stateName = state.substring(pointIndex + 1);
    return stateName;
  }

  ///////////////////// HELPER FUNCTIONS ///////////////////////

}
})();
