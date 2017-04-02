(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .config(config);

  /** @ngInject */
  function config($logProvider, $httpProvider, $authProvider, toastrConfig, $momentProvider,
    ssSideNavSectionsProvider, $mdThemingProvider, $mdIconProvider, momentPickerProvider, $provide,
    gravatarServiceProvider, localStorageServiceProvider, RollbarProvider, CacheFactoryProvider,
    segmentProvider, segmentEvents, ENV) {

    segmentProvider.setKey(ENV.segmentWriteKey);
    segmentProvider.setEvents(segmentEvents);
    segmentProvider.setCondition(function () {
      return ENV.stage == 'production';
    });

    // Enable log
    $logProvider.debugEnabled(true);

    RollbarProvider.init({
      accessToken: ENV.rollbarAccessToken,
      verbose: true,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: ENV.stage || 'development',
      },
    });

    $httpProvider.interceptors.push('AuthInterceptor');

    localStorageServiceProvider.setPrefix('');

    // Auth Config
    $authProvider.httpInterceptor = function () { return true; },

    $authProvider.withCredentials = false;
    $authProvider.tokenRoot = null;
    $authProvider.baseUrl = '/';
    $authProvider.loginUrl = ENV.apiBaseURL + '/login';
    $authProvider.tokenName = 'token';
    $authProvider.tokenPrefix = '';
    $authProvider.tokenHeader = 'token';
    $authProvider.tokenType = '';
    $authProvider.storageType = 'localStorage';

    angular.extend(CacheFactoryProvider.defaults, {
      maxAge: 15 * 60 * 1000, // Items added to the cache expire after 15 minutes
      cacheFlushInterval: 60 * 60 * 1000, // Cache will clear itself every hour
      deleteOnExpire: 'aggressive', // Items will be deleted from cache when they expire
    });

    // Toastr Configs
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    // Theming Configs
    $mdThemingProvider
    .theme('default')
    .primaryPalette('red', {
      default: '400',
      // 'hue-1': '400',
    })
    .accentPalette('blue', {
      default: '500',
    });

    $mdThemingProvider.theme('success-toast');
    $mdThemingProvider.theme('error-toast');
    $mdThemingProvider.theme('info-toast');

    $mdIconProvider
    .defaultIconSet('../assets/icons/mdi.svg');

    // Gravatar Configs
    gravatarServiceProvider.defaults = {
      size: 100,
      default: 'mm',  // Mystery man as default for missing avatars
    };
    gravatarServiceProvider.secure = true;

    // Moment JS Configs
    momentPickerProvider.options({
      /* Picker properties */
      locale:        'en',
      format:        'l',
      minView:       'decade',
      maxView:       'day',
      startView:     'month',
      autoclose:     true,
      today:         true,
      keyboard:      false,
      showHeader:   true,

      /* Extra: Views properties */
      leftArrow:     '&larr;',
      rightArrow:    '&rarr;',
      yearsFormat:   'YYYY',
      monthsFormat:  'MMM',
      daysFormat:    'D',
    });

    $momentProvider.asyncLoading(false);

    // Workaround fix for md-select-menu jumping to top of page
    $provide.decorator('$mdSelect', ['$delegate', '$timeout', '$interval',
      function ($delegate, $timeout, $interval) {
        var origShow = $delegate.show;
        var stop;
        $delegate.show = function () {
            var onShow = origShow.apply(this, arguments);
            onShow.then(function () {
                $interval.cancel(stop);
                stop = undefined;
              });

            var selectInput = arguments[0].target;
            var selectDropDown = arguments[0].element;

            $timeout(function () {
                var boundings = selectInput.getBoundingClientRect();

                selectDropDown[0].style.top = (boundings.top - 35) + 'px';
                var dropDownBoundings = selectDropDown[0].getBoundingClientRect();
                if (dropDownBoundings.width < boundings.width) {
                  selectDropDown[0].style.width = boundings.width + 'px';
                }

                stop = $interval(function () {
                  selectDropDown[0].style.top = (boundings.top - 35) + 'px';
                }, 13);
              }, 60);

            return onShow;
          };

        return $delegate;
      },
    ]);

    // Sidebar Configs
    ssSideNavSectionsProvider.initWithTheme($mdThemingProvider);
    ssSideNavSectionsProvider.initWithSections([
      {
        id: 'go_trending',
        name: 'Go Trending',
        state: 'app.go_trending',
        type: 'link',
        icon: 'trending_up',
      },
      {
        id: 'consultants',
        name: 'Consultants',
        state: 'app.consultants',
        type: 'link',
        icon: 'person_add',
      },
      {
        id: 'students',
        name: 'Students',
        state: 'app.students',
        type: 'link',
        icon: 'supervisor_account',
      },
      {
        id: 'learnrite_questions',
        name: 'Likely WASSCE',
        state: 'app.learnrite_questions',
        type: 'link',
        icon: 'question_answer',
      },
      {
        id: 'wassce_questions',
        name: 'Past WASSCE',
        state: 'app.wassce_questions',
        type: 'link',
        icon: 'question_answer',
      },
      {
        id: 'vouchers',
        name: 'Vouchers',
        state: 'app.vouchers',
        type: 'link',
        icon: 'credit_card',
      },
      {
        id: 'settings',
        name: 'Settings',
        state: 'app.settings',
        type: 'link',
        icon: 'settings',
      },
    ]);
  }

})();
