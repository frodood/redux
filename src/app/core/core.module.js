(function ()
{
    'use strict';

    angular
        .module('app.core',
            [
                'ngAnimate',
                'ngAria',
                'ngCookies',
                'ngMessages',
                'ngResource',
                'ngSanitize',
                'ngMaterial',
                'angular-chartist',
                'chart.js',
                'pascalprecht.translate',
                'ui.router',
                'uiMicrokernel',
                'tenantContext',
                'instanceContext',
                'settingsContext',
                'activityContext',
                'overviewContext',
                'dashboardContext',
                'recurly',
                'subscription-integration',
                'ccPackage',
                '12th-config',
                'stripe-payment-tools',
                'lfNgMdFileInput',
                'uiCropper',
                'ng-sortable',
                'the2checkoutService',
				'webexService'
            ]);

    console.log('loaded core module !');
})();