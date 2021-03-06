(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .config(config);

  /** @ngInject */
  function config($logProvider, $compileProvider, $httpProvider, $authProvider, toastrConfig, $momentProvider,
    ssSideNavSectionsProvider, $mdThemingProvider, $mdIconProvider, momentPickerProvider, $provide,
    gravatarServiceProvider, localStorageServiceProvider, RollbarProvider, CacheFactoryProvider,
    ChartJsProvider, TwilioProvider, ngIntlTelInputProvider, ENV) {

    // Enable log
    $logProvider.debugEnabled(ENV.debug);
    $compileProvider.debugInfoEnabled(ENV.debug);

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

    TwilioProvider.setCredentials({
      accountSid: ENV.twilioAccountSid,
      authToken: ENV.twilioAuthToken,
    });

    angular.extend(CacheFactoryProvider.defaults, {
      maxAge: 30 * 60 * 1000, // Items added to the cache expire after 30 minutes
      cacheFlushInterval: 60 * 60 * 1000, // Cache will clear itself every hour
      deleteOnExpire: 'aggressive', // Items will be deleted from cache when they expire
      // storageMode: 'localStorage',
      storagePrefix: 'kl-',
    });

    // Toastr Configs
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    $mdThemingProvider.theme('success-toast');
    $mdThemingProvider.theme('error-toast');
    $mdThemingProvider.theme('info-toast');

    // Gravatar Configs
    gravatarServiceProvider.defaults = {
      size: 100,
      default: 'mm',  // Mystery man as default for missing avatars
    };
    gravatarServiceProvider.secure = true;

    ChartJsProvider.setOptions({ colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });

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

    ngIntlTelInputProvider.set({
      initialCountry: 'gh',
      preferredCountries: ['gh', 'us', 'gb'],
      nationalMode: true,
      customPlaceholder: function (selectedCountryPlaceholder, selectedCountryData) {
        return 'Phone Number (e.g. ' + selectedCountryPlaceholder + ')';
      },

      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/11.0.14/js/utils.js',
    });

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
        id: 'dashboard',
        name: 'Dashboard',
        state: 'app.dashboard',
        type: 'link',
        icon: 'lnr-chart-bars',
      },
      {
        id: 'requests',
        name: 'Requests',
        state: 'app.requests',
        type: 'link',
        icon: 'lnr-pushpin',
      },
      {
        id: 'drivers',
        name: 'Drivers',
        state: 'app.drivers',
        type: 'link',
        icon: 'lnr-users',
      },
      {
        id: 'courier_vehicles',
        name: 'Courier Vehicles',
        state: 'app.vehicles',
        type: 'link',
        icon: 'lnr-car',
      },
      {
        id: 'equipment',
        name: 'Equipment',
        state: 'app.equipment',
        type: 'link',
        icon: 'lnr-train',
      },
      {
        id: 'customers',
        name: 'Customers',
        state: 'app.customers',
        type: 'link',
        icon: 'lnr-users',
      },
      {
        id: 'invoices',
        name: 'Invoices',
        state: 'app.invoices',
        type: 'link',
        icon: 'lnr-cart',
      },
      {
        id: 'settings',
        name: 'Settings',
        state: 'app.settings',
        type: 'link',
        icon: 'lnr-cog',
      },
    ]);
  }

})();
