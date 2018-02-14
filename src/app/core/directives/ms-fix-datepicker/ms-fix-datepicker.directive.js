(function(){

	'use strict';

	angular
		.module('app.core')
		.provider('msFixDatepickerConfiguration', msFixDatepickerConfiguration)
		.directive('msFixDatepicker', msFixDatepicker);

	/** @ngInject */
	function msFixDatepickerConfiguration(){

		// Default configuration
        var defaultConfiguration = {
            // to pass to the front end
            formatter: function (val)
            {
                if ( !val )
                {
                    return '';
                }

                return val === '' ? val : new Date(val);
            },
            // to pass to the model
            parser   : function (val)
            {
                if ( !val )
                {
                    return '';
                }
                var offset = moment(val).utcOffset();
                var date = new Date(moment(val).add(offset, 'm'));
                return date;
            }
            
        };

        // Methods
        this.config = config;

        //////////

        /**
         * Extend default configuration with the given one
         *
         * @param configuration
         */
        function config(configuration)
        {
            defaultConfiguration = angular.extend({}, defaultConfiguration, configuration);
        }

        /**
         * Service
         */
        this.$get = function ()
        {
            return defaultConfiguration;
        };
	}

	/** @ngInject */

	function msFixDatepicker(msFixDatepickerConfiguration){

		return {
            require: 'ngModel',
            link   : function (scope, elem, attrs, ngModel)
            {
                ngModel.$formatters.unshift(msFixDatepickerConfiguration.formatter); // to pass to the front end
                ngModel.$parsers.unshift(msFixDatepickerConfiguration.parser); // to pass to the model
            }
        };
	}
})();