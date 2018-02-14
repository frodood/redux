(function ()
{
    'use strict';

    angular
        .module('app.core')
        .provider('mesConfig', mesConfigProvider);

    /** @ngInject */
    function mesConfigProvider()
    {
        // shell default configuration
        var mesConfiguration = {
            'disableCustomScrollbars'        : false,
            'disableMdInkRippleOnMobile'     : true,
            'disableCustomScrollbarsOnMobile': true
        };

        this.config = config;

        function config(configuration)
        {
            mesConfiguration = angular.extend({}, mesConfiguration, configuration);
        }


        this.$get = function ()
        {
            var service = {
                getConfig: getConfig,
                setConfig: setConfig
            };

            return service;

            function getConfig(configName)
            {
                if ( angular.isUndefined(mesConfiguration[configName]) )
                {
                    return false;
                }

                return mesConfiguration[configName];
            }

            function setConfig(configName, configValue)
            {
                mesConfiguration[configName] = configValue;
            }
        };
    }

})();