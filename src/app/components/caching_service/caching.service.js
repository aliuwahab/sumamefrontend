(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('CachingService', CachingService);

  /** @ngInject */
  function CachingService(CacheFactory, $timeout) {

    var timesTriggered = 0;

    var service = {
      destroy: destroy,
      destroyOnCreateOperation: destroyOnCreateOperation,
    };

    return service;

    function destroy(cacheName) {
      if (timesTriggered == 0 && CacheFactory.get(cacheName)) {
        cacheName = CacheFactory.get(cacheName);
        cacheName.destroy();
        timesTriggered += 1;
      }

      $timeout(function () {
        timesTriggered = 0;
      }, 2000);
    }

    function destroyOnCreateOperation(cacheName) {
      destroy(cacheName);
    }

  }
})();
