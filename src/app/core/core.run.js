(function ()
{
    'use strict';

    angular
        .module('app.core')
        .run(runBlock);

    /** @ngInject */
    function runBlock(msUtils, mesGenerator, mesConfig)
    {

        console.log('this is way before !');

        mesGenerator.generate();

        if ( mesConfig.getConfig('disableMdInkRippleOnMobile') && msUtils.isMobile() )
        {
            var bodyEl = angular.element('body');
            bodyEl.attr('md-no-ink', true);
        }

        if ( msUtils.isMobile() )
        {
            angular.element('html').addClass('is-mobile');
        }

        var browserInfo = msUtils.detectBrowser();
        if ( browserInfo )
        {
            var htmlClass = browserInfo.browser + ' ' + browserInfo.version + ' ' + browserInfo.os;
            angular.element('html').addClass(htmlClass);
        }
    }
})();