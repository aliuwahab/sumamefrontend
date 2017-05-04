(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('CachingService', CachingService);

  /** @ngInject */
  function CachingService(CacheFactory) {

    var service = {
      destroy: destroy,
      destroyOnCreateOperation: destroyOnCreateOperation,
    };

    return service;

    function destroy(cacheName) {
      if (CacheFactory.get(cacheName)) {
        cacheName = CacheFactory.get(cacheName);
        cacheName.destroy();
      }
    }

    function destroyOnCreateOperation(cacheName) {
      CacheFactory.destroy(cacheName);
    }

  }
})();
